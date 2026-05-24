const PRESET_AVATARS = [
  { key: 'neo', label: 'Neo', backgroundTop: '#1a3520', backgroundBottom: '#09140b', skinTop: '#c8a878', skinBottom: '#9a7858', hair: '#1a1a2e', shirt: '#1a3020', glow: '#39ff14' },
  { key: 'cyber', label: 'Cyber', backgroundTop: '#18263a', backgroundBottom: '#091019', skinTop: '#d8b08a', skinBottom: '#b38562', hair: '#0d1726', shirt: '#14263c', glow: '#00cfff' },
  { key: 'ember', label: 'Ember', backgroundTop: '#332012', backgroundBottom: '#120906', skinTop: '#d6a07b', skinBottom: '#b07452', hair: '#2a140d', shirt: '#2f1d14', glow: '#ff8c42' },
  { key: 'violet', label: 'Violet', backgroundTop: '#261c38', backgroundBottom: '#0f0a16', skinTop: '#d2a57d', skinBottom: '#a87a58', hair: '#170f24', shirt: '#251a35', glow: '#c084fc' },
  { key: 'gold', label: 'Gold', backgroundTop: '#352d15', backgroundBottom: '#141006', skinTop: '#deb28a', skinBottom: '#b98a63', hair: '#20180b', shirt: '#2b2411', glow: '#ffcc00' },
  { key: 'mint', label: 'Mint', backgroundTop: '#16312a', backgroundBottom: '#07120f', skinTop: '#cfa27c', skinBottom: '#a47450', hair: '#10211d', shirt: '#17352d', glow: '#55efc4' },
]

export function getAvatarPreset(key) {
  return PRESET_AVATARS.find((avatar) => avatar.key === key) || PRESET_AVATARS[0]
}

export function getAvatarPresets() {
  return PRESET_AVATARS
}

export default function PresetAvatar({ presetKey = 'neo', size = 68, alt = 'Avatar' }) {
  const avatar = getAvatarPreset(presetKey)
  const width = Math.round(size * 0.94)
  const height = size
  const gradientId = `bg-${avatar.key}-${size}`
  const faceGradientId = `face-${avatar.key}-${size}`

  return (
    <div style={{ width, height, borderRadius: 9, border: `1px solid ${avatar.glow}55`, overflow: 'hidden', flexShrink: 0, boxShadow: `0 0 12px ${avatar.glow}22` }} aria-label={alt}>
      <svg width={width} height={height} viewBox="0 0 64 68" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={avatar.backgroundTop} />
            <stop offset="100%" stopColor={avatar.backgroundBottom} />
          </linearGradient>
          <linearGradient id={faceGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={avatar.skinTop} />
            <stop offset="100%" stopColor={avatar.skinBottom} />
          </linearGradient>
        </defs>
        <rect width="64" height="68" fill={`url(#${gradientId})`} />
        <path d="M8 68 L10 45 Q14 36 22 32 L32 48 L42 32 Q50 36 54 45 L56 68Z" fill={avatar.shirt} />
        <path d="M22 32 L32 48 L42 32" stroke={`${avatar.glow}55`} strokeWidth="0.5" fill="none" />
        <rect x="27" y="26" width="10" height="7" rx="2" fill={avatar.skinBottom} />
        <ellipse cx="32" cy="20" rx="14" ry="15" fill={`url(#${faceGradientId})`} />
        <path d="M18 18 Q18 5 32 4 Q46 5 46 18 Q42 10 32 9 Q22 10 18 18Z" fill={avatar.hair} />
        <path d="M18 18 Q16 23 19 28" fill={avatar.hair} />
        <path d="M46 18 Q48 23 45 28" fill={avatar.hair} />
        <path d="M26 9 Q24 15 23 18" stroke={avatar.hair} strokeWidth="3.5" strokeLinecap="round" />
        <ellipse cx="26" cy="20" rx="4" ry="5" fill="#1a2a1a" />
        <ellipse cx="38" cy="20" rx="4" ry="5" fill="#1a2a1a" />
        <ellipse cx="26" cy="20" rx="2.8" ry="3.8" fill={`${avatar.glow}77`} />
        <ellipse cx="38" cy="20" rx="2.8" ry="3.8" fill={`${avatar.glow}77`} />
        <ellipse cx="26" cy="20" rx="1.5" ry="2" fill="#0a1a0d" />
        <ellipse cx="38" cy="20" rx="1.5" ry="2" fill="#0a1a0d" />
        <ellipse cx="27" cy="19" rx="0.8" ry="0.8" fill={avatar.glow} />
        <ellipse cx="39" cy="19" rx="0.8" ry="0.8" fill={avatar.glow} />
        <line x1="8" y1="66" x2="56" y2="66" stroke={`${avatar.glow}66`} strokeWidth="1.5" />
      </svg>
    </div>
  )
}
