import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useI18n } from '../i18n'
import { auth, db, googleProvider } from '../lib/firebase'

function getAuthErrorMessage(error, language = 'en') {
  const isThai = language === 'th'
  const messages = {
    'auth/invalid-email': isThai ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email address',
    'auth/missing-email': isThai ? 'กรุณากรอกอีเมล' : 'Please enter your email',
    'auth/missing-password': isThai ? 'กรุณากรอกรหัสผ่าน' : 'Please enter your password',
    'auth/user-not-found': isThai ? 'ไม่พบบัญชีนี้' : 'Account not found',
    'auth/wrong-password': isThai ? 'รหัสผ่านไม่ถูกต้อง' : 'Incorrect password',
    'auth/invalid-credential': isThai ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid email or password',
    'auth/invalid-login-credentials': isThai ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'Invalid email or password',
    'auth/email-already-in-use': isThai ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'Email is already in use',
    'auth/weak-password': isThai ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters',
    'auth/too-many-requests': isThai ? 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง' : 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': isThai ? 'ยกเลิกการเข้าสู่ระบบด้วย Google' : 'Google sign-in was cancelled',
    'auth/popup-blocked': isThai ? 'เบราว์เซอร์บล็อกหน้าต่าง Google Sign-in' : 'Google sign-in popup was blocked',
    'auth/network-request-failed': isThai ? 'เชื่อมต่อเครือข่ายไม่สำเร็จ' : 'Network request failed',
  }

  return messages[error?.code] || error?.message?.replace('Firebase: ', '').replace(/\(.*\)/, '') || (isThai ? 'เกิดข้อผิดพลาด' : 'Something went wrong')
}

