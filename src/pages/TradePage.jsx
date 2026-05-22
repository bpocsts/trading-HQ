// src/pages/TradePage.jsx
import { motion } from 'framer-motion'
import { recentTrades } from '../data/mockData'
import useStore from '../store/useStore'

export default function TradePage() {
  const { setShowTradeModal, trades } = useStore()
  const allTrades = [...trades, ...recentTrades]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>TRADE LOG</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>All your trading history in one place</div>
        </div>
        <button className="btn-primary" onClick={() => setShowTradeModal(true)}>+ Log Trade</button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { k: 'Total Trades', v: allTrades.length, c: 'var(--text)' },
          { k: 'Win Rate', v: `${Math.round((allTrades.filter(t => t.result === 'Win').length / allTrades.length) * 100)}%`, c: 'var(--ng)' },
          { k: 'Net P/L', v: `+$${allTrades.reduce((s, t) => s + (t.pl || 0), 0).toLocaleString()}`, c: 'var(--ng)' },
          { k: 'Avg RR', v: '1 : 1.9', c: 'var(--text)' },
        ].map(s => (
          <div key={s.k} className="glass-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{s.k}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 14, overflowX: 'auto' }}>
        <div className="card-title"><span>💹</span>All Trades</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Pair','Direction','Entry','SL','TP','RR','Result','P/L','Date','Notes'].map(h => (
                <th key={h} style={{ color: 'var(--text3)', fontWeight: 600, padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 9, fontFamily: 'Rajdhani', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTrades.map((t, i) => (
              <motion.tr key={t.id || i} className="trade-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text)', fontWeight: 600, fontFamily: 'Rajdhani' }}>{t.pair}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)' }}>
                  <span className={t.direction === 'Long' ? 'badge-long' : 'badge-short'}>{t.direction}</span>
                </td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text2)', fontFamily: 'Rajdhani' }}>{t.entry}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani' }}>{t.sl}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani' }}>{t.tp}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text2)', fontFamily: 'Share Tech Mono', fontSize: 10 }}>{t.rr}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: t.result === 'Win' ? 'var(--ng)' : t.result === 'Loss' ? 'var(--red)' : 'var(--yellow)', fontWeight: 700, fontFamily: 'Rajdhani' }}>{t.result}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: t.pl > 0 ? 'var(--ng)' : t.pl < 0 ? 'var(--red)' : 'var(--text3)', fontWeight: 700, fontFamily: 'Rajdhani' }}>
                  {t.pl > 0 ? '+' : ''}${t.pl}
                </td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontSize: 10 }}>{t.date}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontSize: 9, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes || '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
