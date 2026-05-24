import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { useI18n } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import { achievementCatalog } from '../../lib/appConstants'
import { calcTradeStats, calculateAchievementLevel, useAchievements, useTrades, useUserProfile } from '../../hooks/useFirestore'
import { parseTradeDate } from '../../lib/analytics'
import ProfileFrame from '../ui/ProfileFrame'

const defaultProfile = {
  name: 'Trader',
  role: 'Smart Money Concept Trader',
  level: 1,
  xp: 0,
  xpMax: 1000,
  winRate: 0,
  rrAverage: '1:0',
  totalTrades: 0,
  balance: 0,
  bestSession: 'London',
  currentStreak: 0,
  avatarPreset: 'neo',
  avatarDataUrl: '',
}

export default function TraderProfile() {
  const { setShowProfileModal } = useStore()
  const { user } = useAuth()
  const { profile: liveProfile } = useUserProfile(user?.uid)
  const { data: trades } = useTrades(user?.uid)
  const { data: achievements } = useAchievements(user?.uid)
  const { language, t } = useI18n()
  const baseProfile = liveProfile?.profile || defaultProfile
  const achievementLevel = calculateAchievementLevel(achievements.length, achievementCatalog.length)
  const completedTrades = [...trades]
    .filter((trade) => trade.result === 'Win' || trade.result === 'Loss')
    .sort((a, b) => {
      const aTime = parseTradeDate(a.date)?.getTime() || 0
      const bTime = parseTradeDate(b.date)?.getTime() || 0
      return bTime - aTime
    })
  const stats = calcTradeStats(trades)
  const initialTradeBalance = Number(baseProfile.initialTradeBalance ?? 10000) || 0
  const accountBalance = initialTradeBalance + stats.totalPL
  const totalRR = completedTrades.reduce((sum, trade) => {
    const rrValue = Number(String(trade.rr || '').replace('1 :', '').trim())
    return sum + (Number.isFinite(rrValue) ? rrValue : 0)
  }, 0)
  const avgRR = completedTrades.length ? `1:${(totalRR / completedTrades.length).toFixed(1)}` : baseProfile.rrAverage
  const sessionTotals = completedTrades.reduce((acc, trade) => {
    const sessionKey = trade.session || '-'
    acc[sessionKey] = (acc[sessionKey] || 0) + (Number(trade.pl) || 0)
    return acc
  }, {})
  const bestSession = Object.entries(sessionTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || baseProfile.bestSession || '-'

  const totalWins = completedTrades.filter((trade) => trade.result === 'Win').length
  const totalLosses = completedTrades.filter((trade) => trade.result === 'Loss').length
  const tradeStatus = completedTrades.length
    ? language === 'th'
      ? `${totalLosses} แพ้ / ${totalWins} ชนะ`
      : `${totalLosses} Loss / ${totalWins} Win`
    : '-'

  const profile = {
    ...baseProfile,
    level: achievementLevel.level,
    xp: achievementLevel.xp,
    xpMax: achievementLevel.xpMax,
    winRate: stats.winRate,
    totalTrades: stats.totalTrades,
    rrAverage: avgRR,
    balance: accountBalance,
    bestSession,
    tradeStatus,
  }

  const rows = [
    { key: 'winRate', value: `${profile.winRate}%`, color: 'var(--ng)' },
    { key: 'rrAverage', value: profile.rrAverage, color: 'var(--text)' },
    { key: 'totalTrades', value: profile.totalTrades, color: 'var(--text)' },
    { key: 'accountBalance', value: `$${profile.balance.toLocaleString()}`, color: 'var(--ng)' },
    { key: 'bestSession', value: profile.bestSession, color: '#00cfff' },
    { key: 'tradeStatus', label: language === 'th' ? 'สถานะการเทรด' : 'Trade Status', value: profile.tradeStatus, color: 'var(--ng)' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title">
        <span><i className="bi bi-person-fill"></i></span>
        {t('profile.title')}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <AvatarArt
          avatarDataUrl={profile.avatarDataUrl}
          avatarPreset={profile.avatarPreset || 'neo'}
          name={profile.name}
          level={profile.level}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{profile.name}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 6, marginTop: 2 }}>{profile.role}</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 9, color: 'var(--text3)' }}>{t('profile.level')}</span>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 700, color: 'var(--ng)', lineHeight: 1, textShadow: '0 0 12px rgba(var(--ng-rgb),0.4)' }}>{profile.level}</span>
          </div>

          <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 3 }}>{t('profile.xp')}</div>
          <div style={{ height: 4, background: 'rgba(var(--ng-rgb),0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(profile.xp / profile.xpMax) * 100}%` }} transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--ng3), var(--ng))', borderRadius: 2, boxShadow: '0 0 6px var(--ng)' }} />
          </div>
          <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'right', marginTop: 2 }}>{profile.xp} / {profile.xpMax}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
        {rows.map((row) => (
          <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.06)', fontSize: 10 }}>
            <span style={{ color: 'var(--text3)' }}>{row.label || t(`profile.${row.key}`)}</span>
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

function AvatarArt({ avatarDataUrl, avatarPreset, name, level }) {
  return (
    <ProfileFrame
      avatarDataUrl={avatarDataUrl}
      avatarPreset={avatarPreset}
      name={name}
      level={level}
      width={86}
      height={98}
    />
  )
}
