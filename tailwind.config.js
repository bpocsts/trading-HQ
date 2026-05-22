/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: { DEFAULT: '#39ff14', dim: '#00e676', faint: '#00ff8820' },
        dark: { 1: '#050a05', 2: '#070f07', 3: '#0a150a', 4: '#0d1c0d', card: '#0b160b', card2: '#0f1e0f' }
      },
      fontFamily: {
        rajdhani: ['Rajdhani','sans-serif'],
        exo: ['"Exo 2"','sans-serif'],
        mono: ['"Share Tech Mono"','monospace']
      },
      boxShadow: {
        neon: '0 0 20px rgba(57,255,20,0.3)',
        'neon-sm': '0 0 8px rgba(57,255,20,0.2)',
        'neon-lg': '0 0 40px rgba(57,255,20,0.15)'
      }
    }
  },
  plugins: []
}
