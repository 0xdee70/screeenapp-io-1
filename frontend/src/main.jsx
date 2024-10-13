import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider } from 'next-themes'

createRoot(document.getElementById('root')).render(
  <NextUIProvider>
    <ThemeProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ThemeProvider>
  </NextUIProvider>
)
