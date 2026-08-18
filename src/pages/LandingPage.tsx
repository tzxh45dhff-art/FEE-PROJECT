import { useSearchParams } from 'react-router-dom'

import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/features/landing/components/AuthModal'
import { ActivityBeats } from '@/features/landing/components/ActivityBeats'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { Questions } from '@/features/landing/components/Questions'
import { RoomHero } from '@/features/landing/components/RoomHero'
import { GlassBackdrop } from '@/features/landing/components/GlassBackdrop'
import { ClosingInvite, TogetherProof } from '@/features/landing/components/TogetherProof'
import { InTheRoom, UnderTheHood } from '@/features/landing/components/UnderTheHood'

/**
 * The landing page.
 *
 * Everything sits on one moving sheet of dark glass, and the sections travel
 * over it. There is no progress rail: the page is short enough to read and a
 * second, permanent indicator of how far down you are was chrome competing
 * with the content it was measuring.
 *
 * The order is an argument, not a list: what it does, how you start, why the
 * sync holds, proof you can operate yourself, what else is in the room, then
 * the questions somebody would want answered before signing up.
 */

export function LandingPage() {
  /*
   * Which auth panel is open, carried in the URL rather than in state.
   *
   * The header is shared with every other route, so it cannot reach into this
   * page's state to open something. A query parameter is the one channel they
   * already both have — and it comes with the back button, a shareable
   * "/?signin" link, and no context or global store for one boolean.
   */
  const [params, setParams] = useSearchParams()
  const authMode = params.has('signup') ? 'signup' : params.has('signin') ? 'signin' : null

  const closeAuth = () => {
    const next = new URLSearchParams(params)
    next.delete('signin')
    next.delete('signup')
    setParams(next, { replace: true })
  }

  return (
    <>
      {/* Keyboard users should not have to walk the whole page to reach it. */}
      <a
        href="#watch"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-chalk focus:px-4 focus:py-2 focus:text-[0.85rem] focus:text-void"
      >
        Skip to what it does
      </a>

      {/*
        The silk sits behind everything below the hero, fixed, so the sections
        slide over a surface that is itself slowly moving. Pinned rather than
        repeated per section: one context for the page, not one per panel.
      */}
      <GlassBackdrop className="pointer-events-none fixed inset-0 -z-10" />

      <main className="relative">
        <RoomHero />
        <ActivityBeats />
        <HowItWorks />
        <UnderTheHood />
        <TogetherProof />
        <InTheRoom />
        <Questions />
        <ClosingInvite />
      </main>

      <Footer />

      {authMode && <AuthModal mode={authMode} onClose={closeAuth} />}
    </>
  )
}
