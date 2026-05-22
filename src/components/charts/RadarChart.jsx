import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import { radarStats } from '../../data/mockData'
import { useI18n } from '../../i18n'

HighchartsMore(Highcharts)

export default function RadarChart() {
  const { t } = useI18n()

  const options = {
    chart: {
      polar: true,
      type: 'area',
      backgroundColor: 'transparent',
      margin: [10, 10, 10, 10],
      height: 195,
      animation: { duration: 1400, easing: 'easeOut' },
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    pane: {
      size: '85%',
      background: [{
        backgroundColor: 'rgba(57,255,20,0.02)',
        borderColor: 'rgba(57,255,20,0.08)',
        borderWidth: 1,
        shape: 'circle',
      }],
    },
    xAxis: {
      categories: radarStats.labelKeys.map((key) => t(`radar.${key}`)),
      tickmarkPlacement: 'on',
      lineWidth: 0,
      gridLineColor: 'rgba(57,255,20,0.1)',
      labels: {
        style: { color: '#a0c8a0', fontSize: '9px', fontFamily: 'Rajdhani', fontWeight: '600' },
      },
    },
    yAxis: {
      gridLineColor: 'rgba(57,255,20,0.1)',
      lineWidth: 0,
      tickPositions: [0, 25, 50, 75, 100],
      labels: { enabled: false },
      min: 0,
      max: 100,
    },
    legend: { enabled: false },
    tooltip: {
      shared: true,
      backgroundColor: 'rgba(7,15,7,0.92)',
      borderColor: 'rgba(57,255,20,0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' },
      formatter() {
        return `<b style="color:#39ff14">${this.x}</b><br/><span>${this.y}</span>`
      },
    },
    series: [{
      name: 'Trader Stats',
      data: radarStats.values,
      pointPlacement: 'on',
      color: '#39ff14',
      fillColor: 'rgba(57,255,20,0.08)',
      lineWidth: 2,
      marker: {
        enabled: true,
        fillColor: '#39ff14',
        lineColor: '#39ff14',
        radius: 3,
        symbol: 'circle',
      },
      shadow: { color: 'rgba(57,255,20,0.4)', width: 6, offsetX: 0, offsetY: 0, opacity: 0.5 },
    }],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
