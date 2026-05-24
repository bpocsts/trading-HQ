export const THEME_STORAGE_KEY = 'trading-journal-theme'

export const themeOptions = [
  {
    value: 'neon',
    name: 'Dark',
    accent: '#e5e7eb',
    description: 'Clean dark mode with subtle scan glow',
    unlockLevel: 1,
  },
  {
    value: 'crimson',
    name: 'Space',
    accent: '#8b5cf6',
    description: 'Deep space with nebula glow and soft twinkling stars',
    unlockLevel: 4,
  },
  {
    value: 'cyan',
    name: 'Water',
    accent: '#38d9ff',
    description: 'Deep water blue with aqua glow',
    unlockLevel: 6,
  },
  {
    value: 'amber',
    name: 'Snow',
    accent: '#dff7ff',
    description: 'Frosted white and icy blue',
    unlockLevel: 8,
  },
  {
    value: 'solar',
    name: 'Leaf Falling',
    accent: '#ff5a7a',
    description: 'Rose autumn palette with falling maple leaves',
    unlockLevel: 10,
  },
]

export function getStoredTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'neon'
}

export function applyTheme(theme) {
  const safeTheme = themeOptions.some((option) => option.value === theme) ? theme : 'neon'
  document.documentElement.dataset.theme = safeTheme
  localStorage.setItem(THEME_STORAGE_KEY, safeTheme)
  return safeTheme
}
