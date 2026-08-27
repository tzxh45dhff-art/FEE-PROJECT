import { Loader2, Sparkles } from 'lucide-react'

import type * as studyApi from '@/features/study/api'
import { cn } from '@/lib/utils'

/** What every pane is handed. */
export type PaneProps = {
  roomId: string
  subject: studyApi.Subject | null
  caps: studyApi.Capabilities | null
  announce: (kind: string, subjectId?: string | null) => void
  selfId: string | undefined
}

export function PaneShell({
  title,
  description,
  aside,
  children,
}: {
  title: string
  description: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 pb-4">
        <div className="min-w-0">
          <h2 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-chalk">
            {title}
          </h2>
          <p className="mt-1 max-w-lg text-[0.82rem] leading-relaxed text-mist">{description}</p>
        </div>
        {aside}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="grid place-items-center py-16">
      <span className="flex items-center gap-2.5 text-mist">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        {label && <span className="text-[0.82rem]">{label}</span>}
      </span>
    </div>
  )
}

export function Blank({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <p className="font-display text-[0.98rem] font-semibold text-chalk">{title}</p>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-mist">{body}</p>
      </div>
    </div>
  )
}

export function Problem({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-card bg-signal/10 px-4 py-3 text-[0.8rem] text-signal-bright">
      {message}
    </p>
  )
}

/**
 * Says where something came from.
 *
 * Not decoration. A set of questions written from a model's general knowledge
 * is a perfectly good set of questions, but it is not the same thing as one
 * drawn from the room's own documents — and a page that lets those look
 * identical is teaching somebody a syllabus that might not be theirs.
 */
export function GroundedBadge({
  grounded,
  sources,
}: {
  grounded: boolean
  sources: string[]
}) {
  return (
    <span
      title={grounded ? `From ${sources.join(', ')}` : 'Written from general knowledge'}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem]',
        grounded
          ? 'border-white/15 bg-white/[0.06] text-chalk'
          : 'border-white/10 bg-transparent text-dusk',
      )}
    >
      {grounded ? (
        <>
          <span className="size-1.5 rounded-full bg-signal" />
          {sources.length === 1 ? sources[0] : `${sources.length} documents`}
        </>
      ) : (
        'General knowledge'
      )}
    </span>
  )
}

/** The button every generator sits behind, with the no-key case handled once. */
export function GenerateButton({
  busy,
  disabled,
  label,
  reason,
  onClick,
}: {
  busy: boolean
  disabled: boolean
  label: string
  reason?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      title={disabled ? reason : undefined}
      className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-chalk px-4 text-[0.82rem] font-medium text-void outline-none transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      {busy ? (
        <Loader2 aria-hidden className="size-4 animate-spin" />
      ) : (
        <Sparkles aria-hidden className="size-4" />
      )}
      {busy ? 'Writing…' : label}
    </button>
  )
}

export function bytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
