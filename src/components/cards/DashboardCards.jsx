import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useAuth } from '../../hooks/useAuth'
import useStore from '../../store/useStore'
import {
  calcTradeStats,
  saveExpenseBudgets,
  useAchievements,
  useDeposits,
  useExpenses,
  useMistakes,
  usePsychology,
  useRoutines,
  useTrades,
  useUserProfile,
} from '../../hooks/useFirestore'
import { achievementCatalog, expenseCategories, navItems } from '../../lib/appConstants'
import { buildEmotionDistribution, formatSignedCurrency } from '../../lib/analytics'
import { getAchievementText, getEmotionLabel, getExpenseCategoryLabel, getMistakeLabel } from '../../lib/localization'

const defaultBudgetConfig = {
  food: { budget: 9000, color: '#ff7043' },
  travel: { budget: 4500, color: '#ffa000' },
  shopping: { budget: 6000, color: '#ffca28' },
  gaming: { budget: 3000, color: '#ab47bc' },
  investment: { budget: 12000, color: '#26c6da' },
  bills: { budget: 5000, color: '#42a5f5' },
  home: { budget: 7000, color: '#66bb6a' },
  health: { budget: 4000, color: '#ef5350' },
}

const routineDashboardSections = [
  {
    key: 'morning',
    icon: '🌅',
    color: '#ffcc00',
    label: { en: 'Morning', th: 'ตอนเช้า' },
    items: ['wake_on_time', 'water_clean_up', 'light_movement', 'no_chart_first', 'mindset_check'],
  },
  {
    key: 'pre_trade',
    icon: '🎯',
    color: '#00cfff',
    label: { en: 'Pre-Trade', th: 'ก่อนเทรด' },
    items: ['session_check', 'review_plan', 'check_news', 'focus_pair', 'daily_loss_limit', 'max_trades', 'bias_and_levels', 'setup_grade', 'rr_check'],
  },
  {
    key: 'during_trade',
    icon: '⚡',
    color: '#39ff14',
    label: { en: 'During Trade', th: 'ระหว่างเทรด' },
    items: ['no_random_sl', 'no_early_close', 'no_emotion_stack', 'no_revenge', 'let_plan_work'],
  },
  {
    key: 'post_trade',
    icon: '📝',
    color: '#c084fc',
    label: { en: 'Post-Trade', th: 'หลังเทรด' },
    items: ['log_result', 'log_pl', 'emotion_after', 'mistake_if_any'],
  },
  {
    key: 'night',
    icon: '🌙',
    color: '#42a5f5',
    label: { en: 'Night Review', th: 'ก่อนนอน' },
    items: ['daily_summary', 'best_worst', 'rule_break', 'followed_plan', 'write_good', 'write_fix', 'lessons', 'tomorrow_plan', 'screen_off', 'sleep_ready'],
  },
]

