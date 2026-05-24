import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { saveRoutineEntry, useRoutines } from '../hooks/useFirestore'
import { useI18n } from '../i18n'

const ROUTINE_SECTIONS = [
  {
    key: 'morning',
    icon: 'Morning Routine',
    title: { en: 'Morning Routine', th: 'ลูทีนตอนเช้า' },
    subtitle: { en: 'Wake up clean, calm, and prepared.', th: 'เริ่มวันให้พร้อมก่อนแตะกราฟ' },
    items: [
      { id: 'wake_on_time', en: 'Wake up on time', th: 'ตื่นนอนตรงเวลา' },
      { id: 'water_clean_up', en: 'Drink water and clean up', th: 'ดื่มน้ำ / ล้างหน้า / อาบน้ำ' },
      { id: 'light_movement', en: 'Stretch or move for 5-15 minutes', th: 'ยืดตัวหรือขยับร่างกาย 5-15 นาที' },
      { id: 'no_chart_first', en: 'Do not open charts immediately after waking', th: 'ไม่เปิดกราฟทันทีหลังตื่น' },
      { id: 'mindset_check', en: 'Check your emotional state', th: 'เช็กอารมณ์ตัวเองก่อนเริ่มวัน' },
    ],
  },
  {
    key: 'pre_trade',
    icon: 'Pre-Trade Routine',
    title: { en: 'Pre-Trade Routine', th: 'ก่อนเข้าเทรด' },
    subtitle: { en: 'Only trade when the plan is clear.', th: 'เข้าเทรดเมื่อแผนชัดเท่านั้น' },
    items: [
      { id: 'session_check', en: 'Confirm you are in your best session', th: 'เช็กว่าอยู่ใน session ที่ถนัดไหม' },
      { id: 'review_plan', en: 'Review your trading plan', th: 'อ่านแผนเทรดของตัวเอง' },
      { id: 'check_news', en: 'Check important news events', th: 'เช็กข่าวสำคัญวันนี้' },
      { id: 'focus_pair', en: 'Choose your focus pair', th: 'กำหนดคู่เงินที่โฟกัส' },
      { id: 'daily_loss_limit', en: 'Set max loss for the day', th: 'กำหนด Max Loss ต่อวัน' },
      { id: 'max_trades', en: 'Set max trades for the day', th: 'กำหนดจำนวนเทรดสูงสุดต่อวัน' },
      { id: 'bias_and_levels', en: 'Mark trend, structure, key levels, and set bias', th: 'เช็ก Trend / Structure / Key Level และกำหนด Bias' },
      { id: 'setup_grade', en: 'Grade the setup before entry', th: 'ให้เกรด Setup ก่อนเข้าเทรด' },
      { id: 'rr_check', en: 'Plan Entry, SL, TP, and RR first', th: 'วาง Entry, SL, TP และ RR ก่อนเข้า' },
    ],
  },
  {
    key: 'during_trade',
    icon: 'During Trade',
    title: { en: 'During Trade', th: 'ระหว่างถือออเดอร์' },
    subtitle: { en: 'Protect the plan from emotion.', th: 'ปกป้องแผนจากอารมณ์' },
    items: [
      { id: 'no_random_sl', en: 'Do not move SL randomly', th: 'ไม่เลื่อน SL มั่ว' },
      { id: 'no_early_close', en: 'Do not close early without a valid reason', th: 'ไม่ปิดก่อนแผนโดยไม่มีเหตุผล' },
      { id: 'no_emotion_stack', en: 'Do not stack trades from emotion', th: 'ไม่เปิดเทรดซ้อนเพราะอารมณ์' },
      { id: 'no_revenge', en: 'No revenge trading after a loss', th: 'ไม่แก้แค้นตลาดหลังแพ้' },
      { id: 'let_plan_work', en: 'Let the plan work', th: 'ปล่อยให้แผนทำงาน' },
    ],
  },
  {
    key: 'post_trade',
    icon: 'Post-Trade Routine',
    title: { en: 'Post-Trade Routine', th: 'หลังจบเทรด (ต่อออเดอร์)' },
    subtitle: { en: 'Log every trade right after closing.', th: 'บันทึกทันทีหลังปิดออเดอร์' },
    items: [
      { id: 'log_result', en: 'Log the result immediately', th: 'บันทึกผลลัพธ์ทันที' },
      { id: 'log_pl', en: 'Record P/L', th: 'บันทึก P/L' },
      { id: 'emotion_after', en: 'Record emotion after trading', th: 'บันทึกอารมณ์หลังเทรด' },
      { id: 'mistake_if_any', en: 'Log mistakes if any', th: 'บันทึก Mistake ถ้ามี' },
    ],
  },
  {
    key: 'night',
    icon: 'Night Review',
    title: { en: 'Night Review', th: 'ทบทวนก่อนนอน' },
    subtitle: { en: 'Close the day like a professional.', th: 'ปิดวันให้เป็นมืออาชีพ' },
    items: [
      { id: 'daily_summary', en: 'Summarize trades and P/L today', th: 'สรุปจำนวนเทรดและกำไร/ขาดทุนวันนี้' },
      { id: 'best_worst', en: 'Review best and worst trade', th: 'ดูเทรดที่ดีที่สุดและแย่ที่สุด' },
      { id: 'rule_break', en: 'Check whether any rule was broken', th: 'เช็กว่าผิดกฎข้อไหนไหม' },
      { id: 'followed_plan', en: 'Did you follow the plan overall today?', th: 'โดยรวมวันนี้ทำตามแผนไหม' },
      { id: 'write_good', en: 'Write what you did well today', th: 'เขียนสิ่งที่ทำดีในวันนี้' },
      { id: 'write_fix', en: 'Write what needs improvement tomorrow', th: 'เขียนสิ่งที่ต้องแก้ในวันพรุ่งนี้' },
      { id: 'lessons', en: 'Write 1-3 lessons from today', th: 'เขียนบทเรียนของวันนี้ 1-3 ข้อ' },
      { id: 'tomorrow_plan', en: 'Prepare tomorrow plan', th: 'เตรียมแผนคร่าว ๆ สำหรับวันพรุ่งนี้' },
      { id: 'screen_off', en: 'Close charts and stop watching the market', th: 'ปิดกราฟ / ไม่ไล่ดูตลาดก่อนนอน' },
      { id: 'sleep_ready', en: 'Sleep on time', th: 'นอนให้ตรงเวลา' },
    ],
  },
]

