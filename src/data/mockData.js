export const traderProfile = {
  name: 'Ash',
  role: 'Smart Money Concept Trader',
  level: 24,
  xp: 720,
  xpMax: 1000,
  winRate: 67,
  rrAverage: '1 : 2.4',
  totalTrades: 128,
  balance: 12450,
  bestSession: 'London',
  currentStreak: 7,
  avatar: null,
}

export const dailyStats = {
  hp: { score: 8, max: 10, label: 'Endurance' },
  mood: { score: 7, max: 10, label: 'Emotional Control' },
  focus: { score: 8, max: 10, label: 'Concentration' },
  motivation: { score: 9, max: 10, label: 'Drive' },
}

export const todayFocus = {
  session: 'London',
  pair: 'XAUUSD',
  biasKey: 'bullish',
  keyLevel: '2280.0',
  notesKey: 'notes',
}

export const radarStats = {
  labelKeys: ['discipline', 'riskMgmt', 'patience', 'psychology', 'execution', 'confidence'],
  values: [85, 78, 70, 82, 88, 75],
}

export const todayQuests = [
  { id: 1, key: 'bosRetest', text: 'Wait for BOS + Retest only', done: true },
  { id: 2, key: 'maxTrades', text: 'Max 3 Trades Today', done: true },
  { id: 3, key: 'riskOnePercent', text: 'Risk 1% Per Trade', done: true },
  { id: 4, key: 'noRevenge', text: 'No Revenge Trading', done: false },
  { id: 5, key: 'londonOnly', text: 'Trade only London Session', done: false },
]

export const weeklySummary = {
  totalPL: 1240,
  totalTrades: 18,
  winRate: 66,
  bestTrade: 420,
  worstTrade: -180,
  rrAverage: '1 : 2.1',
}

export const performanceData = {
  labels: ['May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16'],
  values: [-200, 400, 800, 600, 1100, 1600, 2000],
}

export const habits = [
  { id: 1, key: 'morningMeditation', name: 'Morning Meditation', streak: 7 },
  { id: 2, key: 'planReview', name: 'Trading Plan Review', streak: 6 },
  { id: 3, key: 'journalWriting', name: 'Journal Writing', streak: 7 },
  { id: 4, key: 'exercise', name: 'Exercise', streak: 4 },
  { id: 5, key: 'noRevenge', name: 'No Revenge Trading', streak: 7 },
]

export const recentTrades = [
  { id: 1, pair: 'XAUUSD', direction: 'Long', entry: 2275.20, sl: 2270.00, tp: 2285.00, rr: '1:1.88', result: 'Win', pl: 310, date: 'May 16' },
  { id: 2, pair: 'EURUSD', direction: 'Short', entry: 1.0850, sl: 1.0890, tp: 1.0790, rr: '1:1.50', result: 'Win', pl: 150, date: 'May 16' },
  { id: 3, pair: 'GBPUSD', direction: 'Long', entry: 1.2670, sl: 1.2630, tp: 1.2750, rr: '1:2.00', result: 'Loss', pl: -120, date: 'May 15' },
  { id: 4, pair: 'XAUUSD', direction: 'Long', entry: 2282.10, sl: 2276.00, tp: 2295.00, rr: '1:2.11', result: 'Win', pl: 260, date: 'May 15' },
  { id: 5, pair: 'USDJPY', direction: 'Short', entry: 155.20, sl: 155.80, tp: 154.10, rr: '1:1.83', result: 'Loss', pl: -100, date: 'May 14' },
  { id: 6, pair: 'EURUSD', direction: 'Long', entry: 1.0820, sl: 1.0790, tp: 1.0890, rr: '1:2.33', result: 'Win', pl: 220, date: 'May 14' },
  { id: 7, pair: 'GBPJPY', direction: 'Short', entry: 196.40, sl: 197.10, tp: 195.00, rr: '1:2.00', result: 'Win', pl: 340, date: 'May 13' },
]

