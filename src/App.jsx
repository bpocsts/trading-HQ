import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { I18nProvider, useI18n } from './i18n'
import Sidebar from './components/sidebar/Sidebar'
import AddTradeModal from './components/ui/AddTradeModal'
import ProfileModal from './components/ui/ProfileModal'
import ThemeAtmosphere from './components/ui/ThemeAtmosphere'
import Dashboard from './pages/Dashboard'
import TradePage from './pages/TradePage'
import PerformancePage from './pages/PerformancePage'
import PsychologyPage from './pages/PsychologyPage'
import RoutinePage from './pages/RoutinePage'
import HabitPage from './pages/HabitPage'
import MistakePage from './pages/MistakePage'
import AchievementsPage from './pages/AchievementsPage'
import CertificatePage from './pages/CertificatePage'
import StrategyPage from './pages/StrategyPage'
import ScreenshotsPage from './pages/ScreenshotsPage'
import JournalPage from './pages/JournalPage'
import AuthPage from './pages/AuthPage'
import SettingsPage from './pages/SettingsPage'

function AppInner() {
  const { user, loading } = useAuth()
  const { t } = useI18n()

  if (loading) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg1)', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <div style={{ fontFamily: 'Rajdhani', fontSize: 14, color: 'var(--ng)', letterSpacing: 2 }}>{t('common.loadingSystem')}</div>
    </div>
  )

  if (!user) return <AuthPage />

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(var(--ng-rgb),0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--ng-rgb),0.012) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      <ThemeAtmosphere />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', background: 'linear-gradient(160deg,var(--bg1),#040904,var(--bg3))' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, borderLeft: '1px solid rgba(var(--ng-rgb),0.06)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<TradePage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/psychology" element={<PsychologyPage />} />
            <Route path="/routine" element={<RoutinePage />} />
            <Route path="/habits" element={<HabitPage />} />
            <Route path="/mistakes" element={<MistakePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/strategies" element={<StrategyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/screenshots" element={<ScreenshotsPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <AddTradeModal />
      <ProfileModal />

      <Toaster position="bottom-right" toastOptions={{
        style: { background: 'var(--card2)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: 'Exo 2', fontSize: 12 },
        success: { iconTheme: { primary: 'var(--ng)', secondary: '#000' } },
        error: { iconTheme: { primary: '#ff4444', secondary: '#000' } },
      }} />
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </I18nProvider>
  )
}
