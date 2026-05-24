import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const PAGE_META = {
  '/performance': { icon: '📊', title: 'Performance Analytics', sub: 'Deep dive into your trading performance metrics' },
  '/psychology': { icon: '🧠', title: 'Psychology Tracker', sub: 'Track your mental state and emotional patterns' },
  '/routine': { icon: '🔁', title: 'Routine', sub: 'Build and review your trading routine' },
  '/habits': { icon: '💸', title: 'Expense Tracker', sub: 'Track deposits, expenses, and monthly budgets' },
  '/mistakes': { icon: '⚠️', title: 'Mistake Tracker', sub: 'Identify and eliminate recurring trading errors' },
  '/achievements': { icon: '🏆', title: 'Achievements', sub: 'Celebrate your trading milestones' },
  '/strategies': { icon: '📚', title: 'Strategy Library', sub: 'Document and manage your trading strategies' },
  '/screenshots': { icon: '📷', title: 'Screenshots', sub: 'Visual archive of your trade setups' },
  '/journal': { icon: '📝', title: 'Daily Journal', sub: 'Daily reflections and trading notes' },
  '/settings': { icon: '⚙', title: 'Settings', sub: 'Configure your account, app preferences, and workspace behavior' },
}

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { icon: '✨', title: 'Page', sub: 'Coming soon' }

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 20 }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{ fontSize: 60 }}
      >
        {meta.icon}
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>
          {meta.title.toUpperCase()}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>{meta.sub}</div>
        <div style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(var(--ng-rgb),0.05)', border: '1px dashed var(--border2)', borderRadius: 8, fontSize: 11, color: 'var(--text3)' }}>
          🚧 This section is under construction — connect Firebase to unlock full features
        </div>
      </motion.div>
    </div>
  )
}