function formatMonthLabel(value, language) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function shiftMonth(value, direction) {
  const [year, month] = value.split('-').map(Number)
  const next = new Date(year, month - 1 + direction, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

export function QuestsCard() {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { setShowTradeModal } = useStore()
  const { data: trades } = useTrades(user?.uid)
  const { data: expenses } = useExpenses(user?.uid)
  const { data: deposits } = useDeposits(user?.uid)
  const { data: psychology } = usePsychology(user?.uid)
  const today = new Date().toISOString().split('T')[0]

  const quests = [
    {
      id: 'trade',
      label: t('dashboardCards.questTrade'),
      hint: language === 'th' ? 'เปิดฟอร์มบันทึกเทรดแล้วบันทึกรายการ' : 'Open the trade form and save your setup',
      actionLabel: language === 'th' ? 'บันทึก' : 'Open',
      done: trades.some((trade) => trade.date === today),
      action: () => setShowTradeModal(true),
    },
    {
      id: 'expense',
      label: t('dashboardCards.questExpense'),
      hint: language === 'th' ? 'จดรายจ่ายที่เกิดขึ้นวันนี้' : 'Record any spending you made today',
      actionLabel: language === 'th' ? 'เงินสด' : 'Cash Flow',
      done: expenses.some((expense) => expense.date === today),
      action: () => navigate('/habits'),
    },
    {
      id: 'deposit',
      label: t('dashboardCards.questDeposit'),
      hint: language === 'th' ? 'ถ้ามีเงินเข้าวันนี้ ให้บันทึกเพิ่ม' : 'Add new income if money came in today',
      actionLabel: language === 'th' ? 'เงินสด' : 'Cash Flow',
      done: deposits.some((deposit) => deposit.date === today),
      action: () => navigate('/habits'),
    },
    {
      id: 'mindset',
      label: t('dashboardCards.questMindset'),
      hint: language === 'th' ? 'บันทึกสภาพจิตใจก่อนหรือหลังเทรด' : 'Record your mindset before or after trading',
      actionLabel: language === 'th' ? 'เช็กอิน' : 'Check-In',
      done: psychology.some((entry) => entry.date === today),
      action: () => navigate('/psychology'),
    },
  ]

  const done = quests.filter((quest) => quest.done).length
  const pct = Math.round((done / quests.length) * 100)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title">
        <span><i className="bi bi-bullseye"></i></span>
        {t('dashboardCards.questsTitle')}
        <span className="dots-menu">...</span>
      </div>
      {quests.map((quest) => (
        <div key={quest.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.05)', fontSize: 11 }}>
          <div className={`quest-checkbox ${quest.done ? 'checked' : ''}`}>{quest.done && <span style={{ color: 'var(--ng)', fontSize: 9, fontWeight: 700 }}>✓</span>}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: quest.done ? 'var(--text)' : 'var(--text2)', fontSize: 10.5, fontWeight: 600 }}>{quest.label}</div>
            <div style={{ color: 'var(--text3)', fontSize: 9, marginTop: 2 }}>
              {quest.done ? (language === 'th' ? 'ทำครบแล้วสำหรับวันนี้' : 'Completed for today') : quest.hint}
            </div>
          </div>
          <button type="button" className="btn-ghost" onClick={quest.action} style={{ padding: '4px 8px', fontSize: 9.5, flexShrink: 0, opacity: quest.done ? 0.75 : 1 }}>
            {quest.done ? (language === 'th' ? 'ดู' : 'View') : quest.actionLabel}
          </button>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
          <span style={{ color: 'var(--text3)' }}>{t('dashboardCards.questProgress')}</span>
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
  const { language, t } = useI18n()
  const { user } = useAuth()
  const { data: trades } = useTrades(user?.uid)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const monthlyTrades = trades.filter((trade) => String(trade.date || '').startsWith(selectedMonth))
  const stats = calcTradeStats(monthlyTrades)
  const bestTrade = monthlyTrades.reduce((max, trade) => Math.max(max, Number(trade.pl) || 0), 0)
  const worstTrade = monthlyTrades.reduce((min, trade) => Math.min(min, Number(trade.pl) || 0), 0)
  const rows = [
    { label: t('cards.totalPL'), value: formatSignedCurrency(stats.totalPL), pos: stats.totalPL >= 0, neg: stats.totalPL < 0 },
    { label: t('cards.totalTrades'), value: stats.totalTrades },
    { label: t('cards.winRate'), value: `${stats.winRate}%`, pos: true },
    { label: t('cards.bestTrade'), value: formatSignedCurrency(bestTrade), pos: true },
    { label: t('cards.worstTrade'), value: formatSignedCurrency(worstTrade), neg: true },
    { label: t('cards.rrAverage'), value: stats.avgRR },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 13, height: '100%' }}>
      <div className="card-title"><span><i className="bi bi-clipboard-data-fill"></i></span>{language === 'th' ? 'สรุปรายเดือน' : 'Monthly Summary'}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <button type="button" className="btn-ghost" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={{ padding: '2px 8px', minWidth: 34 }}>‹</button>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1 }}>{formatMonthLabel(selectedMonth, language)}</div>
        <button type="button" className="btn-ghost" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))} style={{ padding: '2px 8px', minWidth: 34 }}>›</button>
      </div>
      {rows.map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.05)', fontSize: 11 }}>
          <span style={{ color: 'var(--text3)', fontSize: 10.5 }}>{row.label}</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 12, color: row.pos ? 'var(--ng)' : row.neg ? 'var(--red)' : 'var(--text)' }}>{row.value}</span>
        </div>
      ))}
    </motion.div>
  )
}

