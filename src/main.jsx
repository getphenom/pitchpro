import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { ThemeProvider } from '@/lib/ThemeProvider.jsx'
import '@/index.css'
// v3 cache bust
ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)