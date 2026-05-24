import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n'
import { useAuth } from '../hooks/useAuth'
import {
  addDeposit,
  addExpense,
  deleteDeposit,
  deleteExpense,
  useDeposits,
  useExpenses,
} from '../hooks/useFirestore'
import { expenseCategories } from '../lib/appConstants'
import { getExpenseCategoryLabel } from '../lib/localization'

const formatMoney = (amount) => `฿${Number(amount || 0).toLocaleString()}`

export default function HabitPage() {
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: liveExpenses } = useExpenses(user?.uid)
  const { data: liveDeposits } = useDeposits(user?.uid)

  const expenses = liveExpenses
  const deposits = liveDeposits

  const [expenseSaving, setExpenseSaving] = useState(false)
  const [depositSaving, setDepositSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: expenseCategories[0].key,
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [depositForm, setDepositForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const categoryMap = useMemo(
    () => Object.fromEntries(expenseCategories.map((category) => [category.key, category])),
    []
  )

  const totalSpent = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const totalDeposited = deposits.reduce((sum, deposit) => sum + (Number(deposit.amount) || 0), 0)
  const currentBalance = totalDeposited - totalSpent

  const handleExpenseSubmit = async () => {
    if (!user) return
    if (!expenseForm.amount || !expenseForm.description.trim() || !expenseForm.date) return
    if ((Number(expenseForm.amount) || 0) <= 0) {
      toast.error(t('habitsPage.expenseAmountError'))
      return
    }

    setExpenseSaving(true)
    try {
      const ok = await addExpense(user.uid, {
        amount: expenseForm.amount,
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        date: expenseForm.date,
      })

      if (ok) {
        setExpenseForm({
          amount: '',
          category: expenseCategories[0].key,
          description: '',
          date: new Date().toISOString().split('T')[0],
        })
      }
    } finally {
      setExpenseSaving(false)
    }
  }

  const handleDepositSubmit = async () => {
    if (!user) return
    if (!depositForm.amount || !depositForm.description.trim() || !depositForm.date) return
    if ((Number(depositForm.amount) || 0) <= 0) {
      toast.error(t('habitsPage.depositAmountError'))
      return
    }

    setDepositSaving(true)
    try {
      const ok = await addDeposit(user.uid, {
        amount: depositForm.amount,
        description: depositForm.description.trim(),
        date: depositForm.date,
      })

      if (ok) {
        setDepositForm({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        })
      }
    } finally {
      setDepositSaving(false)
    }
  }

  const handleDeleteDeposit = async (deposit) => {
    if (!user || !deposit?.id) return
    setDeletingId(`deposit-${deposit.id}`)
    try {
      await deleteDeposit(user.uid, deposit.id)
    } finally {
      setDeletingId('')
    }
  }

  const handleDeleteExpense = async (expense) => {
    if (!user || !expense?.id) return
    setDeletingId(`expense-${expense.id}`)
    try {
      await deleteExpense(user.uid, expense.id)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>
          {t('habitsPage.title')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {t('habitsPage.subtitle')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <SummaryCard title={t('habitsPage.availableBalance')} value={formatMoney(currentBalance)} color="var(--ng)" />
        <SummaryCard title={t('habitsPage.totalDeposited')} value={formatMoney(totalDeposited)} color="#00cfff" />
        <SummaryCard title={t('habitsPage.totalSpent')} value={formatMoney(totalSpent)} color="#ffcc00" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, marginBottom: 14 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-wallet2"></i></span>{t('habitsPage.addDeposit')}</div>

          <FormFields
            amountLabel={t('habitsPage.amount')}
            dateLabel={t('habitsPage.date')}
            amountValue={depositForm.amount}
            dateValue={depositForm.date}
            onAmountChange={(value) => setDepositForm((current) => ({ ...current, amount: value }))}
            onDateChange={(value) => setDepositForm((current) => ({ ...current, date: value }))}
          />

          <TextAreaField
            label={t('habitsPage.detail')}
            placeholder={t('habitsPage.depositPlaceholder')}
            value={depositForm.description}
            onChange={(value) => setDepositForm((current) => ({ ...current, description: value }))}
          />

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={handleDepositSubmit} disabled={depositSaving}>
            {depositSaving ? t('habitsPage.saving') : t('habitsPage.saveDeposit')}
          </button>
        </div>

        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-cart-plus"></i></span>{t('habitsPage.addExpense')}</div>

          <FormFields
            amountLabel={t('habitsPage.amount')}
            dateLabel={t('habitsPage.date')}
            amountValue={expenseForm.amount}
            dateValue={expenseForm.date}
            onAmountChange={(value) => setExpenseForm((current) => ({ ...current, amount: value }))}
            onDateChange={(value) => setExpenseForm((current) => ({ ...current, date: value }))}
          />

          <div style={{ marginBottom: 12 }}>
            <FieldLabel>{t('habitsPage.category')}</FieldLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
              {expenseCategories.map((category) => {
                const active = expenseForm.category === category.key
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setExpenseForm((current) => ({ ...current, category: category.key }))}
                    style={{
                      padding: '9px 8px',
                      borderRadius: 8,
                      border: `1px solid ${active ? 'var(--border2)' : 'var(--border)'}`,
                      background: active ? 'rgba(var(--ng-rgb),0.1)' : 'rgba(255,255,255,0.02)',
                      color: active ? 'var(--ng)' : 'var(--text2)',
                      cursor: 'pointer',
                      fontSize: 11,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{category.icon}</span>
                    <span>{getExpenseCategoryLabel(category, language)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <TextAreaField
            label={t('habitsPage.detail')}
            placeholder={t('habitsPage.expensePlaceholder')}
            value={expenseForm.description}
            onChange={(value) => setExpenseForm((current) => ({ ...current, description: value }))}
          />

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={handleExpenseSubmit} disabled={expenseSaving}>
            {expenseSaving ? t('habitsPage.saving') : t('habitsPage.saveExpense')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <LedgerList
          title={t('habitsPage.recentDeposits')}
          emptyLabel={t('habitsPage.noDeposits')}
          items={deposits}
          deletingId={deletingId}
          formatMoney={formatMoney}
          deleteLabel={t('habitsPage.delete')}
          onDelete={handleDeleteDeposit}
          renderItem={(deposit) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {deposit.description}
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: '#00cfff' }}>
                + {formatMoney(deposit.amount)}
              </div>
            </div>
          )}
          idPrefix="deposit"
        />

        <LedgerList
          title={t('habitsPage.recentExpenses')}
          emptyLabel={t('habitsPage.noExpenses')}
          items={expenses}
          deletingId={deletingId}
          formatMoney={formatMoney}
          deleteLabel={t('habitsPage.delete')}
          onDelete={handleDeleteExpense}
          renderItem={(expense) => {
            const category = categoryMap[expense.category] || { icon: '🧾', label: expense.category }
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>{category.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                      {getExpenseCategoryLabel(category, language)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{expense.description}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: '#ffcc00' }}>
                  - {formatMoney(expense.amount)}
                </div>
              </div>
            )
          }}
          idPrefix="expense"
        />
      </div>
    </div>
  )
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="glass-card" style={{ padding: 14 }}>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>
      {children}
    </div>
  )
}

function FormFields({ amountLabel, dateLabel, amountValue, dateValue, onAmountChange, onDateChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
      <div>
        <FieldLabel>{amountLabel}</FieldLabel>
        <input className="input-dark" type="number" min="0.01" step="0.01" placeholder="0" value={amountValue} onChange={(event) => onAmountChange(event.target.value)} />
      </div>
      <div>
        <FieldLabel>{dateLabel}</FieldLabel>
        <input className="input-dark" type="date" value={dateValue} onChange={(event) => onDateChange(event.target.value)} />
      </div>
    </div>
  )
}

function TextAreaField({ label, placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea className="input-dark" rows={3} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} style={{ resize: 'vertical' }} />
    </div>
  )
}

function LedgerList({ title, emptyLabel, items, deletingId, deleteLabel, onDelete, renderItem, idPrefix }) {
  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <div className="card-title"><span><i className="bi bi-clock-history"></i></span>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!items.length && (
          <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{emptyLabel}</div>
        )}
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ paddingBottom: 10, borderBottom: '1px solid rgba(var(--ng-rgb),0.05)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {renderItem(item)}
              </div>
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={deletingId === `${idPrefix}-${item.id}`}
                className="btn-ghost"
                style={{ padding: '4px 8px', minWidth: 58 }}
              >
                {deletingId === `${idPrefix}-${item.id}` ? '...' : deleteLabel}
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>{item.date}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
