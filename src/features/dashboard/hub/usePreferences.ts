import { useCallback, useEffect, useState } from 'react'

const KEY = 'syncroom.hub.preferences'

/** Where the ground is in a scene, as a fraction of viewport height. */
export const DEFAULT_GROUND = 0.82

export type HubPreferences = {
  /** Chosen backdrop, by scene id. Falls back to the first scene found. */
  sceneId?: string
  /** Chosen character, by roster id. */
  characterId?: string
  /**
   * Per-scene ground line, keyed by scene id.
   *
   * Nothing can infer this: it's the height of the path, floor, or bank in a
   * photograph, and getting it wrong is what leaves a character hovering over
   * water. So it's a control rather than a guess.
   */
  ground?: Record<string, number>
}

export function groundFor(preferences: HubPreferences, sceneId?: string) {
  if (!sceneId) return DEFAULT_GROUND
  return preferences.ground?.[sceneId] ?? DEFAULT_GROUND
}

function read(): HubPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as HubPreferences) : {}
  } catch {
    /* A corrupt or blocked store must not take the hub down — the defaults are
       perfectly usable. */
    return {}
  }
}

/**
 * How this user has dressed their hub.
 *
 * Local for now, deliberately: backdrop and character are pure presentation and
 * nothing else needs to read them. When the User model grows `characterId` this
 * becomes the write-through cache in front of it rather than the source.
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<HubPreferences>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(preferences))
    } catch {
      // Private-mode quota. Nothing to recover — the session still works.
    }
  }, [preferences])

  const update = useCallback((patch: Partial<HubPreferences>) => {
    setPreferences((current) => ({ ...current, ...patch }))
  }, [])

  return { preferences, update }
}
