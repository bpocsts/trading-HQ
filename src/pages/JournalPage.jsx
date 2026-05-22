// src/pages/JournalPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useJournals, saveJournalEntry } from '../hooks/useFirestore'
import { format } from 'date-fns'

const MOODS = [
  { v: 1, label: '😤 Frustrated' },
  { v: 3, label: '😟 Anxious' },
  { v: 5, label: '😐 Neutral' },
  { v: 7, label: '😊 Confident' },
  { v: 10, label: '🔥 Focused' },
]

export default function JournalPage() {
  const { user } = useAuth()
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: journals, loading } = useJournals(user?.uid)

  const [form, setForm] = useState({
    date: today,
    content: '',
    mood: 7,
    keyLearnings: '',
    tomorrowPlan: '',
    sessionsTraded: '',
    pairs: '',
  })
  const [saving, setSaving] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  const handleSave = async () => {
    if (!form.content.trim()) return
    setSaving(true)
    await saveJournalEntry(user.uid, form)
    setSaving(false)
    setForm(f => ({ ...f, content: '', keyLearnings: '', tomorrowPlan: '' }))
  }

  const moodColor = (m) => {
    if (m >= 8) return 'var(--ng)'
    if (m >= 6) return '#00cfff'
    if (m >= 4) return '#ffcc00'
    return 'var(--red)'
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', gap: 14, height: '100%' }}>

      {/* Left: Entry list */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2, marginBottom: 4 }}>PAST ENTRIES</div>
        {loading && <div style={{ fontSize: 11, color: 'var(--text3)' }}>Loading...</div>}
        {!loading && !journals.length && (
          <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', padding: '10px 0' }}>No journal entries yet.<br />Start writing today!</div>
        )}
        {journals.map(j => (
          <motion.div
            key={j.id}
            whileHover={{ x: 2 }}
            onClick={() => setSelectedEntry(j)}
            className="glass-card"
            style={{ padding: '10px 12px', cursor: 'pointer', borderColor: selectedEntry?.id === j.id ? 'var(--border2)' : 'var(--border)' }}
          >
            <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{j.date}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {j.content?.substring(0, 40) || 'No content'}...
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: moodColor(j.mood || 5) }} />
              <span style={{ fontSize: 9, color: 'var(--text3)' }}>Mood: {j.mood || '—'}/10</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right: Editor or viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {selectedEntry ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)' }}>{selectedEntry.date}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Mood: <span style={{ color: moodColor(selectedEntry.mood) }}>{selectedEntry.mood}/10</span></div>
              </div>
              <button className="btn-ghost" onClick={() => setSelectedEntry(null)}>✕ Close</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 14 }}>{selectedEntry.content}</div>
            {selectedEntry.keyLearnings && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--ng)', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: 4 }}>KEY LEARNINGS</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>{selectedEntry.keyLearnings}</div>
              </div>
            )}
            {selectedEntry.tomorrowPlan && (
              <div>
                <div style={{ fontSize: 10, color: '#00cfff', fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: 4 }}>TOMORROW'S PLAN</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>{selectedEntry.tomorrowPlan}</div>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* New Entry Form */}
            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 0 }}><span>📝</span>Today's Journal — {today}</div>
              </div>

              {/* Mood */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 6 }}>Mood Today</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MOODS.map(m => (
                    <button key={m.v} onClick={() => setForm(f => ({ ...f, mood: m.v }))} style={{
                      padding: '5px 12px', border: `1px solid ${form.mood === m.v ? 'var(--border2)' : 'var(--border)'}`,
                      borderRadius: 6, background: form.mood === m.v ? 'rgba(57,255,20,0.1)' : 'transparent',
                      color: form.mood === m.v ? 'var(--ng)' : 'var(--text3)',
                      cursor: 'pointer', fontSize: 10, fontFamily: 'Exo 2',
                    }}>{m.label}</button>
                  ))}
                </div>
              </div>

              {/* Session & Pairs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 4 }}>Sessions Traded</div>
                  <input className="input-dark" placeholder="London, New York..." value={form.sessionsTraded} onChange={e => setForm(f => ({ ...f, sessionsTraded: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 4 }}>Pairs Traded</div>
                  <input className="input-dark" placeholder="XAUUSD, EURUSD..." value={form.pairs} onChange={e => setForm(f => ({ ...f, pairs: e.target.value }))} />
                </div>
              </div>

              {/* Main content */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 4 }}>Journal Entry</div>
                <textarea className="input-dark" rows={5} placeholder="How did your trading session go today? What did you observe? How did you feel during trades?..."
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: 100, lineHeight: 1.6 }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--ng)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 4 }}>Key Learnings</div>
                <textarea className="input-dark" rows={2} placeholder="What did you learn today?..."
                  value={form.keyLearnings} onChange={e => setForm(f => ({ ...f, keyLearnings: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: '#00cfff', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', marginBottom: 4 }}>Tomorrow's Plan</div>
                <textarea className="input-dark" rows={2} placeholder="What will you focus on tomorrow?..."
                  value={form.tomorrowPlan} onChange={e => setForm(f => ({ ...f, tomorrowPlan: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? '...' : '📝 Save Journal Entry'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