export function HabitTrackerCard() {
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: storeExpenses } = useExpenses(user?.uid)
  const { profile: userProfile } = useUserProfile(user?.uid)
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetDrafts, setBudgetDrafts] = useState({})
  const [savingBudgets, setSavingBudgets] = useState(false)

  const resolvedBudgets = useMemo(() => {
    const savedBudgets = userProfile?.expenseBudgets || {}
    return Object.fromEntries(Object.entries(defaultBudgetConfig).map(([key, value]) => [key, Number(savedBudgets[key]) > 0 ? Number(savedBudgets[key]) : value.budget]))
  }, [userProfile])

  useEffect(() => {
    if (!isEditingBudget) {
      setBudgetDrafts(Object.fromEntries(Object.entries(resolvedBudgets).map(([key, value]) => [key, String(value)])))
    }
  }, [isEditingBudget, resolvedBudgets])

  const categoryRows = useMemo(() => {
    const totalsByCategory = storeExpenses.reduce((acc, expense) => {
      if (!expense?.date?.startsWith(selectedMonth)) return acc
      acc[expense.category] = (acc[expense.category] || 0) + (Number(expense.amount) || 0)
      return acc
    }, {})

    return expenseCategories
      .map((category) => {
        const spent = totalsByCategory[category.key] || 0
        const budget = resolvedBudgets[category.key] || 1
        return { ...category, spent, budget, percent: Math.min(Math.round((spent / budget) * 100), 100), color: defaultBudgetConfig[category.key]?.color || 'var(--ng)' }
      })
      .sort((a, b) => b.spent - a.spent)
  }, [resolvedBudgets, selectedMonth, storeExpenses])

  const visibleRows = isEditingBudget ? categoryRows : categoryRows.slice(0, 5)

  const handleSaveBudgets = async () => {
    if (!user) return
    const payload = Object.fromEntries(Object.keys(defaultBudgetConfig).map((key) => [key, Math.max(0, Number(budgetDrafts[key]) || defaultBudgetConfig[key].budget)]))
    setSavingBudgets(true)
    try {
      const ok = await saveExpenseBudgets(user.uid, payload)
      if (ok) setIsEditingBudget(false)
    } finally {
      setSavingBudgets(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 13, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="card-title">
        <span><i className="bi bi-cash-stack"></i></span>
        {t('dashboardCards.expenseTracker')}
        <button type="button" className="btn-ghost" onClick={() => setIsEditingBudget((current) => !current)} style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: 10 }}>
          {isEditingBudget ? t('dashboardCards.cancel') : t('dashboardCards.editBudget')}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <button type="button" className="btn-ghost" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))} style={{ padding: '2px 8px', minWidth: 34 }}>‹</button>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1 }}>{formatMonthLabel(selectedMonth, language)}</div>
        <button type="button" className="btn-ghost" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))} style={{ padding: '2px 8px', minWidth: 34 }}>›</button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: isEditingBudget ? 'auto' : 'hidden', paddingRight: isEditingBudget ? 4 : 0, display: 'flex', flexDirection: 'column', justifyContent: isEditingBudget ? 'flex-start' : 'space-evenly', gap: 8 }}>
        {visibleRows.map((category) => (
          <div key={category.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5, gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 15 }}>{category.icon}</span>
                <span style={{ color: 'var(--text2)' }}>{getExpenseCategoryLabel(category, language)}</span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: category.color }}>{category.percent}%</div>
                {isEditingBudget ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 8 }}>฿{category.spent.toLocaleString()} /</span>
                    <input className="input-dark" type="number" min="0" value={budgetDrafts[category.key] ?? ''} onChange={(event) => setBudgetDrafts((current) => ({ ...current, [category.key]: event.target.value }))} style={{ width: 84, padding: '3px 6px', fontSize: 10, textAlign: 'right' }} />
                  </div>
                ) : (
                  <div style={{ color: 'var(--text3)', fontSize: 8 }}>฿{category.spent.toLocaleString()} / ฿{category.budget.toLocaleString()}</div>
                )}
              </div>
            </div>
            <div style={{ height: 4, background: `${category.color}14`, borderRadius: 2, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(category.percent, category.spent > 0 ? 4 : 0)}%` }} transition={{ duration: 1.2, delay: 0.25, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, ${category.color}aa, ${category.color})`, borderRadius: 2, boxShadow: `0 0 4px ${category.color}66` }} />
            </div>
          </div>
        ))}
      </div>
      {isEditingBudget && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, marginBottom: 4 }}>
          <button type="button" className="btn-primary" onClick={handleSaveBudgets} disabled={savingBudgets} style={{ padding: '6px 12px' }}>
            {savingBudgets ? (language === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t('dashboardCards.saveBudgets')}
          </button>
        </div>
      )}
      <div className="view-more-link" onClick={() => navigate('/habits')} style={{ marginTop: 'auto', paddingTop: 12 }}>
        {t('dashboardCards.viewAllExpenses')}
      </div>
    </motion.div>
  )
}

