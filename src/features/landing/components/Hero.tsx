import { Suspense, lazy, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { ModelBoundary } from '@/components/background/ModelBoundary'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { hasModels, modelUrl } from '@/lib/models'

/* three.js lives behind these imports and nowhere else in the landing bundle. */
const HeroOrb = lazy(() => import('@/features/landing/components/HeroOrb'))
const ModelObject = lazy(() => import('@/components/background/ModelObject'))

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end start'],
  })

  /* Three depths leaving at three speeds — the orb hangs back, the copy goes
     first. That difference is the whole parallax. */
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  const still = { y: undefined, scale: undefined, opacity: undefined }

  /*
   * A real model always wins. Drop `orb.glb` into src/assets/models/ and it
   * takes this slot — auto-centred and auto-scaled, so export scale doesn't
   * matter. Without one, the procedural iridescent sphere stands in.
   */
  const orbModel = hasModels ? modelUrl('orb') : undefined

  return (
    <section
      ref={section}
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-void px-6 pb-24 pt-32 md:px-10 md:pb-28 md:pt-40"
    >
      {/* The bubble sits between the two halves of the headline, so the type
          crosses in front of it and the glass refracts the page behind. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
        style={reduced ? still : { y: orbY, scale: orbScale }}
      >
        {/*
          WebGL without preserveDrawingBuffer photographs as blank, so the
          orb is excluded from the snapshot rather than punching a hole in it.

          Smaller and lifted on phones. The headline is heavy enough to read
          across the glass — that crossing is the point — but the standfirst
          under it is small grey text, and centring a bright sphere in a
          narrow column put it directly behind those two lines. Raising the
          orb to sit behind the headline alone keeps the effect and gives the
          copy a dark ground again.
        */}
        <div
          data-liquid-ignore
          className="aspect-square w-[min(56vw,42rem)] -translate-y-[14vh] sm:w-[min(78vw,42rem)] sm:translate-y-0"
        >
          <Suspense fallback={null}>
            {orbModel ? (
              <ModelBoundary fallback={<HeroOrb />}>
                <ModelObject url={orbModel} spin={0.18} still={reduced} />
              </ModelBoundary>
            ) : (
              <HeroOrb />
            )}
          </Suspense>
        </div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(70%_55%_at_50%_50%,color-mix(in_oklab,var(--color-glow-cool)_12%,transparent),transparent_70%)]"
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 z-30 opacity-[0.16]" />

      <motion.div
        className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        style={reduced ? still : { y: copyY, opacity: copyOpacity }}
      >
        <h1
          data-cursor="text"
          className="font-display text-[clamp(2.9rem,10.5vw,8.5rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-chalk"
        >
          One room.
          <span className="block">Everything</span>
          <span className="block">you do together.</span>
        </h1>
      </motion.div>

      {/* Split footer, mirroring the reference: pitch left, action right. */}
      <motion.div
        className="relative z-20 mx-auto mt-14 flex w-full max-w-6xl flex-col gap-8 md:mt-20 md:flex-row md:items-end md:justify-between"
        style={reduced ? still : { opacity: copyOpacity }}
      >
        <div className="max-w-sm text-left" data-cursor="text">
          <p className="font-display text-xl font-semibold tracking-[-0.02em] text-chalk md:text-2xl">
            Everything you do together
          </p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-mist">
            Chat, watch, listen, play and build — in one room that never closes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Create a room</Button>
          <Button asChild variant="outline" size="lg">
            <a href="#devices">
              See how it works
              <ArrowRight aria-hidden />
            </a>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
