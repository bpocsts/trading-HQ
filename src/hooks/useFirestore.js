// src/hooks/useFirestore.js
import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  getDoc, setDoc, limit,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'

// ── Generic real-time collection hook ──────────────────────────────────────
export function useCollection(collectionName, userId, orderField = 'createdAt') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(orderField, 'desc'),
      limit(100),
    )
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error(err)
      setLoading(false)
    })
    return unsub
  }, [collectionName, userId])

  return { data, loading }
}

// ── Trades ────────────────────────────────────────────────────────────────
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
    toast.success('Trade logged! 📊')
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

// ── User Profile ───────────────────────────────────────────────────────────
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(doc(db, 'users', userId), snap => {
      if (snap.exists()) setProfile(snap.data())
      setLoading(false)
    })
    return unsub
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

// ── Journal ───────────────────────────────────────────────────────────────
export function useJournals(userId) {
  return useCollection('journals', userId, 'date')
}

export async function saveJournalEntry(userId, entry) {
  try {
    const dateKey = entry.date // 'YYYY-MM-DD'
    const ref = doc(db, 'journals', `${userId}_${dateKey}`)
    await setDoc(ref, { userId, ...entry, updatedAt: serverTimestamp() }, { merge: true })
    toast.success('Journal saved! ✍')
    return true
  } catch (e) {
    toast.error('Failed to save journal')
    return false
  }
}

// ── Habits ────────────────────────────────────────────────────────────────
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

export async function checkInHabit(habitId, userId) {
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
      toast.success('Habit checked! 🔥')
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
      userId, name, streak: 0,
      longestStreak: 0, completedDates: [],
      createdAt: serverTimestamp(),
    })
  }
}

// ── Mistakes ──────────────────────────────────────────────────────────────
export function useMistakes(userId) {
  return useCollection('mistakes', userId, 'createdAt')
}

export async function logMistake(userId, data) {
  try {
    await addDoc(collection(db, 'mistakes'), {
      userId, ...data, createdAt: serverTimestamp(),
    })
    toast.success('Mistake logged — learn from it! 🧠')
    return true
  } catch (e) {
    toast.error('Failed to log mistake')
    return false
  }
}

// ── Psychology ────────────────────────────────────────────────────────────
export function usePsychology(userId) {
  return useCollection('psychology', userId, 'date')
}

export async function savePsychEntry(userId, entry) {
  try {
    await addDoc(collection(db, 'psychology'), {
      userId, ...entry, createdAt: serverTimestamp(),
    })
    toast.success('Psychology entry saved!')
    return true
  } catch (e) {
    toast.error('Failed to save entry')
    return false
  }
}

// ── Achievements ──────────────────────────────────────────────────────────
export function useAchievements(userId) {
  return useCollection('achievements', userId, 'unlockedAt')
}

// ── Strategies ────────────────────────────────────────────────────────────
export function useStrategies(userId) {
  return useCollection('strategies', userId, 'createdAt')
}

export async function addStrategy(userId, data) {
  try {
    await addDoc(collection(db, 'strategies'), {
      userId, ...data, createdAt: serverTimestamp(),
    })
    toast.success('Strategy saved! 📚')
    return true
  } catch (e) {
    toast.error('Failed to save strategy')
    return false
  }
}

// ── Stats Calculator ──────────────────────────────────────────────────────
export function calcTradeStats(trades) {
  if (!trades.length) return { winRate: 0, totalPL: 0, totalTrades: 0, avgRR: '—', wins: 0, losses: 0 }
  const completed = trades.filter(t => t.result === 'Win' || t.result === 'Loss')
  const wins = completed.filter(t => t.result === 'Win').length
  const totalPL = trades.reduce((s, t) => s + (Number(t.pl) || 0), 0)
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
