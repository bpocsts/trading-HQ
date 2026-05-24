import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import useStore from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { calcTradeStats, deleteTrade, useTrades } from '../hooks/useFirestore'
import { formatSignedCurrency, normalizeTradeResult } from '../lib/analytics'
import { getDirectionLabel, getResultLabel } from '../lib/localization'

export default function TradePage() {
  const { setShowTradeModal } = useStore()
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: trades } = useTrades(user?.uid)
  const [deletingTradeId, setDeletingTradeId] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    result: 'all',
    direction: 'all',
    pair: 'all',
    from: '',
    to: '',
  })
  const pairOptions = Array.from(new Set(trades.map((trade) => trade.pair).filter(Boolean))).sort()
  const filteredTrades = trades.filter((trade) => {
    const search = filters.search.trim().toLowerCase()
    const direction = normalizeTradeResult(trade.direction)
    const matchesSearch = !search || [
      trade.pair,
      trade.result,
      getDirectionLabel(direction, language),
      trade.session,
      trade.notes,
      trade.date,
    ].some((value) => String(value || '').toLowerCase().includes(search))

    return (
      matchesSearch &&
      (filters.result === 'all' || trade.result === filters.result) &&
      (filters.direction === 'all' || direction === filters.direction) &&
      (filters.pair === 'all' || trade.pair === filters.pair) &&
      (!filters.from || String(trade.date || '') >= filters.from) &&
      (!filters.to || String(trade.date || '') <= filters.to)
    )
  })
  const stats = calcTradeStats(filteredTrades)

  const handleDeleteTrade = async (tradeId) => {
    if (!tradeId) return

    setDeletingTradeId(tradeId)
    try {
      await deleteTrade(tradeId)
    } finally {
      setDeletingTradeId('')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>{t('tradePage.title')}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('tradePage.subtitle')}</div>
        </div>
        <button className="btn-primary" onClick={() => setShowTradeModal(true)}>{t('tradePage.addTrade')}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { k: t('tradePage.totalTrades'), v: trades.length, c: 'var(--text)' },
          { k: t('tradePage.winRate'), v: `${stats.winRate}%`, c: 'var(--ng)' },
          { k: t('tradePage.netPL'), v: formatSignedCurrency(stats.totalPL), c: stats.totalPL >= 0 ? 'var(--ng)' : 'var(--red)' },
          { k: t('tradePage.avgRR'), v: stats.avgRR, c: 'var(--text)' },
        ].map((stat) => (
          <div key={stat.k} className="glass-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: stat.c }}>{stat.v}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{stat.k}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 14, overflowX: 'auto' }}>
        <div className="card-title"><span><i className="bi bi-journal-text"></i></span>{t('tradePage.allTrades')}</div>
        <FilterPanel>
          <input className="input-dark" placeholder={language === 'th' ? 'ค้นหาคู่เงิน โน้ต หรือช่วงเวลา...' : 'Search pair, notes, session...'} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          <select className="input-dark" value={filters.result} onChange={(event) => setFilters((current) => ({ ...current, result: event.target.value }))}>
            <option value="all">{language === 'th' ? 'ผลลัพธ์ทั้งหมด' : 'All Results'}</option>
            <option value="Win">{getResultLabel('Win', language)}</option>
            <option value="Loss">{getResultLabel('Loss', language)}</option>
            <option value="Pending">{getResultLabel('Pending', language)}</option>
            <option value="Breakeven">{getResultLabel('Breakeven', language)}</option>
          </select>
          <select className="input-dark" value={filters.direction} onChange={(event) => setFilters((current) => ({ ...current, direction: event.target.value }))}>
            <option value="all">{language === 'th' ? 'ทุกทิศทาง' : 'All Directions'}</option>
            <option value="Long">{getDirectionLabel('Long', language)}</option>
            <option value="Short">{getDirectionLabel('Short', language)}</option>
          </select>
          <select className="input-dark" value={filters.pair} onChange={(event) => setFilters((current) => ({ ...current, pair: event.target.value }))}>
            <option value="all">{language === 'th' ? 'ทุกคู่เงิน' : 'All Pairs'}</option>
            {pairOptions.map((pair) => <option key={pair} value={pair}>{pair}</option>)}
          </select>
          <input className="input-dark" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
          <input className="input-dark" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
          <button type="button" className="btn-ghost" onClick={() => setFilters({ search: '', result: 'all', direction: 'all', pair: 'all', from: '', to: '' })}>
            {language === 'th' ? 'ล้างตัวกรอง' : 'Reset'}
          </button>
        </FilterPanel>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8 }}>
          {language === 'th' ? `แสดง ${filteredTrades.length} / ${trades.length}` : `Showing ${filteredTrades.length} / ${trades.length}`}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {t('tradePage.headers').map((header) => (
                <th key={header} style={{ color: 'var(--text3)', fontWeight: 600, padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 9, fontFamily: 'Rajdhani', letterSpacing: 0.5 }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filteredTrades.length && (
              <tr>
                <td colSpan={11} style={{ padding: '14px 8px', color: 'var(--text3)' }}>
                  {t('tradePage.empty')}
                </td>
              </tr>
            )}
            {filteredTrades.map((trade, index) => {
              const direction = normalizeTradeResult(trade.direction)
              const pl = Number(trade.pl) || 0

              return (
                <motion.tr key={trade.id || index} className="trade-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text)', fontWeight: 600, fontFamily: 'Rajdhani' }}>{trade.pair}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)' }}>
                    <span className={direction === 'Long' ? 'badge-long' : 'badge-short'}>{getDirectionLabel(direction, language)}</span>
                  </td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text2)', fontFamily: 'Rajdhani' }}>{trade.entry}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani' }}>{trade.sl}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text3)', fontFamily: 'Rajdhani' }}>{trade.tp}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text2)', fontFamily: 'Share Tech Mono', fontSize: 10 }}>{trade.rr}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: trade.result === 'Win' ? '#39ff14' : trade.result === 'Loss' ? 'var(--red)' : 'var(--yellow)', fontWeight: 700, fontFamily: 'Rajdhani' }}>{getResultLabel(trade.result, language)}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: pl > 0 ? '#39ff14' : pl < 0 ? 'var(--red)' : 'var(--text3)', fontWeight: 700, fontFamily: 'Rajdhani' }}>
                    {formatSignedCurrency(pl)}
                  </td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text3)', fontSize: 10 }}>{trade.date}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)', color: 'var(--text3)', fontSize: 9, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trade.notes || '-'}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(var(--ng-rgb),0.03)' }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleDeleteTrade(trade.id)}
                      disabled={deletingTradeId === trade.id}
                      style={{ padding: '4px 8px', minWidth: 58 }}
                    >
                      {deletingTradeId === trade.id ? '...' : t('tradePage.delete')}
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterPanel({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(5, minmax(110px, 1fr)) auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      {children}
    </div>
  )
}
