export function formatCurrency(value) {
  const amount = Number(value) || 0
  return `$${amount.toLocaleString()}`
}

export function formatSignedCurrency(value) {
  const amount = Number(value) || 0
  return `${amount >= 0 ? '+' : '-'}$${Math.abs(amount).toLocaleString()}`
}

export function normalizeTradeResult(result) {
  if (result === 'Buy') return 'Long'
  if (result === 'Sell') return 'Short'
  return result || '-'
}

export function parseTradeDate(value) {
  if (!value) return null

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  if (typeof value === 'string' && /^[A-Za-z]{3,9}\s+\d{1,2}$/.test(value)) {
    const parsed = new Date(`${value}, ${new Date().getFullYear()}`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function normalizeTradeDateKey(value) {
  const parsed = parseTradeDate(value)
  if (!parsed) return String(value || '-')

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, '0'),
    String(parsed.getDate()).padStart(2, '0'),
  ].join('-')
}

export function formatTradeDate(value, language = 'en') {
  const parsed = parseTradeDate(value)
  if (!parsed) return String(value || '-')

  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function buildDailyPLSeries(trades, maxPoints = 7) {
  const grouped = trades.reduce((acc, trade) => {
    const key = normalizeTradeDateKey(trade.date || 'Unknown')
    acc[key] = (acc[key] || 0) + (Number(trade.pl) || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .slice(-maxPoints)
    .map(([date, pl]) => ({ date, pl }))
}

export function buildPLSeriesByGranularity(trades, granularity = 'day', maxPoints = 7) {
  const grouped = trades.reduce((acc, trade) => {
    const parsedDate = parseTradeDate(trade.date)
    if (!parsedDate) return acc

    let key
    if (granularity === 'year') {
      key = String(parsedDate.getFullYear())
    } else if (granularity === 'month') {
      key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
    } else {
      key = normalizeTradeDateKey(trade.date)
    }

    acc[key] = (acc[key] || 0) + (Number(trade.pl) || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .slice(-maxPoints)
    .map(([date, pl]) => ({ date, pl }))
}

export function formatTradePeriod(value, granularity = 'day', language = 'en') {
  const locale = language === 'th' ? 'th-TH' : 'en-US'

  if (granularity === 'year') {
    const year = Number(value)
    if (!Number.isFinite(year)) return String(value || '-')
    return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(new Date(year, 0, 1))
  }

  if (granularity === 'month') {
    const [year, month] = String(value).split('-').map(Number)
    if (!Number.isFinite(year) || !Number.isFinite(month)) return String(value || '-')
    return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1))
  }

  return formatTradeDate(value, language)
}

export function buildCumulativeSeries(trades) {
  const ordered = [...trades].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
  let cumulative = 0
  return ordered.map((trade) => {
    cumulative += Number(trade.pl) || 0
    return { date: trade.date || '-', value: Number(cumulative.toFixed(2)) }
  })
}

export function buildEmotionDistribution(entries) {
  const colorMap = {
    Calm: '#39ff14',
    Confident: '#00cfff',
    Neutral: '#555577',
    Anxious: '#ffaa00',
    Angry: '#ff4444',
    Fearful: '#ff77aa',
    Euphoric: '#c084fc',
  }

  const counts = entries.reduce((acc, entry) => {
    const emotion = entry.emotionAfter || entry.emotionBefore
    if (!emotion) return acc
    acc[emotion] = (acc[emotion] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value, color: colorMap[label] || '#39ff14' }))
    .sort((a, b) => b.value - a.value)
}

export function buildRadarStats({ trades, mistakes, psychology }) {
  const completedTrades = trades.filter((trade) => trade.result === 'Win' || trade.result === 'Loss')
  const wins = completedTrades.filter((trade) => trade.result === 'Win').length
  const winRate = completedTrades.length ? (wins / completedTrades.length) * 100 : 0
  const avgStress = psychology.length
    ? psychology.reduce((sum, item) => sum + (Number(item.stressLevel) || 0), 0) / psychology.length
    : null

  const mistakeCounts = mistakes.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})

  const avgRR = completedTrades.length
    ? completedTrades.reduce((sum, trade) => sum + parseRR(trade.rr), 0) / completedTrades.length
    : 1.5

  const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)))
  const totalTrades = Math.max(trades.length, 1)
  const totalMistakes = mistakes.length
  const noMistakeRate = ((trades.length - totalMistakes) / totalTrades) * 100
  const overRiskRate = ((mistakeCounts['Over Risk'] || 0) / totalTrades) * 100
  const impatienceRate = (((mistakeCounts['Early Entry'] || 0) + (mistakeCounts.FOMO || 0)) / totalTrades) * 100
  const revengeRate = ((mistakeCounts['Revenge Trading'] || 0) / totalTrades) * 100
  const psychologyScore = avgStress == null ? 0 : ((10 - avgStress) / 10) * 100
  const rrScore = Math.min(100, (avgRR / 3) * 100)

  return {
    labelKeys: ['discipline', 'riskMgmt', 'patience', 'psychology', 'execution', 'confidence'],
    values: [
      clampScore(noMistakeRate),
      clampScore((rrScore * 0.55) + ((100 - overRiskRate) * 0.45)),
      clampScore(100 - impatienceRate),
      clampScore(psychologyScore),
      clampScore((winRate * 0.6) + (rrScore * 0.4)),
      clampScore((winRate * 0.7) + ((100 - revengeRate) * 0.3)),
    ],
  }
}

function parseRR(value) {
  if (!value || typeof value !== 'string') return 1.5
  const parts = value.split(':').map((item) => Number(item.trim()))
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 1.5
  return parts[1] / parts[0]
}
