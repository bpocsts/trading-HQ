// src/components/charts/PerformanceChart.jsx
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { performanceData } from '../../data/mockData'

export default function PerformanceChart() {
  const options = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 155,
      margin: [5, 5, 30, 45],
      animation: { duration: 1200 },
      spacing: [0, 0, 0, 0],
    },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: {
      categories: performanceData.labels,
      lineColor: 'rgba(57,255,20,0.1)',
      tickColor: 'transparent',
      gridLineColor: 'rgba(57,255,20,0.05)',
      labels: { style: { color: '#587558', fontSize: '8px', fontFamily: 'Exo 2' } },
    },
    yAxis: {
      gridLineColor: 'rgba(57,255,20,0.06)',
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
      borderColor: 'rgba(57,255,20,0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' },
      formatter() { return `<b>${this.x}</b><br/><span style="color:#39ff14">$${this.y}</span>` },
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(57,255,20,0.22)'],
            [1, 'rgba(57,255,20,0)'],
          ],
        },
        lineWidth: 2,
        lineColor: '#39ff14',
        states: { hover: { lineWidth: 2.5 } },
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 3,
          states: {
            hover: { enabled: true, fillColor: '#39ff14', lineColor: '#39ff14', radius: 4 },
          },
        },
        shadow: { color: 'rgba(57,255,20,0.35)', width: 4, offsetX: 0, offsetY: 0, opacity: 0.7 },
      },
    },
    series: [{
      name: 'P/L',
      data: performanceData.values,
    }],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
