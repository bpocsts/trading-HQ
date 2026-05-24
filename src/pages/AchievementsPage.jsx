import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useAuth } from '../hooks/useAuth'
import { syncAchievements, useAchievements } from '../hooks/useFirestore'
import { achievementCatalog } from '../lib/appConstants'
import { getAchievementText } from '../lib/localization'

export default function AchievementsPage() {
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: liveAchievements } = useAchievements(user?.uid)

  useEffect(() => {
    if (!user?.uid) return
    syncAchievements(user.uid, { silent: true })
  }, [user?.uid])

  const unlockedKeys = liveAchievements.map((achievement) => achievement.key)
  const unlocked = achievementCatalog.filter((achievement) => unlockedKeys.includes(achievement.key))
  const locked = achievementCatalog.filter((achievement) => !unlockedKeys.includes(achievement.key))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: '#ffcc00', letterSpacing: 2 }}>{t('achievementsPage.title')}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {t('achievementsPage.unlockedSummary')
            .replace('{count}', unlocked.length)
            .replace('{total}', achievementCatalog.length)}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="progress-bar" style={{ height: 6 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${(unlocked.length / achievementCatalog.length) * 100}%` }} transition={{ duration: 1.2 }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--ng3), #ffcc00)', borderRadius: 3, boxShadow: '0 0 8px rgba(255,204,0,0.4)' }} />
        </div>
      </div>

      <SectionTitle color="var(--ng)">{t('achievementsPage.unlocked')} ({unlocked.length})</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {!unlocked.length && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('achievementsPage.noneUnlocked')}</div>}
        {unlocked.map((achievement, index) => {
          const text = getAchievementText(achievement, language)
          return (
          <motion.div key={achievement.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3, boxShadow: `0 6px 20px ${achievement.color}25` }} className="glass-card" style={{ padding: '14px 16px', borderColor: `${achievement.color}30` }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: achievement.bg, border: `1px solid ${achievement.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10, boxShadow: `0 0 12px ${achievement.color}20` }}>
              {achievement.icon}
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: achievement.color, marginBottom: 3 }}>{text.title}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{text.sub}</div>
          </motion.div>
          )
        })}
      </div>

      <SectionTitle color="var(--text3)">{t('achievementsPage.locked')} ({locked.length})</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {locked.map((achievement, index) => {
          const text = getAchievementText(achievement, language)
          return (
          <motion.div key={achievement.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }} className="glass-card" style={{ padding: '14px 16px', opacity: 0.45, filter: 'grayscale(100%)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>
              🔒
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text3)', marginBottom: 3 }}>{text.title}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{text.sub}</div>
          </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SectionTitle({ children, color }) {
  return (
    <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color, letterSpacing: 2, marginBottom: 10 }}>
      {children}
    </div>
  )
}
