import { create } from 'zustand'
import { todayQuests, traderProfile, dailyStats, expenses } from '../data/mockData'

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  activePage: '/',
  setActivePage: (page) => set({ activePage: page }),

  profile: traderProfile,
  updateProfile: (updates) => set(s => ({ profile: { ...s.profile, ...updates } })),

  dailyStats,
  updateDailyStats: (updates) => set(s => ({ dailyStats: { ...s.dailyStats, ...updates } })),

  quests: todayQuests,
  toggleQuest: (id) => set(s => ({
    quests: s.quests.map(q => q.id === id ? { ...q, done: !q.done } : q),
  })),

  expenses,
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
