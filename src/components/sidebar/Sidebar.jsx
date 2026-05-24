// src/components/sidebar/Sidebar.jsx
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'
import { navItems } from '../../lib/appConstants'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { language, t } = useI18n()

  return (
    <aside style={{ width: 192, minWidth: 192, background: 'linear-gradient(180deg,#060c06,#050905)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 20, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{ width: 36, height: 36, background: 'rgba(var(--ng-rgb),0.08)', border: '1px solid var(--ng)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 0 10px rgba(var(--ng-rgb),0.2)', flexShrink: 0 }}>📈</motion.div>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1 }}>TRADING HQ</div>
          <div style={{ fontSize: 8, color: 'var(--text3)', letterSpacing: 1.5 }}>v2.0 • {user?.email?.split('@')[0]}</div>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingTop: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', padding: '8px 14px 6px', textTransform: 'uppercase' }}>{t('sidebar.mainMenu')}</div>
        {navItems.map((item) => {
          const active = location.pathname === item.route
          const label = item.labelKey === 'expenses'
            ? t('dashboardCards.expenseTracker')
            : item.labelKey === 'settings'
              ? t('nav.settings')
              : t(`nav.${item.labelKey}`)
          return (
            <motion.div key={item.route} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(item.route)} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
              <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12 }}>{label}</span>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}
