// src/components/hero/HeroBanner.jsx
import { motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 6,
  size: 1 + Math.random() * 2,
}))

export default function HeroBanner() {
  return (
    <div style={{
      position: 'relative',
      height: 148,
      background: 'linear-gradient(135deg, #020702 0%, #041404 25%, #061a06 55%, #030a03 100%)',
      overflow: 'hidden',
      flexShrink: 0,
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Forest depth layers */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 65% 60%, rgba(0,80,0,0.35) 0%, transparent 65%), radial-gradient(ellipse at 25% 80%, rgba(0,50,0,0.2) 0%, transparent 55%)',
        zIndex: 1,
      }} />

      {/* Animated fog */}
      <div className="fog-layer" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 100%, rgba(57,255,20,0.04) 0%, transparent 60%)',
        zIndex: 2,
      }} />
      <div className="fog-layer-2" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 80% 80%, rgba(0,100,0,0.06) 0%, transparent 50%)',
        zIndex: 2,
      }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div key={p.id} className="particle" style={{
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: p.size,
          height: p.size,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          opacity: 0.3,
          zIndex: 3,
        }} />
      ))}

      {/* Anime character silhouette */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'absolute', left: 16, bottom: 0,
          width: 108, height: 140, zIndex: 4,
        }}
      >
        <AnimeCharacter />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{ position: 'absolute', left: 144, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}
      >
        <div style={{ fontFamily: 'Rajdhani', fontSize: 34, fontWeight: 700, lineHeight: 1, letterSpacing: 1 }}>
          <span style={{ color: 'var(--ng)', textShadow: '0 0 20px rgba(57,255,20,0.6)' }}>TRADING</span>
          {' '}
          <span style={{ color: 'var(--text)' }}>JOURNAL</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#00ff88', letterSpacing: 3.5, fontWeight: 600, marginTop: 4 }}
        >
          Discipline. Patience. Execution.
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 9, fontStyle: 'italic', maxWidth: 330, lineHeight: 1.5 }}
        >
          "The goal is not to be right every time,<br />but to lose less when you are wrong."
        </motion.div>
      </motion.div>

      {/* Right overlay gradient */}
      <div style={{
        position: 'absolute', right: 0, top: 0, width: '45%', height: '100%',
        background: 'linear-gradient(to left, rgba(0,20,0,0.5), transparent)',
        zIndex: 4,
      }} />

      {/* Green ambient light at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
        background: 'linear-gradient(to top, rgba(57,255,20,0.04), transparent)',
        zIndex: 5,
      }} />
    </div>
  )
}

function AnimeCharacter() {
  return (
    <svg width="108" height="140" viewBox="0 0 108 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="charGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d5030" />
          <stop offset="60%" stopColor="#1a3020" />
          <stop offset="100%" stopColor="#0d1a10" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8a878" />
          <stop offset="100%" stopColor="#a08060" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#39ff14" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient glow */}
      <ellipse cx="54" cy="130" rx="40" ry="14" fill="url(#glowGrad)" />

      {/* Body / coat */}
      <path d="M24 140 L20 90 Q22 75 34 68 L44 110 L54 70 L64 110 L74 68 Q86 75 88 90 L84 140Z"
        fill="url(#charGrad)" stroke="rgba(57,255,20,0.2)" strokeWidth="0.5" />

      {/* Jacket details */}
      <path d="M44 110 L54 70 L64 110" stroke="rgba(57,255,20,0.3)" strokeWidth="0.5" fill="none" />
      <line x1="40" y1="80" x2="44" y2="95" stroke="rgba(57,255,20,0.15)" strokeWidth="0.5" />
      <line x1="68" y1="80" x2="64" y2="95" stroke="rgba(57,255,20,0.15)" strokeWidth="0.5" />

      {/* Neck */}
      <rect x="48" y="55" width="12" height="14" rx="3" fill="#b89870" />

      {/* Head */}
      <ellipse cx="54" cy="42" rx="20" ry="22" fill="url(#faceGrad)" />

      {/* Hair (dark, anime style) */}
      <path d="M34 38 Q34 18 54 16 Q74 18 74 38 Q74 28 66 24 Q60 20 54 20 Q48 20 42 24 Q36 28 34 38Z"
        fill="#1a1a2e" />
      <path d="M34 38 Q32 44 36 50 Q34 42 34 38Z" fill="#1a1a2e" />
      <path d="M74 38 Q76 44 72 50 Q74 42 74 38Z" fill="#1a1a2e" />
      {/* Hair strand */}
      <path d="M46 20 Q44 28 42 32" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Eyes (anime style) */}
      <ellipse cx="46" cy="42" rx="5" ry="6" fill="#1a2a1a" />
      <ellipse cx="62" cy="42" rx="5" ry="6" fill="#1a2a1a" />
      <ellipse cx="46" cy="42" rx="3.5" ry="4.5" fill="#2a6a3a" />
      <ellipse cx="62" cy="42" rx="3.5" ry="4.5" fill="#2a6a3a" />
      <ellipse cx="46" cy="42" rx="2" ry="2.5" fill="#0d1a0d" />
      <ellipse cx="62" cy="42" rx="2" ry="2.5" fill="#0d1a0d" />
      {/* Eye shine */}
      <ellipse cx="47.5" cy="40.5" rx="1" ry="1" fill="rgba(57,255,20,0.8)" />
      <ellipse cx="63.5" cy="40.5" rx="1" ry="1" fill="rgba(57,255,20,0.8)" />

      {/* Neon collar/scarf accent */}
      <path d="M38 65 Q54 72 70 65" stroke="rgba(57,255,20,0.5)" strokeWidth="2" fill="none" filter="url(#glow)" />
      <path d="M42 68 Q54 74 66 68" stroke="rgba(57,255,20,0.3)" strokeWidth="1" fill="none" />

      {/* Bottom glow line */}
      <line x1="20" y1="138" x2="88" y2="138" stroke="rgba(57,255,20,0.35)" strokeWidth="1.5" />
    </svg>
  )
}
