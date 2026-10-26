import { randomInt } from 'node:crypto'
import { env } from '../config/env.js'
import type { GeoOptions, Point } from '../games/geo.js'
import { seenFor } from './seen.service.js'

export type GeoLocation = Point & { pano: string; heading: number; label: string; seed: string }
type Seed = { id: string; group: string; country: string; label: string; lat: number; lng: number }

/** Independently chosen search centres, not downloaded Google imagery or metadata. */
const WORLD: [string, string, number, number][] = [
  ['Japan', 'Kyoto', 35.02, 135.75],
  ['Japan', 'Hokkaido', 43.2, 142.7],
  ['Japan', 'Fukuoka', 33.58, 130.4],
  ['South Korea', 'Busan', 35.16, 129.06],
  ['South Korea', 'Jeju', 33.4, 126.55],
  ['Taiwan', 'Tainan', 23, 120.22],
  ['Taiwan', 'Hualien', 23.98, 121.6],
  ['Thailand', 'Chiang Mai', 18.79, 98.98],
  ['Thailand', 'Krabi', 8.08, 98.91],
  ['Malaysia', 'Penang', 5.4, 100.3],
  ['Malaysia', 'Ipoh', 4.6, 101.08],
  ['Indonesia', 'Yogyakarta', -7.8, 110.37],
  ['Indonesia', 'Bali', -8.5, 115.2],
  ['Philippines', 'Cebu', 10.31, 123.9],
  ['Cambodia', 'Siem Reap', 13.36, 103.86],
  ['Sri Lanka', 'Kandy', 7.29, 80.64],
  ['Bangladesh', 'Dhaka', 23.8, 90.4],
  ['Australia', 'Tasmania', -42.88, 147.32],
  ['Australia', 'Adelaide', -34.93, 138.6],
  ['Australia', 'Queensland', -16.93, 145.77],
  ['New Zealand', 'Otago', -45.03, 168.66],
  ['New Zealand', 'Canterbury', -43.53, 172.63],
  ['United Kingdom', 'York', 53.96, -1.08],
  ['United Kingdom', 'Scottish Highlands', 57.48, -4.22],
  ['Ireland', 'Galway', 53.27, -9.05],
  ['France', 'Brittany', 48.11, -1.68],
  ['France', 'Provence', 43.95, 4.81],
  ['Spain', 'Andalusia', 37.18, -3.6],
  ['Spain', 'Galicia', 42.88, -8.54],
  ['Portugal', 'Porto', 41.15, -8.61],
  ['Italy', 'Tuscany', 43.32, 11.33],
  ['Italy', 'Sicily', 37.5, 15.08],
  ['Greece', 'Crete', 35.34, 25.13],
  ['Germany', 'Bavaria', 48.14, 11.58],
  ['Netherlands', 'Utrecht', 52.09, 5.12],
  ['Belgium', 'Ghent', 51.05, 3.72],
  ['Denmark', 'Aarhus', 56.16, 10.2],
  ['Norway', 'Bergen', 60.39, 5.32],
  ['Sweden', 'Uppsala', 59.86, 17.64],
  ['Finland', 'Tampere', 61.5, 23.76],
  ['Iceland', 'Akureyri', 65.68, -18.09],
  ['Poland', 'Krakow', 50.06, 19.94],
  ['Czechia', 'Brno', 49.2, 16.61],
  ['Hungary', 'Szeged', 46.25, 20.15],
  ['Romania', 'Brasov', 45.65, 25.6],
  ['Bulgaria', 'Plovdiv', 42.14, 24.75],
  ['Croatia', 'Split', 43.51, 16.44],
  ['Turkey', 'Antalya', 36.9, 30.7],
  ['South Africa', 'Cape Town', -33.93, 18.42],
  ['South Africa', 'Durban', -29.86, 31.02],
  ['Kenya', 'Nairobi', -1.29, 36.82],
  ['Ghana', 'Kumasi', 6.69, -1.62],
  ['Senegal', 'Dakar', 14.72, -17.46],
  ['Botswana', 'Gaborone', -24.65, 25.91],
  ['Tunisia', 'Sousse', 35.83, 10.64],
  ['United States', 'Vermont', 44.26, -72.58],
  ['United States', 'Arizona', 35.2, -111.65],
  ['United States', 'Oregon', 44.05, -123.09],
  ['Canada', 'Quebec', 46.81, -71.21],
  ['Canada', 'Alberta', 51.05, -114.07],
  ['Mexico', 'Yucatan', 20.97, -89.62],
  ['Mexico', 'Oaxaca', 17.06, -96.72],
  ['Guatemala', 'Antigua', 14.56, -90.73],
  ['Colombia', 'Medellin', 6.25, -75.57],
  ['Ecuador', 'Cuenca', -2.9, -79],
  ['Peru', 'Arequipa', -16.4, -71.54],
  ['Bolivia', 'La Paz', -16.5, -68.15],
  ['Chile', 'Valparaiso', -33.05, -71.62],
  ['Argentina', 'Mendoza', -32.89, -68.85],
  ['Uruguay', 'Colonia', -34.47, -57.84],
  ['Brazil', 'Curitiba', -25.43, -49.27],
  ['Brazil', 'Recife', -8.05, -34.88],
]
const INDIA: [string, string, number, number][] = [
  ['North', 'Amritsar, Punjab', 31.63, 74.87],
  ['North', 'Chandigarh', 30.73, 76.78],
  ['North', 'Ludhiana, Punjab', 30.9, 75.85],
  ['North', 'Shimla, Himachal Pradesh', 31.1, 77.17],
  ['North', 'Dehradun, Uttarakhand', 30.32, 78.03],
  ['North', 'Delhi', 28.61, 77.21],
  ['West', 'Jaipur, Rajasthan', 26.91, 75.79],
  ['West', 'Udaipur, Rajasthan', 24.59, 73.69],
  ['West', 'Ahmedabad, Gujarat', 23.02, 72.57],
  ['West', 'Surat, Gujarat', 21.17, 72.83],
  ['West', 'Pune, Maharashtra', 18.52, 73.86],
  ['West', 'Nashik, Maharashtra', 19.99, 73.79],
  ['West', 'Panaji, Goa', 15.49, 73.83],
  ['Central', 'Bhopal, Madhya Pradesh', 23.26, 77.41],
  ['Central', 'Indore, Madhya Pradesh', 22.72, 75.86],
  ['Central', 'Nagpur, Maharashtra', 21.15, 79.09],
  ['Central', 'Raipur, Chhattisgarh', 21.25, 81.63],
  ['East', 'Lucknow, Uttar Pradesh', 26.85, 80.95],
  ['East', 'Varanasi, Uttar Pradesh', 25.32, 82.97],
  ['East', 'Patna, Bihar', 25.6, 85.14],
  ['East', 'Kolkata, West Bengal', 22.57, 88.36],
  ['East', 'Bhubaneswar, Odisha', 20.3, 85.82],
  ['East', 'Guwahati, Assam', 26.14, 91.74],
  ['South', 'Bengaluru, Karnataka', 12.97, 77.59],
  ['South', 'Mysuru, Karnataka', 12.3, 76.64],
  ['South', 'Mangaluru, Karnataka', 12.91, 74.86],
  ['South', 'Hyderabad, Telangana', 17.39, 78.49],
  ['South', 'Vijayawada, Andhra Pradesh', 16.51, 80.65],
  ['South', 'Chennai, Tamil Nadu', 13.08, 80.27],
  ['South', 'Madurai, Tamil Nadu', 9.93, 78.12],
  ['South', 'Coimbatore, Tamil Nadu', 11.02, 76.96],
  ['South', 'Kochi, Kerala', 9.97, 76.28],
  ['South', 'Thiruvananthapuram, Kerala', 8.52, 76.94],
]
const continent = (country: string) => {
  if (['Australia', 'New Zealand'].includes(country)) return 'Oceania'
  if (['United States', 'Canada', 'Mexico', 'Guatemala'].includes(country)) return 'North America'
  if (['Colombia', 'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Uruguay', 'Brazil'].includes(country))
    return 'South America'
  if (['South Africa', 'Kenya', 'Ghana', 'Senegal', 'Botswana', 'Tunisia'].includes(country)) return 'Africa'
  if (
    [
      'Japan',
      'South Korea',
      'Taiwan',
      'Thailand',
      'Malaysia',
      'Indonesia',
      'Philippines',
      'Cambodia',
      'Sri Lanka',
      'Bangladesh',
      'India',
      'Turkey',
    ].includes(country)
  )
    return 'Asia'
  return 'Europe'
}
const seeds = (map: GeoOptions['map']): Seed[] => {
  const world: typeof WORLD = [
    ...WORLD,
    ...INDIA.map(([, label, lat, lng]): (typeof WORLD)[number] => ['India', label, lat, lng]),
  ]
  return (map === 'india' ? INDIA : world).map(([group, label, lat, lng]) => ({
    id: `${map}:${group}:${label}`,
    group: map === 'india' ? group : continent(group),
    country: map === 'india' ? 'India' : group,
    label: map === 'india' ? label : `${label}, ${group}`,
    lat,
    lng,
  }))
}

