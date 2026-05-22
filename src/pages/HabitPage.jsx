// src/pages/HabitPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useHabits, checkInHabit } from '../hooks/useFirestore'
import { habits as mockHabits } from '../data/mockData'

export default function HabitPage() {
  const { user } = useAuth()
  const { habits: liveHabits, loading } = useHabits(user?.uid)
  const habits = liveHabits.length ? liveHabits : mockHabits
  const [newHabit, setNewHabit] = useState('')
  const [adding, setAdding] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleCheckIn = async (habitId) => {
    if (!user) return
    await checkInHabit(habitId, user.uid)
  }

  const handleAddHabit = async () => {
    if (!newHabit.trim() || !user) return
    setAdding(true)
    await addDoc(collection(db, 'habits'), {
      userId: user.uid, name: newHabit.trim(),
      streak: 0, longestStreak: 0, completedDates: [],
      createdAt: serverTimestamp(),
    })
    setNewHabit('')
    setAdding(false)
  }

  const streakColor = (n) => {
    if (n >= 7) return '#39ff14'
    if (n >= 3) return '#ffcc00'
    return '#ff6b35'
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>HABIT TRACKER</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Build discipline one day at a time</div>
      </div>

      {/* Add habit */}
      <div className="glass-card" style={{ padding: 14, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <input className="input-dark" placeholder="Add new habit (e.g. Cold Shower, Read 30 min)..."
          value={newHabit} onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
          style={{ flex: 1 }} />
        <button className="btn-primary" onClick={handleAddHabit} disabled={adding}>
          {adding ? '...' : '+ Add Habit'}
        </button>
      </div>

      {/* Habit cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {habits.map((h, i) => {
          const checkedToday = h.completedDates?.includes(today)
          return (
            <motion.div
              key={h.id || i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card"
              style={{ padding: 16, borderColor: checkedToday ? 'rgba(57,255,20,0.3)' : 'var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{h.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 1 }}>
                    {checkedToday ? '✅ Done today' : '⏳ Not done yet'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: streakColor(h.streak || 0), lineHeight: 1 }}>
                    {h.streak || 0}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>day streak</div>
                </div>
              </div>

              {/* Mini calendar dots */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - dayIdx))
                  const dateStr = d.toISOString().split('T')[0]
                  const done = h.completedDates?.includes(dateStr)
                  return (
                    <div key={dayIdx} style={{
                      flex: 1, height: 6, borderRadius: 2,
                      background: done ? 'var(--ng)' : 'rgba(57,255,20,0.08)',
                      boxShadow: done ? '0 0 4px rgba(57,255,20,0.5)' : 'none',
                    }} title={dateStr} />
                  )
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCheckIn(h.id)}
                disabled={checkedToday}
                style={{
                  width: '100%', padding: '8px', border: 'none', borderRadius: 8, cursor: checkedToday ? 'default' : 'pointer',
                  background: checkedToday ? 'rgba(57,255,20,0.08)' : 'rgba(57,255,20,0.12)',
                  color: checkedToday ? 'var(--text3)' : 'var(--ng)',
                  fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, letterSpacing: 1,
                  border: `1px solid ${checkedToday ? 'transparent' : 'rgba(57,255,20,0.3)'}`,
                  transition: 'all 0.2s',
                }}
              >
                {checkedToday ? '✅ Completed Today' : '🔥 Check In'}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* Motivation quote */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px', borderTop: '1px solid var(--border)', marginTop: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic' }}>"We are what we repeatedly do. Excellence is not an act, but a habit."</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>— Aristotle</div>
      </div>
    </div>
  )
}
