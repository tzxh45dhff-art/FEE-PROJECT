import { useEffect } from 'react'

/**
 * The game's lettering — Art Deco headlines, a typewriter for dossiers, an
 * old serif for the narrator — loaded only when somebody opens Mafia, so the
 * rest of the app never pays for three fonts it doesn't use.
 */
const HREF =
  'https://fonts.googleapis.com/css2?family=Limelight&family=Special+Elite&family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,500&display=swap'

export function useNoirFonts() {
  useEffect(() => {
    if (document.querySelector(`link[data-noir-fonts]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = HREF
    link.dataset.noirFonts = ''
    document.head.append(link)
  }, [])
}