export const emotionData = {
  labelKeys: ['calm', 'confident', 'neutral', 'anxious', 'angry'],
  values: [10, 7, 4, 2, 1],
  colors: ['#39ff14', '#00cfff', '#555577', '#ffaa00', '#ff4444'],
  avgScore: 7.5,
}

export const monthlyData = (() => {
  const days = Array.from({ length: 22 }, (_, i) => `May ${i + 1}`)
  const pl = [120, -80, 200, 310, -150, 180, 420, 250, 90, 380, -100, 280, 190, 340, -80, 200, 310, 260, 180, 420, 150, 300]
  let cum = 0
  const cumulative = pl.map(v => { cum += v; return cum })
  return { days, pl, cumulative }
})()

export const monthlyStats = {
  totalPL: 3450,
  winRate: 65,
  totalTrades: 72,
  rrAverage: '1:2.15',
}

export const mistakes = [
  { id: 1, key: 'noConfirmation', name: 'No Confirmation', count: 12, max: 12, color: '#ff4444' },
  { id: 2, key: 'earlyEntry', name: 'Early Entry', count: 9, max: 12, color: '#ff8c00' },
  { id: 3, key: 'fomo', name: 'FOMO', count: 7, max: 12, color: '#ffcc00' },
  { id: 4, key: 'revengeTrading', name: 'Revenge Trading', count: 6, max: 12, color: '#ffaa00' },
  { id: 5, key: 'overRisk', name: 'Over Risk', count: 4, max: 12, color: '#00e676' },
]

export const achievements = [
  { id: 1, icon: '🔥', titleKey: 'sevenWinStreakTitle', subKey: 'sevenWinStreakSub', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)' },
  { id: 2, icon: '✅', titleKey: 'noRevengeTitle', subKey: 'noRevengeSub', color: '#39ff14', bg: 'rgba(57,255,20,0.12)' },
  { id: 3, icon: '🎯', titleKey: 'rrTitle', subKey: 'rrSub', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)' },
  { id: 4, icon: '🌅', titleKey: 'morningRoutineTitle', subKey: 'morningRoutineSub', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)' },
]

export const quickAccess = [
  { id: 1, icon: '📋', nameKey: 'tradeLogName', subKey: 'tradeLogSub', color: '#39ff14', route: '/trades' },
  { id: 2, icon: '📝', nameKey: 'journalName', subKey: 'journalSub', color: '#00cfff', route: '/journal' },
  { id: 3, icon: '🧠', nameKey: 'psychologyName', subKey: 'psychologySub', color: '#c084fc', route: '/psychology' },
  { id: 4, icon: '⚠️', nameKey: 'mistakesName', subKey: 'mistakesSub', color: '#ffaa00', route: '/mistakes' },
  { id: 5, icon: '📚', nameKey: 'strategiesName', subKey: 'strategiesSub', color: '#39ff14', route: '/strategies' },
  { id: 6, icon: '📷', nameKey: 'screenshotsName', subKey: 'screenshotsSub', color: '#00cfff', route: '/screenshots' },
]

export const navItems = [
  { icon: '🏠', labelKey: 'dashboard', route: '/' },
  { icon: '📋', labelKey: 'tradeLog', route: '/trades' },
  { icon: '📊', labelKey: 'performance', route: '/performance' },
  { icon: '🧠', labelKey: 'psychology', route: '/psychology' },
  { icon: '🔥', labelKey: 'habits', route: '/habits' },
  { icon: '⚠️', labelKey: 'mistakes', route: '/mistakes' },
  { icon: '🏆', labelKey: 'achievements', route: '/achievements' },
  { icon: '📚', labelKey: 'strategies', route: '/strategies' },
  { icon: '📷', labelKey: 'screenshots', route: '/screenshots' },
  { icon: '📝', labelKey: 'journal', route: '/journal' },
]
