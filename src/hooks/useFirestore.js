import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

function createBaseUserDoc(userId, balance = 0) {
  return {
    uid: userId,
    profile: {
      name: 'Trader',
      role: 'Trader',
      avatarUrl: '',
      avatarPreset: 'neo',
      avatarDataUrl: '',
      level: 1,
      xp: 0,
      xpMax: 1000,
      winRate: 0,
      rrAverage: '-',
      totalTrades: 0,
      initialTradeBalance: 10000,
      balance,
      bestSession: '-',
      currentStreak: 0,
    },
    dailyStats: { hp: 8, mood: 7, focus: 8, motivation: 9 },
    todayFocus: { session: 'London', pair: 'XAUUSD', bias: 'Neutral', keyLevel: '', notes: '' },
  }
}

function compareValuesDescending(aValue, bValue) {
  if (!aValue && !bValue) return 0
  if (!aValue) return 1
  if (!bValue) return -1

  const aComparable = typeof aValue?.toDate === 'function' ? aValue.toDate().getTime() : aValue
  const bComparable = typeof bValue?.toDate === 'function' ? bValue.toDate().getTime() : bValue

  if (aComparable > bComparable) return -1
  if (aComparable < bComparable) return 1
  return 0
}

function parsePositiveAmount(value, label) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`${label} must be greater than 0`)
  }
  return amount
}

function normalizeDateKey(value) {
  if (!value) return null

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
    return null
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString().split('T')[0]
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0]
  }

  return null
}

function getMonthKey(dateKey) {
  return dateKey ? dateKey.slice(0, 7) : null
}

