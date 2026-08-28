import { useEffect, useRef, useState } from 'react'

import { useStudyDark } from '@/features/study/useStudyDark'

/**
 * A diagram, from the text a model wrote.
 *
 * Mermaid rather than a generated image: a model emits a flowchart as a dozen
 * lines of text far more reliably than it draws one, the result is legible at
 * any size because it is vector, and a diagram that turns out wrong can be
 * corrected by editing a line rather than by paying for another picture.
 *
 * The library is loaded on first use and kept — it is a large dependency, and
 * a page of notes with no diagrams in it should never pay for it.
 */

let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null

/* Mermaid bakes its colours into the SVG at render time, so the palette has to
   be handed to it rather than inherited. Re-initialised whenever the tab's
   theme changes — the library allows it, and the alternative is dark boxes
   with dark text sitting in a white page. */
const PALETTE = {
  dark: {
    primaryColor: '#1c1c1f',
    primaryTextColor: '#fafafa',
    primaryBorderColor: '#3a3a40',
    lineColor: '#8a8a94',
    secondaryColor: '#141416',
    tertiaryColor: '#0d0d0f',
  },
  light: {
    primaryColor: '#f1efec',
    primaryTextColor: '#17171b',
    primaryBorderColor: '#c9c5c0',
    lineColor: '#6b6b75',
    secondaryColor: '#e7e4e0',
    tertiaryColor: '#fbfaf9',
  },
}

function loadMermaid(dark: boolean) {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => module.default)
  }
  return mermaidPromise.then((mermaid) => {
    mermaid.initialize({
      startOnLoad: false,
      /* Errors are handled below, as a readable fallback. Left to itself the
         library writes its own error graphic into the page, which is a
         picture of a bomb where a diagram should be. */
      suppressErrorRendering: true,
      securityLevel: 'strict',
      theme: dark ? 'dark' : 'neutral',
      darkMode: dark,
      fontFamily: 'inherit',
      themeVariables: { background: 'transparent', ...(dark ? PALETTE.dark : PALETTE.light) },
      flowchart: { curve: 'basis', useMaxWidth: true },
      sequence: { useMaxWidth: true },
    })
    return mermaid
  })
}

let counter = 0

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const dark = useStudyDark()

  useEffect(() => {
    let cancelled = false
    counter += 1
    const id = `study-diagram-${counter}`

    void loadMermaid(dark)
      .then((mermaid) => mermaid.render(id, chart))
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered)
          setFailed(false)
        }
      })
      .catch(() => {
        /*
         * A diagram that will not parse is shown as its own source.
         *
         * The model writes these, and it occasionally writes one Mermaid
         * cannot read. The text still says what the diagram meant, so showing
         * it beats showing nothing — and it makes the fault obvious rather
         * than leaving a blank space where a picture was promised.
         */
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [chart, dark])

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-[0.9rem] border border-[var(--study-line)] bg-[var(--study-card)] p-3 text-[0.74rem] leading-relaxed text-[var(--study-soft)]">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      ref={host}
      className="my-4 overflow-x-auto rounded-[0.9rem] border border-[var(--study-line)] bg-[var(--study-card)] p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      /* The SVG comes from Mermaid's own renderer with `securityLevel: strict`,
         which strips script and event handlers from the graph it is given. */
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : <span className="text-[0.76rem] text-[var(--study-faint)]">Drawing…</span>}
    </div>
  )
}
