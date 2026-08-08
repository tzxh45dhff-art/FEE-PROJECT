import { StreakField } from '@/components/background/StreakField'
import { Footer } from '@/components/layout/Footer'
import { LiquidCursor } from '@/features/landing/components/LiquidCursor'
import { ClosingCTA } from '@/features/landing/components/ClosingCTA'
import { DeviceShowcase } from '@/features/landing/components/DeviceShowcase'
import { FeatureShowcase } from '@/features/landing/components/FeatureShowcase'
import { Hero } from '@/features/landing/components/Hero'
import { InfoSection } from '@/features/landing/components/InfoSection'

export function LandingPage() {
  return (
    <>
      <LiquidCursor />
      <main>
        <Hero />

        {/*
          Everything below the hero shares one streak field. Sticky rather than
          fixed so it's scoped to this stretch of the page — the hero keeps its
          own treatment and the footer isn't dragged into it.
        */}
        <div className="relative bg-void">
          <div
            aria-hidden
            className="pointer-events-none sticky top-0 z-0 h-svh w-full overflow-hidden"
          >
            <StreakField className="absolute inset-0 size-full" />
            <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_45%,transparent,rgb(0_0_0/0.55))]" />
          </div>

          <div className="relative z-10 -mt-[100svh]">
            <DeviceShowcase />
            <FeatureShowcase />
            <InfoSection />
            <ClosingCTA />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
