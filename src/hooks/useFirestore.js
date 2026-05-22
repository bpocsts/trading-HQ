import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  getDoc, setDoc, limit, increment,
} from 'firebase/firestore'
import {
  getFirestore as getLiteFirestore,
  collection as liteCollection,
  query as liteQuery,
  where as liteWhere,
  limit as liteLimit,
  getDocs as liteGetDocs,
  addDoc as liteAddDoc,
  doc as liteDoc,
  getDoc as liteGetDoc,
  setDoc as liteSetDoc,
  deleteDoc as liteDeleteDoc,
  serverTimestamp as liteServerTimestamp,
  increment as liteIncrement,
} from 'firebase/firestore/lite'
import { db } from '../lib/firebase'
import firebaseApp from '../lib/firebase'
import toast from 'react-hot-toast'

const dbLite = getLiteFirestore(firebaseApp)

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

function sortDocsByField(items, orderField) {
  return [...items].sort((a, b) => {
    const aValue = a?.[orderField]
    const bValue = b?.[orderField]

    if (!aValue && !bValue) return 0
    if (!aValue) return 1
    if (!bValue) return -1

    const aComparable = typeof aValue?.toDate === 'function' ? aValue.toDate().getTime() : aValue
    const bComparable = typeof bValue?.toDate === 'function' ? bValue.toDate().getTime() : bValue

    if (aComparable > bComparable) return -1
    if (aComparable < bComparable) return 1
    return 0
  })
}

async function ensureUserProfileDoc(userId, balanceDelta = 0) {
  const userRef = liteDoc(dbLite, 'users', userId)
  const userSnap = await liteGetDoc(userRef)

  if (userSnap.exists()) {
    await liteSetDoc(
      userRef,
      {
        uid: userId,
        profile: {
          balance: liteIncrement(balanceDelta),
        },
        updatedAt: liteServerTimestamp(),
      },
      { merge: true }
    )
    return
  }

  await liteSetDoc(userRef, {
    uid: userId,
    profile: {
      name: 'Trader',
      role: 'Trader',
      level: 1,
      xp: 0,
      xpMax: 1000,
      winRate: 0,
      rrAverage: '-',
      totalTrades: 0,
      balance: balanceDelta,
      bestSession: '-',
      currentStreak: 0,
    },
    dailyStats: { hp: 8, mood: 7, focus: 8, motivation: 9 },
    todayFocus: { session: 'London', pair: 'XAUUSD', bias: 'Neutral', keyLevel: '', notes: '' },
    createdAt: liteServerTimestamp(),
    updatedAt: liteServerTimestamp(),
  })
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

    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      limit(100),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aValue = a?.[orderField]
            const bValue = b?.[orderField]

            if (!aValue && !bValue) return 0
            if (!aValue) return 1
            if (!bValue) return -1

            const aComparable = typeof aValue?.toDate === 'function' ? aValue.toDate().getTime() : aValue
            const bComparable = typeof bValue?.toDate === 'function' ? bValue.toDate().getTime() : bValue

            if (aComparable > bComparable) return -1
            if (aComparable < bComparable) return 1
            return 0
          })

        setData(docs)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        toast.error(`Failed to load ${collectionName}`)
        setLoading(false)
      }
    )

    return unsub
  }, [collectionName, userId, orderField])

  return { data, loading }
}

export function useTrades(userId) {
  return useCollection('trades', userId, 'createdAt')
}

export async function addTrade(userId, tradeData) {
  try {
    await addDoc(collection(db, 'trades'), {
      userId,
      ...tradeData,
      createdAt: serverTimestamp(),
    })
    toast.success('Trade logged!')
    return true
  } catch (e) {
    toast.error('Failed to save trade')
    return false
  }
}

export async function updateTrade(tradeId, updates) {
  try {
    await updateDoc(doc(db, 'trades', tradeId), { ...updates, updatedAt: serverTimestamp() })
    toast.success('Trade updated!')
  } catch (e) {
    toast.error('Failed to update trade')
  }
}

