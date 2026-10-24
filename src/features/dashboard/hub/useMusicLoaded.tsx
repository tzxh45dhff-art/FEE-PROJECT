import { useEffect } from 'react'

import { useMusic } from '@/features/music/MusicContext'

/**
 * Reports whether the room has a song loaded, for a page that sits above the
 * music session and so cannot read it directly. The hub uses it to keep the
 * pet and the controls clear of the floating music dock.
 */
export function MusicLoaded({ onChange }: { onChange: (loaded: boolean) => void }) {
  const loaded = !!useMusic().snapshot?.track
  useEffect(() => onChange(loaded), [loaded, onChange])
  return null
}
