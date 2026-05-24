import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { addTrade, logMistake, savePsychEntry } from '../../hooks/useFirestore'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../i18n'
import useStore from '../../store/useStore'
import { mistakeTypes } from '../../lib/appConstants'
import { getDirectionLabel, getEmotionLabel, getMistakeLabel } from '../../lib/localization'

const PAIRS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'EURJPY', 'EURGBP']
const EMOTIONS = ['Calm', 'Confident', 'Neutral', 'Anxious', 'Excited', 'Fearful']
const SESSIONS = ['London', 'New York', 'Asia', 'Sydney', 'Overlap']
const RESULTS = ['Win', 'Loss', 'Pending', 'Breakeven']
const BIASES = ['Long', 'Short', 'Neutral', 'No Trade Day']
const SETUP_GRADES = ['A', 'B', 'C']

function getPairMultiplier(pair) {
  if (pair === 'XAUUSD') return 100
  if (pair.endsWith('JPY')) return 1000
  return 100000
}

function calculateAutoPL(form) {
  const entry = Number(form.entry)
  const stopLoss = Number(form.sl)
  const takeProfit = Number(form.tp)
  const lotSize = Number(form.lotSize) || 0

  if (!entry || !lotSize || form.result === 'Pending') return ''
  if (form.result === 'Breakeven') return '0.00'

  const exitPrice = form.result === 'Win' ? takeProfit : stopLoss
  if (!exitPrice) return ''

  const rawMove = form.direction === 'Long' ? exitPrice - entry : entry - exitPrice
  const multiplier = getPairMultiplier(form.pair)
  const pl = rawMove * multiplier * lotSize

  return Number.isFinite(pl) ? pl.toFixed(2) : ''
}

function getTradeLevelErrorKey(form) {
  const entry = Number(form.entry)
  const stopLoss = Number(form.sl)
  const takeProfit = Number(form.tp)

  if (!entry || !stopLoss || !takeProfit) return ''

  if (form.direction === 'Long') {
    if (stopLoss >= entry) return 'tradeModal.longSlError'
    if (takeProfit <= entry) return 'tradeModal.longTpError'
  }

  if (form.direction === 'Short') {
    if (stopLoss <= entry) return 'tradeModal.shortSlError'
    if (takeProfit >= entry) return 'tradeModal.shortTpError'
  }

  return ''
}

function buildDefaultDailyStats(language) {
  return {
    hp: { score: 7, max: 10, label: language === 'th' ? 'พลังงาน' : 'Energy' },
    mood: { score: 7, max: 10, label: language === 'th' ? 'อารมณ์รวม' : 'Overall Mood' },
    focus: { score: 7, max: 10, label: language === 'th' ? 'สมาธิเทรด' : 'Trading Focus' },
    motivation: { score: 7, max: 10, label: language === 'th' ? 'แรงจูงใจ' : 'Drive' },
  }
}

function createInitialForm(language) {
  return {
    date: new Date().toISOString().split('T')[0],
    pair: 'XAUUSD',
    direction: 'Long',
    entry: '',
    sl: '',
    tp: '',
    lotSize: '0.01',
    emotion: 'Calm',
    session: 'London',
    notes: '',
    result: 'Pending',
    pl: '',
    setupGrade: 'B',
    stressLevel: 5,
    bias: 'Neutral',
    dailyStats: buildDefaultDailyStats(language),
    selectedMistakes: [],
    mistakeNote: '',
  }
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function SliderField({ label, value, onChange, color = 'var(--ng)' }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5 }}>{label}</span>
        <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color }}>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 4 }} />
    </div>
  )
}

