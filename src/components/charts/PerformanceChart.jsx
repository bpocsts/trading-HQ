import { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useI18n } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import { useTrades } from '../../hooks/useFirestore'
import { buildPLSeriesByGranularity, formatTradePeriod } from '../../lib/analytics'

export default function PerformanceChart({ granularity = 'day' }) {
  const { language } = useI18n()
  const { user } = useAuth()
  const { data: trades } = useTrades(user?.uid)
  const series = useMemo(
    () => buildPLSeriesByGranularity(trades, granularity, granularity === 'year' ? 6 : 7),
    [granularity, trades]
  )
  const categories = series.map((item) => formatTradePeriod(item.date, granularity, language))

  const options = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 230,
      margin: [5, 5, 34, 45],
      animation: { duration: 1200 },
      spacing: [0, 0, 0, 0],
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories,
      lineColor: 'rgba(var(--ng-rgb),0.1)',
      tickColor: 'transparent',
      gridLineColor: 'rgba(var(--ng-rgb),0.05)',
      labels: { style: { color: '#587558', fontSize: '8px', fontFamily: 'Exo 2' } },
    },
    yAxis: {
      gridLineColor: 'rgba(var(--ng-rgb),0.06)',
      lineWidth: 0,
      title: { text: '' },
      labels: {
        style: { color: '#587558', fontSize: '8px', fontFamily: 'Exo 2' },
        formatter() { return `$${this.value}` },
      },
    },
    legend: { enabled: false },
    tooltip: {
      backgroundColor: 'rgba(7,15,7,0.92)',
      borderColor: 'rgba(var(--ng-rgb),0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' },
      formatter() { return `<b>${this.x}</b><br/><span style="color:var(--ng)">$${this.y}</span>` },
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(var(--ng-rgb),0.22)'],
            [1, 'rgba(var(--ng-rgb),0)'],
          ],
        },
        lineWidth: 2,
        lineColor: 'var(--ng)',
        states: { hover: { lineWidth: 2.5 } },
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 3,
          states: {
            hover: { enabled: true, fillColor: 'var(--ng)', lineColor: 'var(--ng)', radius: 4 },
          },
        },
        shadow: { color: 'rgba(var(--ng-rgb),0.35)', width: 4, offsetX: 0, offsetY: 0, opacity: 0.7 },
      },
    },
    series: [{
      name: 'P/L',
      data: series.map((item) => item.pl),
    }],
  }

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}
