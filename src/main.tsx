import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/features/auth/AuthProvider'
import { EntranceProvider } from '@/features/transition/EntranceProvider'
import App from './App.tsx'
import './index.css'

/*
 * The ngrok service-worker slips a `ngrok-skip-browser-warning` header onto
 * cross-origin media requests that a bare `<video>` element cannot add itself.
 * Without it, ngrok's free-tier interstitial page replaces the video bytes and
 * the element errors out. Registering early so the worker is active before any
 * video tries to load.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ngrok-sw.js').catch(() => undefined)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EntranceProvider>
          <App />
        </EntranceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
