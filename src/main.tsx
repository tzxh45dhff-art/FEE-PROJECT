import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from '@/features/auth/AuthProvider'
import { EntranceProvider } from '@/features/transition/EntranceProvider'
import App from './App.tsx'
import './index.css'

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
