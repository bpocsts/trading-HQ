import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useI18n } from '../../i18n'
import { achievementCatalog } from '../../lib/appConstants'
import { calculateAchievementLevel, updateUserProfile, useAchievements, useUserProfile } from '../../hooks/useFirestore'
import { useAuth } from '../../hooks/useAuth'
import useStore from '../../store/useStore'
import ProfileFrame from './ProfileFrame'

const ROLES = [
  'Smart Money Concept Trader',
  'Price Action Trader',
  'Swing Trader',
  'Scalper',
  'Day Trader',
  'ICT Trader',
  'Algo Trader',
]

const SESSIONS = ['London', 'New York', 'Asia', 'Sydney', 'All Sessions']
const MAX_AVATAR_FILE_SIZE = 350 * 1024

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function ProfileModal() {
  const { showProfileModal, setShowProfileModal } = useStore()
  const { user } = useAuth()
  const { t } = useI18n()
  const { profile: liveProfile } = useUserProfile(user?.uid)
  const { data: achievements } = useAchievements(user?.uid)
  const fileRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: '',
    balance: '',
    bestSession: '',
    xp: 0,
    xpMax: 1000,
    avatarPreset: 'neo',
    avatarDataUrl: '',
  })

  useEffect(() => {
    if (!liveProfile?.profile) return

    const profile = liveProfile.profile
    setForm({
      name: profile.name || '',
      role: profile.role || ROLES[0],
      balance: profile.initialTradeBalance ?? profile.balance ?? 10000,
      bestSession: profile.bestSession || SESSIONS[0],
      xp: profile.xp || 0,
      xpMax: profile.xpMax || 1000,
      avatarPreset: profile.avatarPreset || 'neo',
      avatarDataUrl: profile.avatarDataUrl || '',
    })
  }, [liveProfile, showProfileModal])

  const displayedAvatar = useMemo(() => form.avatarDataUrl || '', [form.avatarDataUrl])
  const achievementLevel = useMemo(
    () => calculateAchievementLevel(achievements.length, achievementCatalog.length),
    [achievements.length]
  )

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error(t('profileModal.chooseImage'))
      return
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      toast.error(t('profileModal.imageTooLarge'))
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      if (dataUrl.length > 700000) {
        toast.error(t('profileModal.imageStillTooLarge'))
        return
      }

      setForm((current) => ({
        ...current,
        avatarDataUrl: dataUrl,
      }))
    } catch (error) {
      console.error('Failed to convert avatar to base64:', error)
      toast.error(error.message || t('profileModal.imageReadFailed'))
    } finally {
      event.target.value = ''
    }
  }

  const clearCustomAvatar = () => {
    setForm((current) => ({
      ...current,
      avatarDataUrl: '',
    }))
  }

  const handleSave = async () => {
    if (!user) return

    if (!form.name.trim()) {
      toast.error(t('profileModal.enterName'))
      return
    }

    setSaving(true)
    try {
      const ok = await updateUserProfile(user.uid, {
        profile: {
          name: form.name.trim(),
          role: form.role,
          initialTradeBalance: Number(form.balance) || 0,
          bestSession: form.bestSession,
          avatarPreset: form.avatarPreset,
          avatarDataUrl: form.avatarDataUrl || '',
          avatarUrl: '',
        },
      })

      if (ok) {
        setShowProfileModal(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {showProfileModal && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(event) => event.target === event.currentTarget && setShowProfileModal(false)}>
          <motion.div className="modal-box" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>
                <i className="bi bi-pencil-fill" style={{ marginRight: 8 }}></i>{t('profileModal.title')}
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>
                ×
              </button>
            </div>

            <Field label={t('profileModal.photo')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <ProfileFrame
                  avatarDataUrl={displayedAvatar}
                  avatarPreset={form.avatarPreset || 'neo'}
                  level={achievementLevel.level}
                  name="Profile preview"
                  width={104}
                  height={116}
                />

                <div style={{ flex: 1 }}>
                  <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={saving}>
                    {displayedAvatar ? t('profileModal.changePhoto') : t('profileModal.choosePhoto')}
                  </button>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
                    {t('profileModal.photoHint')}
                  </div>
                  {displayedAvatar && (
                    <button type="button" className="btn-ghost" onClick={clearCustomAvatar} disabled={saving} style={{ marginTop: 8 }}>
                      {t('profileModal.usePreset')}
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
              </div>
            </Field>

            <Field label={t('profileModal.traderName')}>
              <input className="input-dark" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={t('profileModal.traderNamePlaceholder')} />
            </Field>

            <Field label={t('profileModal.traderRole')}>
              <select className="input-dark" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                {ROLES.map((role) => <option key={role}>{role}</option>)}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={t('profileModal.balance')}>
                <input className="input-dark" type="number" value={form.balance} onChange={(event) => setForm((current) => ({ ...current, balance: event.target.value }))} placeholder="10000" />
              </Field>
              <Field label={t('profileModal.bestSession')}>
                <select className="input-dark" value={form.bestSession} onChange={(event) => setForm((current) => ({ ...current, bestSession: event.target.value }))}>
                  {SESSIONS.map((session) => <option key={session}>{session}</option>)}
                </select>
              </Field>
            </div>

            <Field label={`${t('profileModal.xpProgress')} (${achievementLevel.xp} / ${achievementLevel.xpMax})`}>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(achievementLevel.xp / achievementLevel.xpMax) * 100}%` }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>
                {t('profileModal.xpHint')} ({achievementLevel.unlockedCount} / {achievementLevel.totalAchievements})
              </div>
            </Field>

            <div style={{ padding: '10px 12px', background: 'rgba(var(--ng-rgb),0.04)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 16, fontSize: 10, color: 'var(--text3)', lineHeight: 1.5 }}>
              <i className="bi bi-lightbulb-fill" style={{ marginRight: 6 }}></i>{t('profileModal.autoStatsHint')}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowProfileModal(false)} disabled={saving}>
                {t('profileModal.cancel')}
              </button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                {saving ? t('profileModal.saving') : `✓ ${t('profileModal.save')}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
