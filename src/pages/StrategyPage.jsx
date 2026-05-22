// src/pages/StrategyPage.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useStrategies, addStrategy } from '../hooks/useFirestore'

const TIMEFRAMES = ['1m','5m','15m','30m','1H','4H','D1','W1']
const PAIRS = ['XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','NZDUSD']

const defaultStrategies = [
  { id: 'demo1', name: 'BOS + Retest', description: 'Wait for a Break of Structure, then enter on the retest of the broken level.', rules: ['Identify HH/HL or LH/LL structure','Wait for BOS confirmation','Enter on retest with confirmation candle','SL below/above last swing','Target next major level'], timeframes: ['15m','1H'], pairs: ['XAUUSD','EURUSD'], winRate: 67 },
  { id: 'demo2', name: 'SMC Order Block', description: 'Trade from institutional order blocks identified on higher timeframes.', rules: ['Mark OB on 4H or D1','Wait for price to return to OB','Look for reversal confirmation on 15m','Enter with tight SL','Minimum 1:2 RR'], timeframes: ['4H','1H','15m'], pairs: ['XAUUSD','GBPUSD'], winRate: 72 },
]

export default function StrategyPage() {
  const { user } = useAuth()
  const { data: liveStrategies } = useStrategies(user?.uid)
  const strategies = liveStrategies.length ? liveStrategies : defaultStrategies
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', rules: '', timeframes: [], pairs: [], notes: '' })

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await addStrategy(user.uid, { ...form, rules: form.rules.split('\n').filter(Boolean), winRate: 0 })
    setSaving(false)
    setShowForm(false)
    setForm({ name: '', description: '', rules: '', timeframes: [], pairs: [], notes: '' })
  }

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>STRATEGY LIBRARY</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Your personal trading playbook</div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Strategy</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }}>
        {/* Strategy list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {strategies.map(s => (
            <motion.div
              key={s.id}
              whileHover={{ x: 2 }}
              onClick={() => setSelected(s)}
              className="glass-card"
              style={{ padding: '12px 14px', cursor: 'pointer', borderColor: selected?.id === s.id ? 'var(--border2)' : 'var(--border)' }}
            >
              <div style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: 'var(--ng)', marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8, lineHeight: 1.4 }}>{s.description?.substring(0, 60)}...</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {(s.timeframes || []).map(tf => <span key={tf} className="tag tag-green">{tf}</span>)}
              </div>
              {s.winRate > 0 && (
                <div style={{ marginTop: 7, fontSize: 10, color: 'var(--ng)', fontFamily: 'Rajdhani', fontWeight: 700 }}>
                  WR: {s.winRate}%
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>{selected.description}</div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--ng)', fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>TRADING RULES</div>
                {(selected.rules || []).map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 11, color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--ng)', fontFamily: 'Rajdhani', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {rule}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>TIMEFRAMES</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(selected.timeframes || []).map(tf => <span key={tf} className="tag tag-green">{tf}</span>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>PAIRS</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(selected.pairs || []).map(p => <span key={p} className="tag tag-blue">{p}</span>)}
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div style={{ padding: '10px 12px', background: 'rgba(57,255,20,0.04)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                  {selected.notes}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass-card" style={{ padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>Select a strategy to view details<br />or add a new one</div>
            </div>
          )}
        </div>
      </div>

      {/* Add Strategy Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div className="modal-box" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>+ ADD STRATEGY</div>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              {[{ label: 'Strategy Name', key: 'name', ph: 'e.g. BOS + Retest' }, { label: 'Description', key: 'description', ph: 'Brief description of the strategy...' }].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>{f.label}</div>
                  <input className="input-dark" placeholder={f.ph} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Rules (one per line)</div>
                <textarea className="input-dark" rows={4} placeholder={'1. Wait for BOS\n2. Enter on retest\n3. SL below swing'} value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Timeframes</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TIMEFRAMES.map(tf => (
                    <button key={tf} onClick={() => setForm(f => ({ ...f, timeframes: toggleArr(f.timeframes, tf) }))} style={{
                      padding: '4px 10px', border: `1px solid ${form.timeframes.includes(tf) ? 'var(--border2)' : 'var(--border)'}`,
                      borderRadius: 5, background: form.timeframes.includes(tf) ? 'rgba(57,255,20,0.1)' : 'transparent',
                      color: form.timeframes.includes(tf) ? 'var(--ng)' : 'var(--text3)',
                      cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
                    }}>{tf}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Pairs</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PAIRS.map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, pairs: toggleArr(f.pairs, p) }))} style={{
                      padding: '4px 10px', border: `1px solid ${form.pairs.includes(p) ? 'rgba(0,207,255,0.4)' : 'var(--border)'}`,
                      borderRadius: 5, background: form.pairs.includes(p) ? 'rgba(0,207,255,0.1)' : 'transparent',
                      color: form.pairs.includes(p) ? '#00cfff' : 'var(--text3)',
                      cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 10,
                    }}>{p}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                  {saving ? '...' : '📚 Save Strategy'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
