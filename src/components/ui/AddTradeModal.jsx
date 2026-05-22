// src/components/ui/AddTradeModal.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { addTrade } from '../../hooks/useFirestore'
import { useAuth } from '../../hooks/useAuth'
import useStore from '../../store/useStore'

const PAIRS = ['XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','NZDUSD','USDCAD','EURJPY','EURGBP']
const EMOTIONS = ['Calm','Confident','Neutral','Anxious','Excited','Fearful']
const SESSIONS = ['London','New York','Asia','Sydney','Overlap']

export default function AddTradeModal() {
  const { showTradeModal, setShowTradeModal } = useStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [form, setForm] = useState({
    pair: 'XAUUSD', direction: 'Long',
    entry: '', sl: '', tp: '', lotSize: '0.01',
    emotion: 'Calm', session: 'London',
    notes: '', result: 'Pending', pl: '',
  })

  const calcRR = () => {
    const e = parseFloat(form.entry), s = parseFloat(form.sl), t = parseFloat(form.tp)
    if (!e || !s || !t) return null
    const risk = Math.abs(e - s), reward = Math.abs(t - e)
    if (!risk) return null
    return (reward / risk).toFixed(2)
  }

  const rr = calcRR()
  const rrStr = rr ? `1 : ${rr}` : 'N/A'

  const handleSubmit = async () => {
    if (!form.entry || !form.sl || !form.tp) return
    setLoading(true)
    const tradeData = {
      ...form,
      entry: parseFloat(form.entry), sl: parseFloat(form.sl), tp: parseFloat(form.tp),
      lotSize: parseFloat(form.lotSize) || 0.01,
      pl: parseFloat(form.pl) || 0,
      rr: rrStr,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
    if (user) await addTrade(user.uid, tradeData)
    setLoading(false)
    setShowTradeModal(false)
    setForm({ pair: 'XAUUSD', direction: 'Long', entry: '', sl: '', tp: '', lotSize: '0.01', emotion: 'Calm', session: 'London', notes: '', result: 'Pending', pl: '' })
    setScreenshotFile(null)
  }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: 11 }}>
      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )

  return (
    <AnimatePresence>
      {showTradeModal && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && setShowTradeModal(false)}>
          <motion.div className="modal-box" style={{ width: 540 }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>📊 LOG TRADE</div>
              <button onClick={() => setShowTradeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <F label="Pair">
                <select className="input-dark" value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))}>
                  {PAIRS.map(p => <option key={p}>{p}</option>)}
                </select>
              </F>
              <F label="Direction">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Long','Short'].map(d => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, direction: d }))} style={{
                      flex: 1, padding: '7px', border: `1px solid ${form.direction === d ? (d==='Long'?'rgba(57,255,20,0.5)':'rgba(255,68,68,0.5)') : 'var(--border)'}`,
                      borderRadius: 7, background: form.direction === d ? (d==='Long'?'rgba(57,255,20,0.12)':'rgba(255,68,68,0.12)') : 'transparent',
                      color: form.direction === d ? (d==='Long'?'var(--ng)':'var(--red)') : 'var(--text3)',
                      cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13,
                    }}>{d === 'Long' ? '▲ Long' : '▼ Short'}</button>
                  ))}
                </div>
              </F>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[['Entry Price','entry'],['Stop Loss','sl'],['Take Profit','tp']].map(([label, key]) => (
                <F key={key} label={label}>
                  <input className="input-dark" type="number" step="0.01" placeholder="0.00" value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </F>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <F label="Lot Size">
                <input className="input-dark" type="number" step="0.01" value={form.lotSize} onChange={e => setForm(f => ({ ...f, lotSize: e.target.value }))} />
              </F>
              <F label="Session">
                <select className="input-dark" value={form.session} onChange={e => setForm(f => ({ ...f, session: e.target.value }))}>
                  {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </F>
              <F label="Result">
                <select className="input-dark" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                  {['Win','Loss','Pending','Breakeven'].map(r => <option key={r}>{r}</option>)}
                </select>
              </F>
            </div>

            <div style={{ display: 'flex', gap: 12, background: 'rgba(57,255,20,0.04)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5 }}>Risk:Reward</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 20, fontWeight: 700, color: rr && parseFloat(rr) >= 1.5 ? 'var(--ng)' : rr ? 'var(--yellow)' : 'var(--text3)' }}>{rrStr}</div>
              </div>
              <div style={{ flex: 1 }}>
                <F label="P/L ($)">
                  <input className="input-dark" type="number" placeholder="310 or -120" value={form.pl}
                    onChange={e => setForm(f => ({ ...f, pl: e.target.value }))} />
                </F>
              </div>
            </div>

            <F label="Emotion">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EMOTIONS.map(em => (
                  <button key={em} onClick={() => setForm(f => ({ ...f, emotion: em }))} style={{
                    padding: '4px 10px', border: `1px solid ${form.emotion === em ? 'var(--border2)' : 'var(--border)'}`,
                    borderRadius: 5, background: form.emotion === em ? 'rgba(57,255,20,0.1)' : 'transparent',
                    color: form.emotion === em ? 'var(--ng)' : 'var(--text3)',
                    cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 10,
                  }}>{em}</button>
                ))}
              </div>
            </F>

            <F label="Screenshot">
              <label style={{ display: 'block', padding: '7px 12px', border: '1px dashed var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
                {screenshotFile ? `📷 ${screenshotFile.name}` : '📷 Click to attach screenshot'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setScreenshotFile(e.target.files[0])} />
              </label>
            </F>

            <F label="Notes / Rationale">
              <textarea className="input-dark" rows={2} placeholder="Why did you take this trade?..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </F>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowTradeModal(false)}>Cancel</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading || !form.entry}>
                {loading ? 'Saving...' : '+ Log Trade'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
