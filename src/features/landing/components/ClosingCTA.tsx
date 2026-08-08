import { GradientGlow } from '@/components/background/GradientGlow'
import { PosterWall } from '@/components/background/PosterWall'
import { Button } from '@/components/ui/button'

export function ClosingCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-void px-6 py-32 md:px-10 md:py-44">
      {/* Same background parts as the hero, dialled right down. */}
      <PosterWall rows={3} postersPerRow={16} deckOffset={90} dim={0.24} />
      <GradientGlow intensity="soft" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_50%,rgb(2_3_14/0.9),rgb(2_3_14/0.55)_50%,transparent_80%)]"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="font-display text-[clamp(2.25rem,6.5vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-chalk">
          Your room is waiting.
        </h2>
        <p className="mt-5 text-base text-mist md:text-lg">Free to create. Ready in seconds.</p>
        <Button size="lg" className="mt-10">
          Create your room
        </Button>
      </div>
    </section>
  )
}
