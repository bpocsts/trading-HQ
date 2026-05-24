import { create } from 'zustand'

const defaultProfile = {
  name: 'Trader',
  role: 'Smart Money Concept Trader',
  avatarPreset: 'neo',
  avatarDataUrl: '',
  level: 1,
  xp: 0,
  xpMax: 1000,
  winRate: 0,
  rrAverage: '-',
  totalTrades: 0,
  balance: 0,
  bestSession: '-',
  currentStreak: 0,
}

const defaultDailyStats = {
  hp: { score: 0, max: 10, label: 'Endurance' },
  mood: { score: 0, max: 10, label: 'Emotional Control' },
  focus: { score: 0, max: 10, label: 'Concentration' },
  motivation: { score: 0, max: 10, label: 'Drive' },
}

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  activePage: '/',
  setActivePage: (page) => set({ activePage: page }),

  profile: defaultProfile,
  updateProfile: (updates) => set(s => ({ profile: { ...s.profile, ...updates } })),

  dailyStats: defaultDailyStats,
  updateDailyStats: (updates) => set(s => ({ dailyStats: { ...s.dailyStats, ...updates } })),

  quests: [],
  toggleQuest: (id) => set(s => ({
    quests: s.quests.map(q => q.id === id ? { ...q, done: !q.done } : q),
  })),

  expenses: [],
  addExpense: (expense) => set(s => ({ expenses: [expense, ...s.expenses] })),

  trades: [],
  addTrade: (trade) => set(s => ({ trades: [trade, ...s.trades] })),

  showTradeModal: false,
  setShowTradeModal: (v) => set({ showTradeModal: v }),

  showProfileModal: false,
  setShowProfileModal: (v) => set({ showProfileModal: v }),

  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}))

export default useStore
