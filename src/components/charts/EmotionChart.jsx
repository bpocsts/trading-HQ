import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useI18n } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import { usePsychology, useTrades } from '../../hooks/useFirestore'
import { buildCumulativeSeries, buildDailyPLSeries, buildEmotionDistribution } from '../../lib/analytics'
import { getEmotionLabel } from '../../lib/localization'

export function EmotionChart() {
  const { user } = useAuth()
  const { language } = useI18n()
  const { data: entries } = usePsychology(user?.uid)
  const emotions = buildEmotionDistribution(entries)

  const options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 150,
      margin: [0, 0, 0, 0],
      animation: { duration: 1000 },
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    tooltip: {
      backgroundColor: 'rgba(7,15,7,0.92)',
      borderColor: 'rgba(var(--ng-rgb),0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' },
      formatter() { return `<b style="color:${this.color}">${this.point.name}</b>: ${this.y}` },
    },
    plotOptions: {
      pie: {
        innerSize: '68%',
        dataLabels: { enabled: false },
        borderColor: '#0b160b',
        borderWidth: 3,
        states: { hover: { brightness: 0.1 } },
      },
    },
    series: [{
      name: language === 'th' ? 'อารมณ์' : 'Emotions',
      data: emotions.map((item) => ({
        name: getEmotionLabel(item.label, language),
        y: item.value,
        color: item.color,
        sliced: false,
      })),
    }],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}

export function MonthlyChart() {
  const { user } = useAuth()
  const { language } = useI18n()
  const { data: trades } = useTrades(user?.uid)
  const dailySeries = buildDailyPLSeries(trades, 31)
  const cumulativeSeries = buildCumulativeSeries(trades)
  const categories = dailySeries.map((item) => item.date)
  const plValues = dailySeries.map((item) => item.pl)
  const cumulativeMap = Object.fromEntries(cumulativeSeries.map((item) => [item.date, item.value]))
  const cumulativeValues = categories.map((date) => cumulativeMap[date] ?? 0)

  const options = {
    chart: {
      backgroundColor: 'transparent',
      height: 115,
      margin: [5, 5, 20, 48],
      animation: { duration: 1000 },
      spacing: [0, 0, 0, 0],
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories,
      lineColor: 'rgba(var(--ng-rgb),0.08)',
      tickColor: 'transparent',
      gridLineColor: 'transparent',
      labels: { enabled: false },
    },
    yAxis: [
      {
        gridLineColor: 'rgba(var(--ng-rgb),0.06)',
        lineWidth: 0,
        title: { text: '' },
        labels: {
          style: { color: '#587558', fontSize: '8px', fontFamily: 'Exo 2' },
          formatter() { return `$${this.value}` },
        },
      },
      {
        gridLineColor: 'transparent',
        lineWidth: 0,
        title: { text: '' },
        labels: { enabled: false },
        opposite: true,
      },
    ],
    legend: { enabled: false },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(7,15,7,0.92)',
      borderColor: 'rgba(var(--ng-rgb),0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '10px' },
    },
    plotOptions: {
      column: {
        borderRadius: 2,
        borderWidth: 0,
        maxPointWidth: 10,
      },
      spline: {
        lineWidth: 2,
        marker: { enabled: false },
        shadow: { color: 'rgba(0,207,255,0.3)', width: 4, offsetX: 0, offsetY: 0, opacity: 0.6 },
      },
    },
    series: [
      {
        type: 'column',
        name: language === 'th' ? 'P/L รายวัน' : 'Daily P/L',
        yAxis: 0,
        data: plValues.map((value) => ({
          y: value,
          color: value >= 0 ? 'rgba(var(--ng-rgb),0.65)' : 'rgba(255,68,68,0.65)',
        })),
      },
      {
        type: 'spline',
        name: language === 'th' ? 'สะสม' : 'Cumulative',
        yAxis: 1,
        data: cumulativeValues,
        color: '#00cfff',
        lineWidth: 2,
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
