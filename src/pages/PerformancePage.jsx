// src/pages/PerformancePage.jsx
import { motion } from 'framer-motion'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import { useAuth } from '../hooks/useAuth'
import { useTrades, calcTradeStats } from '../hooks/useFirestore'
import { recentTrades, monthlyData } from '../data/mockData'

HighchartsMore(Highcharts)

export default function PerformancePage() {
  const { user } = useAuth()
  const { data: liveTrades } = useTrades(user?.uid)
  const trades = liveTrades.length ? liveTrades : recentTrades
  const stats = calcTradeStats(trades)

  // Build equity curve from trades
  const equityData = (() => {
    let cum = 10000
    return trades.slice().reverse().map(t => {
      cum += Number(t.pl) || 0
      return cum
    })
  })()

  const areaOptions = {
    chart: { type: 'areaspline', backgroundColor: 'transparent', height: 200, margin: [10, 10, 30, 55], animation: { duration: 1200 } },
    title: { text: '' }, credits: { enabled: false }, exporting: { enabled: false },
    xAxis: { categories: trades.slice().reverse().map(t => t.date || ''), lineColor: 'rgba(57,255,20,0.1)', tickColor: 'transparent', gridLineColor: 'rgba(57,255,20,0.05)', labels: { style: { color: '#587558', fontSize: '8px' } } },
    yAxis: { gridLineColor: 'rgba(57,255,20,0.06)', lineWidth: 0, title: { text: '' }, labels: { style: { color: '#587558', fontSize: '8px' }, formatter() { return `$${this.value.toLocaleString()}` } } },
    legend: { enabled: false },
    tooltip: { backgroundColor: 'rgba(7,15,7,0.92)', borderColor: 'rgba(57,255,20,0.3)', style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' }, formatter() { return `<b>${this.x}</b><br/><span style="color:#39ff14">$${this.y.toLocaleString()}</span>` } },
    plotOptions: { areaspline: { fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, 'rgba(57,255,20,0.2)'], [1, 'rgba(57,255,20,0)']] }, lineWidth: 2, lineColor: '#39ff14', marker: { enabled: false }, shadow: { color: 'rgba(57,255,20,0.3)', width: 4, offsetX: 0, offsetY: 0 } } },
    series: [{ name: 'Equity', data: equityData }],
  }

  const winLossOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 180, margin: [10, 10, 10, 10], animation: { duration: 800 } },
    title: { text: '' }, credits: { enabled: false }, exporting: { enabled: false },
    tooltip: { backgroundColor: 'rgba(7,15,7,0.92)', borderColor: 'rgba(57,255,20,0.3)', style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' } },
    plotOptions: { pie: { innerSize: '60%', dataLabels: { enabled: true, style: { color: '#a0c8a0', fontFamily: 'Rajdhani', fontSize: '10px', fontWeight: '600', textOutline: 'none' } }, borderColor: '#0b160b', borderWidth: 3 } },
    series: [{ name: 'Result', data: [{ name: 'Wins', y: stats.wins, color: '#39ff14' }, { name: 'Losses', y: stats.losses, color: '#ff4444' }] }],
  }

  const plBarOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 180, margin: [10, 10, 30, 55], animation: { duration: 900 } },
    title: { text: '' }, credits: { enabled: false }, exporting: { enabled: false },
    xAxis: { categories: trades.map(t => t.pair || ''), lineColor: 'rgba(57,255,20,0.1)', tickColor: 'transparent', labels: { style: { color: '#587558', fontSize: '8px' }, rotation: -30 } },
    yAxis: { gridLineColor: 'rgba(57,255,20,0.06)', lineWidth: 0, title: { text: '' }, labels: { style: { color: '#587558', fontSize: '8px' }, formatter() { return `$${this.value}` } } },
    legend: { enabled: false },
    tooltip: { backgroundColor: 'rgba(7,15,7,0.92)', borderColor: 'rgba(57,255,20,0.3)', style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' } },
    plotOptions: { column: { borderRadius: 3, borderWidth: 0, maxPointWidth: 20 } },
    series: [{ name: 'P/L', data: trades.map(t => ({ y: Number(t.pl) || 0, color: (t.pl || 0) >= 0 ? 'rgba(57,255,20,0.7)' : 'rgba(255,68,68,0.7)' })) }],
  }

  const Card = ({ title, children, span = 1 }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 14, gridColumn: `span ${span}` }}>
      <div className="card-title"><span>📊</span>{title}</div>
      {children}
    </motion.div>
  )

  const StatBox = ({ label, value, color = 'var(--text)' }) => (
    <div style={{ textAlign: 'center', padding: '10px 8px' }}>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>PERFORMANCE ANALYTICS</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Deep dive into your trading metrics</div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Total Trades', value: stats.totalTrades, color: 'var(--text)' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'var(--ng)' },
          { label: 'Net P/L', value: `${stats.totalPL >= 0 ? '+' : ''}$${stats.totalPL.toLocaleString()}`, color: stats.totalPL >= 0 ? 'var(--ng)' : 'var(--red)' },
          { label: 'Total Wins', value: stats.wins, color: 'var(--ng)' },
          { label: 'Total Losses', value: stats.losses, color: 'var(--red)' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '12px 10px' }}>
            <StatBox {...s} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
        <Card title="Equity Curve">
          <HighchartsReact highcharts={Highcharts} options={areaOptions} />
        </Card>
        <Card title="Win / Loss Split">
          <HighchartsReact highcharts={Highcharts} options={winLossOptions} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#39ff14' }} />
              <span style={{ color: 'var(--text2)' }}>Wins ({stats.wins})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4444' }} />
              <span style={{ color: 'var(--text2)' }}>Losses ({stats.losses})</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="P/L Per Trade" span={2}>
        <HighchartsReact highcharts={Highcharts} options={plBarOptions} />
      </Card>

      {/* Pair breakdown */}
      <div style={{ marginTop: 10 }}>
        <Card title="Performance By Pair">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {['XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY'].map(pair => {
              const pairTrades = trades.filter(t => t.pair === pair)
              const pairWins = pairTrades.filter(t => t.result === 'Win').length
              const pairPL = pairTrades.reduce((s, t) => s + (Number(t.pl) || 0), 0)
              const wr = pairTrades.length ? Math.round((pairWins / pairTrades.length) * 100) : 0
              return (
                <div key={pair} style={{ background: 'rgba(57,255,20,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', marginBottom: 4 }}>{pair}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)' }}>{pairTrades.length} trades</div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: wr >= 50 ? 'var(--ng)' : 'var(--red)', marginTop: 2 }}>{wr}% WR</div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: pairPL >= 0 ? 'var(--ng)' : 'var(--red)' }}>
                    {pairPL >= 0 ? '+' : ''}${pairPL}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
