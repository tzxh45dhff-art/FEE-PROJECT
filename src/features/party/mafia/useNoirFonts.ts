import { useEffect } from 'react'

import type { ArcLook } from './arcs'

/**
 * The game's lettering — Art Deco headlines, a typewriter for dossiers, an
 * old serif for the narrator — plus the story's own display face, loaded only
 * when somebody opens Mafia (and that story), so the rest of the app never
 * pays for fonts it doesn't use.
 */
const BASE =
  'https://fonts.googleapis.com/css2?family=Limelight&family=Special+Elite&family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,500&display=swap'

function load(key: string, href: string) {
  if (document.querySelector(`link[data-noir-fonts="${key}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.dataset.noirFonts = key
  document.head.append(link)
}

export function useNoirFonts(arcs?: ArcLook | readonly ArcLook[]) {
  const wanted = (Array.isArray(arcs) ? arcs : arcs ? [arcs] : []) as readonly ArcLook[]
  const key = wanted.map((arc) => arc.id).join(',')
  useEffect(() => {
    load('base', BASE)
    for (const arc of wanted) if (arc.fonts) load(arc.id, `https://fonts.googleapis.com/css2?family=${arc.fonts}&display=swap`)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` names exactly the stories asked for
  }, [key])
}
