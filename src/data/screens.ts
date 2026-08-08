/**
 * What plays on each device screen in the landing page showcase.
 *
 * Two ways to get real moving footage, checked in this order:
 *
 *   1. A video file in `src/assets/videos/` named after the slot
 *      (`phone.mp4`, `tablet.mp4`, `laptop.mp4`, `imac.mp4`).
 *      Best quality, fully offline, no third party. Preferred.
 *
 *   2. A YouTube id below. Paste the 11-character id from a watch URL —
 *      `youtube.com/watch?v=`**`dQw4w9WgXcQ`**. Official trailers are
 *      publisher-uploaded and embeddable, which is why this is the quick
 *      route to real film footage without hosting anything yourself.
 *
 * Leave a slot empty and it falls back to TMDB artwork with a slow drift.
 * Nothing here breaks if it's blank — the section always renders.
 */
export type ScreenSlot = 'phone' | 'tablet' | 'laptop' | 'imac'

export const SCREEN_YOUTUBE: Record<ScreenSlot, string> = {
  phone: '',
  tablet: '',
  laptop: '',
  imac: '',
}