export type Metadata = { status?: string; pano_id?: string; location?: Point; copyright?: string }
export async function lookupGeo(
  point: Point,
  key: string,
  signal?: AbortSignal,
  request: typeof fetch = fetch,
): Promise<Metadata> {
  const budget = signal ?? AbortSignal.timeout(4000)
  const read = async (parameters: Record<string, string>) => {
    const query = new URLSearchParams({ ...parameters, key })
    const response = await request(`https://maps.googleapis.com/maps/api/streetview/metadata?${query}`, {
      signal: budget,
    })
    if (!response.ok) throw new Error('Street View lookup is unavailable. Try again shortly.')
    const result = (await response.json()) as Metadata
    if (result.status === 'REQUEST_DENIED')
      throw new Error('Street View access was denied. Check the server key, API restrictions and billing setup.')
    if (result.status === 'OVER_QUERY_LIMIT' || result.status === 'OVER_DAILY_LIMIT')
      throw new Error('Street View lookup has reached its limit. The host needs to check Google Maps usage.')
    return result
  }
  const candidate = await read({ location: `${point.lat},${point.lng}`, radius: '12000', source: 'outdoor' })
  if (candidate.status !== 'OK' || !candidate.pano_id) return candidate
  // A location lookup can return a contributed/retired panorama whose tiles are
  // black in the JS viewer. Accept Google-attributed imagery and resolve the ID
  // itself before admitting it to a round. Both requests are metadata-only.
  if (!/\bGoogle\b/.test(candidate.copyright ?? '')) return { status: 'ZERO_RESULTS' }
  const verified = await read({ pano: candidate.pano_id })
  return verified.status === 'OK' && /\bGoogle\b/.test(verified.copyright ?? '') ? verified : { status: 'ZERO_RESULTS' }
}

