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
    <div
      style={{
        position: 'relative',
        height: 148,
        background: 'linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 28%, var(--bg3) 62%, var(--bg1) 100%)',
        overflow: 'hidden',
        flexShrink: 0,
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 70% 58%, rgba(var(--ng-rgb),0.18) 0%, transparent 65%), radial-gradient(ellipse at 22% 82%, rgba(var(--ng-rgb),0.09) 0%, transparent 55%)',
          zIndex: 1,
        }}
      />

      <div
        className="fog-layer"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(var(--ng-rgb),0.04) 0%, transparent 60%)',
          zIndex: 2,
        }}
      />
      <div
        className="fog-layer-2"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 82% 78%, rgba(var(--ng-rgb),0.07) 0%, transparent 50%)',
          zIndex: 2,
        }}
      />

      {PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.3,
            zIndex: 3,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        style={{
          position: 'relative',
          zIndex: 5,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px 0 30px',
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 10px', border: '1px solid rgba(var(--ng-rgb),0.16)', borderRadius: 999, background: 'rgba(var(--ng-rgb),0.05)', marginBottom: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ng)', boxShadow: '0 0 10px rgba(var(--ng-rgb),0.65)' }} />
            <span style={{ fontSize: 9, color: 'var(--ng)', letterSpacing: 2.2, textTransform: 'uppercase', fontFamily: 'Rajdhani', fontWeight: 700 }}>
              Trader Workspace
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ fontFamily: 'Rajdhani', fontSize: 38, fontWeight: 700, lineHeight: 0.98, letterSpacing: 1.2 }}
          >
            <span style={{ color: 'var(--ng)', textShadow: '0 0 20px rgba(var(--ng-rgb),0.45)' }}>TRADING</span>{' '}
            <span style={{ color: 'var(--text)' }}>JOURNAL</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontFamily: 'Rajdhani', fontSize: 12.5, color: 'var(--ng)', letterSpacing: 3.8, fontWeight: 600, marginTop: 8 }}
          >
            Discipline. Patience. Execution.
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}
          >
            <div style={{ width: 54, height: 1, background: 'linear-gradient(90deg, rgba(var(--ng-rgb),0.75), transparent)' }} />
            <div style={{ fontSize: 10.5, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Trade with structure. Review with honesty.
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '45%',
          height: '100%',
          background: 'linear-gradient(to left, rgba(var(--ng-rgb),0.12), transparent)',
          zIndex: 4,
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: 'linear-gradient(to top, rgba(var(--ng-rgb),0.04), transparent)',
          zIndex: 5,
        }}
      />
    </div>
  )
}