export function EmotionalTrackerCard({ chart }) {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const { data: entries } = usePsychology(user?.uid)
  const emotions = buildEmotionDistribution(entries)
  const average = entries.length ? (entries.reduce((sum, entry) => sum + Math.max(1, 11 - (Number(entry.stressLevel) || 5)), 0) / entries.length).toFixed(1) : '0.0'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 13 }}>
      <div className="card-title"><span><i className="bi bi-heart-pulse-fill"></i></span>{t('dashboardCards.emotionalTracker')}<span className="dots-menu">...</span></div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {chart}
          <div style={{ textAlign: 'center', marginTop: -10 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 34, fontWeight: 700, color: 'var(--ng)', lineHeight: 1, textShadow: '0 0 15px rgba(var(--ng-rgb),0.4)' }}>{average}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{t('dashboardCards.avgEmotionalScore')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {emotions.slice(0, 5).map((emotion) => (
            <div key={emotion.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: emotion.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--text2)', fontSize: 10 }}>{getEmotionLabel(emotion.label, language)}</span>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text)', fontSize: 11 }}>{emotion.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function MonthlyPerfCard() {
  const { language } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: routines } = useRoutines(user?.uid)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const selectedRoutine = routines.find((entry) => entry.date === selectedDate)
  const completed = new Set(Array.isArray(selectedRoutine?.completed) ? selectedRoutine.completed : [])
  const locale = language === 'th' ? 'th' : 'en'
  const totalItems = routineDashboardSections.reduce((sum, section) => sum + section.items.length, 0)
  const doneItems = completed.size
  const overallProgress = totalItems ? Math.round((doneItems / totalItems) * 100) : 0
  const title = language === 'th' ? 'ลูทีน' : 'Routine'
  const viewLabel = language === 'th' ? 'ดูเช็กลิสต์ทั้งหมด ->' : 'View full checklist ->'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 13, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <span><i className="bi bi-check2-square"></i></span>
        {title}
        <input
          className="input-dark"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          style={{
            marginLeft: 'auto',
            width: 128,
            padding: '3px 8px',
            minHeight: 0,
            height: 28,
            fontSize: 11,
            color: 'var(--ng)',
          }}
        />
        <span style={{ marginLeft: 8, fontFamily: 'Rajdhani', fontWeight: 800, color: overallProgress >= 80 ? 'var(--ng)' : overallProgress >= 45 ? '#ffcc00' : '#ff6b35' }}>
          {overallProgress}%
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {routineDashboardSections.map((section) => {
          const sectionDone = section.items.filter((item) => completed.has(item)).length
          const percent = Math.round((sectionDone / section.items.length) * 100)

          return (
            <div key={section.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 15 }}>{section.icon}</span>
                  <span style={{ color: 'var(--text2)' }}>{section.label[locale]}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 800, color: section.color }}>{percent}%</div>
                  <div style={{ color: 'var(--text3)', fontSize: 8 }}>{sectionDone} / {section.items.length}</div>
                </div>
              </div>
              <div style={{ height: 4, background: `${section.color}14`, borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${section.color}99, ${section.color})`, borderRadius: 2, boxShadow: `0 0 4px ${section.color}66` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="view-more-link" onClick={() => navigate('/routine')} style={{ marginTop: 'auto', paddingTop: 12 }}>
        {viewLabel}
      </div>
    </motion.div>
  )
}

export function MistakeTrackerCard() {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const { data: mistakes } = useMistakes(user?.uid)
  const rows = Object.entries(mistakes.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 5)
  const max = Math.max(...rows.map((row) => row.count), 1)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 13, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title"><span><i className="bi bi-exclamation-triangle-fill"></i></span>{t('dashboardCards.mistakeTracker')}<span className="dots-menu">...</span></div>
      {!rows.length && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{t('dashboardCards.noMistakes')}</div>}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: rows.length >= 4 ? 'space-evenly' : 'flex-start', gap: rows.length >= 4 ? 0 : 13 }}>
        {rows.map((row) => (
          <div key={row.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10.5 }}>
              <span style={{ color: 'var(--text2)' }}>{getMistakeLabel(row.label, language)}</span>
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: '#ffaa00' }}>{row.count}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,170,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(row.count / max) * 100}%` }} transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, rgba(255,170,0,0.65), #ffaa00)', borderRadius: 2, boxShadow: '0 0 4px rgba(255,170,0,0.45)' }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function AchievementsCard() {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const { data: achievements } = useAchievements(user?.uid)
  const unlocked = achievementCatalog.filter((item) => achievements.some((achievement) => achievement.key === item.key)).slice(0, 5)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card" style={{ padding: 13, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title"><span><i className="bi bi-trophy-fill"></i></span>{t('dashboardCards.achievements')}<span className="dots-menu">...</span></div>
      {!unlocked.length && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{t('dashboardCards.noAchievements')}</div>}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: unlocked.length >= 4 ? 'space-evenly' : 'flex-start' }}>
        {unlocked.map((achievement) => {
          const achievementText = getAchievementText(achievement, language)
          return (
          <div key={achievement.key} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.05)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: achievement.bg, border: `1px solid ${achievement.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{achievement.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 11, color: achievement.color }}>{achievementText.title}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{achievementText.sub}</div>
            </div>
          </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export function QuickAccess() {
  const navigate = useNavigate()
  const { language, t } = useI18n()
  const quickAccess = navItems.filter((item) => item.route !== '/').slice(0, 6)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
        {quickAccess.map((item) => (
          <motion.div key={item.route} whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(var(--ng-rgb),0.15)' }} whileTap={{ scale: 0.97 }} onClick={() => navigate(item.route)} style={{ border: '1px solid rgba(var(--ng-rgb),0.18)', borderRadius: 10, padding: '10px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', background: 'var(--card2)', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 18, width: 36, height: 36, borderRadius: 8, background: 'rgba(var(--ng-rgb),0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>
              {item.labelKey === 'expenses'
                ? t('dashboardCards.expenseTracker')
                : item.labelKey === 'settings'
                  ? (language === 'th' ? 'ตั้งค่า' : 'Settings')
                  : t(`nav.${item.labelKey}`)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
