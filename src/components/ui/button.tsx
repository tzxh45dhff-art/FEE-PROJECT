import { cloneElement, isValidElement, type ComponentProps, type ReactElement } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { FlipText } from '@/components/ui/FlipText'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'group/flip relative isolate inline-flex shrink-0 items-center justify-center gap-2',
    'overflow-hidden whitespace-nowrap rounded-full font-sans font-medium outline-none',
    /* Only colour and transform transition here. The fill itself is the wash
       element below, which wipes rather than cross-fades. */
    'transition-[color,border-color,box-shadow,transform] duration-500 ease-glass',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        /* The cinematic "play" button: solid light, washing to the accent. */
        primary:
          'bg-chalk text-void shadow-[0_18px_45px_-18px_rgb(255_255_255/0.45)] [--wash:var(--color-signal)] hover:text-white hover:shadow-[0_22px_55px_-16px_color-mix(in_oklab,var(--color-signal)_60%,transparent)] active:scale-[0.98]',
        outline:
          'border border-white/15 bg-white/5 text-chalk backdrop-blur-md [--wash:color-mix(in_oklab,var(--color-signal)_55%,transparent)] hover:border-signal/40 hover:text-white active:scale-[0.98]',
        ghost:
          'text-mist [--wash:rgb(255_255_255/0.09)] hover:text-chalk active:scale-[0.98]',
        link: 'h-auto overflow-visible rounded-none px-0 text-mist underline-offset-4 hover:text-chalk hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm [&_svg]:size-4',
        md: 'h-11 px-6 text-[0.95rem] [&_svg]:size-4',
        lg: 'h-14 px-8 text-base tracking-[-0.01em] [&_svg]:size-5',
        icon: 'size-10 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Opt out of the per-letter flip (icon-only buttons, or when nesting). */
    plain?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  plain = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  /*
   * Only plain strings get the flip. With `asChild` the string is one level
   * down inside the slotted element (usually a <Link>), so it gets swapped in
   * place there. Anything richer is left alone rather than guessed at.
   */
  let content = children
  if (!plain) {
    if (typeof children === 'string') {
      content = <FlipText text={children} />
    } else if (asChild && isValidElement(children)) {
      const slotted = children as ReactElement<{ children?: unknown }>
      if (typeof slotted.props.children === 'string') {
        content = cloneElement(slotted, undefined, <FlipText text={slotted.props.children} />)
      }
    }
  }

  const inner = (
    <>
      {/*
        The hover colour arrives as a wipe from the top edge rather than the
        whole fill cross-fading at once — a flat background swap is what makes
        a hover read as a state toggle instead of a material responding.
      */}
      <span aria-hidden className="button-wash" />
      <span className="relative z-10 inline-flex items-center gap-2">{content}</span>
    </>
  )

  if (asChild && isValidElement(content)) {
    const slotted = content as ReactElement<{ children?: unknown }>
    return (
      <Slot data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {cloneElement(
          slotted,
          undefined,
          <>
            <span aria-hidden className="button-wash" />
            <span className="relative z-10 inline-flex items-center gap-2">
              {slotted.props.children as React.ReactNode}
            </span>
          </>,
        )}
      </Slot>
    )
  }

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {inner}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
