import { motion } from 'framer-motion'
import { weeklySummary, mistakes, achievements, quickAccess, emotionData, monthlyStats } from '../../data/mockData'
import useStore from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function QuestsCard() {
  const { quests, toggleQuest } = useStore()
  const { t } = useI18n()
  const done = quests.filter(q => q.done).length
  const pct = Math.round((done / quests.length) * 100)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title">
        <span>🎯</span>
        {t('cards.questsTitle')}
        <span className="dots-menu">···</span>
      </div>

      {quests.map(q => (
        <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(57,255,20,0.05)', fontSize: 11 }}>
          <div className={`quest-checkbox ${q.done ? 'checked' : ''}`} onClick={() => toggleQuest(q.id)}>
            {q.done && <span style={{ color: 'var(--ng)', fontSize: 9, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ flex: 1, color: q.done ? 'var(--text3)' : 'var(--text2)', textDecoration: q.done ? 'line-through' : 'none', fontSize: 10.5 }}>
            {t(`quests.${q.key}`)}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
          <span style={{ color: 'var(--text3)' }}>{t('cards.progress')}</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--ng)' }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, delay: 0.6 }} />
        </div>
      </div>
    </motion.div>
  )
}

export function WeeklySummaryCard() {
  const { t } = useI18n()
  const rows = [
    { label: t('cards.totalPL'), value: `+$${weeklySummary.totalPL.toLocaleString()}`, pos: true },
    { label: t('cards.totalTrades'), value: weeklySummary.totalTrades },
    { label: t('cards.winRate'), value: `${weeklySummary.winRate}%`, pos: true },
    { label: t('cards.bestTrade'), value: `+$${weeklySummary.bestTrade}`, pos: true },
    { label: t('cards.worstTrade'), value: `-$${Math.abs(weeklySummary.worstTrade)}`, neg: true },
    { label: t('cards.rrAverage'), value: weeklySummary.rrAverage },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>📊</span>{t('cards.weeklySummary')}</div>
      {rows.map(row => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(57,255,20,0.05)', fontSize: 11 }}>
          <span style={{ color: 'var(--text3)', fontSize: 10.5 }}>{row.label}</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 12, color: row.pos ? 'var(--ng)' : row.neg ? 'var(--red)' : 'var(--text)' }}>{row.value}</span>
        </div>
      ))}
      <div className="view-more-link">{t('cards.viewMoreAnalytics')}</div>
    </motion.div>
  )
}

export function HabitTrackerCard() {
  const { habits: storeHabits } = useStore()
  const { t } = useI18n()

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>🔥</span>{t('cards.habitsTitle')}<span className="dots-menu">···</span></div>
      {storeHabits.map(h => (
        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(57,255,20,0.05)', fontSize: 11 }}>
          <span style={{ flex: 1, color: 'var(--text2)', fontSize: 10.5 }}>{t(`habits.${h.key}`)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#ff6b35', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13 }}>{h.streak} 🔥</span>
        </div>
      ))}
      <div className="view-more-link">{t('cards.viewFullHabits')}</div>
    </motion.div>
  )
}

export function EmotionalTrackerCard({ chart }) {
  const { t } = useI18n()

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>💜</span>{t('cards.emotionalTitle')}<span className="dots-menu">···</span></div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {chart}
          <div style={{ textAlign: 'center', marginTop: -10 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 34, fontWeight: 700, color: 'var(--ng)', lineHeight: 1, textShadow: '0 0 15px rgba(57,255,20,0.4)' }}>{emotionData.avgScore}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{t('cards.avgEmotionalScore')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {emotionData.labelKeys.map((labelKey, i) => (
            <div key={labelKey} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: emotionData.colors[i], flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--text2)', fontSize: 10 }}>{t(`emotions.${labelKey}`)}</span>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text)', fontSize: 11 }}>{emotionData.values[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 9, lineHeight: 1.5 }}>
        {t('cards.emotionalFooter1')}<br />{t('cards.emotionalFooter2')}
      </div>
    </motion.div>
  )
}

export function MonthlyPerfCard({ chart }) {
  const { t } = useI18n()
  const stats = [
    { value: `+$${monthlyStats.totalPL.toLocaleString()}`, label: t('cards.totalPL'), color: 'var(--ng)' },
    { value: `${monthlyStats.winRate}%`, label: t('cards.winRate'), color: 'var(--ng)' },
    { value: monthlyStats.totalTrades, label: t('cards.totalTrades'), color: 'var(--text)' },
    { value: monthlyStats.rrAverage, label: t('cards.rrAverage'), color: 'var(--text)' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>🗓️</span>{t('cards.monthlyTitle')}<span className="dots-menu">···</span></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 9, color: 'var(--text3)', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 2, background: 'var(--ng)', borderRadius: 1 }} />
          P/L
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 2, background: '#00cfff', borderRadius: 1 }} />
          {t('cards.cumulative')}
        </div>
      </div>

      {chart}
    </motion.div>
  )
}

export function MistakeTrackerCard() {
  const { t } = useI18n()

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>⚠️</span>{t('cards.mistakesTitle')}<span className="dots-menu">···</span></div>

      {mistakes.map(m => (
        <div key={m.id} style={{ marginBottom: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5 }}>
            <span style={{ color: 'var(--text2)' }}>{t(`mistakes.${m.key}`)}</span>
            <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#ffaa00' }}>{m.count}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,170,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(m.count / m.max) * 100}%` }} transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, ${m.color}aa, ${m.color})`, borderRadius: 2, boxShadow: `0 0 4px ${m.color}66` }} />
          </div>
        </div>
      ))}

      <div className="view-more-link">{t('cards.viewAllMistakes')}</div>
    </motion.div>
  )
}

export function AchievementsCard() {
  const { t } = useI18n()

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span>🏆</span>{t('cards.achievementsTitle')}<span className="dots-menu">···</span></div>

      {achievements.map(ach => (
        <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: ach.bg, border: `1px solid ${ach.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{ach.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 11, color: ach.color }}>{t(`achievements.${ach.titleKey}`)}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)' }}>{t(`achievements.${ach.subKey}`)}</div>
          </div>
        </div>
      ))}

      <div className="view-more-link">{t('cards.viewAllAchievements')}</div>
    </motion.div>
  )
}

export function QuickAccess() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
        {quickAccess.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3, boxShadow: `0 6px 20px ${item.color}22` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(item.route)}
            style={{ border: `1px solid ${item.color}30`, borderRadius: 10, padding: '10px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', background: 'var(--card2)', transition: 'all 0.2s' }}
          >
            <div style={{ fontSize: 18, width: 36, height: 36, borderRadius: 8, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>{t(`quickAccess.${item.nameKey}`)}</div>
            <div style={{ fontSize: 8, color: 'var(--text3)', lineHeight: 1.3 }}>{t(`quickAccess.${item.subKey}`)}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
