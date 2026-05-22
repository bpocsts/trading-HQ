// src/pages/PsychologyPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { usePsychology, savePsychEntry } from '../hooks/useFirestore'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { emotionData } from '../data/mockData'
import { useI18n } from '../i18n'

const EMOTIONS = ['😌 Calm','😤 Anxious','💪 Confident','😐 Neutral','😡 Angry','😨 Fearful','🤩 Euphoric']
const BIASES = ['Long','Short','Neutral','No Trade Day']

export default function PsychologyPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { data: entries } = usePsychology(user?.uid)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    emotionBefore: 'Calm',
    emotionAfter: 'Neutral',
    stressLevel: 5,
    bias: 'Neutral',
    notes: '',
    tradingDecisions: '',
  })

  const handleSave = async () => {
    setSaving(true)
    await savePsychEntry(user.uid, form)
    setSaving(false)
    setForm(f => ({ ...f, notes: '', tradingDecisions: '' }))
  }

  const donutOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 200, margin: [0,0,0,0] },
    title: { text: '' }, credits: { enabled: false }, exporting: { enabled: false },
    tooltip: { backgroundColor: 'rgba(7,15,7,0.92)', borderColor: 'rgba(57,255,20,0.3)', style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' } },
    plotOptions: { pie: { innerSize: '62%', dataLabels: { enabled: false }, borderColor: '#0b160b', borderWidth: 3 } },
    series: [{ name: 'Emotions', data: emotionData.labelKeys.map((labelKey, i) => ({ name: t(`emotions.${labelKey}`), y: emotionData.values[i], color: emotionData.colors[i] })) }],
  }

  const SliderField = ({ label, value, onChange, color = 'var(--ng)' }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5 }}>{label}</span>
        <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14, color }}>{value}/10</span>
      </div>
      <input type="range" min="1" max="10" value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 4 }} />
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>PSYCHOLOGY TRACKER</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Your mindset is your edge</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Daily check-in */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span>🧠</span>Daily Mental Check-In</div>

          <SliderField label="Stress Level" value={form.stressLevel} onChange={v => setForm(f => ({ ...f, stressLevel: v }))}
            color={form.stressLevel > 7 ? 'var(--red)' : form.stressLevel > 4 ? 'var(--yellow)' : 'var(--ng)'} />

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Emotion Before Trading</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOTIONS.map(em => {
                const label = em.split(' ').slice(1).join(' ')
                return (
                  <button key={label} onClick={() => setForm(f => ({ ...f, emotionBefore: label }))} style={{
                    padding: '4px 10px', border: `1px solid ${form.emotionBefore === label ? 'var(--border2)' : 'var(--border)'}`,
                    borderRadius: 5, background: form.emotionBefore === label ? 'rgba(57,255,20,0.1)' : 'transparent',
                    color: form.emotionBefore === label ? 'var(--ng)' : 'var(--text3)',
                    cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 10,
                  }}>{em}</button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 6 }}>Market Bias</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {BIASES.map(b => (
                <button key={b} onClick={() => setForm(f => ({ ...f, bias: b }))} style={{
                  flex: 1, padding: '6px', border: `1px solid ${form.bias === b ? 'var(--border2)' : 'var(--border)'}`,
                  borderRadius: 6, background: form.bias === b ? 'rgba(57,255,20,0.1)' : 'transparent',
                  color: form.bias === b ? 'var(--ng)' : 'var(--text3)',
                  cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
                }}>{b}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Trading Decisions Today</div>
            <textarea className="input-dark" rows={2} placeholder="What decisions did you make and why?..." value={form.tradingDecisions} onChange={e => setForm(f => ({ ...f, tradingDecisions: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Notes & Reflections</div>
            <textarea className="input-dark" rows={3} placeholder="How did you feel? What affected your psychology today?..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <button className="btn-primary" style={{ justifyContent: 'center', width: '100%' }} onClick={handleSave} disabled={saving}>
            {saving ? '...' : '🧠 Save Check-In'}
          </button>
        </motion.div>

        {/* Stats panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 16 }}>
            <div className="card-title"><span>💜</span>Emotion Distribution</div>
            <HighchartsReact highcharts={Highcharts} options={donutOptions} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
              {emotionData.labelKeys.map((labelKey, i) => (
                <div key={labelKey} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: emotionData.colors[i], flexShrink: 0 }} />
                  <span style={{ color: 'var(--text2)' }}>{t(`emotions.${labelKey}`)}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text)' }}>{emotionData.values[i]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 16 }}>
            <div className="card-title"><span>📋</span>Recent Entries ({entries.length})</div>
            {!entries.length && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>No entries yet. Start tracking!</div>}
            {entries.slice(0, 4).map(e => (
              <div key={e.id} style={{ padding: '7px 0', borderBottom: '1px solid rgba(57,255,20,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontFamily: 'Rajdhani', color: 'var(--text)' }}>{e.date}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>Stress: {e.stressLevel}/10</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.emotionBefore} → {e.emotionAfter}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
