import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { storage, db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

export default function ScreenshotsPage() {
  const { user } = useAuth()
  const [screenshots, setScreenshots] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ caption: '', pair: '', date: new Date().toISOString().split('T')[0] })
  const fileRef = useRef()

  useEffect(() => {
    if (!user) return

    const screenshotQuery = query(
      collection(db, 'screenshots'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(screenshotQuery, (snapshot) => {
      setScreenshots(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    return unsubscribe
  }, [user])

  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !user) return

    setUploading(true)
    setProgress(0)

    const storageRef = ref(storage, `screenshots/${user.uid}/${Date.now()}_${file.name}`)
    const task = uploadBytesResumable(storageRef, file)

    task.on(
      'state_changed',
      (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      () => {
        toast.error('Upload failed')
        setUploading(false)
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        await addDoc(collection(db, 'screenshots'), {
          userId: user.uid,
          url,
          ...form,
          fileName: file.name,
          createdAt: serverTimestamp(),
        })

        setUploading(false)
        setProgress(0)
        setForm({ caption: '', pair: '', date: new Date().toISOString().split('T')[0] })
        toast.success('Screenshot uploaded! 📷')
      }
    )
  }

  const pairs = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDUSD']

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 22, fontWeight: 700, color: '#00cfff', letterSpacing: 2 }}>SCREENSHOTS</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Visual archive of your trade setups</div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="card-title"><span>📷</span>Upload Screenshot</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Caption</div>
            <input className="input-dark" placeholder="Setup description..." value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Pair</div>
            <select className="input-dark" value={form.pair} onChange={(event) => setForm((current) => ({ ...current, pair: event.target.value }))}>
              <option value="">Select pair...</option>
              {pairs.map((pair) => <option key={pair}>{pair}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', fontFamily: 'Rajdhani', letterSpacing: 1.5, marginBottom: 4 }}>Date</div>
            <input className="input-dark" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
          </div>
          <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? `${progress}%` : '+ Upload'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

        {uploading && (
          <div style={{ marginTop: 10 }}>
            <div className="progress-bar">
              <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {!screenshots.length && (
          <motion.div
            whileHover={{ borderColor: 'rgba(0,207,255,0.4)' }}
            onClick={() => fileRef.current?.click()}
            style={{ marginTop: 12, border: '2px dashed rgba(0,207,255,0.2)', borderRadius: 10, padding: '30px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Click or drag and drop your chart screenshots here</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>PNG, JPG, WEBP supported</div>
          </motion.div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={screenshot.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(0,207,255,0.15)' }}
            onClick={() => setSelected(screenshot)}
            className="glass-card"
            style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
          >
            <div style={{ height: 130, background: 'rgba(0,207,255,0.05)', overflow: 'hidden', position: 'relative' }}>
              <img src={screenshot.url} alt={screenshot.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {screenshot.pair && (
                <div style={{ position: 'absolute', top: 6, left: 6 }}>
                  <span className="tag tag-blue">{screenshot.pair}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{screenshot.caption || 'No caption'}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)' }}>{screenshot.date}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{ maxWidth: '85vw', maxHeight: '85vh', position: 'relative' }}
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selected.url} alt={selected.caption} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, border: '1px solid rgba(0,207,255,0.3)' }} />
              <div style={{ background: 'rgba(7,15,7,0.9)', borderRadius: '0 0 12px 12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{selected.caption || 'No caption'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{selected.pair} • {selected.date}</div>
                </div>
                <button className="btn-ghost" onClick={() => setSelected(null)}>✕ Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
