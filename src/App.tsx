import { Route, Routes, useLocation } from 'react-router-dom'

import { NeonFlowBackdrop } from '@/components/background/NeonFlowBackdrop'
import { Header } from '@/components/layout/Header'
import { LiquidGlassFilter } from '@/components/layout/LiquidGlassFilter'
import { SignInPage, SignUpPage } from '@/pages/AuthPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { LandingPage } from '@/pages/LandingPage'
import { RequireAuth } from '@/pages/RequireAuth'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function App() {
  useSmoothScroll()
  const { pathname } = useLocation()

  /*
   * The marketing page is built on a wall of dark poster art — dropping an
   * off-white canvas behind it would gut the whole thing. So the neon canvas
   * is the *app* surface (auth, dashboard) and the landing page keeps its
   * cinematic dark. Two deliberate skins, not one compromise.
   */
  const onLanding = pathname === '/'
  /*
   * The hub paints its own full-screen world, so the neon canvas behind it would
   * be an animating WebGL surface nobody can see — and it has to share frames
   * with the hub's own canvas and particle field.
   */
  const onHub = pathname === '/dashboard'

  return (
    <div className={onLanding ? 'relative min-h-svh bg-void' : 'relative min-h-svh'}>
      <LiquidGlassFilter />
      {!onLanding && !onHub && <NeonFlowBackdrop />}
      <Header />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  )
}
