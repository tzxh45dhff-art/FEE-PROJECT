import { Group, Panel, Separator, type GroupProps, type PanelProps, type SeparatorProps } from 'react-resizable-panels'

import { cn } from '@/lib/utils'

/**
 * Panels a person can resize by dragging the line between them — the shadcn
 * "resizable" pattern, on react-resizable-panels.
 *
 * The handle is a thin line with a grip in the middle that lights up on hover
 * and while dragging, and it is a real separator: focusable, movable with the
 * arrow keys, and reset to its default by a double-click.
 */

export function ResizableGroup({ className, ...props }: GroupProps) {
  return <Group className={cn('flex h-full w-full', className)} {...props} />
}

export function ResizablePanel({ className, ...props }: PanelProps) {
  return <Panel className={cn('min-h-0 min-w-0', className)} {...props} />
}

export function ResizableHandle({ className, vertical = false, ...props }: SeparatorProps & { vertical?: boolean }) {
  return (
    <Separator
      className={cn(
        'group relative flex shrink-0 items-center justify-center outline-none',
        vertical ? 'h-3 w-full cursor-row-resize' : 'h-full w-3 cursor-col-resize',
        className,
      )}
      {...props}
    >
      {/* The line. */}
      <span
        aria-hidden
        className={cn(
          'absolute rounded-full bg-[var(--study-line)] transition-colors group-hover:bg-[var(--study-accent)] group-focus-visible:bg-[var(--study-accent)] group-data-[separator=active]:bg-[var(--study-accent)]',
          vertical ? 'inset-x-2 h-px' : 'inset-y-2 w-px',
        )}
      />
      {/* The grip, so it reads as something to take hold of. */}
      <span
        aria-hidden
        className={cn(
          'relative z-10 flex items-center justify-center gap-[3px] rounded-full border border-[var(--study-line)] bg-[var(--study-card-strong,var(--study-card))] opacity-70 transition group-hover:opacity-100 group-data-[separator=active]:scale-110 group-data-[separator=active]:opacity-100',
          vertical ? 'h-2.5 w-9 flex-row' : 'h-9 w-2.5 flex-col',
        )}
      >
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-[3px] rounded-full bg-[var(--study-soft)]" />
        ))}
      </span>
    </Separator>
  )
}
