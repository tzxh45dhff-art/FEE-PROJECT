import { useEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

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

function loadMermaid(reduced: boolean) {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => {
      const mermaid = module.default
      mermaid.initialize({
        startOnLoad: false,
        /* Errors are handled below, as a readable fallback. Left to itself the
           library writes its own error graphic into the page, which is a
           picture of a bomb where a diagram should be. */
        suppressErrorRendering: true,
        securityLevel: 'strict',
        theme: 'dark',
        darkMode: true,
        fontFamily: 'inherit',
        themeVariables: {
          background: 'transparent',
          primaryColor: '#1c1c1f',
          primaryTextColor: '#fafafa',
          primaryBorderColor: '#2a2a2e',
          lineColor: '#6e6e77',
          secondaryColor: '#141416',
          tertiaryColor: '#0d0d0f',
        },
        flowchart: { curve: 'basis', useMaxWidth: true },
        sequence: { useMaxWidth: true },
      })
      return mermaid
    })
  }
  void reduced
  return mermaidPromise
}

let counter = 0

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    counter += 1
    const id = `study-diagram-${counter}`

    void loadMermaid(reduced)
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
  }, [chart, reduced])

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-card border border-white/10 bg-white/[0.03] p-3 text-[0.74rem] leading-relaxed text-mist">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      ref={host}
      className="my-4 overflow-x-auto rounded-card border border-white/[0.07] bg-white/[0.02] p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      /* The SVG comes from Mermaid's own renderer with `securityLevel: strict`,
         which strips script and event handlers from the graph it is given. */
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? undefined : <span className="text-[0.76rem] text-dusk">Drawing…</span>}
    </div>
  )
}
