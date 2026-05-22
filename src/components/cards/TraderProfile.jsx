import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { useI18n } from '../../i18n'

export default function TraderProfile() {
  const { profile, setShowProfileModal } = useStore()
  const { t } = useI18n()

  const rows = [
    { key: 'winRate', value: `${profile.winRate}%`, color: 'var(--ng)' },
    { key: 'rrAverage', value: profile.rrAverage, color: 'var(--text)' },
    { key: 'totalTrades', value: profile.totalTrades, color: 'var(--text)' },
    { key: 'accountBalance', value: `$${profile.balance.toLocaleString()}`, color: 'var(--ng)' },
    { key: 'bestSession', value: profile.bestSession, color: '#00cfff' },
    { key: 'currentStreak', value: `${profile.currentStreak} ${t('profile.winsSuffix')}`, color: 'var(--ng)' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title">
        <span><i className="bi bi-person-fill"></i></span>
        {t('profile.title')}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <AvatarArt />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{profile.name}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 6, marginTop: 2 }}>{profile.role}</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: 'var(--text3)' }}>{t('profile.level')}</span>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 700, color: 'var(--ng)', lineHeight: 1, textShadow: '0 0 12px rgba(57,255,20,0.4)' }}>{profile.level}</span>
          </div>

          <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 3 }}>{t('profile.xp')}</div>
          <div style={{ height: 4, background: 'rgba(57,255,20,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(profile.xp / profile.xpMax) * 100}%` }} transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--ng3), var(--ng))', borderRadius: 2, boxShadow: '0 0 6px var(--ng)' }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'right', marginTop: 2 }}>{profile.xp} / {profile.xpMax}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
        {rows.map((row) => (
          <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(57,255,20,0.06)', fontSize: 10 }}>
            <span style={{ color: 'var(--text3)' }}>{t(`profile.${row.key}`)}</span>
            <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 11, color: row.color }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => setShowProfileModal(true)}>
        {t('profile.editProfile')}
      </button>
    </motion.div>
  )
}

function AvatarArt() {
  return (
    <div style={{ width: 64, height: 68, borderRadius: 9, border: '1px solid rgba(57,255,20,0.3)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 12px rgba(57,255,20,0.1)' }}>
      <svg width="64" height="68" viewBox="0 0 64 68" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3520" />
            <stop offset="100%" stopColor="#0a1a0d" />
          </linearGradient>
          <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8a878" />
            <stop offset="100%" stopColor="#9a7858" />
          </linearGradient>
        </defs>
        <rect width="64" height="68" fill="url(#bgGrad)" />
        <path d="M8 68 L10 45 Q14 36 22 32 L32 48 L42 32 Q50 36 54 45 L56 68Z" fill="#1a3020" />
        <path d="M22 32 L32 48 L42 32" stroke="rgba(57,255,20,0.25)" strokeWidth="0.5" fill="none" />
        <rect x="27" y="26" width="10" height="7" rx="2" fill="#b89870" />
        <ellipse cx="32" cy="20" rx="14" ry="15" fill="url(#fGrad)" />
        <path d="M18 18 Q18 5 32 4 Q46 5 46 18 Q42 10 32 9 Q22 10 18 18Z" fill="#1a1a2e" />
        <path d="M18 18 Q16 23 19 28" fill="#1a1a2e" />
        <path d="M46 18 Q48 23 45 28" fill="#1a1a2e" />
        <path d="M26 9 Q24 15 23 18" stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="26" cy="20" rx="4" ry="5" fill="#1a2a1a" />
        <ellipse cx="38" cy="20" rx="4" ry="5" fill="#1a2a1a" />
        <ellipse cx="26" cy="20" rx="2.8" ry="3.8" fill="#2a6a3a" />
        <ellipse cx="38" cy="20" rx="2.8" ry="3.8" fill="#2a6a3a" />
        <ellipse cx="26" cy="20" rx="1.5" ry="2" fill="#0a1a0d" />
        <ellipse cx="38" cy="20" rx="1.5" ry="2" fill="#0a1a0d" />
        <ellipse cx="27" cy="19" rx="0.8" ry="0.8" fill="rgba(57,255,20,0.9)" />
        <ellipse cx="39" cy="19" rx="0.8" ry="0.8" fill="rgba(57,255,20,0.9)" />
        <line x1="8" y1="66" x2="56" y2="66" stroke="rgba(57,255,20,0.4)" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
