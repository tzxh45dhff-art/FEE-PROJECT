import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-card border border-white/[0.07] bg-surface/60 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('font-display text-lg font-semibold text-chalk', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm leading-relaxed text-dusk', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
