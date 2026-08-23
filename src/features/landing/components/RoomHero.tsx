import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { HeroBallpit } from '@/features/landing/components/HeroBallpit'
import { ScrubbedRoom } from '@/features/landing/components/ScrubbedRoom'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SCENES } from '@/lib/scenes'

/**
 * The hero is the product.
 *
 * The page this replaced opened on a floating iridescent orb — a shape that
 * means nothing, in front of a headline that had to do all the explaining, and
 * which cost a WebGL context and the whole of three.js to draw. Meanwhile the
 * actual app has the one image nobody else can show: a room, lit at golden
 * hour, with people standing in it.
 *
 * So that is the hero. The real backdrop, the real chrome the app puts on top
 * of it, and the headline sitting inside the scene rather than floating over a
 * decoration. Nothing here is 3D: the backdrop is the same still the hub uses,
 * and everything else is DOM, so the landing page no longer pulls a renderer
 * down the wire to say hello.
 */

/* The hub's own backdrop, whichever one is first in the folder. */
const SCENE = SCENES[0]
const BACKDROP = SCENE?.layers[0]?.url
/*
 * A clip for the same scene, if one has been dropped in beside the stills.
 *
 * The scene loader already globs `src/assets/scenes/*.{mp4,webm,mov}` and hangs
 * the result off the scene, so this needs nothing registered: drop a file in
 * and the hero becomes a shot you scrub instead of a photograph. Without one,
 * the still below carries the section exactly as before.
 */
const CLIP = SCENE?.video

/** The people standing in the room, as the hub labels them. */
const STANDING = [
  { name: 'Aditi', tint: 'var(--color-signal)' },
  { name: 'you', tint: '#7fb3e8', self: true },
  { name: 'Rohan', tint: '#e0a02f' },
]

export function RoomHero() {
  const section = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end start'],
  })

  /*
   * Three depths leaving at three speeds.
   *
   * The room hangs back and scales in a little, the way a wide shot does when
   * a camera pushes; the copy leaves first and fades out before the section
   * does. The gap between those rates is the whole effect — the picture reads
   * as further away than the words sitting on it.
   */
  const roomY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const roomScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-38%'])
  const copyFade = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  const still = { y: undefined, scale: undefined, opacity: undefined }

  return (
    <section
      ref={section}
      id="top"
      /*
       * No background of its own any more.
       *
       * It used to paint solid `bg-void`, which is what drew the hard line
       * across the page where the hero stopped and the stone started — two
       * different blacks meeting at an edge read as a seam even when they are
       * close. Letting the stone show through from behind means there is
       * nothing to butt up against, and the washes below fade the hero's own
       * picture out into it instead of stopping.
       */
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-5 pb-14 pt-28 sm:px-8 md:px-12 md:pb-20 lg:pl-28"
    >
      {/*
        The room itself — a shot you scrub if the scene ships one, and the
        still it was cut from otherwise. Reduced motion always takes the
        still: a clip whose only motion is the one you cause is still motion.
      */}
      {CLIP && !reduced ? (
        <ScrubbedRoom src={CLIP} poster={BACKDROP} progress={scrollYProgress} />
      ) : (
        BACKDROP && (
          <motion.img
            src={BACKDROP}
            alt=""
            aria-hidden
            /* Eager and high priority: this is the largest paint on the page,
               so deferring it only moves the moment the page looks finished. */
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 size-full origin-center object-cover will-change-transform"
            style={reduced ? still : { y: roomY, scale: roomScale }}
          />
        )
      )}

      {/*
        The pit, over the room and under the words.

        Masked away toward the bottom rather than clipped: the spheres are the
        loudest thing on the page, and a hard line where they stop would be a
        second seam in the exact place the first one was just removed from.
      */}
      <HeroBallpit className="absolute inset-0 -z-10 size-full" />

      {/*
        Two washes rather than one. A single flat scrim over a sunset kills the
        light that makes the picture worth showing; a bottom-weighted gradient
        plus a soft vignette keeps the sky and still gives the type a ground.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-void via-void/70 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(85%_65%_at_50%_35%,transparent,rgb(0_0_0/0.5))]"
      />

      <motion.div
        className="relative w-full max-w-3xl"
        style={reduced ? still : { y: copyY, opacity: copyFade }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 backdrop-blur-md">
          <span className="size-1.5 animate-signal-pulse rounded-full bg-emerald-400" />
          <span className="text-[0.7rem] tracking-[0.02em] text-chalk">
            3 in the room now
          </span>
        </span>

        <h1 className="mt-5 font-display text-[clamp(2.4rem,8vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-chalk">
          Everyone on the
          <br />
          same second.
        </h1>

        <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-mist sm:text-[1.02rem]">
          A room that stays open. Put a film on and it plays in step for all of you —
          one of you hits pause, it stops on every screen. Then put the music on, without
          anybody having to leave and come back.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/?signup"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-chalk px-6 text-[0.9rem] font-medium text-void outline-none transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Start a room
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            to="/?signin"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-[0.9rem] text-chalk outline-none backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            I have one
          </Link>
        </div>

        {/*
          The nameplates the hub puts under each person's feet, laid along the
          bottom of the scene. This is the app's own vocabulary for "somebody
          is here", so the hero ends on the thing the product is actually for.
        */}
        <ul className="mt-10 flex flex-wrap items-center gap-2 md:mt-14">
          {STANDING.map((person) => (
            <li
              key={person.name}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-void/55 px-3 py-1.5 backdrop-blur-md"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: person.tint }}
              />
              <span className="text-[0.75rem] text-chalk">{person.name}</span>
              {person.self && (
                <span className="text-[0.68rem] text-dusk">it&apos;s you</span>
              )}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
