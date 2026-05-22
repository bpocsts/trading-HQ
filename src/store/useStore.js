// src/store/useStore.js
import { create } from 'zustand'
import { todayQuests, traderProfile, dailyStats, habits } from '../data/mockData'

const useStore = create((set, get) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Active nav
  activePage: '/',
  setActivePage: (page) => set({ activePage: page }),

  // Trader profile
  profile: traderProfile,
  updateProfile: (updates) => set(s => ({ profile: { ...s.profile, ...updates } })),

  // Daily stats
  dailyStats,
  updateDailyStats: (updates) => set(s => ({ dailyStats: { ...s.dailyStats, ...updates } })),

  // Quests
  quests: todayQuests,
  toggleQuest: (id) => set(s => ({
    quests: s.quests.map(q => q.id === id ? { ...q, done: !q.done } : q)
  })),

  // Habits
  habits,
  incrementHabit: (id) => set(s => ({
    habits: s.habits.map(h => h.id === id ? { ...h, streak: h.streak + 1 } : h)
  })),

  // Trades
  trades: [],
  addTrade: (trade) => set(s => ({ trades: [trade, ...s.trades] })),

  // Modal state
  showTradeModal: false,
  setShowTradeModal: (v) => set({ showTradeModal: v }),

  showProfileModal: false,
  setShowProfileModal: (v) => set({ showProfileModal: v }),

  // Sidebar collapsed (mobile)
  sidebarOpen: true,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}))

export default useStore
