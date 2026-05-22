import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { navItems, todayFocus } from '../../data/mockData'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const { language, setLanguage, t } = useI18n()

  const handleLogout = async () => {
    await logout()
    toast.success(t('sidebar.loggedOut'))
  }

  return (
    <aside style={{ width: 192, minWidth: 192, background: 'linear-gradient(180deg,#060c06,#050905)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 20, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{ width: 36, height: 36, background: 'rgba(57,255,20,0.08)', border: '1px solid var(--ng)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 0 10px rgba(57,255,20,0.2)', flexShrink: 0 }}>📈</motion.div>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1 }}>TRADING HQ</div>
          <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: 1.5 }}>v2.0 • {user?.email?.split('@')[0]}</div>
        </div>
      </div>

      <div style={{ padding: '10px 14px 2px', borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' }}>{t('sidebar.language')}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn-ghost" style={{ flex: 1, padding: '6px 8px', opacity: language === 'en' ? 1 : 0.65 }} onClick={() => setLanguage('en')}>{t('common.english')}</button>
          <button type="button" className="btn-ghost" style={{ flex: 1, padding: '6px 8px', opacity: language === 'th' ? 1 : 0.65 }} onClick={() => setLanguage('th')}>{t('common.thai')}</button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingTop: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', padding: '8px 14px 6px', textTransform: 'uppercase' }}>{t('sidebar.mainMenu')}</div>
        {navItems.map((item) => {
          const active = location.pathname === item.route
          return (
            <motion.div key={item.route} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(item.route)} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12 }}>{t(`nav.${item.labelKey}`)}</span>
            </motion.div>
          )
        })}
      </div>

      <TodayFocusCard />

      <button
        onClick={handleLogout}
        style={{ margin: '0 10px 12px', padding: '8px', background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: 8, color: 'rgba(255,100,100,0.7)', cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s', flexShrink: 0 }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,68,68,0.12)'; e.target.style.color = '#ff6666' }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,68,68,0.06)'; e.target.style.color = 'rgba(255,100,100,0.7)' }}
      >
        {t('sidebar.signOut')}
      </button>
    </aside>
  )
}

function TodayFocusCard() {
  const { t } = useI18n()
  const { session, pair, biasKey, keyLevel, notesKey } = todayFocus

  const rows = [
    { label: t('sidebar.session'), value: session, color: '#39ff14' },
    { label: t('sidebar.focusPair'), value: pair, color: '#00cfff' },
    { label: t('sidebar.bias'), value: t(`focus.${biasKey}`), color: '#39ff14' },
    { label: t('sidebar.keyLevel'), value: keyLevel, color: 'var(--text2)' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ margin: '10px 10px 0', background: 'linear-gradient(135deg,#0a1a0a,#0d200d)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 12px', flexShrink: 0 }}>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 9 }}>{t('sidebar.todayFocus')}</div>
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 10 }}>
          <span style={{ color: 'var(--text3)' }}>{row.label}</span>
          <span style={{ color: row.color, fontWeight: 600, fontFamily: 'Rajdhani', fontSize: 11 }}>{row.value}</span>
        </div>
      ))}
      <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8, lineHeight: 1.5 }}>
        {t(`focus.${notesKey}`).split('\n').map((line, index) => <div key={index}>{line}</div>)}
      </div>
    </motion.div>
  )
}
