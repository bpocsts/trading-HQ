import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'
import { calcTradeStats, useDeposits, useExpenses, useTrades, useUserProfile } from '../../hooks/useFirestore'

const cards = [
  { key: 'accountBalance', icon: '💼', color: 'var(--ng)', shadowColor: 'rgba(var(--ng-rgb),0.4)' },
  { key: 'totalPL', icon: '📈', color: '#00cfff', shadowColor: 'rgba(0,207,255,0.4)' },
  { key: 'winRate', icon: '🎯', color: '#c084fc', shadowColor: 'rgba(192,132,252,0.4)' },
  { key: 'expenseBalance', icon: '💸', color: '#ffcc00', shadowColor: 'rgba(255,204,0,0.4)' },
]

const labels = {
  en: {
    accountBalance: 'Account Balance',
    totalPL: 'Total P/L',
    winRate: 'Win Rate',
    expenseBalance: 'Expenses Total Balance',
    tradeAccount: 'Trading account',
    cumulativeResult: 'Cumulative result',
    closedTradesOnly: 'Closed trades only',
    cashFlowBalance: 'Cash flow balance',
  },
  th: {
    accountBalance: 'ยอดเงินในบัญชี',
    totalPL: 'กำไร/ขาดทุนรวม',
    winRate: 'อัตราชนะ',
    expenseBalance: 'ยอดเงินคงเหลือรายจ่าย',
    tradeAccount: 'บัญชีเทรด',
    cumulativeResult: 'ผลรวมสะสม',
    closedTradesOnly: 'เฉพาะเทรดที่ปิดผลแล้ว',
    cashFlowBalance: 'ยอดคงเหลือกระแสเงินสด',
  },
}

function formatCurrency(value) {
  const amount = Number(value) || 0
  const sign = amount > 0 ? '+' : ''
  return `${sign}$${amount.toLocaleString()}`
}

export default function StatCards() {
  const { user } = useAuth()
  const { language } = useI18n()
  const { data: trades } = useTrades(user?.uid)
  const { data: deposits } = useDeposits(user?.uid)
  const { data: expenses } = useExpenses(user?.uid)
  const { profile: userDoc } = useUserProfile(user?.uid)
  const text = labels[language] || labels.en

  const stats = calcTradeStats(trades)
  const initialTradeBalance = Number(userDoc?.profile?.initialTradeBalance ?? 10000) || 0
  const accountBalance = initialTradeBalance + stats.totalPL
  const totalDeposited = deposits.reduce((sum, deposit) => sum + (Number(deposit.amount) || 0), 0)
  const totalSpent = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const expenseBalance = totalDeposited - totalSpent

  const values = {
    accountBalance: {
      value: formatCurrency(accountBalance),
      description: text.tradeAccount,
    },
    totalPL: {
      value: formatCurrency(stats.totalPL),
      description: text.cumulativeResult,
    },
    winRate: {
      value: `${stats.winRate}%`,
      description: text.closedTradesOnly,
    },
    expenseBalance: {
      value: formatCurrency(expenseBalance),
      description: text.cashFlowBalance,
    },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
      {cards.map((card, i) => {
        const item = values[card.key]
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -2, boxShadow: `0 6px 28px ${card.shadowColor}` }}
            className="glass-card"
            style={{ padding: '10px 13px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{card.icon}</span>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: card.color }}>
                {text[card.key]}
              </span>
            </div>

            <div
              style={{
                fontFamily: 'Rajdhani',
                fontSize: 28,
                fontWeight: 700,
                color: card.color,
                lineHeight: 1,
                textShadow: `0 0 10px ${card.shadowColor}`,
                marginBottom: 8,
              }}
            >
              {item.value}
            </div>

            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.9, delay: i * 0.08 + 0.2, ease: 'easeOut' }}
                style={{ height: '100%', background: card.color, borderRadius: 2, boxShadow: `0 0 6px ${card.color}` }}
              />
            </div>

            <div style={{ fontSize: 9, color: 'var(--text3)' }}>{item.description}</div>
          </motion.div>
        )
      })}
    </div>
  )
}
