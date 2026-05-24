import PresetAvatar from './PresetAvatar'

const PROFILE_FRAMES = [
  { key: 'bronze', label: 'Bronze', badge: 'BRONZE', glow: '#cd7f32', accent: '#ffb15c' },
  { key: 'silver', label: 'Silver', badge: 'SILVER', glow: '#cfd8e3', accent: '#ffffff' },
  { key: 'gold', label: 'Gold', badge: 'GOLD', glow: '#ffd34d', accent: '#fff1a8' },
  { key: 'platinum', label: 'Platinum', badge: 'PLATINUM', glow: '#9fe8ff', accent: '#ffffff' },
  { key: 'emerald', label: 'Emerald', badge: 'EMERALD', glow: '#47ff7a', accent: '#c7ffd5' },
  { key: 'ruby', label: 'Ruby', badge: 'RUBY', glow: '#ff4b3e', accent: '#ffb3a8' },
  { key: 'sapphire', label: 'Sapphire', badge: 'SAPPHIRE', glow: '#35b7ff', accent: '#c8efff' },
  { key: 'royal', label: 'Royal', badge: 'ROYAL', glow: '#c084fc', accent: '#f1d6ff' },
  { key: 'legend', label: 'Legend', badge: 'LEGEND', glow: '#ffef7a', accent: '#fff9cf' },
  { key: 'mythic', label: 'Mythic', badge: 'MYTHIC', glow: '#ff3df2', accent: '#9ffcff' },
]

export function getProfileFrames() {
  return PROFILE_FRAMES
}

export function getProfileFrame(frameKey, level = 1) {
  if (frameKey) {
    const explicit = PROFILE_FRAMES.find((frame) => frame.key === frameKey)
    if (explicit) return explicit
  }

  const index = Math.min(PROFILE_FRAMES.length - 1, Math.max(0, Math.ceil(level || 1) - 1))
  return PROFILE_FRAMES[index] || PROFILE_FRAMES[0]
}

function getFrameEffects(frame) {
  if (frame.key === 'legend' || frame.key === 'mythic') {
    return {
      animation: 'profileFramePulse 2.8s ease-in-out infinite',
      boxShadow: `0 0 28px ${frame.glow}75, 0 0 12px ${frame.accent}40, inset 0 0 22px ${frame.glow}2e`,
    }
  }

  return {
    animation: 'none',
    boxShadow: `0 0 22px ${frame.glow}55, inset 0 0 18px ${frame.glow}24`,
  }
}

export default function ProfileFrame({
  avatarDataUrl,
  avatarPreset,
  name,
  level = 1,
  frameKey,
  width = 86,
  height = 98,
  showBadge = true,
}) {
  const frame = getProfileFrame(frameKey, level)
  const effects = getFrameEffects(frame)
  const badgeHeight = showBadge ? 16 : 0
  const avatarHeight = height - badgeHeight
  const avatar = avatarDataUrl ? (
    <img src={avatarDataUrl} alt={name || 'Trader avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  ) : (
    <PresetAvatar presetKey={avatarPreset || 'neo'} size={Math.max(avatarHeight - 8, 50)} alt={name || 'Trader avatar'} />
  )

  return (
    <div style={{ position: 'relative', width, height, flexShrink: 0 }}>
      <style>{`
        @keyframes profileFramePulse {
          0%, 100% { transform: scale(1); opacity: 0.96; }
          50% { transform: scale(1.018); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width,
          height: avatarHeight,
          borderRadius: 12,
          padding: 4,
          background: `linear-gradient(135deg, ${frame.glow}55, rgba(6,13,7,0.93) 34%, ${frame.accent}38 72%, rgba(6,13,7,0.98))`,
          border: `1px solid ${frame.glow}`,
          overflow: 'hidden',
          transformOrigin: 'center',
          ...effects,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 2,
            borderRadius: 10,
            border: `1px solid ${frame.accent}77`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 7,
            left: 7,
            right: 7,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${frame.accent}, transparent)`,
            opacity: 0.95,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 9,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(16,28,16,0.95), rgba(7,14,7,0.98))',
            boxShadow: 'inset 0 0 14px rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatar}
        </div>
      </div>

      {showBadge && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            padding: '2px 8px',
            borderRadius: 999,
            background: 'rgba(5,12,6,0.96)',
            border: `1px solid ${frame.glow}`,
            color: frame.glow,
            fontFamily: 'Rajdhani',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: 0.9,
            textTransform: 'uppercase',
            boxShadow: `0 0 14px ${frame.glow}55`,
            whiteSpace: 'nowrap',
            zIndex: 4,
          }}
        >
          {frame.badge}
        </div>
      )}
    </div>
  )
}
