import { motion } from 'framer-motion'
import { recentTrades } from '../../data/mockData'
import { useI18n } from '../../i18n'

export default function RecentTrades() {
  const { t } = useI18n()
  const cols = t('recentTrades.columns')

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title">
        <span>📒</span>
        {t('recentTrades.title')}
        <span className="dots-menu">···</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c} style={{ color: 'var(--text3)', fontWeight: 600, padding: '4px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 9, letterSpacing: 0.5, fontFamily: 'Rajdhani', whiteSpace: 'nowrap' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTrades.map((trade, index) => (
              <motion.tr key={trade.id} className="trade-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 + 0.4 }}>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text)', fontWeight: 600, fontFamily: 'Rajdhani', fontSize: 11 }}>{trade.pair}</td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)' }}>
                  <span className={trade.direction === 'Long' ? 'badge-long' : 'badge-short'}>
                    {trade.direction === 'Long' ? t('recentTrades.buy') : t('recentTrades.sell')}
                  </span>
                </td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text2)', fontFamily: 'Rajdhani', fontSize: 10.5 }}>{trade.entry}</td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani', fontSize: 10.5 }}>{trade.sl}</td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani', fontSize: 10.5 }}>{trade.tp}</td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text2)', fontFamily: 'Share Tech Mono', fontSize: 10 }}>{trade.rr}</td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: trade.result === 'Win' ? 'var(--ng)' : 'var(--red)', fontWeight: 700, fontFamily: 'Rajdhani', fontSize: 11 }}>
                  {trade.result === 'Win' ? t('recentTrades.win') : t('recentTrades.loss')}
                </td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: trade.pl > 0 ? 'var(--ng)' : 'var(--red)', fontWeight: 700, fontFamily: 'Rajdhani', fontSize: 11 }}>
                  {trade.pl > 0 ? '+' : ''}${trade.pl}
                </td>
                <td style={{ padding: '5px 7px', borderBottom: '1px solid rgba(57,255,20,0.03)', color: 'var(--text3)', fontSize: 10 }}>{trade.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="view-more-link">{t('recentTrades.viewAll')}</div>
    </motion.div>
  )
}
