import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { addDeposit, addExpense, deleteDeposit, deleteExpense, useDeposits, useExpenses, useUserProfile } from '../hooks/useFirestore'
import { expenseCategories } from '../data/mockData'

const formatMoney = (amount) => `฿${Number(amount || 0).toLocaleString()}`

export default function HabitPage() {
  const { user } = useAuth()
  const { data: liveExpenses } = useExpenses(user?.uid)
  const { data: liveDeposits } = useDeposits(user?.uid)
  const { profile: liveProfile } = useUserProfile(user?.uid)

  const expenses = liveExpenses
  const deposits = liveDeposits
  const currentBalance = liveProfile?.profile?.balance ?? 0

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

  const handleExpenseSubmit = async () => {
    if (!user) return
    if (!expenseForm.amount || !expenseForm.description.trim() || !expenseForm.date) return

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
      await deleteDeposit(user.uid, deposit.id, deposit.amount)
    } finally {
      setDeletingId('')
    }
  }

  const handleDeleteExpense = async (expense) => {
    if (!user || !expense?.id) return

    setDeletingId(`expense-${expense.id}`)
    try {
      await deleteExpense(user.uid, expense.id, expense.amount)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>CASH FLOW TRACKER</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Deposit money in, then expenses subtract from your available balance automatically</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Available Balance</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: 'var(--ng)' }}>{formatMoney(currentBalance)}</div>
        </div>
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Total Deposited</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: '#00cfff' }}>{formatMoney(totalDeposited)}</div>
        </div>
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Total Spent</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color: '#ffcc00' }}>{formatMoney(totalSpent)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12, marginBottom: 14 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>💼</span>Add Deposit</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Amount</div>
              <input className="input-dark" type="number" min="0" placeholder="0" value={depositForm.amount} onChange={(e) => setDepositForm((current) => ({ ...current, amount: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Date</div>
              <input className="input-dark" type="date" value={depositForm.date} onChange={(e) => setDepositForm((current) => ({ ...current, date: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Detail</div>
            <textarea className="input-dark" rows={3} placeholder="เช่น เงินเดือน, เงินจากงานฟรีแลนซ์, ค่าคอมมิชชั่น" value={depositForm.description} onChange={(e) => setDepositForm((current) => ({ ...current, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={handleDepositSubmit} disabled={depositSaving}>
            {depositSaving ? 'Saving...' : '+ Add Deposit'}
          </button>
        </div>

        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>💸</span>Add Expense</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Amount</div>
              <input className="input-dark" type="number" min="0" placeholder="0" value={expenseForm.amount} onChange={(e) => setExpenseForm((current) => ({ ...current, amount: e.target.value }))} />
            </div>

            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Date</div>
              <input className="input-dark" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((current) => ({ ...current, date: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Category</div>
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
                      border: `1px solid ${active ? 'rgba(57,255,20,0.35)' : 'var(--border)'}`,
                      background: active ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.02)',
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
                    <span>{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>Detail</div>
            <textarea className="input-dark" rows={3} placeholder="เช่น ข้าวกลางวัน, ค่าน้ำมัน, ค่าเกม" value={expenseForm.description} onChange={(e) => setExpenseForm((current) => ({ ...current, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={handleExpenseSubmit} disabled={expenseSaving}>
            {expenseSaving ? 'Saving...' : '+ Add Expense'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>⬇️</span>Recent Deposits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!deposits.length && (
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>No deposits yet</div>
            )}
            {deposits.map((deposit, index) => (
              <motion.div key={deposit.id || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{deposit.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: '#00cfff' }}>+ {formatMoney(deposit.amount)}</div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDeposit(deposit)}
                      disabled={deletingId === `deposit-${deposit.id}`}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', minWidth: 58 }}
                    >
                      {deletingId === `deposit-${deposit.id}` ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{deposit.date}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>🧾</span>Recent Expenses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!expenses.length && (
              <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>No expenses yet</div>
            )}
            {expenses.map((expense, index) => {
              const category = categoryMap[expense.category] || { icon: '💸', label: expense.category }
              return (
                <motion.div key={expense.id || index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} style={{ paddingBottom: 10, borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 16 }}>{category.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{category.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{expense.description}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: '#ffcc00' }}>- {formatMoney(expense.amount)}</div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense)}
                        disabled={deletingId === `expense-${expense.id}`}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', minWidth: 58 }}
                      >
                        {deletingId === `expense-${expense.id}` ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{expense.date}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