export async function deleteTrade(tradeId) {
  try {
    await deleteDoc(doc(db, 'trades', tradeId))
    toast.success('Trade deleted')
  } catch (e) {
    toast.error('Failed to delete trade')
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

    let cancelled = false

    const loadProfile = async () => {
      try {
        const snap = await liteGetDoc(liteDoc(dbLite, 'users', userId))
        if (!cancelled) {
          setProfile(snap.exists() ? snap.data() : null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProfile()
    const intervalId = window.setInterval(loadProfile, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [userId])

  return { profile, loading }
}

export async function updateUserProfile(userId, updates) {
  try {
    await updateDoc(doc(db, 'users', userId), { ...updates, updatedAt: serverTimestamp() })
    toast.success('Profile saved!')
  } catch (e) {
    toast.error('Failed to save profile')
  }
}

export async function saveExpenseBudgets(userId, budgets) {
  try {
    await liteSetDoc(
      liteDoc(dbLite, 'users', userId),
      {
        uid: userId,
        expenseBudgets: budgets,
        updatedAt: liteServerTimestamp(),
      },
      { merge: true }
    )
    toast.success('Budgets saved!')
    return true
  } catch (e) {
    console.error('saveExpenseBudgets failed:', e)
    toast.error(e.message || 'Failed to save budgets')
    return false
  }
}

export function useJournals(userId) {
  return useCollection('journals', userId, 'date')
}

export async function saveJournalEntry(userId, entry) {
  try {
    const dateKey = entry.date
    const ref = doc(db, 'journals', `${userId}_${dateKey}`)
    await setDoc(ref, { userId, ...entry, updatedAt: serverTimestamp() }, { merge: true })
    toast.success('Journal saved!')
    return true
  } catch (e) {
    toast.error('Failed to save journal')
    return false
  }
}

export function useExpenses(userId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    let cancelled = false

    const loadExpenses = async () => {
      try {
        const expensesQuery = liteQuery(
          liteCollection(dbLite, 'expenses'),
          liteWhere('userId', '==', userId),
          liteLimit(100),
        )

        const snap = await liteGetDocs(expensesQuery)
        const docs = sortDocsByField(
          snap.docs.map((item) => ({ id: item.id, ...item.data() })),
          'date'
        )

        if (!cancelled) {
          setData(docs)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load expenses:', error)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadExpenses()
    const intervalId = window.setInterval(loadExpenses, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [userId])

  return { data, loading }
}

export async function addExpense(userId, expense) {
  try {
    const amount = Number(expense.amount) || 0
    await withTimeout(async () => {
      await liteAddDoc(liteCollection(dbLite, 'expenses'), {
        userId,
        ...expense,
        amount,
        createdAt: liteServerTimestamp(),
      })
      await ensureUserProfileDoc(userId, -amount)
    }, 'Saving expense')
    toast.success('Expense saved!')
    return true
  } catch (e) {
    console.error('addExpense failed:', e)
    toast.error(e.message || 'Failed to save expense')
    return false
  }
}

export async function deleteExpense(userId, expenseId, amount) {
  try {
    const parsedAmount = Number(amount) || 0
    await withTimeout(async () => {
      await liteDeleteDoc(liteDoc(dbLite, 'expenses', expenseId))
      await ensureUserProfileDoc(userId, parsedAmount)
    }, 'Deleting expense')
    toast.success('Expense deleted!')
    return true
  } catch (e) {
    console.error('deleteExpense failed:', e)
    toast.error(e.message || 'Failed to delete expense')
    return false
  }
}

export function useDeposits(userId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      return
    }

    let cancelled = false

    const loadDeposits = async () => {
      try {
        const depositsQuery = liteQuery(
          liteCollection(dbLite, 'deposits'),
          liteWhere('userId', '==', userId),
          liteLimit(100),
        )

        const snap = await liteGetDocs(depositsQuery)
        const docs = sortDocsByField(
          snap.docs.map((item) => ({ id: item.id, ...item.data() })),
          'date'
        )

        if (!cancelled) {
          setData(docs)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load deposits:', error)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDeposits()
    const intervalId = window.setInterval(loadDeposits, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [userId])

  return { data, loading }
}

export async function addDeposit(userId, deposit) {
  try {
    const amount = Number(deposit.amount) || 0
    await withTimeout(async () => {
      await liteAddDoc(liteCollection(dbLite, 'deposits'), {
        userId,
        ...deposit,
        amount,
        createdAt: liteServerTimestamp(),
      })
      await ensureUserProfileDoc(userId, amount)
    }, 'Saving deposit')
    toast.success('Deposit saved!')
    return true
  } catch (e) {
    console.error('addDeposit failed:', e)
    toast.error(e.message || 'Failed to save deposit')
    return false
  }
}

export async function deleteDeposit(userId, depositId, amount) {
  try {
    const parsedAmount = Number(amount) || 0
    await withTimeout(async () => {
      await liteDeleteDoc(liteDoc(dbLite, 'deposits', depositId))
      await ensureUserProfileDoc(userId, -parsedAmount)
    }, 'Deleting deposit')
    toast.success('Deposit deleted!')
    return true
  } catch (e) {
    console.error('deleteDeposit failed:', e)
    toast.error(e.message || 'Failed to delete deposit')
    return false
  }
}

export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(
      query(collection(db, 'habits'), where('userId', '==', userId)),
      snap => {
        setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }
    )
    return unsub
  }, [userId])

  return { habits, loading }
}

export async function checkInHabit(habitId) {
  const today = new Date().toISOString().split('T')[0]
  const ref = doc(db, 'habits', habitId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    const dates = data.completedDates || []
    if (!dates.includes(today)) {
      await updateDoc(ref, {
        streak: (data.streak || 0) + 1,
        completedDates: [...dates, today],
        lastChecked: today,
        updatedAt: serverTimestamp(),
      })
      toast.success('Habit checked!')
    }
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
    return true
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    toast.error('Failed to save strategy')
    return false
  }
}

export function calcTradeStats(trades) {
  if (!trades.length) {
    return { winRate: 0, totalPL: 0, totalTrades: 0, avgRR: '-', wins: 0, losses: 0 }
  }

  const completed = trades.filter(t => t.result === 'Win' || t.result === 'Loss')
  const wins = completed.filter(t => t.result === 'Win').length
  const totalPL = trades.reduce((sum, t) => sum + (Number(t.pl) || 0), 0)
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