function getIsoWeekKey(dateKey) {
  if (!dateKey) return null

  const date = new Date(`${dateKey}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null

  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNumber = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7)

  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

function parseRrValue(rrLike) {
  if (typeof rrLike === 'number' && Number.isFinite(rrLike)) {
    return rrLike
  }

  if (typeof rrLike !== 'string') return null

  const match = rrLike.match(/1\s*:\s*([\d.]+)/)
  if (!match) return null

  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

function getComparableTimestamp(item) {
  const createdAt = item?.createdAt
  if (typeof createdAt?.toDate === 'function') {
    return createdAt.toDate().getTime()
  }

  const dateKey = normalizeDateKey(item?.date)
  if (dateKey) {
    return new Date(`${dateKey}T00:00:00Z`).getTime()
  }

  return 0
}

function calculateWinRate(trades) {
  if (!trades.length) return 0
  const wins = trades.filter((trade) => trade.result === 'Win').length
  return (wins / trades.length) * 100
}

function anyPositiveBucket(items, bucketKeyGetter) {
  const totals = new Map()

  items.forEach((item) => {
    const bucketKey = bucketKeyGetter(item)
    if (!bucketKey) return
    const current = totals.get(bucketKey) || 0
    totals.set(bucketKey, current + (Number(item.pl) || 0))
  })

  return Array.from(totals.values()).some((total) => total > 0)
}

function hasCleanBucket(trades, mistakes, bucketKeyGetter) {
  const tradeBuckets = new Set()
  const mistakeBuckets = new Set()

  trades.forEach((trade) => {
    const bucketKey = bucketKeyGetter(trade)
    if (bucketKey) tradeBuckets.add(bucketKey)
  })

  mistakes.forEach((mistake) => {
    const bucketKey = bucketKeyGetter(mistake)
    if (bucketKey) mistakeBuckets.add(bucketKey)
  })

  return Array.from(tradeBuckets).some((bucketKey) => !mistakeBuckets.has(bucketKey))
}

function countByField(items, fieldName, value) {
  return items.filter((item) => item?.[fieldName] === value).length
}

function hasTradeCountWithoutMistakes(trades, mistakes, count) {
  const mistakenTradeIds = new Set(
    mistakes
      .map((mistake) => mistake?.tradeId)
      .filter(Boolean)
  )

  return trades.filter((trade) => trade?.id && !mistakenTradeIds.has(trade.id)).length >= count
}

function hasTradesWithNotes(trades, count) {
  return trades.filter((trade) => String(trade?.notes || '').trim().length > 0).length >= count
}

function hasSinglePairTradeCount(trades, count) {
  const pairCounts = new Map()

  trades.forEach((trade) => {
    const pair = trade?.pair
    if (!pair) return
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1)
  })

  return Array.from(pairCounts.values()).some((total) => total >= count)
}

function getTotalLotSize(trades) {
  return trades.reduce((sum, trade) => sum + (Number(trade?.lotSize) || 0), 0)
}

function buildAchievementKeys({ trades, mistakes, deposits, expenses, userDoc }) {
  const unlockedKeys = new Set()
  const sortedTrades = [...trades].sort((a, b) => getComparableTimestamp(b) - getComparableTimestamp(a))
  const completedTrades = sortedTrades.filter((trade) => trade.result === 'Win' || trade.result === 'Loss')
  const finishedTrades = sortedTrades.filter((trade) => trade.result !== 'Pending')
  const rrTrades = finishedTrades
    .map((trade) => parseRrValue(trade.rr))
    .filter((value) => Number.isFinite(value))

  if (sortedTrades.length >= 1) unlockedKeys.add('first_trade')
  if (completedTrades.some((trade) => trade.result === 'Win')) unlockedKeys.add('first_win')
  if (completedTrades.some((trade) => trade.result === 'Loss')) unlockedKeys.add('first_loss')
  if (sortedTrades.length >= 10) unlockedKeys.add('trades_10')
  if (sortedTrades.length >= 25) unlockedKeys.add('trades_25')
  if (sortedTrades.length >= 50) unlockedKeys.add('trades_50')
  if (sortedTrades.length >= 100) unlockedKeys.add('trades_100')
  if (sortedTrades.length >= 200) unlockedKeys.add('trades_200')
  if (sortedTrades.length >= 1000) unlockedKeys.add('trades_1000')
  if (countByField(sortedTrades, 'setupGrade', 'A') >= 10) unlockedKeys.add('a_setup_hunter')
  if (hasTradeCountWithoutMistakes(sortedTrades, mistakes, 10)) unlockedKeys.add('boring_is_good')
  if (hasTradesWithNotes(sortedTrades, 20)) unlockedKeys.add('journal_discipline')
  if (hasTradesWithNotes(sortedTrades, 50)) unlockedKeys.add('note_master')
  if (hasSinglePairTradeCount(sortedTrades, 20)) unlockedKeys.add('one_pair_focus')
  if (countByField(completedTrades, 'result', 'Win') >= 5) unlockedKeys.add('wins_5')
  if (countByField(completedTrades, 'result', 'Loss') >= 10) unlockedKeys.add('losses_10')

  const latest20Trades = completedTrades.slice(0, 20)
  const latest50Trades = completedTrades.slice(0, 50)
  const latest30RrTrades = completedTrades
    .map((trade) => parseRrValue(trade.rr))
    .filter((value) => Number.isFinite(value))
    .slice(0, 30)

  if (latest20Trades.length >= 20) {
    const winRate20 = calculateWinRate(latest20Trades)
    if (winRate20 >= 60) unlockedKeys.add('win_rate_60')
    if (winRate20 >= 70) unlockedKeys.add('win_rate_70')
    if (winRate20 >= 80) unlockedKeys.add('win_rate_80')
  }

  if (latest50Trades.length >= 50 && calculateWinRate(latest50Trades) >= 65) {
    unlockedKeys.add('win_rate_65_50')
  }

  if (rrTrades.filter((value) => value >= 2).length >= 5) unlockedKeys.add('rr_1_2_5')
  if (rrTrades.filter((value) => value >= 3).length >= 5) unlockedKeys.add('rr_1_3_5')
  if (rrTrades.filter((value) => value >= 4).length >= 5) unlockedKeys.add('high_rr_sniper')
  if (latest30RrTrades.length >= 30) {
    const averageRr = latest30RrTrades.reduce((sum, value) => sum + value, 0) / latest30RrTrades.length
    if (averageRr >= 3) unlockedKeys.add('rr_master')
  }

  if (anyPositiveBucket(finishedTrades, (trade) => normalizeDateKey(trade.date))) {
    unlockedKeys.add('green_day_1')
  }
  if (anyPositiveBucket(finishedTrades, (trade) => getIsoWeekKey(normalizeDateKey(trade.date)))) {
    unlockedKeys.add('green_week')
  }
  if (anyPositiveBucket(finishedTrades, (trade) => getMonthKey(normalizeDateKey(trade.date)))) {
    unlockedKeys.add('green_month')
  }

  const initialTradeBalance = Number(userDoc?.profile?.initialTradeBalance) || 0
  if (initialTradeBalance > 0) {
    const totalTradePl = finishedTrades.reduce((sum, trade) => sum + (Number(trade.pl) || 0), 0)
    const returnPercent = (totalTradePl / initialTradeBalance) * 100
    if (returnPercent >= 5) unlockedKeys.add('return_5')
    if (returnPercent >= 10) unlockedKeys.add('return_10')
    if (returnPercent >= 20) unlockedKeys.add('return_20')
    if (returnPercent >= 50) unlockedKeys.add('return_50')
    if (returnPercent >= 100) unlockedKeys.add('return_100')
    if (returnPercent >= 1000) unlockedKeys.add('return_1000')
  }

  if (hasCleanBucket(finishedTrades, mistakes, (item) => getIsoWeekKey(normalizeDateKey(item.date)))) {
    unlockedKeys.add('clean_week')
  }
  if (hasCleanBucket(finishedTrades, mistakes, (item) => getMonthKey(normalizeDateKey(item.date)))) {
    unlockedKeys.add('clean_month')
  }

  if (countByField(sortedTrades, 'session', 'London') >= 20) unlockedKeys.add('london_specialist')
  if (countByField(sortedTrades, 'session', 'New York') >= 20) unlockedKeys.add('newyork_specialist')
  if (countByField(sortedTrades, 'session', 'Asia') >= 20) unlockedKeys.add('asia_specialist')
  if (countByField(sortedTrades, 'pair', 'XAUUSD') >= 25) unlockedKeys.add('gold_hunter')

  const totalLotSize = getTotalLotSize(sortedTrades)
  if (totalLotSize >= 1) unlockedKeys.add('lot_1')
  if (totalLotSize >= 10) unlockedKeys.add('lot_10')
  if (totalLotSize >= 100) unlockedKeys.add('lot_100')

  if (deposits.length > 0 && expenses.length > 0) {
    unlockedKeys.add('cashflow_starter')
  }

  if (mistakes.length >= 10) {
    unlockedKeys.add('mistake_aware')
  }

  return unlockedKeys
}

export async function syncAchievements(userId, options = {}) {
  if (!userId) return []

  const { silent = false } = options
  try {
    const [
      userSnap,
      tradesSnap,
      mistakesSnap,
      depositsSnap,
      expensesSnap,
      achievementsSnap,
    ] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDocs(query(collection(db, 'trades'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'mistakes'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'deposits'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'expenses'), where('userId', '==', userId))),
      getDocs(query(collection(db, 'achievements'), where('userId', '==', userId))),
    ])

    const userDoc = userSnap.exists() ? userSnap.data() : null
    const trades = tradesSnap.docs.map((item) => ({ id: item.id, ...item.data() }))
    const mistakes = mistakesSnap.docs.map((item) => ({ id: item.id, ...item.data() }))
    const deposits = depositsSnap.docs.map((item) => ({ id: item.id, ...item.data() }))
    const expenses = expensesSnap.docs.map((item) => ({ id: item.id, ...item.data() }))
    const existingAchievementDocs = achievementsSnap.docs
      .map((item) => ({
        id: item.id,
        key: item.data().key,
      }))
      .filter((item) => Boolean(item.key))
    const existingKeys = new Set(existingAchievementDocs.map((item) => item.key))
    const computedKeys = buildAchievementKeys({ trades, mistakes, deposits, expenses, userDoc })
    const newKeys = Array.from(computedKeys).filter((key) => !existingKeys.has(key))
    const staleAchievements = existingAchievementDocs.filter((item) => !computedKeys.has(item.key))

    await Promise.all(
      [
        ...newKeys.map((key) =>
          setDoc(doc(db, 'achievements', `${userId}_${key}`), {
            userId,
            key,
            unlockedAt: serverTimestamp(),
          })
        ),
        ...staleAchievements.map((item) => deleteDoc(doc(db, 'achievements', item.id))),
      ]
    )

    if (!silent && newKeys.length > 0) {
      toast.success(
        newKeys.length === 1
          ? 'Achievement unlocked!'
          : `${newKeys.length} achievements unlocked!`
      )
    }

    return newKeys
  } catch (error) {
    console.error('syncAchievements failed:', error)
    return []
  }
}

function getTradeBalanceImpact(tradeLike) {
  if (!tradeLike) return 0

  const result = String(tradeLike.result || '')
  if (result !== 'Win' && result !== 'Loss' && result !== 'Breakeven') {
    return 0
  }

  return Number(tradeLike.pl) || 0
}

async function withTimeout(task, label, timeoutMs = 15000) {
  let timeoutId

  try {
    return await Promise.race([
      task(),
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
  }
}

function applyBalanceDelta(transaction, userRef, userId, userSnap, balanceDelta) {
  if (!userSnap.exists()) {
    transaction.set(userRef, {
      ...createBaseUserDoc(userId, balanceDelta),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  const currentBalance = Number(userSnap.data()?.profile?.balance) || 0
  transaction.set(
    userRef,
    {
      uid: userId,
      profile: {
        balance: currentBalance + balanceDelta,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function useCollection(collectionName, userId, orderField = 'createdAt') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)

    const collectionQuery = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(orderField, 'desc'),
      limit(100),
    )

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
        setLoading(false)
      },
      (error) => {
        console.error(`Failed to load ${collectionName}:`, error)
        toast.error(`Failed to load ${collectionName}`)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [collectionName, orderField, userId])

  return { data, loading }
}

export function useTrades(userId) {
  return useCollection('trades', userId, 'createdAt')
}

export async function addTrade(userId, tradeData) {
  try {
    const tradeRef = doc(collection(db, 'trades'))
    await runTransaction(db, async (transaction) => {
      transaction.set(tradeRef, {
        userId,
        ...tradeData,
        createdAt: serverTimestamp(),
      })
    })

    toast.success('Trade logged!')
    await syncAchievements(userId)
    return tradeRef.id
  } catch (error) {
    console.error('addTrade failed:', error)
    toast.error('Failed to save trade')
    return null
  }
}

export async function updateTrade(tradeId, updates) {
  try {
    let updatedUserId = null
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'trades', tradeId)
      const tradeSnap = await transaction.get(tradeRef)

      if (!tradeSnap.exists()) {
        throw new Error('Trade not found')
      }

      const existingTrade = tradeSnap.data()
      updatedUserId = existingTrade.userId

      transaction.set(
        tradeRef,
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    })

    toast.success('Trade updated!')
    await syncAchievements(updatedUserId, { silent: true })
    return true
  } catch (error) {
    console.error('updateTrade failed:', error)
    toast.error('Failed to update trade')
    return false
  }
}

export async function deleteTrade(tradeId) {
  try {
    let deletedUserId = null
    await runTransaction(db, async (transaction) => {
      const tradeRef = doc(db, 'trades', tradeId)
      const tradeSnap = await transaction.get(tradeRef)

      if (!tradeSnap.exists()) {
        throw new Error('Trade not found')
      }

      deletedUserId = tradeSnap.data().userId
      transaction.delete(tradeRef)
    })

    toast.success('Trade deleted')
    await syncAchievements(deletedUserId, { silent: true })
    return true
  } catch (error) {
    console.error('deleteTrade failed:', error)
    toast.error('Failed to delete trade')
    return false
  }
}

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load user profile:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  return { profile, loading }
}

export async function updateUserProfile(userId, updates) {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        uid: userId,
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    toast.success('Profile saved!')
    return true
  } catch (error) {
    console.error('updateUserProfile failed:', error)
    toast.error('Failed to save profile')
    return false
  }
}

export async function saveExpenseBudgets(userId, budgets) {
  try {
    const normalizedBudgets = Object.fromEntries(
      Object.entries(budgets).map(([key, value]) => [key, Math.max(1, Number(value) || 1)])
    )

    await setDoc(
      doc(db, 'users', userId),
      {
        uid: userId,
        expenseBudgets: normalizedBudgets,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    toast.success('Budgets saved!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('saveExpenseBudgets failed:', error)
    toast.error(error.message || 'Failed to save budgets')
    return false
  }
}

export function useJournals(userId) {
  return useCollection('journals', userId, 'date')
}

export function useRoutines(userId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)

    const routinesQuery = query(collection(db, 'routines'), where('userId', '==', userId))
    const unsubscribe = onSnapshot(
      routinesQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => compareValuesDescending(a.date, b.date))

        setData(rows)
        setLoading(false)
      },
      (error) => {
        console.error('Failed to load routines:', error)
        toast.error('Failed to load routines')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [userId])

  return { data, loading }
}

export async function saveRoutineEntry(userId, entry) {
  try {
    const dateKey = entry.date
    await setDoc(
      doc(db, 'routines', `${userId}_${dateKey}`),
      {
        userId,
        ...entry,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    return true
  } catch (error) {
    console.error('saveRoutineEntry failed:', error)
    toast.error('Failed to save routine')
    return false
  }
}

export async function saveJournalEntry(userId, entry) {
  try {
    const dateKey = entry.date
    await setDoc(
      doc(db, 'journals', `${userId}_${dateKey}`),
      {
        userId,
        ...entry,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    toast.success('Journal saved!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('saveJournalEntry failed:', error)
    toast.error('Failed to save journal')
    return false
  }
}

export function useExpenses(userId) {
  return useCollection('expenses', userId, 'date')
}

export async function addExpense(userId, expense) {
  try {
    const amount = parsePositiveAmount(expense.amount, 'Expense amount')

    await withTimeout(
      () =>
        runTransaction(db, async (transaction) => {
          const expenseRef = doc(collection(db, 'expenses'))
          const userRef = doc(db, 'users', userId)
          const userSnap = await transaction.get(userRef)

          transaction.set(expenseRef, {
            userId,
            ...expense,
            amount,
            createdAt: serverTimestamp(),
          })
          applyBalanceDelta(transaction, userRef, userId, userSnap, -amount)
        }),
      'Saving expense'
    )

    toast.success('Expense saved!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('addExpense failed:', error)
    toast.error(error.message || 'Failed to save expense')
    return false
  }
}

export async function deleteExpense(userId, expenseId) {
  try {
    await withTimeout(
      () =>
        runTransaction(db, async (transaction) => {
          const expenseRef = doc(db, 'expenses', expenseId)
          const userRef = doc(db, 'users', userId)
          const expenseSnap = await transaction.get(expenseRef)
          const userSnap = await transaction.get(userRef)

          if (!expenseSnap.exists()) {
            throw new Error('Expense not found')
          }

          const expenseData = expenseSnap.data()
          if (expenseData.userId !== userId) {
            throw new Error('You do not have permission to delete this expense')
          }

          const amount = parsePositiveAmount(expenseData.amount, 'Expense amount')
          transaction.delete(expenseRef)
          applyBalanceDelta(transaction, userRef, userId, userSnap, amount)
        }),
      'Deleting expense'
    )

    toast.success('Expense deleted!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('deleteExpense failed:', error)
    toast.error(error.message || 'Failed to delete expense')
    return false
  }
}

export function useDeposits(userId) {
  return useCollection('deposits', userId, 'date')
}

export async function addDeposit(userId, deposit) {
  try {
    const amount = parsePositiveAmount(deposit.amount, 'Deposit amount')

    await withTimeout(
      () =>
        runTransaction(db, async (transaction) => {
          const depositRef = doc(collection(db, 'deposits'))
          const userRef = doc(db, 'users', userId)
          const userSnap = await transaction.get(userRef)

          transaction.set(depositRef, {
            userId,
            ...deposit,
            amount,
            createdAt: serverTimestamp(),
          })
          applyBalanceDelta(transaction, userRef, userId, userSnap, amount)
        }),
      'Saving deposit'
    )

    toast.success('Deposit saved!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('addDeposit failed:', error)
    toast.error(error.message || 'Failed to save deposit')
    return false
  }
}

export async function deleteDeposit(userId, depositId) {
  try {
    await withTimeout(
      () =>
        runTransaction(db, async (transaction) => {
          const depositRef = doc(db, 'deposits', depositId)
          const userRef = doc(db, 'users', userId)
          const depositSnap = await transaction.get(depositRef)
          const userSnap = await transaction.get(userRef)

          if (!depositSnap.exists()) {
            throw new Error('Deposit not found')
          }

          const depositData = depositSnap.data()
          if (depositData.userId !== userId) {
            throw new Error('You do not have permission to delete this deposit')
          }

          const amount = parsePositiveAmount(depositData.amount, 'Deposit amount')
          transaction.delete(depositRef)
          applyBalanceDelta(transaction, userRef, userId, userSnap, -amount)
        }),
      'Deleting deposit'
    )

    toast.success('Deposit deleted!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('deleteDeposit failed:', error)
    toast.error(error.message || 'Failed to delete deposit')
    return false
  }
}

export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setHabits([])
      setLoading(false)
      return
    }

    const habitsQuery = query(collection(db, 'habits'), where('userId', '==', userId))
    const unsubscribe = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  return { habits, loading }
}

export async function checkInHabit(habitId) {
  const today = new Date().toISOString().split('T')[0]
  const habitRef = doc(db, 'habits', habitId)
  const habitSnap = await getDoc(habitRef)

  if (!habitSnap.exists()) return

  const data = habitSnap.data()
  const dates = data.completedDates || []

  if (!dates.includes(today)) {
    await updateDoc(habitRef, {
      streak: (data.streak || 0) + 1,
      completedDates: [...dates, today],
      lastChecked: today,
      updatedAt: serverTimestamp(),
    })
    toast.success('Habit checked!')
  }
}

export async function initHabits(userId) {
  const defaultHabits = [
    'Morning Meditation',
    'Trading Plan Review',
    'Journal Writing',
    'Exercise',
    'No Revenge Trading',
  ]

  for (const name of defaultHabits) {
    await addDoc(collection(db, 'habits'), {
      userId,
      name,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: serverTimestamp(),
    })
  }
}

export function useMistakes(userId) {
  return useCollection('mistakes', userId, 'createdAt')
}

export async function logMistake(userId, data) {
  try {
    await addDoc(collection(db, 'mistakes'), {
      userId,
      ...data,
      createdAt: serverTimestamp(),
    })
    toast.success('Mistake logged - learn from it!')
    await syncAchievements(userId, { silent: true })
    return true
  } catch (error) {
    console.error('logMistake failed:', error)
    toast.error('Failed to log mistake')
    return false
  }
}

export function usePsychology(userId) {
  return useCollection('psychology', userId, 'date')
}

export async function savePsychEntry(userId, entry) {
  try {
    await addDoc(collection(db, 'psychology'), {
      userId,
      ...entry,
      createdAt: serverTimestamp(),
    })
    toast.success('Psychology entry saved!')
    return true
  } catch (error) {
    console.error('savePsychEntry failed:', error)
    toast.error('Failed to save entry')
    return false
  }
}

export function useAchievements(userId) {
  return useCollection('achievements', userId, 'unlockedAt')
}

export function useStrategies(userId) {
  return useCollection('strategies', userId, 'createdAt')
}

export async function addStrategy(userId, data) {
  try {
    await addDoc(collection(db, 'strategies'), {
      userId,
      ...data,
      createdAt: serverTimestamp(),
    })
    toast.success('Strategy saved!')
    return true
  } catch (error) {
    console.error('addStrategy failed:', error)
    toast.error('Failed to save strategy')
    return false
  }
}

export function calculateAchievementLevel(unlockedCount, totalAchievements) {
  const safeTotal = Math.max(1, Number(totalAchievements) || 1)
  const safeUnlocked = Math.max(0, Number(unlockedCount) || 0)
  const progress = Math.min(1, safeUnlocked / safeTotal)

  if (progress >= 1) {
    return {
      level: 10,
      xp: 1000,
      xpMax: 1000,
      unlockedCount: safeUnlocked,
      totalAchievements: safeTotal,
      progress,
    }
  }

  const scaled = progress * 10
  const level = Math.min(10, Math.floor(scaled) + 1)
  const xp = Math.max(0, Math.min(999, Math.round((scaled - Math.floor(scaled)) * 1000)))

  return {
    level,
    xp,
    xpMax: 1000,
    unlockedCount: safeUnlocked,
    totalAchievements: safeTotal,
    progress,
  }
}

export function calcTradeStats(trades) {
  if (!trades.length) {
    return { winRate: 0, totalPL: 0, totalTrades: 0, avgRR: '-', wins: 0, losses: 0 }
  }

  const completed = trades.filter((trade) => trade.result === 'Win' || trade.result === 'Loss')
  const wins = completed.filter((trade) => trade.result === 'Win').length
  const totalPL = trades.reduce((sum, trade) => sum + (Number(trade.pl) || 0), 0)
  const winRate = completed.length ? Math.round((wins / completed.length) * 100) : 0

  return {
    winRate,
    totalPL,
    totalTrades: trades.length,
    wins,
    losses: completed.length - wins,
    avgRR: '1 : 2.0',
  }
}
