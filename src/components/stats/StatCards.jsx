import { motion } from 'framer-motion'
import { dailyStats } from '../../data/mockData'

const cards = [
  { key: 'hp', icon: '❤', label: 'HP', color: '#39ff14', shadowColor: 'rgba(57,255,20,0.4)' },
  { key: 'mood', icon: '💎', label: 'Mood', color: '#c084fc', shadowColor: 'rgba(192,132,252,0.4)' },
  { key: 'focus', icon: '🎯', label: 'Focus', color: '#00cfff', shadowColor: 'rgba(0,207,255,0.4)' },
  { key: 'motivation', icon: '🏆', label: 'Motivation', color: '#ffcc00', shadowColor: 'rgba(255,204,0,0.4)' },
]

export default function StatCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
      {cards.map((card, i) => {
        const stat = dailyStats[card.key]
        const pct = (stat.score / stat.max) * 100
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -2, boxShadow: `0 6px 28px ${card.shadowColor}` }}
            className="glass-card"
            style={{ padding: '10px 13px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{card.icon}</span>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: card.color }}>
                {card.label}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani', fontSize: 19, fontWeight: 700, color: card.color, textShadow: `0 0 10px ${card.shadowColor}` }}>
                {stat.score}/{stat.max}
              </span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                style={{ height: '100%', background: card.color, borderRadius: 2, boxShadow: `0 0 6px ${card.color}` }}
              />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text3)' }}>{stat.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
