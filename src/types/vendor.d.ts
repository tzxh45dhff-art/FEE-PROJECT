/**
 * Types for the vendored JavaScript in `src/vendor`.
 *
 * That folder is excluded from the TypeScript project on purpose — third-party
 * code shouldn't have to satisfy this codebase's strictness — so the contracts
 * it exposes are declared here instead.
 */

declare module '@/vendor/InfiniteMenu' {
  import type { ComponentType } from 'react'

  export type InfiniteMenuItem = {
    /** Any URL an <img> can load, including a data: URI. */
    image: string
    title: string
    description?: string
    /** Carried through untouched so `onSelect` can identify the choice. */
    id: string
  }

  const InfiniteMenu: ComponentType<{
    items: InfiniteMenuItem[]
    /** Camera zoom. Above 1 pulls back, below pushes in. */
    scale?: number
    onSelect?: (item: InfiniteMenuItem) => void
    selectLabel?: string
  }>

  export default InfiniteMenu
}