export default function AddTradeModal() {
  const { showTradeModal, setShowTradeModal } = useStore()
  const { user } = useAuth()
  const { language, t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(() => createInitialForm(language))

  const calcRR = () => {
    const entry = parseFloat(form.entry)
    const stopLoss = parseFloat(form.sl)
    const takeProfit = parseFloat(form.tp)

    if (!entry || !stopLoss || !takeProfit) return null

    const risk = Math.abs(entry - stopLoss)
    const reward = Math.abs(takeProfit - entry)
    if (!risk) return null

    return (reward / risk).toFixed(2)
  }

  const rr = calcRR()
  const rrStr = rr ? `1 : ${rr}` : 'N/A'
  const autoPL = useMemo(() => calculateAutoPL(form), [form])
  const tradeLevelErrorKey = useMemo(() => getTradeLevelErrorKey(form), [form])

  const toggleMistake = (mistakeLabel) => {
    setForm((current) => ({
      ...current,
      selectedMistakes: current.selectedMistakes.includes(mistakeLabel)
        ? current.selectedMistakes.filter((item) => item !== mistakeLabel)
        : [...current.selectedMistakes, mistakeLabel],
    }))
  }

  const closeAndReset = () => {
    setShowTradeModal(false)
    setForm(createInitialForm(language))
  }

  const handleSubmit = async () => {
    if (!form.entry || !form.sl || !form.tp || !user) return
    if (tradeLevelErrorKey) {
      toast.error(t(tradeLevelErrorKey))
      return
    }

    setLoading(true)

    try {
      const tradeDate = form.date || new Date().toISOString().split('T')[0]
      const tradeData = {
        pair: form.pair,
        direction: form.direction,
        entry: parseFloat(form.entry),
        sl: parseFloat(form.sl),
        tp: parseFloat(form.tp),
        lotSize: parseFloat(form.lotSize) || 0.01,
        emotion: form.emotion,
        session: form.session,
        notes: form.notes,
        result: form.result,
        pl: parseFloat(autoPL) || 0,
        rr: rrStr,
        date: tradeDate,
        setupGrade: form.setupGrade,
      }

      const tradeId = await addTrade(user.uid, tradeData)
      if (!tradeId) return

      await savePsychEntry(user.uid, {
        date: tradeDate,
        emotionBefore: form.emotion,
        emotionAfter: form.result === 'Win' ? 'Confident' : form.result === 'Loss' ? 'Anxious' : form.emotion,
        stressLevel: form.stressLevel,
        bias: form.bias,
        tradingDecisions: form.notes,
        notes: `${form.pair} ${form.direction} ${form.result}`.trim(),
        tradeId,
        dailyStats: form.dailyStats,
      })

      if (form.selectedMistakes.length > 0) {
        for (const mistakeType of form.selectedMistakes) {
          await logMistake(user.uid, {
            type: mistakeType,
            description: form.mistakeNote || form.notes || '',
            tradeId,
            date: tradeDate,
            pair: form.pair,
          })
        }
      }

      closeAndReset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {showTradeModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => event.target === event.currentTarget && closeAndReset()}
        >
          <motion.div className="modal-box" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto' }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>
                <i className="bi bi-bar-chart-fill" style={{ marginRight: 8 }}></i>{t('tradeModal.title')}
              </div>
              <button onClick={closeAndReset} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 0, lineHeight: 1 }}>
                <span style={{ fontSize: 18 }}>&times;</span>
                ร—
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={language === 'th' ? 'วันที่' : 'Date'}>
                <input className="input-dark" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </Field>
              <div />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={t('tradeModal.pair')}>
                <select className="input-dark" value={form.pair} onChange={(event) => setForm((current) => ({ ...current, pair: event.target.value }))}>
                  {PAIRS.map((pair) => <option key={pair}>{pair}</option>)}
                </select>
              </Field>
              <Field label={t('tradeModal.direction')}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Long', 'Short'].map((direction) => (
                    <button
                      type="button"
                      key={direction}
                      onClick={() => setForm((current) => ({ ...current, direction }))}
                      style={{
                        flex: 1,
                        padding: '7px',
                        border: `1px solid ${form.direction === direction ? (direction === 'Long' ? 'rgba(57,255,20,0.5)' : 'rgba(255,68,68,0.5)') : 'var(--border)'}`,
                        borderRadius: 7,
                        background: form.direction === direction ? (direction === 'Long' ? 'rgba(57,255,20,0.12)' : 'rgba(255,68,68,0.12)') : 'transparent',
                        color: form.direction === direction ? (direction === 'Long' ? '#39ff14' : 'var(--red)') : 'var(--text3)',
                        cursor: 'pointer',
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {direction === 'Long' ? `▲ ${t('tradeModal.long')}` : `▼ ${t('tradeModal.short')}`}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                [t('tradeModal.entryPrice'), 'entry'],
                [t('tradeModal.stopLoss'), 'sl'],
                [t('tradeModal.takeProfit'), 'tp'],
              ].map(([label, key]) => (
                <Field key={key} label={label}>
                  <input
                    className="input-dark"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form[key]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </Field>
              ))}
            </div>

            {tradeLevelErrorKey && (
              <div style={{ marginTop: -2, marginBottom: 10, fontSize: 10, color: 'var(--red)' }}>
                {t(tradeLevelErrorKey)}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <Field label={t('tradeModal.lotSize')}>
                <input className="input-dark" type="number" step="0.01" value={form.lotSize} onChange={(event) => setForm((current) => ({ ...current, lotSize: event.target.value }))} />
              </Field>
              <Field label={t('tradeModal.session')}>
                <select className="input-dark" value={form.session} onChange={(event) => setForm((current) => ({ ...current, session: event.target.value }))}>
                  {SESSIONS.map((session) => <option key={session}>{session}</option>)}
                </select>
              </Field>
              <Field label={t('tradeModal.result')}>
                <select className="input-dark" value={form.result} onChange={(event) => setForm((current) => ({ ...current, result: event.target.value }))}>
                  {RESULTS.map((result) => <option key={result} value={result}>{t(`tradeModal.${result.toLowerCase()}`)}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ background: 'rgba(0,207,255,0.03)', border: '1px solid rgba(0,207,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: '#00cfff', letterSpacing: 1.2, marginBottom: 10 }}>
                {language === 'th' ? 'คุณภาพของเซ็ตอัป' : 'Setup Quality'}
              </div>

              <Field label={language === 'th' ? 'เกรดเซ็ตอัป' : 'Setup Grade'}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {SETUP_GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, setupGrade: grade }))}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: `1px solid ${form.setupGrade === grade ? 'rgba(0,207,255,0.55)' : 'var(--border)'}`,
                        borderRadius: 10,
                        background: form.setupGrade === grade ? 'rgba(0,207,255,0.12)' : 'transparent',
                        color: form.setupGrade === grade ? '#00cfff' : 'var(--text3)',
                        cursor: 'pointer',
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: 1,
                        boxShadow: form.setupGrade === grade ? '0 0 0 1px rgba(0,207,255,0.12) inset' : 'none',
                      }}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 12, background: 'rgba(var(--ng-rgb),0.04)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5 }}>{t('tradeModal.riskReward')}</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 20, fontWeight: 700, color: tradeLevelErrorKey ? 'var(--red)' : rr && parseFloat(rr) >= 1.5 ? 'var(--ng)' : rr ? 'var(--yellow)' : 'var(--text3)' }}>
                  {tradeLevelErrorKey ? t('tradeModal.invalid') : rrStr}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Field label={t('tradeModal.profitLoss')}>
                  <input className="input-dark" type="text" placeholder={form.result === 'Pending' ? t('tradeModal.pendingPlaceholder') : t('tradeModal.autoPlaceholder')} value={autoPL} readOnly />
                </Field>
              </div>
            </div>

            <Field label={t('tradeModal.emotion')}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EMOTIONS.map((emotion) => (
                  <button
                    type="button"
                    key={emotion}
                    onClick={() => setForm((current) => ({ ...current, emotion }))}
                    style={{
                      padding: '4px 10px',
                      border: `1px solid ${form.emotion === emotion ? 'var(--border2)' : 'var(--border)'}`,
                      borderRadius: 5,
                      background: form.emotion === emotion ? 'rgba(var(--ng-rgb),0.1)' : 'transparent',
                      color: form.emotion === emotion ? 'var(--ng)' : 'var(--text3)',
                      cursor: 'pointer',
                      fontFamily: 'Exo 2',
                      fontSize: 10,
                    }}
                  >
                    {getEmotionLabel(emotion, language)}
                  </button>
                ))}
              </div>
            </Field>

            {/*
            <div style={{ background: 'rgba(var(--ng-rgb),0.03)', border: '1px solid rgba(var(--ng-rgb),0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1.2, marginBottom: 10 }}>
                {language === 'th' ? 'เช็กสภาพจิตใจพร้อมบันทึกเทรด' : 'Psychology Check-In'}
              </div>

              <SliderField
                label={language === 'th' ? 'ระดับความเครียด' : 'Stress Level'}
                value={form.stressLevel}
                onChange={(value) => setForm((current) => ({ ...current, stressLevel: value }))}
                color={form.stressLevel > 7 ? 'var(--red)' : form.stressLevel > 4 ? 'var(--yellow)' : 'var(--ng)'}
              />

              <Field label={language === 'th' ? 'มุมมองตลาด' : 'Market Bias'}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {BIASES.map((bias) => (
                    <button
                      key={bias}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, bias }))}
                      style={{
                        padding: '6px 10px',
                        border: `1px solid ${form.bias === bias ? 'var(--border2)' : 'var(--border)'}`,
                        borderRadius: 6,
                        background: form.bias === bias ? 'rgba(var(--ng-rgb),0.1)' : 'transparent',
                        color: form.bias === bias ? 'var(--ng)' : 'var(--text3)',
                        cursor: 'pointer',
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {bias}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['hp', language === 'th' ? 'HP / พลังงาน' : 'HP / Energy', 'var(--ng)'],
                  ['mood', language === 'th' ? 'Mood / อารมณ์' : 'Mood / Overall Mood', '#c084fc'],
                  ['focus', language === 'th' ? 'Focus / สมาธิ' : 'Focus / Trading Focus', '#00cfff'],
                  ['motivation', language === 'th' ? 'Motivation / แรงจูงใจ' : 'Motivation / Drive', '#ffcc00'],
                ].map(([key, label, color]) => (
                  <SliderField
                    key={key}
                    label={label}
                    value={form.dailyStats[key].score}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        dailyStats: {
                          ...current.dailyStats,
                          [key]: {
                            ...current.dailyStats[key],
                            score: value,
                          },
                        },
                      }))
                    }
                    color={color}
                  />
                ))}
              </div>
            </div>

            */}
            <div style={{ background: 'rgba(255,170,0,0.03)', border: '1px solid rgba(255,170,0,0.08)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 700, color: '#ffcc00', letterSpacing: 1.2, marginBottom: 10 }}>
                {language === 'th' ? 'บันทึกข้อผิดพลาดในดีลนี้' : 'Mistake Tracker'}
              </div>

              <Field label={language === 'th' ? 'เลือกข้อผิดพลาดที่เกิดขึ้น' : 'Select Mistakes'}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {mistakeTypes.slice(0, 6).map((mistake) => {
                    const active = form.selectedMistakes.includes(mistake.label)
                    return (
                      <button
                        key={mistake.label}
                        type="button"
                        onClick={() => toggleMistake(mistake.label)}
                        style={{
                          padding: '7px 10px',
                          border: `1px solid ${active ? `${mistake.color}66` : 'var(--border)'}`,
                          borderRadius: 7,
                          background: active ? `${mistake.color}12` : 'transparent',
                          color: active ? mistake.color : 'var(--text3)',
                          cursor: 'pointer',
                          fontFamily: 'Exo 2',
                          fontSize: 10,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{mistake.icon}</span>{getMistakeLabel(mistake.label, language)}
                      </button>
                    )
                  })}
                </div>
              </Field>

              <Field label={language === 'th' ? 'สาเหตุ / รายละเอียดข้อผิดพลาด' : 'Mistake Notes'}>
                <textarea
                  className="input-dark"
                  rows={2}
                  placeholder={language === 'th' ? 'ดีลนี้พลาดตรงไหน เพราะอะไร...' : 'What went wrong in this trade?...'}
                  value={form.mistakeNote}
                  onChange={(event) => setForm((current) => ({ ...current, mistakeNote: event.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </Field>
            </div>

            {/*
            <Field label={t('tradeModal.screenshot')}>
              <label style={{ display: 'block', padding: '7px 12px', border: '1px dashed var(--border)', borderRadius: 7, cursor: 'pointer', fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
                {uploading
                  ? `📤 ${t('tradeModal.uploadProgress').replace('{progress}', uploadProgress)}`
                  : screenshotFile
                    ? `📎 ${t('tradeModal.screenshotAttached').replace('{name}', screenshotFile.name)}`
                    : `📎 ${t('tradeModal.screenshotPrompt')}`}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => setScreenshotFile(event.target.files?.[0] || null)} />
              </label>
              {uploading && (
                <div style={{ marginTop: 6 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}
            </Field>
            */}

            <Field label={t('tradeModal.notes')}>
              <textarea className="input-dark" rows={2} placeholder={t('tradeModal.notesPlaceholder')} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} style={{ resize: 'vertical' }} />
            </Field>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={closeAndReset}>
                {t('tradeModal.cancel')}
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading || !form.entry}>
                {loading ? t('tradeModal.saving') : t('tradeModal.save')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
