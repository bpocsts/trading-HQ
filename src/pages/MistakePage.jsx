// src/pages/MistakePage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useMistakes, logMistake } from '../hooks/useFirestore'
import { mistakes as mockMistakes } from '../data/mockData'

const MISTAKE_TYPES = [
  { label: 'No Confirmation', color: '#ff4444', icon: '🚫' },
  { label: 'Early Entry', color: '#ff8c00', icon: '⚡' },
  { label: 'FOMO', color: '#ffcc00', icon: '😱' },
  { label: 'Revenge Trading', color: '#ff6b35', icon: '🤬' },
  { label: 'Over Risk', color: '#ffaa00', icon: '💸' },
  { label: 'No Stop Loss', color: '#ff4444', icon: '🎲' },
  { label: 'Moving SL', color: '#ff8c00', icon: '🔄' },
  { label: 'Overtrading', color: '#ffcc00', icon: '📈' },
]

export default function MistakePage() {
  const { user } = useAuth()
  const { data: liveMistakes } = useMistakes(user?.uid)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: '', description: '', tradeId: '' })

  const handleLog = async () => {
    if (!form.type) return
    setSaving(true)
    await logMistake(user.uid, { ...form, date: new Date().toISOString().split('T')[0] })
    setSaving(false)
    setForm({ type: '', description: '', tradeId: '' })
  }

  // Count mistakes by type
  const counts = {}
  ;[...liveMistakes].forEach(m => { counts[m.type] = (counts[m.type] || 0) + 1 })

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: '#ffaa00', letterSpacing: 2 }}>MISTAKE TRACKER</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Identify, track, and eliminate your trading errors</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Log form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>⚠</span>Log a Mistake</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Mistake Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {MISTAKE_TYPES.map(m => (
                <button key={m.label} onClick={() => setForm(f => ({ ...f, type: m.label }))} style={{
                  padding: '7px 10px', border: `1px solid ${form.type === m.label ? m.color + '66' : 'var(--border)'}`,
                  borderRadius: 7, background: form.type === m.label ? `${m.color}12` : 'transparent',
                  color: form.type === m.label ? m.color : 'var(--text3)',
                  cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 10, textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Description</div>
            <textarea className="input-dark" rows={3} placeholder="What happened? What caused this mistake?..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Related Trade (optional)</div>
            <input className="input-dark" placeholder="Trade ID or pair (e.g. XAUUSD May 16)" value={form.tradeId} onChange={e => setForm(f => ({ ...f, tradeId: e.target.value }))} />
          </div>

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%', background: '#ffaa00', boxShadow: '0 0 12px rgba(255,170,0,0.3)' }} onClick={handleLog} disabled={saving || !form.type}>
            {saving ? '...' : '⚠ Log This Mistake'}
          </button>
        </motion.div>

        {/* Live counts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>📊</span>Mistake Frequency</div>
          {MISTAKE_TYPES.map((m, i) => {
            const c = counts[m.label] || 0
            return (
              <div key={m.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5 }}>
                  <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{m.icon}</span>{m.label}
                  </span>
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: m.color }}>{c}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,170,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c / maxCount) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${m.color}99, ${m.color})`, borderRadius: 2, boxShadow: `0 0 4px ${m.color}55` }}
                  />
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: 8, fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
            💡 <strong style={{ color: '#ffcc00' }}>Insight:</strong> Most traders fail by repeating the same mistakes.<br />
            Logging creates awareness. Awareness creates change.
          </div>
        </motion.div>
      </div>

      {/* Recent mistakes */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 16 }}>
        <div className="card-title"><span>📋</span>Recent Mistakes Log</div>
        {!liveMistakes.length && (
          <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
            No mistakes logged yet 🎯<br />
            <span style={{ fontSize: 10 }}>Keep trading clean!</span>
          </div>
        )}
        {liveMistakes.slice(0, 10).map(m => {
          const meta = MISTAKE_TYPES.find(t => t.label === m.type) || { color: '#ffaa00', icon: '⚠' }
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(57,255,20,0.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${meta.color}12`, border: `1px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                {meta.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: meta.color }}>{m.type}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>{m.date}</span>
                </div>
                {m.description && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, lineHeight: 1.4 }}>{m.description}</div>}
              </div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
