import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useI18n } from '../i18n'
import { useAuth } from '../hooks/useAuth'
import { usePsychology } from '../hooks/useFirestore'
import { buildEmotionDistribution } from '../lib/analytics'
import { getDirectionLabel, getEmotionLabel } from '../lib/localization'

export default function PsychologyPage() {
  const { user } = useAuth()
  const { language, t } = useI18n()
  const { data: entries } = usePsychology(user?.uid)
  const [filters, setFilters] = useState({
    search: '',
    emotion: 'all',
    bias: 'all',
    minStress: '',
    maxStress: '',
    from: '',
    to: '',
  })
  const emotionOptions = Array.from(new Set(entries.flatMap((entry) => [entry.emotionBefore, entry.emotionAfter]).filter(Boolean))).sort()
  const biasOptions = Array.from(new Set(entries.map((entry) => entry.bias).filter(Boolean))).sort()
  const filteredEntries = entries.filter((entry) => {
    const search = filters.search.trim().toLowerCase()
    const stress = Number(entry.stressLevel) || 0
    const matchesSearch = !search || [
      entry.date,
      entry.emotionBefore,
      entry.emotionAfter,
      entry.bias,
      entry.tradingDecisions,
      entry.notes,
    ].some((value) => String(value || '').toLowerCase().includes(search))

    return (
      matchesSearch &&
      (filters.emotion === 'all' || entry.emotionBefore === filters.emotion || entry.emotionAfter === filters.emotion) &&
      (filters.bias === 'all' || entry.bias === filters.bias) &&
      (!filters.minStress || stress >= Number(filters.minStress)) &&
      (!filters.maxStress || stress <= Number(filters.maxStress)) &&
      (!filters.from || String(entry.date || '') >= filters.from) &&
      (!filters.to || String(entry.date || '') <= filters.to)
    )
  })

  const emotions = useMemo(() => buildEmotionDistribution(filteredEntries), [filteredEntries])

  const donutOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 260, margin: [0, 0, 0, 0] },
    title: { text: '' },
    credits: { enabled: false },
    exporting: { enabled: false },
    tooltip: {
      backgroundColor: 'rgba(7,15,7,0.92)',
      borderColor: 'rgba(var(--ng-rgb),0.3)',
      style: { color: '#e8ffe8', fontFamily: 'Exo 2', fontSize: '11px' },
    },
    plotOptions: {
      pie: {
        innerSize: '62%',
        dataLabels: { enabled: false },
        borderColor: '#0b160b',
        borderWidth: 3,
      },
    },
    series: [{
      name: t('psychologyPage.emotionDistribution'),
      data: emotions.map((item) => ({ name: getEmotionLabel(item.label, language), y: item.value, color: item.color })),
    }],
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>{t('psychologyPage.title')}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('psychologyPage.subtitle')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 12 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-pie-chart-fill"></i></span>{t('psychologyPage.emotionDistribution')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 12 }}>
            <input className="input-dark" placeholder={language === 'th' ? 'ค้นหาโน้ตหรืออารมณ์...' : 'Search notes, emotion...'} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
            <select className="input-dark" value={filters.emotion} onChange={(event) => setFilters((current) => ({ ...current, emotion: event.target.value }))}>
              <option value="all">{language === 'th' ? 'ทุกอารมณ์' : 'All Emotions'}</option>
              {emotionOptions.map((emotion) => <option key={emotion} value={emotion}>{getEmotionLabel(emotion, language)}</option>)}
            </select>
            <select className="input-dark" value={filters.bias} onChange={(event) => setFilters((current) => ({ ...current, bias: event.target.value }))}>
              <option value="all">{language === 'th' ? 'ทุกมุมมองตลาด' : 'All Bias'}</option>
              {biasOptions.map((bias) => <option key={bias} value={bias}>{getDirectionLabel(bias, language)}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input-dark" type="number" min="1" max="10" placeholder={language === 'th' ? 'เครียดต่ำสุด' : 'Min stress'} value={filters.minStress} onChange={(event) => setFilters((current) => ({ ...current, minStress: event.target.value }))} />
              <input className="input-dark" type="number" min="1" max="10" placeholder={language === 'th' ? 'เครียดสูงสุด' : 'Max stress'} value={filters.maxStress} onChange={(event) => setFilters((current) => ({ ...current, maxStress: event.target.value }))} />
            </div>
            <input className="input-dark" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
            <input className="input-dark" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
          </div>
          <button type="button" className="btn-ghost" onClick={() => setFilters({ search: '', emotion: 'all', bias: 'all', minStress: '', maxStress: '', from: '', to: '' })} style={{ marginBottom: 10 }}>
            {language === 'th' ? 'ล้างตัวกรอง' : 'Reset Filters'}
          </button>
          <HighchartsReact highcharts={Highcharts} options={donutOptions} />
          {!emotions.length && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t('psychologyPage.noPsychologyData')}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
            {emotions.map((emotion) => (
              <div key={emotion.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: emotion.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text2)' }}>{getEmotionLabel(emotion.label, language)}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text)' }}>{emotion.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 16 }}>
          <div className="card-title"><span><i className="bi bi-clock-history"></i></span>{t('psychologyPage.recentEntries')} ({filteredEntries.length} / {entries.length})</div>
          {!filteredEntries.length && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>{t('psychologyPage.noEntries')}</div>}
          {filteredEntries.slice(0, 10).map((entry) => (
            <div key={entry.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(var(--ng-rgb),0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontFamily: 'Rajdhani', color: 'var(--text)' }}>{entry.date}</span>
                <span style={{ fontSize: 9, color: 'var(--text3)' }}>{t('psychologyPage.stressShort')}: {entry.stressLevel}/10</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {getEmotionLabel(entry.emotionBefore, language)} {'->'} {getEmotionLabel(entry.emotionAfter, language)}
              </div>
              {entry.bias && (
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3 }}>
                  {t('psychologyPage.marketBias')}: {getDirectionLabel(entry.bias, language)}
                </div>
              )}
              {entry.tradingDecisions && (
                <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3, lineHeight: 1.5 }}>
                  {entry.tradingDecisions}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
