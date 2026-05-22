# 🎮 Trading Journal — MMORPG HQ Dashboard

> Dark fantasy cyberpunk trading dashboard with anime RPG aesthetic

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Firebase](https://img.shields.io/badge/Firebase-10-orange) ![Highcharts](https://img.shields.io/badge/Highcharts-11-green)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Fill in your Firebase credentials in .env

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── sidebar/         # Sidebar navigation + Today Focus
│   ├── hero/            # Cinematic banner with anime character
│   ├── stats/           # HP / Mood / Focus / Motivation cards
│   ├── charts/          # Highcharts: Radar, Area, Donut, Column
│   ├── cards/           # Dashboard section cards
│   ├── table/           # Recent trades table
│   └── ui/              # AddTradeModal, shared UI
├── pages/
│   ├── Dashboard.jsx    # Main dashboard (all sections)
│   ├── TradePage.jsx    # Trade log full page
│   └── PlaceholderPage  # Other routes stub
├── store/
│   └── useStore.js      # Zustand global state
├── data/
│   └── mockData.js      # All dummy data
├── lib/
│   └── firebase.js      # Firebase init
└── styles/
    └── globals.css      # Global CSS variables + utilities
```

---

## 🔥 Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage**
5. Copy your config to `.env`

See `FIRESTORE_SCHEMA.md` for full collection structure.

---

## 🎨 Theme

| Variable | Value | Usage |
|---|---|---|
| `--ng` | `#39ff14` | Primary neon green |
| `--ng2` | `#00ff88` | Secondary neon |
| `--bg1` | `#050a05` | Darkest background |
| `--card` | `#0b160b` | Card background |
| `--red` | `#ff4444` | Losses / negatives |
| `--blue` | `#00cfff` | Focus accent |
| `--purple` | `#c084fc` | Mood accent |
| `--yellow` | `#ffcc00` | Motivation / gold |

---

## 📊 Charts (Highcharts)

| Chart | Component | Data |
|---|---|---|
| Radar | `RadarChart` | 6-dimension trader stats |
| Area/Spline | `PerformanceChart` | Weekly P/L |
| Donut | `EmotionChart` | Emotion distribution |
| Column+Line | `MonthlyChart` | Monthly P/L + cumulative |

---

## 🏗️ Extending the App

### Add a new page
1. Create `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add nav item in `src/data/mockData.js > navItems`

### Connect Firebase for real data
Replace mock imports in components with Firestore queries:
```js
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
const tradesRef = collection(db, 'trades')
```

---

## 🎯 Features

- ✅ Dark fantasy cyberpunk UI
- ✅ Animated neon glow effects
- ✅ Glassmorphism cards
- ✅ Highcharts (Radar, Area, Donut, Column)
- ✅ Framer Motion animations
- ✅ Zustand state management
- ✅ React Router v6
- ✅ Add Trade modal with RR auto-calculation
- ✅ Quest checkbox system
- ✅ Habit tracker with streaks
- ✅ Firebase-ready architecture
- ✅ Firestore schema documented
- ✅ Responsive layout

---

## 📦 Build for Production

```bash
npm run build
# Output in /dist
```