/** Bounded, country/region-balanced lookup. Metadata stays in this session only. */
export async function buildGeoRoute(
  map: GeoOptions['map'],
  count: number,
  seen: ReadonlySet<string>,
  lookup: (p: Point) => Promise<Metadata>,
  random = (max: number) => randomInt(max),
): Promise<GeoLocation[]> {
  const pool = seeds(map)
  const shuffled = <T>(a: T[]) => {
    const copy = [...a]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = random(i + 1)
      ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
    }
    return copy
  }
  const groups = shuffled([...new Set(pool.map((s) => s.group))])
  const fresh = (items: Seed[]) => shuffled(items).sort((a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)))
  const piles = groups.map((g) => {
    const candidates = pool.filter((s) => s.group === g)
    if (map === 'india') return fresh(candidates)
    const countries = shuffled([...new Set(candidates.map((s) => s.country))])
    const byCountry = countries.map((country) => fresh(candidates.filter((s) => s.country === country)))
    const mixed: Seed[] = []
    while (byCountry.some((p) => p.length))
      for (const pile of byCountry) {
        const next = pile.shift()
        if (next) mixed.push(next)
      }
    return mixed.sort((a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)))
  })
  const ordered: Seed[] = []
  while (piles.some((p) => p.length))
    for (const pile of piles) {
      const next = pile.shift()
      if (next) ordered.push(next)
    }
  const route: GeoLocation[] = []
  // A fresh jitter on later passes finds roads beside rejected contributions.
  // Never repeat a successful region within a game. Only about one spot in four
  // has usable imagery, so ten lookups run at once — each finished one starts
  // the next — and nothing new starts once the route is full. At most 96 are
  // checked, still within prepare()'s 25-second total budget.
  const candidates = Array.from({ length: 4 }, () => ordered).flat()
  let next = 0
  let checked = 0
  let failure: unknown = null
  const check = async (seed: Seed): Promise<GeoLocation | null> => {
    const jitter = () => (random(10_001) / 10_000 - 0.5) * 0.13
    const point = { lat: seed.lat + jitter(), lng: seed.lng + jitter() }
    let result: Metadata
    try {
      result = await lookup(point)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (/access was denied|has reached its limit/.test(message)) throw error
      return null // A slow candidate must not throw away the other valid views.
    }
    const loc = result.location
    if (
      result.status !== 'OK' ||
      !result.pano_id ||
      !loc ||
      !Number.isFinite(loc.lat) ||
      !Number.isFinite(loc.lng) ||
      Math.abs(loc.lat) > 90 ||
      Math.abs(loc.lng) > 180
    )
      return null
    return { pano: result.pano_id, lat: loc.lat, lng: loc.lng, seed: seed.id, label: `Near ${seed.label}`, heading: random(360) }
  }
  /*
   * How many lookups to keep in flight: enough to fill the route at the yield
   * seen so far (about one usable spot in three, until we know better), and
   * never more than ten. Easy maps make few calls; hard ones go wide.
   */
  let inFlight = 0
  let usable = 0
  const wanted = () => {
    const needed = count - route.length
    const yieldSoFar = checked - inFlight > 0 ? Math.max(0.15, usable / (checked - inFlight)) : 0.35
    return Math.min(10, Math.ceil(needed / yieldSoFar))
  }
  await new Promise<void>((resolve) => {
    const pump = () => {
      while (!failure && route.length < count && checked < 96 && next < candidates.length && inFlight < wanted()) {
        const seed = candidates[next++]!
        if (route.some((x) => x.seed === seed.id)) continue
        checked += 1
        inFlight += 1
        check(seed)
          .then((item) => {
            if (item) usable += 1
            if (item && route.length < count && !route.some((x) => x.pano === item.pano || x.seed === item.seed)) route.push(item)
          })
          .catch((error: unknown) => {
            failure = error
          })
          .finally(() => {
            inFlight -= 1
            pump()
          })
      }
      if (inFlight === 0) resolve()
    }
    pump()
  })
  if (failure) throw failure
  return route.slice(0, count)
}