const copy = {
  en: {
    title: 'Routine Checklist',
    subtitle: 'Build discipline from wake-up to sleep.',
    date: 'Date',
    progress: 'Daily Progress',
    completed: 'completed',
    notes: 'Daily Notes',
    notesPlaceholder: 'What helped or blocked your discipline today?...',
    saveNotes: 'Save Notes',
    saving: 'Saving...',
    saved: 'Saved ✓',
    history: 'Recent History',
    empty: 'No routine entries yet',
    allDone: 'All done today!',
  },
  th: {
    title: 'ลูทีนเช็กลิสต์',
    subtitle: 'สร้างวินัยตั้งแต่ตื่นนอนจนถึงเข้านอน',
    date: 'วันที่',
    progress: 'ความคืบหน้าวันนี้',
    completed: 'ทำแล้ว',
    notes: 'บันทึกประจำวัน',
    notesPlaceholder: 'วันนี้อะไรช่วยหรือขัดขวางวินัยของคุณ?...',
    saveNotes: 'บันทึกโน้ต',
    saving: 'กำลังบันทึก...',
    saved: 'บันทึกแล้ว ✓',
    history: 'ประวัติล่าสุด',
    empty: 'ยังไม่มีบันทึกลูทีน',
    allDone: 'ครบทุกข้อวันนี้!',
  },
}

const getTodayKey = () => new Date().toISOString().split('T')[0]
const allRoutineIds = ROUTINE_SECTIONS.flatMap((s) => s.items.map((i) => i.id))

// Color thresholds helper
const progressColor = (pct) =>
  pct >= 80 ? 'var(--ng)' : pct >= 45 ? '#ffcc00' : '#ff6b35'

// Mini section progress bar
function SectionBar({ pct }) {
  return (
    <div style={{ height: 3, borderRadius: 999, background: 'rgba(var(--ng-rgb),0.10)', overflow: 'hidden', marginTop: 8 }}>
      <motion.div
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          height: '100%',
          borderRadius: 999,
          background: pct === 100 ? 'var(--ng)' : 'rgba(var(--ng-rgb),0.5)',
        }}
      />
    </div>
  )
}

