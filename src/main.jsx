// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Highcharts from 'highcharts'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import './styles/globals.css'
import { applyTheme, getStoredTheme } from './lib/theme'

Highcharts.setOptions({
  accessibility: {
    enabled: false,
  },
})

applyTheme(getStoredTheme())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
