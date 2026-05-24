import { motion } from 'framer-motion'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import { useI18n } from '../i18n'
import { useAuth } from '../hooks/useAuth'
import { calcTradeStats, useTrades, useUserProfile } from '../hooks/useFirestore'
import { buildCumulativeSeries, formatSignedCurrency } from '../lib/analytics'

HighchartsMore(Highcharts)

export default function PerformancePage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { data: trades } = useTrades(user?.uid)
  const { profile: liveProfile } = useUserProfile(user?.uid)
  const stats = calcTradeStats(trades)
  const cumulativeSeries = buildCumulativeSeries(trades)
  const initialTradeBalance = Number(liveProfile?.profile?.initialTradeBalance ?? 10000) || 0
  const equityData = cumulativeSeries.map((item) => item.value + initialTradeBalance)

  const areaOptions = {
    chart: { type: 'areaspline', backgroundColor: 'transparent', height: 200, margin: [10, 10, 30, 55], animation: { duration: 1200 } },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { categories: cumulativeSeries.map((item) => item.date), lineColor: 'rgba(var(--ng-rgb),0.1)', tickColor: 'transparent', gridLineColor: 'rgba(var(--ng-rgb),0.05)', labels: { style: { color: 'var(--text3)', fontSize: '8px' } } },
    yAxis: { gridLineColor: 'rgba(var(--ng-rgb),0.06)', lineWidth: 0, title: { text: '' }, labels: { style: { color: 'var(--text3)', fontSize: '8px' }, formatter() { return `$${this.value.toLocaleString()}` } } },
    legend: { enabled: false },
    tooltip: { backgroundColor: 'var(--card2)', borderColor: 'var(--border2)', style: { color: 'var(--text)', fontFamily: 'Exo 2', fontSize: '11px' }, formatter() { return `<b>${this.x}</b><br/><span style="color:var(--ng)">$${this.y.toLocaleString()}</span>` } },
    plotOptions: { areaspline: { fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(var(--ng-rgb),0.2)'], [1, 'rgba(var(--ng-rgb),0)']] }, lineWidth: 2, lineColor: 'var(--ng)', marker: { enabled: false }, shadow: { color: 'rgba(var(--ng-rgb),0.3)', width: 4, offsetX: 0, offsetY: 0 } } },
    series: [{ name: t('performancePage.equity'), data: equityData }],
  }

  const winLossOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 180, margin: [10, 10, 10, 10], animation: { duration: 800 } },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    tooltip: { backgroundColor: 'var(--card2)', borderColor: 'var(--border2)', style: { color: 'var(--text)', fontFamily: 'Exo 2', fontSize: '11px' } },
    plotOptions: { pie: { innerSize: '60%', dataLabels: { enabled: true, style: { color: '#a0c8a0', fontFamily: 'Rajdhani', fontSize: '10px', fontWeight: '600', textOutline: 'none' } }, borderColor: '#0b160b', borderWidth: 3 } },
    series: [{ name: t('performancePage.result'), data: [{ name: t('performancePage.wins'), y: stats.wins, color: 'var(--ng)' }, { name: t('performancePage.losses'), y: stats.losses, color: '#ff4444' }] }],
  }

  const plBarOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 180, margin: [10, 10, 30, 55], animation: { duration: 900 } },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { categories: trades.map((trade) => trade.pair || ''), lineColor: 'rgba(var(--ng-rgb),0.1)', tickColor: 'transparent', labels: { style: { color: 'var(--text3)', fontSize: '8px' }, rotation: -30 } },
    yAxis: { gridLineColor: 'rgba(var(--ng-rgb),0.06)', lineWidth: 0, title: { text: '' }, labels: { style: { color: 'var(--text3)', fontSize: '8px' }, formatter() { return `$${this.value}` } } },
    legend: { enabled: false },
    tooltip: { backgroundColor: 'var(--card2)', borderColor: 'var(--border2)', style: { color: 'var(--text)', fontFamily: 'Exo 2', fontSize: '11px' } },
    plotOptions: { column: { borderRadius: 3, borderWidth: 0, maxPointWidth: 20 } },
    series: [{ name: 'P/L', data: trades.map((trade) => ({ y: Number(trade.pl) || 0, color: (trade.pl || 0) >= 0 ? 'rgba(var(--ng-rgb),0.7)' : 'rgba(255,68,68,0.7)' })) }],
  }

  const cards = [
    { label: t('performancePage.totalTrades'), value: stats.totalTrades, color: 'var(--text)' },
    { label: t('performancePage.winRate'), value: `${stats.winRate}%`, color: 'var(--ng)' },
    { label: t('performancePage.netPL'), value: formatSignedCurrency(stats.totalPL), color: stats.totalPL >= 0 ? 'var(--ng)' : 'var(--red)' },
    { label: t('performancePage.totalWins'), value: stats.wins, color: 'var(--ng)' },
    { label: t('performancePage.totalLosses'), value: stats.losses, color: 'var(--red)' },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>{t('performancePage.title')}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('performancePage.subtitle')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 12 }}>
        {cards.map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '12px 10px' }}>
            <div style={{ textAlign: 'center', padding: '10px 8px' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
        <Card title={t('performancePage.equityCurve')}>
          <HighchartsReact highcharts={Highcharts} options={areaOptions} />
        </Card>
        <Card title={t('performancePage.winLossSplit')}>
          <HighchartsReact highcharts={Highcharts} options={winLossOptions} />
        </Card>
      </div>

      <Card title={t('performancePage.profitLossPerTrade')} span={2}>
        <HighchartsReact highcharts={Highcharts} options={plBarOptions} />
      </Card>
    </div>
  )
}

function Card({ title, children, span = 1 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 14, gridColumn: `span ${span}` }}>
      <div className="card-title"><span><i className="bi bi-graph-up-arrow"></i></span>{title}</div>
      {children}
    </motion.div>
  )
}