// Animated checkbox
function CheckBox({ checked }) {
  return (
    <motion.span
      animate={{
        background: checked ? 'var(--ng)' : 'rgba(255,255,255,0.02)',
        borderColor: checked ? 'var(--ng)' : 'var(--border2)',
        scale: checked ? [1, 1.18, 1] : 1,
      }}
      transition={{ duration: 0.18 }}
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: '1px solid var(--border2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.15 }}
            style={{ color: '#001000', fontWeight: 900, fontSize: 11, lineHeight: 1 }}
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  )
}

// History mini bar
function HistoryBar({ pct }) {
  return (
    <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(var(--ng-rgb),0.08)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 999,
          background: pct >= 80 ? 'var(--ng)' : 'rgba(var(--ng-rgb),0.35)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

export default function RoutinePage() {
  const { user } = useAuth()
  const { language } = useI18n()
  const locale = language === 'th' ? 'th' : 'en'
  const text = copy[locale]
  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const { data: routines, loading } = useRoutines(user?.uid)
  const selectedEntry = useMemo(
    () => routines.find((entry) => entry.date === selectedDate),
    [routines, selectedDate]
  )
  const [completed, setCompleted] = useState([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setCompleted(Array.isArray(selectedEntry?.completed) ? selectedEntry.completed : [])
    setNotes(selectedEntry?.notes || '')
  }, [selectedEntry, selectedDate])

  const completedSet = useMemo(() => new Set(completed), [completed])
  const completedCount = completed.length
  const totalCount = allRoutineIds.length
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
  const isAllDone = completedCount === totalCount

  const saveEntry = async (nextCompleted, nextNotes = notes) => {
    if (!user) return false
    const nextProgress = totalCount ? Math.round((nextCompleted.length / totalCount) * 100) : 0
    setSaving(true)
    try {
      return await saveRoutineEntry(user.uid, {
        date: selectedDate,
        completed: nextCompleted,
        notes: nextNotes,
        progress: nextProgress,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (itemId) => {
    const nextCompleted = completedSet.has(itemId)
      ? completed.filter((id) => id !== itemId)
      : [...completed, itemId]
    setCompleted(nextCompleted)
    await saveEntry(nextCompleted)
  }

  const handleSaveNotes = async () => {
    await saveEntry(completed, notes.trim())
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 14px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 800, color: 'var(--ng)', letterSpacing: 2 }}>
            🔁 {text.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{text.subtitle}</div>
        </div>
        <div style={{ minWidth: 190 }}>
          <FieldLabel>{text.date}</FieldLabel>
          <input
            className="input-dark"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Overall progress card */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <div className="card-title" style={{ marginBottom: 2 }}>
              <span>✅</span>{text.progress}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {completedCount} / {totalCount} {text.completed}
              {isAllDone && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ marginLeft: 8, color: 'var(--ng)', fontWeight: 700 }}
                >
                  — {text.allDone}
                </motion.span>
              )}
            </div>
          </div>
          <motion.div
            key={progress}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: 'Rajdhani', fontSize: 34, fontWeight: 800, color: progressColor(progress) }}
          >
            {progress}%
          </motion.div>
        </div>

        {/* Progress bar with milestone dots */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(var(--ng-rgb),0.08)', overflow: 'hidden' }}>
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
              style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,var(--ng),#00cfff)' }}
            />
          </div>
          {/* Milestone markers */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, pointerEvents: 'none' }}>
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                style={{
                  position: 'absolute',
                  left: `${milestone}%`,
                  top: 0,
                  width: 1,
                  height: '100%',
                  background: progress >= milestone ? 'rgba(0,16,0,0.25)' : 'rgba(var(--ng-rgb),0.15)',
                  transform: 'translateX(-50%)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Section mini-bars overview */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {ROUTINE_SECTIONS.map((section) => {
            const sc = section.items.filter((i) => completedSet.has(i.id)).length
            const sp = Math.round((sc / section.items.length) * 100)
            return (
              <div key={section.key} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: sp === 100 ? 'var(--ng)' : 'var(--text3)', marginBottom: 3, fontFamily: 'Rajdhani', letterSpacing: 0.5 }}>
                  {section.icon}
                </div>
                <div style={{ height: 3, borderRadius: 999, background: 'rgba(var(--ng-rgb),0.10)', overflow: 'hidden' }}>
                  <motion.div
                    initial={false}
                    animate={{ width: `${sp}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', borderRadius: 999, background: sp === 100 ? 'var(--ng)' : 'rgba(var(--ng-rgb),0.45)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(300px, 0.7fr)', gap: 14, alignItems: 'start' }}>

        {/* Sections grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {ROUTINE_SECTIONS.map((section, sectionIndex) => {
            const sectionCompleted = section.items.filter((i) => completedSet.has(i.id)).length
            const sectionProgress = Math.round((sectionCompleted / section.items.length) * 100)
            const isDone = sectionProgress === 100

            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.05 }}
                className="glass-card"
                style={{
                  padding: 16,
                  outline: isDone ? '1px solid rgba(var(--ng-rgb),0.3)' : 'none',
                  transition: 'outline 0.3s',
                }}
              >
                {/* Section header */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div className="card-title" style={{ marginBottom: 2 }}>
                      <span>{section.icon}</span>{section.title[locale]}
                    </div>
                    <div style={{
                      fontFamily: 'Rajdhani',
                      fontSize: 15,
                      fontWeight: 800,
                      color: isDone ? 'var(--ng)' : 'var(--text2)',
                      whiteSpace: 'nowrap',
                      marginTop: 1,
                    }}>
                      {sectionCompleted}/{section.items.length}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{section.subtitle[locale]}</div>
                  <SectionBar pct={sectionProgress} />
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 10 }}>
                  {section.items.map((item) => {
                    const checked = completedSet.has(item.id)
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggle(item.id)}
                        whileHover={{ backgroundColor: checked ? 'rgba(var(--ng-rgb),0.12)' : 'rgba(var(--ng-rgb),0.04)' }}
                        whileTap={{ scale: 0.985 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          width: '100%',
                          border: 'none',
                          background: checked ? 'rgba(var(--ng-rgb),0.08)' : 'transparent',
                          color: checked ? 'var(--text)' : 'var(--text2)',
                          cursor: 'pointer',
                          padding: '7px 8px',
                          borderRadius: 7,
                          textAlign: 'left',
                          fontFamily: 'Exo 2',
                          fontSize: 12,
                          transition: 'color 0.15s',
                        }}
                      >
                        <CheckBox checked={checked} />
                        <span style={{
                          flex: 1,
                          textDecoration: checked ? 'line-through' : 'none',
                          opacity: checked ? 0.55 : 1,
                          transition: 'opacity 0.2s, text-decoration 0.2s',
                        }}>
                          {item[locale]}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Notes */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 10 }}><span>🧾</span>{text.notes}</div>
            <textarea
              className="input-dark"
              rows={6}
              placeholder={text.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical', marginBottom: 10 }}
            />
            <motion.button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSaveNotes}
              disabled={saving}
              whileTap={{ scale: 0.97 }}
              animate={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? text.saving : savedFlash ? text.saved : text.saveNotes}
            </motion.button>
          </div>

          {/* History */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div className="card-title" style={{ marginBottom: 10 }}><span>🕒</span>{text.history}</div>
            {loading && (
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{language === 'th' ? 'กำลังโหลด...' : 'Loading...'}</div>
            )}
            {!loading && !routines.length && (
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{text.empty}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {routines.slice(0, 7).map((entry) => {
                const count = Array.isArray(entry.completed) ? entry.completed.length : 0
                const entryProgress = Math.round((count / totalCount) * 100)
                const isSelected = entry.date === selectedDate
                return (
                  <motion.button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedDate(entry.date)}
                    whileHover={{ backgroundColor: 'rgba(var(--ng-rgb),0.06)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 8px',
                      border: isSelected ? '1px solid rgba(var(--ng-rgb),0.3)' : '1px solid transparent',
                      borderRadius: 8,
                      background: isSelected ? 'rgba(var(--ng-rgb),0.06)' : 'transparent',
                      color: 'var(--text2)',
                      cursor: 'pointer',
                      fontFamily: 'Exo 2',
                      transition: 'border 0.2s, background 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 11, minWidth: 76, color: isSelected ? 'var(--text)' : 'var(--text2)' }}>
                      {entry.date}
                    </span>
                    <HistoryBar pct={entryProgress} />
                    <span style={{
                      fontFamily: 'Rajdhani',
                      fontSize: 13,
                      fontWeight: 800,
                      minWidth: 34,
                      textAlign: 'right',
                      color: entryProgress >= 80 ? 'var(--ng)' : 'var(--text3)',
                    }}>
                      {entryProgress}%
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{
      fontSize: 9,
      color: 'var(--text3)',
      textTransform: 'uppercase',
      fontFamily: 'Rajdhani',
      letterSpacing: 1.5,
      marginBottom: 5,
    }}>
      {children}
    </div>
  )
}
