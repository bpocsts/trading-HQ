// src/components/ui/ProfileModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateUserProfile } from '../../hooks/useFirestore'
import { useUserProfile } from '../../hooks/useFirestore'
import { useAuth } from '../../hooks/useAuth'
import useStore from '../../store/useStore'

const ROLES = [
  'Smart Money Concept Trader', 'Price Action Trader', 'Swing Trader',
  'Scalper', 'Day Trader', 'ICT Trader', 'Algo Trader',
]
const SESSIONS = ['London', 'New York', 'Asia', 'Sydney', 'All Sessions']
const PAIRS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD', 'NZDUSD', 'USDCAD']

export default function ProfileModal() {
  const { showProfileModal, setShowProfileModal } = useStore()
  const { user } = useAuth()
  const { profile: liveProfile } = useUserProfile(user?.uid)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', role: '', balance: '', bestSession: '',
    xp: 0, xpMax: 1000,
  })

  useEffect(() => {
    if (liveProfile?.profile) {
      const p = liveProfile.profile
      setForm({ name: p.name || '', role: p.role || '', balance: p.balance || '', bestSession: p.bestSession || '', xp: p.xp || 0, xpMax: p.xpMax || 1000 })
    }
  }, [liveProfile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await updateUserProfile(user.uid, {
      'profile.name': form.name,
      'profile.role': form.role,
      'profile.balance': Number(form.balance),
      'profile.bestSession': form.bestSession,
    })
    setSaving(false)
    setShowProfileModal(false)
  }

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )

  return (
    <AnimatePresence>
      {showProfileModal && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && setShowProfileModal(false)}>
          <motion.div className="modal-box" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>✎ EDIT PROFILE</div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <Field label="Trader Name">
              <input className="input-dark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
            </Field>

            <Field label="Trader Role / Style">
              <select className="input-dark" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Account Balance ($)">
                <input className="input-dark" type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="10000" />
              </Field>
              <Field label="Best Trading Session">
                <select className="input-dark" value={form.bestSession} onChange={e => setForm(f => ({ ...f, bestSession: e.target.value }))}>
                  {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Field label={`XP Progress (${form.xp} / ${form.xpMax})`}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(form.xp / form.xpMax) * 100}%` }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>XP increases automatically as you log trades and complete habits</div>
            </Field>

            <div style={{ padding: '10px 12px', background: 'rgba(57,255,20,0.04)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 16, fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
              💡 Win Rate, Total Trades, and Streak are calculated automatically from your trade log
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowProfileModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Profile'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
