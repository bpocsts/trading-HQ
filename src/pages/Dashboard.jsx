import { useState } from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '../components/hero/HeroBanner'
import StatCards from '../components/stats/StatCards'
import TraderProfile from '../components/cards/TraderProfile'
import RadarChart from '../components/charts/RadarChart'
import { EmotionChart } from '../components/charts/EmotionChart'
import PerformanceChart from '../components/charts/PerformanceChart'
import RecentTrades from '../components/table/RecentTrades'
import {
  QuestsCard,
  WeeklySummaryCard,
  HabitTrackerCard,
  EmotionalTrackerCard,
  MonthlyPerfCard,
  MistakeTrackerCard,
  AchievementsCard,
  QuickAccess,
} from '../components/cards/DashboardCards'
import useStore from '../store/useStore'
import { useI18n } from '../i18n'

const gap = { gap: 10 }

export default function Dashboard() {
  const { setShowTradeModal } = useStore()
  const { t } = useI18n()
  const [performanceGranularity, setPerformanceGranularity] = useState('day')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <HeroBanner />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 10px 0' }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary neon-pulse" onClick={() => setShowTradeModal(true)}>
            + {t('dashboard.logTrade')}
          </motion.button>
        </div>

        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', ...gap }}>
          <StatCards />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', ...gap }}>
            <TraderProfile />
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-card" style={{ padding: 13 }}>
              <div className="card-title">
                <span>🎯</span>
                {t('dashboard.traderStats')}
                <span style={{ color: 'var(--text3)', fontSize: 9, fontWeight: 400, letterSpacing: 0 }}>{t('dashboard.sixDimensions')}</span>
              </div>
              <RadarChart />
            </motion.div>
            <QuestsCard />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', ...gap }}>
            <WeeklySummaryCard />
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass-card" style={{ padding: 13, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  <span>📈</span>
                  {t('dashboard.performanceOverview')}
                </div>
                <select
                  value={performanceGranularity}
                  onChange={(event) => setPerformanceGranularity(event.target.value)}
                  style={{ background: 'rgba(var(--ng-rgb),0.05)', border: '1px solid var(--border)', color: 'var(--ng)', fontSize: 10, padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'Exo 2', outline: 'none' }}
                >
                  <option value="day">{t('dashboard.thisWeek')}</option>
                  <option value="month">{t('dashboard.thisMonth')}</option>
                  <option value="year">{t('dashboard.threeMonths')}</option>
                </select>
              </div>
              <PerformanceChart granularity={performanceGranularity} />
            </motion.div>
            <MistakeTrackerCard />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1fr', ...gap }}>
            <RecentTrades />
            <EmotionalTrackerCard chart={<EmotionChart />} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', ...gap }}>
            <MonthlyPerfCard />
            <HabitTrackerCard />
            <AchievementsCard />
          </div>

          <QuickAccess />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', padding: '12px 0 16px', borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <div style={{ fontStyle: 'italic', fontSize: 12, color: 'var(--text3)' }}>{t('dashboard.footerQuote')}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>- Trading Journal</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
