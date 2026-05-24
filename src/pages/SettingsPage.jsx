import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { calculateAchievementLevel, updateUserProfile, useAchievements, useUserProfile } from '../hooks/useFirestore'
import { useI18n } from '../i18n'
import { achievementCatalog } from '../lib/appConstants'
import { applyTheme, getStoredTheme, themeOptions } from '../lib/theme'
import { getThemeText } from '../lib/localization'
import ProfileFrame, { getProfileFrames } from '../components/ui/ProfileFrame'

const THEME_PREVIEW_BACKDROPS = {
  neon: 'linear-gradient(135deg, #05070a, #101821)',
  crimson: 'radial-gradient(circle at 72% 18%, rgba(139,92,246,0.34), transparent 24%), linear-gradient(135deg, #030614, #101433)',
  cyan: 'radial-gradient(circle at 72% 18%, rgba(56,217,255,0.28), transparent 24%), linear-gradient(135deg, #021018, #08364a)',
  amber: 'radial-gradient(circle at 72% 18%, rgba(223,247,255,0.34), transparent 24%), linear-gradient(135deg, #061016, #162f3a)',
  solar: 'radial-gradient(circle at 72% 18%, rgba(255,90,122,0.32), transparent 24%), linear-gradient(135deg, #12070b, #381717)',
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{subtitle}</div>
      </div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>{label}</span>
      {children}
      {hint ? <span style={{ fontSize: 11, color: 'var(--text3)' }}>{hint}</span> : null}
    </label>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { profile: liveProfile } = useUserProfile(user?.uid)
  const { data: achievements, loading: achievementsLoading } = useAchievements(user?.uid)
  const { language, setLanguage } = useI18n()
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [preferences, setPreferences] = useState({
    language,
    theme: getStoredTheme(),
  })
  const [previewTab, setPreviewTab] = useState('frames')
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0)
  const [previewThemeIndex, setPreviewThemeIndex] = useState(0)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', nextPassword: '', confirmPassword: '' })
  const traderLevel = calculateAchievementLevel(achievements.length, achievementCatalog.length).level
  const selectedTheme = themeOptions.find((theme) => theme.value === preferences.theme) || themeOptions[0]
  const profilePreview = liveProfile?.profile || {}
  const profileFrames = getProfileFrames()
  const selectedFramePreview = profileFrames[previewFrameIndex] || profileFrames[0]
  const selectedFrameLevel = previewFrameIndex + 1
  const selectedFrameUnlocked = traderLevel >= selectedFrameLevel
  const selectedThemePreview = themeOptions[previewThemeIndex] || themeOptions[0]

  const isThemeUnlocked = (theme) => traderLevel >= (theme.unlockLevel || 1)
  const selectedThemeUnlocked = isThemeUnlocked(selectedThemePreview)
  const getThemeLockLabel = (theme) => {
    const requiredLevel = theme.unlockLevel || 1
    if (requiredLevel <= 1) return ''
    return language === 'th' ? `ปลดล็อกที่เลเวล ${requiredLevel}` : `Unlocks at level ${requiredLevel}`
  }

  const copy = useMemo(() => {
    if (language === 'th') {
      return {
        title: 'ตั้งค่า',
        subtitle: 'จัดการภาษา ธีม และความปลอดภัยของบัญชี',
        languageTitle: 'Language & Theme',
        languageSubtitle: 'ตั้งค่าภาษาและธีมที่อยากใช้ในแอป',
        languageLabel: 'ภาษา',
        currentLanguageLabel: 'ภาษาที่ใช้งานอยู่ตอนนี้',
        selectedLabel: 'ค่าที่เลือก',
        themeLabel: 'ธีม',
        savePrefs: 'บันทึกการตั้งค่า',
        saving: 'กำลังบันทึก...',
        securityTitle: 'Security',
        securitySubtitle: 'จัดการรหัสผ่านและการเข้าสู่ระบบของบัญชีคุณ',
        signedInAs: 'เข้าสู่ระบบด้วย',
        provider: 'วิธีเข้าสู่ระบบ',
        emailPassword: 'อีเมลและรหัสผ่าน',
        google: 'Google',
        currentPassword: 'รหัสผ่านปัจจุบัน',
        newPassword: 'รหัสผ่านใหม่',
        confirmPassword: 'ยืนยันรหัสผ่านใหม่',
        passwordHint: 'อย่างน้อย 6 ตัวอักษร',
        updatePassword: 'เปลี่ยนรหัสผ่าน',
        sendReset: 'ส่งอีเมลรีเซ็ตรหัสผ่าน',
        logout: 'ออกจากระบบ',
        prefsSaved: 'บันทึกการตั้งค่าแล้ว',
        currentPasswordRequired: 'กรุณากรอกรหัสผ่านปัจจุบันก่อนเปลี่ยนรหัสผ่าน',
        passwordsMismatch: 'รหัสผ่านใหม่ไม่ตรงกัน',
        passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        passwordUpdated: 'เปลี่ยนรหัสผ่านแล้ว',
        passwordRequiresRecentLogin: 'เพื่อความปลอดภัย กรุณาออกจากระบบแล้วเข้าใหม่ก่อนเปลี่ยนรหัสผ่าน',
        wrongCurrentPassword: 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        resetSent: 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว',
        resetFailed: 'ส่งอีเมลรีเซ็ตไม่สำเร็จ',
        passwordFailed: 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
        providerHint: 'ถ้าคุณล็อกอินด้วย Google ปุ่มรีเซ็ตรหัสผ่านอาจไม่จำเป็น',
        previewTitle: 'ตัวอย่าง',
        previewSubtitle: 'ดูตัวอย่างกรอบโปรไฟล์และธีมก่อนบันทึก',
        framePreview: 'กรอบโปรไฟล์',
        themePreview: 'ตัวอย่างธีม',
        currentLevel: 'เลเวลปัจจุบัน',
        allFrames: 'กรอบทั้งหมด',
        allThemes: 'ธีมทั้งหมด',
        previewGalleryTitle: 'แกลเลอรีตัวอย่าง',
        previewGallerySubtitle: 'ดูตัวอย่างกรอบโปรไฟล์และธีมทุกแบบ',
      }
    }

    return {
      title: 'Settings',
      subtitle: 'Manage language, theme, and account security preferences',
      languageTitle: 'Language & Theme',
      languageSubtitle: 'Choose your app language and theme',
      languageLabel: 'Language',
      currentLanguageLabel: 'Current active language',
      selectedLabel: 'Selected',
      themeLabel: 'Theme',
      savePrefs: 'Save Preferences',
      saving: 'Saving...',
      securityTitle: 'Security',
      securitySubtitle: 'Manage your password and sign-in security',
      signedInAs: 'Signed in as',
      provider: 'Sign-in method',
      emailPassword: 'Email & Password',
      google: 'Google',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      passwordHint: 'At least 6 characters',
      updatePassword: 'Update Password',
      logout: 'Sign Out',
      prefsSaved: 'Preferences saved',
      currentPasswordRequired: 'Please enter your current password before changing it',
      passwordsMismatch: 'New passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordUpdated: 'Password updated',
      passwordRequiresRecentLogin: 'For security, please sign out and sign in again before changing your password',
      wrongCurrentPassword: 'Current password is incorrect',
      passwordFailed: 'Failed to update password',
      previewTitle: 'Preview',
      previewSubtitle: 'Check your profile frame and selected theme before saving',
      framePreview: 'Profile Frame',
      themePreview: 'Theme Preview',
      currentLevel: 'Current Level',
      allFrames: 'All Frames',
      allThemes: 'All Themes',
      previewGalleryTitle: 'Preview Gallery',
      previewGallerySubtitle: 'Preview every profile frame and every theme',
    }
  }, [language])

  useEffect(() => {
    const savedPrefs = liveProfile?.preferences
    if (!savedPrefs) return

    setPreferences((current) => ({
      language: savedPrefs.language || current.language,
      theme: savedPrefs.theme || current.theme,
    }))

    if (savedPrefs.theme) {
      applyTheme(savedPrefs.theme)
    }
  }, [liveProfile])

  useEffect(() => {
    if (achievementsLoading) return
    const selectedTheme = themeOptions.find((theme) => theme.value === preferences.theme)
    if (selectedTheme && !isThemeUnlocked(selectedTheme)) {
      setPreferences((current) => ({ ...current, theme: 'neon' }))
      applyTheme('neon')
    }
  }, [achievementsLoading, preferences.theme, traderLevel])

  const providerIds = user?.providerData?.map((provider) => provider.providerId) || []
  const hasPasswordProvider = providerIds.includes('password')
  const usesGoogle = providerIds.includes('google.com')

  const handleSavePreferences = async () => {
    if (!user?.uid) return
    if (achievementsLoading) return
    const selectedTheme = themeOptions.find((theme) => theme.value === preferences.theme)
    if (selectedTheme && !isThemeUnlocked(selectedTheme)) {
      toast.error(getThemeLockLabel(selectedTheme))
      return
    }
    setSavingPrefs(true)

    try {
      setLanguage(preferences.language)
      applyTheme(preferences.theme)

      const ok = await updateUserProfile(user.uid, {
        preferences: {
          language: preferences.language,
          theme: preferences.theme,
        },
      })

      if (ok) {
        toast.success(copy.prefsSaved)
      }
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return
    if (hasPasswordProvider && !passwordForm.currentPassword) {
      toast.error(copy.currentPasswordRequired)
      return
    }
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      toast.error(copy.passwordsMismatch)
      return
    }
    if (passwordForm.nextPassword.length < 6) {
      toast.error(copy.passwordTooShort)
      return
    }

    setSavingPassword(true)
    try {
      if (hasPasswordProvider && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, passwordForm.currentPassword)
        await reauthenticateWithCredential(auth.currentUser, credential)
      }

      await updatePassword(auth.currentUser, passwordForm.nextPassword)
      setPasswordForm({ currentPassword: '', nextPassword: '', confirmPassword: '' })
      toast.success(copy.passwordUpdated)
    } catch (error) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        toast.error(copy.wrongCurrentPassword)
      } else if (error?.code === 'auth/requires-recent-login') {
        toast.error(copy.passwordRequiresRecentLogin)
      } else {
        toast.error(error?.message || copy.passwordFailed)
      }
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 32, fontWeight: 700, color: 'var(--ng)', letterSpacing: 1 }}>
          {copy.title}
        </div>
        <div style={{ marginTop: 6, color: 'var(--text3)', fontSize: 13 }}>
          {copy.subtitle}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, alignItems: 'start' }}>
        <SectionCard title={copy.languageTitle} subtitle={copy.languageSubtitle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 420px)', gap: 14 }}>
            <Field label={copy.languageLabel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>
                <span>{copy.currentLanguageLabel}: <span style={{ color: 'var(--ng)' }}>{language === 'th' ? 'ไทย' : 'English'}</span></span>
                {preferences.language !== language ? (
                  <span>{copy.selectedLabel}: <span style={{ color: '#ffcc00' }}>{preferences.language === 'th' ? 'ไทย' : 'English'}</span></span>
                ) : null}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{
                    flex: 1,
                    opacity: preferences.language === 'en' ? 1 : 0.65,
                    borderColor: preferences.language === 'en' ? 'var(--border2)' : 'var(--border)',
                    background: preferences.language === 'en' ? 'rgba(var(--ng-rgb),0.08)' : 'transparent',
                    color: preferences.language === 'en' ? 'var(--ng)' : 'var(--text3)',
                  }}
                  onClick={() => setPreferences((current) => ({ ...current, language: 'en' }))}
                >
                  EN {language === 'en' ? '• Live' : ''}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{
                    flex: 1,
                    opacity: preferences.language === 'th' ? 1 : 0.65,
                    borderColor: preferences.language === 'th' ? 'var(--border2)' : 'var(--border)',
                    background: preferences.language === 'th' ? 'rgba(var(--ng-rgb),0.08)' : 'transparent',
                    color: preferences.language === 'th' ? 'var(--ng)' : 'var(--text3)',
                  }}
                  onClick={() => setPreferences((current) => ({ ...current, language: 'th' }))}
                >
                  TH {language === 'th' ? '• Live' : ''}
                </button>
              </div>
            </Field>

          </div>

          <div style={{ marginTop: 16 }}>
            <Field label={copy.themeLabel}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                {themeOptions.map((theme) => {
                  const active = preferences.theme === theme.value
                  const unlocked = isThemeUnlocked(theme)
                  const lockLabel = getThemeLockLabel(theme)
                  return (
                    <button
                      key={theme.value}
                      type="button"
                      className="btn-ghost"
                      disabled={!unlocked}
                      title={unlocked ? getThemeText(theme, language).description : lockLabel}
                      onClick={() => {
                        if (!unlocked) {
                          toast.error(lockLabel)
                          return
                        }
                        setPreferences((current) => ({ ...current, theme: theme.value }))
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 7,
                        padding: 12,
                        minHeight: 88,
                        cursor: unlocked ? 'pointer' : 'not-allowed',
                        opacity: unlocked ? 1 : 0.45,
                        borderColor: active ? theme.accent : 'var(--border)',
                        background: active ? `${theme.accent}18` : unlocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                        color: active ? 'var(--text)' : unlocked ? 'var(--text2)' : 'var(--text3)',
                        boxShadow: active ? `0 0 18px ${theme.accent}26` : 'none',
                      }}
                    >
                      <span style={{ width: 28, height: 28, borderRadius: 999, background: unlocked ? theme.accent : 'var(--card3)', boxShadow: unlocked ? `0 0 14px ${theme.accent}80` : 'none', border: '1px solid rgba(255,255,255,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                        {unlocked ? '' : '🔒'}
                      </span>
                      <span style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>{getThemeText(theme, language).name}</span>
                      <span style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'left' }}>{getThemeText(theme, language).description}</span>
                      {!unlocked ? <span style={{ marginTop: 'auto', fontSize: 9, color: '#ffcc00', fontWeight: 700 }}>{lockLabel}</span> : null}
                    </button>
                  )
                })}
              </div>
            </Field>
          </div>

          <div style={{ marginTop: 16 }}>
            <button type="button" className="btn-primary" onClick={handleSavePreferences} disabled={savingPrefs} style={{ justifyContent: 'center' }}>
              {savingPrefs ? copy.saving : copy.savePrefs}
            </button>
          </div>
        </SectionCard>

        <div style={{ display: 'grid', gap: 16 }}>
          <SectionCard title={copy.previewGalleryTitle || 'Preview Gallery'} subtitle={copy.previewGallerySubtitle || 'Preview every profile frame and every theme'}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPreviewTab('frames')}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  borderColor: previewTab === 'frames' ? 'var(--border2)' : 'var(--border)',
                  background: previewTab === 'frames' ? 'rgba(var(--ng-rgb),0.08)' : 'transparent',
                  color: previewTab === 'frames' ? 'var(--ng)' : 'var(--text3)',
                }}
              >
                {copy.allFrames || 'All Frames'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPreviewTab('themes')}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  borderColor: previewTab === 'themes' ? 'var(--border2)' : 'var(--border)',
                  background: previewTab === 'themes' ? 'rgba(var(--ng-rgb),0.08)' : 'transparent',
                  color: previewTab === 'themes' ? 'var(--ng)' : 'var(--text3)',
                }}
              >
                {copy.allThemes || 'All Themes'}
              </button>
            </div>

            {previewTab === 'frames' ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    border: `1px solid ${selectedFramePreview.glow}`,
                    background: `radial-gradient(circle at 72% 20%, ${selectedFramePreview.glow}24, transparent 28%), linear-gradient(135deg, rgba(8,12,24,0.95), rgba(15,20,34,0.82))`,
                    boxShadow: `0 0 24px ${selectedFramePreview.glow}24`,
                    opacity: selectedFrameUnlocked ? 1 : 0.58,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <ProfileFrame
                      avatarDataUrl={profilePreview.avatarDataUrl || ''}
                      avatarPreset={profilePreview.avatarPreset || 'neo'}
                      name={profilePreview.name || 'Trader'}
                      level={selectedFrameLevel}
                      frameKey={selectedFramePreview.key}
                      width={112}
                      height={132}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 900, color: selectedFramePreview.glow, letterSpacing: 1 }}>
                        {selectedFramePreview.label}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 11, color: 'var(--text3)' }}>
                        {language === 'th' ? 'เลเวล' : 'Level'} {selectedFrameLevel}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 10, color: selectedFrameUnlocked ? '#9ef7b5' : '#ffcc00', fontWeight: 800 }}>
                        {selectedFrameUnlocked ? (language === 'th' ? 'ปลดล็อกแล้ว' : 'Unlocked') : (language === 'th' ? `ปลดล็อกที่เลเวล ${selectedFrameLevel}` : `Unlocks at level ${selectedFrameLevel}`)}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setPreviewFrameIndex((current) => (current - 1 + profileFrames.length) % profileFrames.length)}
                    style={{ justifyContent: 'center', height: 38 }}
                  >
                    ‹
                  </button>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {profileFrames.map((frame, index) => (
                      <button
                        key={frame.key}
                        type="button"
                        className="btn-ghost"
                        onClick={() => setPreviewFrameIndex(index)}
                        style={{
                          minWidth: 78,
                          justifyContent: 'center',
                          borderColor: previewFrameIndex === index ? frame.glow : 'var(--border)',
                          color: previewFrameIndex === index ? frame.glow : 'var(--text3)',
                          background: previewFrameIndex === index ? `${frame.glow}16` : 'transparent',
                        }}
                      >
                        {index + 1}. {frame.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setPreviewFrameIndex((current) => (current + 1) % profileFrames.length)}
                    style={{ justifyContent: 'center', height: 38 }}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 210,
                    padding: 18,
                    borderRadius: 16,
                    border: `1px solid ${selectedThemePreview.accent}70`,
                    background: THEME_PREVIEW_BACKDROPS[selectedThemePreview.value] || THEME_PREVIEW_BACKDROPS.neon,
                    boxShadow: `0 0 26px ${selectedThemePreview.accent}24`,
                    opacity: selectedThemeUnlocked ? 1 : 0.58,
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.34, backgroundImage: `radial-gradient(circle at 18% 20%, ${selectedThemePreview.accent}44 0 1px, transparent 2px), radial-gradient(circle at 80% 52%, #ffffff55 0 1px, transparent 2px)`, backgroundSize: '74px 74px, 108px 108px' }} />
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 900, letterSpacing: 2, color: selectedThemePreview.accent, textTransform: 'uppercase' }}>
                        {getThemeText(selectedThemePreview, language).name}
                      </div>
                      <div style={{ marginTop: 5, fontSize: 11, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>
                        {getThemeText(selectedThemePreview, language).description}
                      </div>
                      <div style={{ marginTop: 9, fontSize: 10, color: selectedThemeUnlocked ? '#9ef7b5' : '#ffcc00', fontWeight: 800 }}>
                        {selectedThemeUnlocked ? (language === 'th' ? 'ปลดล็อกแล้ว' : 'Unlocked') : getThemeLockLabel(selectedThemePreview)}
                      </div>
                    </div>
                    <span style={{ width: 38, height: 38, borderRadius: 999, background: selectedThemeUnlocked ? selectedThemePreview.accent : 'rgba(255,255,255,0.16)', boxShadow: selectedThemeUnlocked ? `0 0 22px ${selectedThemePreview.accent}88` : 'none', border: '1px solid rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedThemeUnlocked ? '' : '🔒'}
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      language === 'th' ? 'บัญชี' : 'Account',
                      language === 'th' ? 'อัตราชนะ' : 'Win Rate',
                      'P/L',
                      language === 'th' ? 'โฟกัส' : 'Focus',
                    ].map((label, index) => (
                      <div key={label} style={{ padding: 11, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.09)' }}>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.52)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                        <div style={{ marginTop: 4, fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 800, color: index === 0 ? '#fff' : selectedThemePreview.accent }}>
                          {index === 0 ? '$3,130' : index === 1 ? '75%' : index === 2 ? '+$3,080' : '7/10'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setPreviewThemeIndex((current) => (current - 1 + themeOptions.length) % themeOptions.length)}
                    style={{ justifyContent: 'center', height: 38 }}
                  >
                    ‹
                  </button>
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {themeOptions.map((theme, index) => (
                      <button
                        key={theme.value}
                        type="button"
                        className="btn-ghost"
                        onClick={() => setPreviewThemeIndex(index)}
                        style={{
                          minWidth: 92,
                          justifyContent: 'center',
                          borderColor: previewThemeIndex === index ? theme.accent : 'var(--border)',
                          color: previewThemeIndex === index ? theme.accent : 'var(--text3)',
                          background: previewThemeIndex === index ? `${theme.accent}16` : 'transparent',
                        }}
                      >
                        {getThemeText(theme, language).name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setPreviewThemeIndex((current) => (current + 1) % themeOptions.length)}
                    style={{ justifyContent: 'center', height: 38 }}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title={copy.securityTitle} subtitle={copy.securitySubtitle}>
            <div style={{ display: 'grid', gap: 14 }}>
            <Field label={copy.signedInAs}>
              <input className="input-dark" value={user?.email || '-'} disabled />
            </Field>

            <Field label={copy.provider}>
              <input
                className="input-dark"
                value={hasPasswordProvider ? copy.emailPassword : usesGoogle ? copy.google : user?.providerData?.[0]?.providerId || '-'}
                disabled
              />
            </Field>

            {hasPasswordProvider ? (
              <Field label={copy.currentPassword}>
                <input
                  className="input-dark"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  placeholder="••••••••"
                />
              </Field>
            ) : null}

            <Field label={copy.newPassword} hint={copy.passwordHint}>
              <input
                className="input-dark"
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, nextPassword: event.target.value }))}
                placeholder="••••••••"
              />
            </Field>

            <Field label={copy.confirmPassword}>
              <input
                className="input-dark"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="••••••••"
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <button type="button" className="btn-primary" onClick={handleUpdatePassword} disabled={savingPassword} style={{ justifyContent: 'center' }}>
                {savingPassword ? copy.saving : copy.updatePassword}
              </button>
            </div>

            <button type="button" className="btn-ghost" onClick={logout} style={{ borderColor: 'rgba(255,68,68,0.25)', color: '#ff8a8a' }}>
              {copy.logout}
            </button>
            </div>
          </SectionCard>
          </div>
      </div>
    </div>
  )
}
