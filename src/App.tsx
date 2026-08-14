import { Route, Routes, useLocation } from 'react-router-dom'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NeonFlowBackdrop } from '@/components/background/NeonFlowBackdrop'
import { Header } from '@/components/layout/Header'
import { LiquidGlassFilter } from '@/components/layout/LiquidGlassFilter'
import { SignInPage, SignUpPage } from '@/pages/AuthPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { LandingPage } from '@/pages/LandingPage'
import { RequireAuth } from '@/pages/RequireAuth'
import { useLiquidPointer } from '@/hooks/useLiquidPointer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

export default function App() {
  useSmoothScroll()
  /* One listener for every liquid-glass control on the page. */
  useLiquidPointer()
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

      {/*
        The last line of defence.
        Any render error that gets past a feature's own boundary would
        otherwise unmount the entire application to a black page with no way
        back. Keyed on the path so navigating away clears it.
      */}
      <ErrorBoundary
        resetKey={pathname}
        fallback={(error, reset) => (
          <div className="grid min-h-svh place-items-center p-6">
            <div className="max-w-sm text-center">
              <h1 className="font-display text-[1.4rem] font-semibold text-chalk">
                Something broke on this screen
              </h1>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-mist">
                {error.message || 'An unexpected error stopped the page from rendering.'}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full bg-chalk px-4 py-2.5 text-[0.85rem] font-medium text-void"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      >
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
      </ErrorBoundary>
    </div>
  )
}
