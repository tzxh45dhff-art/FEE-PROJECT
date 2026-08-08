import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

import { IMac, Laptop, Phone, Tablet } from '@/features/landing/components/devices/Devices'
import { Eyebrow } from '@/features/landing/components/ScrollRow'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type DeviceItemProps = {
  label: string
  className: string
  y?: MotionValue<string>
  children: ReactNode
}

function DeviceItem({ label, className, y, children }: DeviceItemProps) {
  return (
    <motion.div className={cn('flex shrink-0 flex-col items-center', className)} style={{ y }}>
      <div className="w-full">{children}</div>
      <span className="mt-5 text-[0.82rem] text-mist">{label}</span>
    </motion.div>
  )
}

export function DeviceShowcase() {
  const section = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })

  /* Four depths, so the row has a little life as it passes. */
  const phoneY = useTransform(scrollYProgress, [0, 1], ['14%', '-14%'])
  const tabletY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const laptopY = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])
  const imacY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  return (
    <section
      ref={section}
      id="devices"
      className="relative overflow-hidden px-6 py-28 md:px-10 md:py-36"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">Anywhere you already are</Eyebrow>
          <h2 className="mt-5 font-display text-[clamp(2rem,5.4vw,3.8rem)] font-semibold leading-[1.0] tracking-[-0.035em] text-chalk">
            Same room.
            <span className="block text-mist">Whatever you’re holding.</span>
          </h2>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-center gap-x-8 gap-y-12 md:mt-20 lg:flex-nowrap lg:gap-10">
          <DeviceItem
            label="Phone"
            className="w-[36%] max-w-[8.5rem] lg:w-[10%]"
            y={reduced ? undefined : phoneY}
          >
            <Phone />
          </DeviceItem>

          <DeviceItem
            label="Tablet"
            className="w-[52%] max-w-[15rem] lg:w-[21%]"
            y={reduced ? undefined : tabletY}
          >
            <Tablet />
          </DeviceItem>

          <DeviceItem
            label="Laptop"
            className="w-[78%] max-w-[26rem] lg:w-[33%]"
            y={reduced ? undefined : laptopY}
          >
            <Laptop />
          </DeviceItem>

          <DeviceItem
            label="Desktop"
            className="w-[78%] max-w-[26rem] lg:w-[30%]"
            y={reduced ? undefined : imacY}
          >
            <IMac />
          </DeviceItem>
        </div>
      </div>
    </section>
  )
}
