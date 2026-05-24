import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n'
import { useAuth } from '../hooks/useAuth'
import { useMistakes } from '../hooks/useFirestore'
import { mistakeTypes } from '../lib/appConstants'
import { getMistakeLabel } from '../lib/localization'

export default function MistakePage() {
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: liveMistakes } = useMistakes(user?.uid)

  const counts = useMemo(() => {
    const result = {}
    liveMistakes.forEach((mistake) => {
      result[mistake.type] = (result[mistake.type] || 0) + 1
    })
    return result
  }, [liveMistakes])

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: '#ffaa00', letterSpacing: 2 }}>{t('mistakePage.title')}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('mistakePage.subtitle')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-bar-chart-line-fill"></i></span>{t('mistakePage.frequency')}</div>
          {mistakeTypes.map((mistake, index) => {
            const count = counts[mistake.label] || 0
            return (
              <div key={mistake.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5 }}>
                  <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{mistake.icon}</span>{getMistakeLabel(mistake.label, language)}
                  </span>
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: mistake.color }}>{count}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,170,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }} transition={{ duration: 1, delay: index * 0.1 }} style={{ height: '100%', background: `linear-gradient(90deg, ${mistake.color}99, ${mistake.color})`, borderRadius: 2, boxShadow: `0 0 4px ${mistake.color}55` }} />
                </div>
              </div>
            )
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-pie-chart-fill"></i></span>{t('mistakePage.recentLog')}</div>
          {!liveMistakes.length && (
            <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              {t('mistakePage.noMistakes')}
            </div>
          )}
          {liveMistakes.slice(0, 6).map((mistake) => {
            const meta = mistakeTypes.find((item) => item.label === mistake.type) || { color: '#ffaa00', icon: '⚠' }
            return (
              <div key={mistake.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.04)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${meta.color}12`, border: `1px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: meta.color }}>{getMistakeLabel(mistake.type, language)}</span>
                    <span style={{ fontSize: 9, color: 'var(--text3)' }}>{mistake.date}</span>
                  </div>
                  {mistake.description && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, lineHeight: 1.4 }}>{mistake.description}</div>}
                  {mistake.tradeId && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3 }}>{language === 'th' ? 'เทรด' : 'Trade'}: {mistake.tradeId}</div>}
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
