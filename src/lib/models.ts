/**
 * Auto-discovery for the hero's 3D objects.
 *
 * Any `.glb` dropped into `src/assets/models/` is picked up at build time and
 * replaces the CSS object whose slot matches its filename. Nothing to register.
 *
 * See `src/assets/models/README.md` for the slot names.
 */

const modules = import.meta.glob('../assets/models/*.glb', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** Slot name (filename without extension, lowercased) → hashed asset URL. */
export const MODEL_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([filePath, url]) => [
    filePath.split('/').pop()!.replace(/\.glb$/i, '').toLowerCase(),
    url,
  ]),
)

/**
 * True once at least one model exists. Gates the lazy three.js import, so a
 * project with no models never downloads the 3D chunk.
 */
export const hasModels = Object.keys(MODEL_URLS).length > 0

export function modelUrl(slot: string): string | undefined {
  return MODEL_URLS[slot.toLowerCase()]
}
