// src/pages/AchievementsPage.jsx
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useAchievements } from '../hooks/useFirestore'
import { achievements as mockAch } from '../data/mockData'

const ALL_ACHIEVEMENTS = [
  { key: 'streak_3', icon: '🔥', title: '3 Win Streak', sub: 'Win 3 trades in a row', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: true },
  { key: 'streak_7', icon: '⚡', title: '7 Win Streak', sub: 'Win 7 trades in a row', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: true },
  { key: 'no_revenge_7', icon: '🧘', title: 'No Revenge Trade (7 Days)', sub: 'Avoid revenge trading for a week', color: '#39ff14', bg: 'rgba(57,255,20,0.12)', unlocked: true },
  { key: 'rr_1_2_5', icon: '⭐', title: 'RR Above 1:2 (5 Trades)', sub: 'Achieve 1:2 RR on 5 consecutive trades', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: true },
  { key: 'morning_5', icon: '🌅', title: 'Morning Routine (5 Days)', sub: 'Complete morning routine for 5 days', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: true },
  { key: 'first_trade', icon: '🚀', title: 'First Trade Logged', sub: 'Log your very first trade', color: '#00cfff', bg: 'rgba(0,207,255,0.12)', unlocked: true },
  { key: 'journal_30', icon: '📖', title: '30 Day Journaler', sub: 'Write journal for 30 consecutive days', color: '#c084fc', bg: 'rgba(192,132,252,0.12)', unlocked: false },
  { key: 'win_rate_70', icon: '🏹', title: '70% Win Rate', sub: 'Maintain 70%+ win rate over 20 trades', color: '#39ff14', bg: 'rgba(57,255,20,0.12)', unlocked: false },
  { key: 'balance_20k', icon: '💰', title: 'Account $20K', sub: 'Grow account to $20,000', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: false },
  { key: 'rr_master', icon: '🎯', title: 'RR Master', sub: 'Average 1:3 RR over 30 trades', color: '#ffcc00', bg: 'rgba(255,204,0,0.12)', unlocked: false },
  { key: 'habit_30', icon: '💪', title: 'Habit Champion', sub: 'Complete all habits for 30 days', color: '#39ff14', bg: 'rgba(57,255,20,0.12)', unlocked: false },
  { key: 'no_mistake_week', icon: '🛡', title: 'Clean Week', sub: 'Trade a full week with zero logged mistakes', color: '#00cfff', bg: 'rgba(0,207,255,0.12)', unlocked: false },
]

export default function AchievementsPage() {
  const { user } = useAuth()
  const { data: liveAch } = useAchievements(user?.uid)
  const unlockedKeys = liveAch.map(a => a.key)
  const unlocked = ALL_ACHIEVEMENTS.filter(a => a.unlocked || unlockedKeys.includes(a.key))
  const locked = ALL_ACHIEVEMENTS.filter(a => !a.unlocked && !unlockedKeys.includes(a.key))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: '#ffcc00', letterSpacing: 2 }}>ACHIEVEMENTS</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{unlocked.length} / {ALL_ACHIEVEMENTS.length} unlocked</div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div className="progress-bar" style={{ height: 6 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${(unlocked.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1.2 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--ng3), #ffcc00)', borderRadius: 3, boxShadow: '0 0 8px rgba(255,204,0,0.4)' }} />
        </div>
      </div>

      <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2, marginBottom: 10 }}>
        ✅ UNLOCKED ({unlocked.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {unlocked.map((ach, i) => (
          <motion.div key={ach.key}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, boxShadow: `0 6px 20px ${ach.color}25` }}
            className="glass-card" style={{ padding: '14px 16px', borderColor: `${ach.color}30` }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: ach.bg, border: `1px solid ${ach.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10, boxShadow: `0 0 12px ${ach.color}20` }}>
              {ach.icon}
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: ach.color, marginBottom: 3 }}>{ach.title}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{ach.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10 }}>
        🔒 LOCKED ({locked.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {locked.map((ach, i) => (
          <motion.div key={ach.key}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className="glass-card" style={{ padding: '14px 16px', opacity: 0.45, filter: 'grayscale(100%)' }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>
              🔒
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 3 }}>{ach.title}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{ach.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
