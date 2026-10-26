import type { Point } from './types'

/** Small typed boundary around the optional SDK. No Google code enters the main bundle. */
type Listener = { remove(): void }
export type LatLng = { lat(): number; lng(): number }
export type MapsObject = { addListener(name: string, callback: (event?: { latLng?: LatLng }) => void): Listener }
export type GeoMap = MapsObject & {
  getCenter(): LatLng | undefined
  setCenter(point: Point): void
  setOptions(options: Record<string, unknown>): void
  fitBounds(bounds: { north: number; south: number; east: number; west: number }, padding?: number): void
}
export type Panorama = MapsObject & {
  setPano(pano: string): void
  getPano(): string
  getStatus(): string
  setPov(pov: { heading: number; pitch: number }): void
  getPov(): { heading: number; pitch: number }
  setZoom(zoom: number): void
  setOptions(options: Record<string, unknown>): void
  setVisible(visible: boolean): void
}
type Marker = MapsObject & {
  setMap(map: GeoMap | null): void
  setPosition(p: Point): void
  getPosition(): LatLng | undefined
}
type Polyline = { setMap(map: GeoMap | null): void }
export type MapsSdk = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GeoMap
  StreetViewPanorama: new (element: HTMLElement, options: Record<string, unknown>) => Panorama
  Marker: new (options: Record<string, unknown>) => Marker
  Polyline: new (options: Record<string, unknown>) => Polyline
  SymbolPath: { CIRCLE: number }
  event: { trigger(object: MapsObject, event: string): void; clearInstanceListeners(object: MapsObject): void }
}
type MapsWindow = Window & { google?: { maps?: MapsSdk }; __huddleGeoReady?: () => void; gm_authFailure?: () => void }
const host = () => window as MapsWindow
let promise: Promise<MapsSdk> | null = null
export const hasBrowserMapsKey = () => !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

export function loadMaps(): Promise<MapsSdk> {
  if (host().google?.maps?.StreetViewPanorama) return Promise.resolve(host().google!.maps!)
  if (promise) return promise
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  if (!key) return Promise.reject(new Error('Google Maps is not set up on this website yet.'))
  promise = new Promise<MapsSdk>((resolve, reject) => {
    const script = document.createElement('script')
    const timer = window.setTimeout(() => fail('Google Maps took too long to load. Check your connection.'), 20_000)
    const fail = (message: string) => {
      window.clearTimeout(timer)
      script.remove()
      promise = null
      reject(new Error(message))
    }
    host().__huddleGeoReady = () => {
      window.clearTimeout(timer)
      const sdk = host().google?.maps
      if (sdk?.StreetViewPanorama) resolve(sdk)
      else fail('Google Maps could not initialise.')
    }
    const previousAuthFailure = host().gm_authFailure
    host().gm_authFailure = () => {
      previousAuthFailure?.()
      window.dispatchEvent(new Event('geo:auth-error'))
      fail('Google Maps access was denied. The host needs to check the browser key and billing setup.')
    }
    script.async = true
    script.onerror = () => fail('Google Maps could not load. Check your connection or content blocker.')
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key, v: 'quarterly', loading: 'async', callback: '__huddleGeoReady' })}`
    document.head.appendChild(script)
  })
  return promise
}

/** Smallest longitude arc, so a reveal across the date line stays readable. */
export function boundsForPoints(points: Point[]) {
  const latitudes = points.map((p) => Math.max(-85, Math.min(85, p.lat)))
  const lngs = points.map((p) => ((p.lng % 360) + 360) % 360).sort((a, b) => a - b)
  let gap = -1,
    index = 0
  for (let i = 0; i < lngs.length; i++) {
    const d = lngs[(i + 1) % lngs.length]! + (i === lngs.length - 1 ? 360 : 0) - lngs[i]!
    if (d > gap) {
      gap = d
      index = i
    }
  }
  const wrap = (n: number) => ((n + 540) % 360) - 180
  const west = lngs[(index + 1) % lngs.length]!,
    east = lngs[index]!
  return {
    north: Math.min(85, Math.max(...latitudes) + 0.03),
    south: Math.max(-85, Math.min(...latitudes) - 0.03),
    west: wrap(west - 0.03),
    east: wrap(east + 0.03),
  }
}