const preparing = new Set<string>()

export async function prepareGeoLocations(
  roomId: string,
  options: GeoOptions,
): Promise<GeoOptions | { error: string }> {
  if (!env.googleMapsServerKey)
    return { error: 'Somewhere needs a Google Maps server key. Ask the host to finish map setup.' }
  if (preparing.has(roomId)) return { error: 'A route is already being prepared for this room.' }
  if (preparing.size >= 4) return { error: 'A few trips are preparing right now. Try again in a moment.' }
  preparing.add(roomId)
  const deadline = AbortSignal.timeout(25_000)
  try {
    const seen = await seenFor(roomId, 'geo')
    const locations = await buildGeoRoute(options.map, options.rounds + 2, seen, (point) =>
      lookupGeo(point, env.googleMapsServerKey, AbortSignal.any([deadline, AbortSignal.timeout(4000)])),
    )
    if (locations.length < options.rounds)
      return {
        error: 'Not enough Street View locations are available right now. Try the other map or try again shortly.',
      }
    return { ...options, locations }
  } catch (error) {
    // Never expose a fetch URL (it contains the server credential).
    const message = error instanceof Error ? error.message : ''
    return {
      error: message.startsWith('Street View')
        ? message
        : 'Street View took too long to prepare. Check the connection and try again.',
    }
  } finally {
    preparing.delete(roomId)
  }
}
