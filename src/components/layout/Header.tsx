import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { DockNav } from '@/components/layout/DockNav'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { useEntrance } from '@/features/transition/EntranceContext'
import { useLiquidLens } from '@/hooks/useLiquidLens'
import { cn } from '@/lib/utils'

const MARKETING_LINKS = [
  { label: 'Devices', href: '/#devices' },
  { label: 'Inside the room', href: '/#features' },
  { label: 'Room types', href: '/#rooms' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Floating glass capsule, shared by every page.
 *
 * Sits above the shared liquidGL canvas on purpose. That canvas carries every
 * lens on the page and is placed just below the highest one (the cursor), so
 * anything below it — including this bar's own contents — would be painted
 * over by its own glass.
 *
 * Wide and near-invisible over the hero, then it contracts into a tighter,
 * denser pill once you start scrolling — so it reads as chrome only when you
 * actually need it. What sits inside depends on the route and on whether
 * anyone is signed in.
 */
export function Header() {
  const { scrollY } = useScroll()
  const { user, signOut } = useAuth()
  const { phase } = useEntrance()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const glassRef = useRef<HTMLDivElement>(null)

  const onLanding = pathname === '/'

  /*
   * The glass is a separate layer *behind* the bar, never the bar itself —
   * liquidGL sets `pointer-events: none` on any lens, which would make every
   * nav link and button in here unclickable.
   */
  useLiquidLens(glassRef, {
    enabled: onLanding,
    refraction: 0.035,
    aberration: 1.4,
    bevelDepth: 0.1,
    bevelWidth: 0.2,
    specular: true,
    shadow: false,
  })

  /*
   * Tied to scroll position rather than flipped at a threshold, so the bar
   * tightens continuously as you move. Spring-damped so a flick of the wheel
   * doesn't snap it.
   */
  const progress = useSpring(useTransform(scrollY, [0, 260], [0, 1], { clamp: true }), {
    stiffness: 220,
    damping: 38,
    mass: 0.35,
  })

  const width = useTransform(progress, [0, 1], ['min(74rem, 100%)', 'min(54rem, 100%)'])
  const padX = useTransform(progress, [0, 1], ['1.35rem', '0.9rem'])
  const padY = useTransform(progress, [0, 1], ['0.8rem', '0.45rem'])
  /* Glass gets denser as it tightens — thin and near-invisible over the hero,
     thick enough to read against page content once you're into the page. */
  const glassAlpha = useTransform(progress, [0, 1], [0, 1])
  /* Anchor links only mean anything on the landing page. */
  const links = onLanding ? MARKETING_LINKS : []

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[130] flex justify-center px-4 pt-4 md:pt-5">
      <motion.div
        className={cn(
          'pointer-events-auto relative flex items-center gap-3 rounded-full sm:gap-6',
          /* On the landing page the fill comes from the WebGL lens behind;
             elsewhere it's the CSS pill, since those routes sit on canvas
             backdrops that html2canvas can't photograph. */
          onLanding ? 'border border-white/12' : 'glass-pill-ink',
        )}
        initial={false}
        animate={{
          /* Bubbles out of nothing when the corridor lands, then behaves
             normally for the rest of the session. */
          scale: phase === 'tunnel' ? 0.6 : 1,
          opacity: phase === 'tunnel' ? 0 : 1,
        }}
        style={
          onLanding
            ? {
                width,
                paddingLeft: padX,
                paddingRight: padX,
                paddingTop: padY,
                paddingBottom: padY,
                // Fades the glass in over the hero without a hard cut.
                ['--glass-alpha' as string]: glassAlpha,
              }
            : undefined
        }
        transition={{ duration: phase === 'reveal' ? 0.85 : 0.55, ease: EASE }}
      >
        {onLanding && (
          <div
            ref={glassRef}
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full"
          />
        )}

        <Link
          to={user ? '/dashboard' : '/'}
          className="flex shrink-0 items-center gap-2.5 rounded-full transition-opacity hover:opacity-80"
        >
          <Logo />
          <span className="font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-chalk">
            SyncRoom
          </span>
        </Link>

        {links.length > 0 && (
          <DockNav
            items={links.map((link) => ({
              key: link.href,
              node: (
                <a
                  href={link.href}
                  className="block rounded-full text-[0.85rem] text-mist transition-colors duration-300 hover:text-chalk"
                >
                  {link.label}
                </a>
              ),
            }))}
          />
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {pathname !== '/dashboard' && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
              <span
                aria-hidden
                title={user.name}
                className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-signal to-signal-deep text-[0.75rem] font-semibold text-white"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/signup">Create room</Link>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </header>
  )
}