function getValidationText(language) {
  const isThai = language === 'th'
  return {
    confirmPassword: isThai ? 'ยืนยันรหัสผ่าน' : 'Confirm Password',
    confirmPasswordPlaceholder: isThai ? 'กรอกรหัสผ่านอีกครั้ง' : 'Enter password again',
    passwordMin: isThai ? 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' : 'Password must be at least 6 characters',
    passwordMismatch: isThai ? 'รหัสผ่านยืนยันไม่ตรงกัน' : 'Password confirmation does not match',
  }
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const { language, setLanguage, t } = useI18n()
  const validationText = useMemo(() => getValidationText(language), [language])

  const setField = (key, value) => {
    setFormError('')
    setForm((current) => ({ ...current, [key]: value }))
  }

  const createUserDoc = async (user, fallbackName = '') => {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    const displayName = user.displayName || fallbackName || t('auth.defaultName')

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        displayName,
        profile: {
          name: displayName,
          role: t('auth.defaultRole'),
          avatarUrl: user.photoURL || '',
          avatarPreset: 'neo',
          avatarDataUrl: '',
          level: 1,
          xp: 0,
          xpMax: 1000,
          winRate: 0,
          rrAverage: '-',
          totalTrades: 0,
          initialTradeBalance: 10000,
          balance: 0,
          bestSession: '-',
          currentStreak: 0,
        },
        dailyStats: { hp: 8, mood: 7, focus: 8, motivation: 9 },
        todayFocus: { session: 'London', pair: 'XAUUSD', bias: 'Bullish', keyLevel: '', notes: '' },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
  }

  const showError = (message) => {
    setFormError(message)
    toast.error(message)
  }

  const handleSubmit = async () => {
    const email = form.email.trim()
    const name = form.name.trim()
    setFormError('')

    if (!email || !form.password) {
      showError(t('auth.fillAllFields'))
      return
    }

    if (mode === 'register' && !name) {
      showError(t('auth.enterTraderName'))
      return
    }

    if (mode === 'register' && form.password.length < 6) {
      showError(validationText.passwordMin)
      return
    }

    if (mode === 'register' && form.password !== form.confirmPassword) {
      showError(validationText.passwordMismatch)
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, email, form.password)
        await createUserDoc(cred.user)
        toast.success(t('auth.welcomeBack'))
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, form.password)
        await updateProfile(cred.user, { displayName: name })
        await createUserDoc(cred.user, name)
        toast.success(t('auth.accountCreated'))
      }
    } catch (error) {
      console.error('Auth failed:', error?.code, error)
      showError(getAuthErrorMessage(error, language))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setFormError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await createUserDoc(cred.user)
      toast.success(t('auth.welcome'))
    } catch (error) {
      console.error('Google sign-in failed:', error?.code, error)
      showError(getAuthErrorMessage(error, language) || t('auth.googleSignInFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setFormError('')
    setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(160deg, #020602, #040904, #050a05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(var(--ng-rgb),0.015) 1px, transparent 1px),linear-gradient(90deg, rgba(var(--ng-rgb),0.015) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--ng-rgb),0.06), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,207,255,0.04), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 20, display: 'flex', gap: 6 }}>
        <button type="button" onClick={() => setLanguage('en')} className="btn-ghost" style={{ padding: '6px 10px', opacity: language === 'en' ? 1 : 0.65 }}>{t('common.english')}</button>
        <button type="button" onClick={() => setLanguage('th')} className="btn-ghost" style={{ padding: '6px 10px', opacity: language === 'th' ? 1 : 0.65 }}>{t('common.thai')}</button>
      </div>

      {Array.from({ length: 20 }).map((_, index) => (
        <div key={index} className="particle" style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 2, height: 2, animationDuration: `${4 + Math.random() * 6}s`, animationDelay: `${Math.random() * 4}s` }} />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: 420, position: 'relative', zIndex: 10, background: 'linear-gradient(135deg, var(--card), var(--card2))', border: '1px solid var(--border2)', borderRadius: 16, padding: 32, boxShadow: '0 0 60px rgba(var(--ng-rgb),0.08), 0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(var(--ng-rgb),0.5), transparent)', borderRadius: '16px 16px 0 0' }} />

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div animate={{ boxShadow: ['0 0 10px rgba(var(--ng-rgb),0.3)', '0 0 20px rgba(var(--ng-rgb),0.5)', '0 0 10px rgba(var(--ng-rgb),0.3)'] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 52, height: 52, background: 'rgba(var(--ng-rgb),0.08)', border: '1px solid var(--ng)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>
            📈
          </motion.div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: 'var(--ng)', letterSpacing: 2 }}>TRADING HQ</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, letterSpacing: 1.5 }}>{t('auth.disciplineLine')}</div>
        </div>

        <div style={{ display: 'flex', background: 'rgba(var(--ng-rgb),0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: 3, marginBottom: 22 }}>
          {['login', 'register'].map((item) => (
            <button key={item} type="button" onClick={() => handleModeChange(item)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 6, cursor: 'pointer', background: mode === item ? 'rgba(var(--ng-rgb),0.12)' : 'transparent', color: mode === item ? 'var(--ng)' : 'var(--text3)', fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: 'all 0.2s', textTransform: 'uppercase' }}>
              {item === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', display: 'block', marginBottom: 4 }}>{t('auth.traderName')}</label>
                <input className="input-dark" placeholder={t('auth.traderNamePlaceholder')} value={form.name} onChange={(event) => setField('name', event.target.value)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', display: 'block', marginBottom: 4 }}>{t('auth.email')}</label>
            <input className="input-dark" type="email" placeholder="trader@example.com" value={form.email} onChange={(event) => setField('email', event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSubmit()} />
          </div>

          <div>
            <label style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', display: 'block', marginBottom: 4 }}>{t('auth.password')}</label>
            <input className="input-dark" type="password" placeholder={t('auth.passwordPlaceholder')} value={form.password} onChange={(event) => setField('password', event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSubmit()} />
          </div>

          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'Rajdhani', display: 'block', marginBottom: 4 }}>
                  {validationText.confirmPassword}
                </label>
                <input className="input-dark" type="password" placeholder={validationText.confirmPasswordPlaceholder} value={form.confirmPassword} onChange={(event) => setField('confirmPassword', event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSubmit()} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" style={{ justifyContent: 'center', width: '100%', padding: '10px', fontSize: 13, marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : (mode === 'login' ? t('auth.signIn') : t('auth.createAccount'))}
          </motion.button>

          {formError ? (
            <div style={{ padding: '9px 10px', border: '1px solid rgba(255,68,68,0.35)', borderRadius: 8, background: 'rgba(255,68,68,0.08)', color: '#ff8a8a', fontSize: 11, lineHeight: 1.4 }}>
              {formError}
            </div>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{t('auth.or')}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <motion.button whileHover={{ scale: 1.02, borderColor: 'var(--border2)' }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '9px', border: '1px solid var(--border)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'Exo 2', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </motion.button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'var(--text3)' }}>
          {t('auth.marketQuote')}
        </div>
      </motion.div>
    </div>
  )
}
