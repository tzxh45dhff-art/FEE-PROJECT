import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'

import { ModelBoundary } from '@/components/background/ModelBoundary'
import { revealItem } from '@/features/dashboard/reveal'
import { hasModels, modelUrl } from '@/lib/models'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const ModelObject = lazy(() => import('@/components/background/ModelObject'))

/** Stand-in until a `toy.glb` lands — a lit plinth with nothing on it yet. */
function EmptyPlinth() {
  return (
    <div className="relative grid size-full place-items-center">
      <div className="absolute bottom-[22%] size-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-signal)_22%,transparent),transparent_70%)] blur-2xl" />

      <div className="relative -translate-y-4">
        <div className="glass size-28 animate-float-slow rounded-full ring-1 ring-inset ring-white/20 md:size-36" />
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(110%_110%_at_28%_18%,rgb(255_255_255/0.5),transparent_58%)]" />
      </div>

      <div className="absolute bottom-[16%] h-1 w-40 rounded-full bg-[radial-gradient(ellipse,rgb(0_0_0/0.65),transparent_70%)] blur-sm" />
    </div>
  )
}

/**
 * The one interactive object on the dashboard.
 *
 * Drop `toy.glb` into `src/assets/models/` and it takes this slot — the loader
 * auto-centres and auto-scales it, so export scale doesn't matter. Until then
 * the plinth stands on its own rather than showing a broken hole.
 */
export function ToyStage() {
  const reduced = usePrefersReducedMotion()
  const url = hasModels ? modelUrl('toy') : undefined

  return (
    <motion.section variants={revealItem} className="panel relative overflow-hidden rounded-panel">
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.1fr] md:items-center md:p-10">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-dusk">The room, in your hand</p>
          <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.025em] text-chalk">
            Give it a spin.
          </h3>
          <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-mist">
            {url
              ? 'Drag it. It keeps spinning after you let go.'
              : 'Waiting on its model — drop a toy.glb into src/assets/models/ and it appears here.'}
          </p>
        </div>

        <div className="relative aspect-square max-h-80 w-full">
          {url ? (
            <ModelBoundary fallback={<EmptyPlinth />}>
              <Suspense fallback={<EmptyPlinth />}>
                <ModelObject url={url} spin={0.3} still={reduced} />
              </Suspense>
            </ModelBoundary>
          ) : (
            <EmptyPlinth />
          )}
        </div>
      </div>
    </motion.section>
  )
}
