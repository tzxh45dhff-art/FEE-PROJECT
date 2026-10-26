import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, LocateFixed, RotateCcw } from 'lucide-react'
import { boundsForPoints, loadMaps, type GeoMap, type Panorama } from './mapsSdk'
import { COLORS, type GeoOptions, type GeoRound, type Point } from './types'

export function GeoPanorama({
  scene,
  movement,
  playing,
  attempt,
  onReady,
  onHeading,
}: {
  scene: { pano: string; heading: number; pitch: number; zoom: number }
  movement: GeoOptions['movement']
  playing: boolean
  attempt: number
  onReady: () => void
  onHeading: (heading: number) => void
}) {
  const element = useRef<HTMLDivElement>(null)
  const pano = useRef<Panorama | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [boot, setBoot] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const callbacks = useRef({ onReady, onHeading })
  callbacks.current = { onReady, onHeading }
  useEffect(() => {
    if (attempt > 0 && !pano.current) setBoot((n) => n + 1)
  }, [attempt])
  useEffect(() => {
    let cancelled = false
    const authError = () => setError('Google Maps access was denied. The host needs to check map setup.')
    window.addEventListener('geo:auth-error', authError)
    void loadMaps()
      .then((sdk) => {
        if (cancelled || !element.current) return
        const viewer = new sdk.StreetViewPanorama(element.current, {
          disableDefaultUI: true,
          addressControl: false,
          showRoadLabels: false,
          motionTracking: false,
          motionTrackingControl: false,
          fullscreenControl: false,
          panControl: false,
          zoomControl: false,
          enableCloseButton: false,
        })
        pano.current = viewer
        setLoaded(true)
        const resize = new ResizeObserver(() => sdk.event.trigger(viewer, 'resize'))
        resize.observe(element.current)
        cleanup = () => {
          resize.disconnect()
          sdk.event.clearInstanceListeners(viewer)
          viewer.setVisible(false)
          pano.current = null
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    let cleanup = () => {}
    return () => {
      cancelled = true
      cleanup()
      window.removeEventListener('geo:auth-error', authError)
    }
  }, [boot])
  useEffect(() => {
    const viewer = pano.current
    if (!loaded || !viewer) return
    setError(null)
    let ready = false
    const report = () => {
      const status = viewer.getStatus()
      if (status === 'OK') setError(null)
      if (status === 'OK' && viewer.getPano() === scene.pano && !ready) {
        ready = true
        callbacks.current.onReady()
      }
      if (status === 'ZERO_RESULTS' || status === 'UNKNOWN_ERROR')
        setError('This Street View could not load. You can rejoin the next round.')
    }
    const status = viewer.addListener('status_changed', report)
    const position = viewer.addListener('pano_changed', () => {
      if (movement !== 'moving' && viewer.getPano() !== scene.pano) viewer.setPano(scene.pano)
    })
    const heading = viewer.addListener('pov_changed', () => callbacks.current.onHeading(viewer.getPov().heading))
    viewer.setOptions({
      linksControl: movement === 'moving',
      clickToGo: movement === 'moving',
      scrollwheel: movement !== 'fixed',
      disableDoubleClickZoom: movement === 'fixed',
      panControl: false,
      zoomControl: movement !== 'fixed',
      keyboardShortcuts: movement !== 'fixed',
    })
    viewer.setPano(scene.pano)
    viewer.setPov({ heading: scene.heading, pitch: scene.pitch })
    viewer.setZoom(scene.zoom)
    viewer.setVisible(true)
    // Same panorama on retry may not emit a fresh status event.
    const check = window.setTimeout(report, 200)
    const timeout = window.setTimeout(() => {
      if (!ready) setError('The view is taking too long to load. Check your connection.')
    }, 18_000)
    return () => {
      status.remove()
      position.remove()
      heading.remove()
      clearTimeout(check)
      clearTimeout(timeout)
    }
  }, [loaded, scene.pano, scene.heading, scene.pitch, scene.zoom, movement, attempt])
  return (
    <>
      <div
        ref={element}
        data-lenis-prevent
        className={`geo-panorama ${movement === 'fixed' ? 'geo-panorama-fixed' : ''}`}
        aria-label="Street View location"
      />
      {!loaded && !error && (
        <div className="geo-view-message">
          <Loader2 className="animate-spin" />
          <span>Opening the view…</span>
        </div>
      )}
      {error && (
        <div className="geo-view-message" role="alert">
          <AlertCircle />
          <p>{error}</p>
        </div>
      )}
      {loaded && playing && movement === 'moving' && (
        <button
          type="button"
          className="geo-return"
          onClick={() => {
            const viewer = pano.current
            if (!viewer) return
            // Keep the SDK instance (and its loaded imagery) alive when returning.
            if (viewer.getPano() !== scene.pano) viewer.setPano(scene.pano)
            viewer.setPov({ heading: scene.heading, pitch: scene.pitch })
            viewer.setZoom(scene.zoom)
          }}
        >
          <RotateCcw size={15} aria-hidden /> Back to start
        </button>
      )}
    </>
  )
}

/** How long the reveal lines take to reach the answer. */
export const REVEAL_LINE_MS = 1_100

/** A point part-way along the great circle from `a` to `b`. */
function along(a: Point, b: Point, t: number): Point {
  const rad = Math.PI / 180
  const toVec = (p: Point) => [Math.cos(p.lat * rad) * Math.cos(p.lng * rad), Math.cos(p.lat * rad) * Math.sin(p.lng * rad), Math.sin(p.lat * rad)]
  const va = toVec(a)
  const vb = toVec(b)
  const dot = Math.min(1, Math.max(-1, va[0]! * vb[0]! + va[1]! * vb[1]! + va[2]! * vb[2]!))
  const angle = Math.acos(dot)
  if (angle < 1e-9) return b
  const s = Math.sin(angle)
  const wa = Math.sin((1 - t) * angle) / s
  const wb = Math.sin(t * angle) / s
  const x = wa * va[0]! + wb * vb[0]!
  const y = wa * va[1]! + wb * vb[1]!
  const z = wa * va[2]! + wb * vb[2]!
  return { lat: Math.atan2(z, Math.hypot(x, y)) / rad, lng: Math.atan2(y, x) / rad }
}

export function GeoMapCanvas({
  point,
  onPin,
  result,
  players,
  focus,
  map: region,
  disabled = false,
  attempt = 0,
}: {
  point: Point | null
  onPin?: (p: Point) => void
  result?: GeoRound
  players: { id: string; name: string }[]
  focus?: string | null
  map: 'world' | 'india'
  disabled?: boolean
  attempt?: number
}) {
  const element = useRef<HTMLDivElement>(null)
  const map = useRef<GeoMap | null>(null)
  const callbacks = useRef({ onPin, disabled, result })
  callbacks.current = { onPin, disabled, result }
  const [loaded, setLoaded] = useState(false)
  const [boot, setBoot] = useState(0)
  /*
   * When this round's reveal began. Party updates redraw the map many times a
   * round; the reveal resumes from here rather than restarting or skipping.
   */
  const reveal = useRef<{ round: number; start: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (attempt > 0 && !map.current) setBoot((n) => n + 1)
  }, [attempt])
  useEffect(() => {
    let cancelled = false
    let cleanup = () => {}
    const authError = () => setError('Google Maps access was denied. Ask the host to check map setup.')
    window.addEventListener('geo:auth-error', authError)
    void loadMaps()
      .then((sdk) => {
        if (cancelled || !element.current) return
        const canvas = new sdk.Map(element.current, {
          center: region === 'india' ? { lat: 22.8, lng: 79 } : { lat: 20, lng: 0 },
          zoom: region === 'india' ? 4 : 2,
          minZoom: 1,
          maxZoom: 19,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          renderingType: 'RASTER',
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        })
        map.current = canvas
        canvas.addListener('click', (event) => {
          if (event?.latLng && !callbacks.current.disabled && !callbacks.current.result)
            callbacks.current.onPin?.({ lat: event.latLng.lat(), lng: event.latLng.lng() })
        })
        const resize = new ResizeObserver(() => {
          const center = canvas.getCenter()
          sdk.event.trigger(canvas, 'resize')
          if (center) canvas.setCenter({ lat: center.lat(), lng: center.lng() })
        })
        resize.observe(element.current)
        cleanup = () => {
          resize.disconnect()
          sdk.event.clearInstanceListeners(canvas)
          map.current = null
        }
        setLoaded(true)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
      cleanup()
      window.removeEventListener('geo:auth-error', authError)
    }
    // The canvas stays mounted across pins, rounds, resizing and reveals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boot])
  useEffect(() => {
    if (!loaded || !map.current) return
    let cancelled = false
    let raf = 0
    let cleanup = () => {}
    void loadMaps().then((sdk) => {
      if (cancelled || !map.current) return
      const canvas = map.current
      const markers: InstanceType<typeof sdk.Marker>[] = []
      const lines: InstanceType<typeof sdk.Polyline>[] = []
      const marker = (p: Point, color: string, title: string, label?: string, draggable = false, drop = false) => {
        const m = new sdk.Marker({
          map: canvas,
          position: p,
          title,
          draggable,
          animation: drop ? sdk.Animation?.DROP : undefined,
          label: label ? { text: label, color: '#102925', fontWeight: '700', fontSize: '11px' } : undefined,
          icon: {
            path: sdk.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: label ? 12 : 8,
          },
        })
        if (draggable)
          m.addListener('dragend', () => {
            const pos = m.getPosition()
            if (pos) callbacks.current.onPin?.({ lat: pos.lat(), lng: pos.lng() })
          })
        markers.push(m)
      }
      if (result) {
        /*
         * A new reveal plays out: each guess draws a line toward the real
         * place, and the real place drops in when the lines arrive. Picking a
         * player or reopening a past round just shows the finished picture.
         */
        const began = reveal.current?.round === result.round ? reveal.current.start : -Infinity
        const animate = performance.now() - began < REVEAL_LINE_MS
        const guesses = players.flatMap((player, i) => {
          const guess = result.guesses[player.id]?.point
          return guess && (!focus || focus === player.id) ? [{ player, i, guess }] : []
        })
        const drawn = guesses.map(({ player, i, guess }) => {
          const color = COLORS[i % COLORS.length]!
          marker(guess, color, player.name, String(i + 1))
          const line = new sdk.Polyline({
            map: canvas,
            path: animate ? [guess, guess] : [guess, result.location],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 2.5,
          })
          lines.push(line)
          return { line, guess }
        })
        const land = () => {
          if (cancelled) return
          marker(result.location, '#142f29', 'Actual location', '•', false, animate)
          if (animate) canvas.fitBounds(boundsForPoints([result.location, ...guesses.map((g) => g.guess)]), 45)
        }
        if (!animate || !drawn.length) land()
        else {
          const frame = (now: number) => {
            if (cancelled) return
            const t = Math.min(1, Math.max(0, (now - began) / REVEAL_LINE_MS))
            const eased = 1 - (1 - t) ** 3
            for (const { line, guess } of drawn) line.setPath([guess, along(guess, result.location, eased)])
            if (t < 1) raf = requestAnimationFrame(frame)
            else land()
          }
          raf = requestAnimationFrame(frame)
        }
      } else if (point) marker(point, '#ef795c', 'Your guess', undefined, !disabled)
      cleanup = () => {
        cancelAnimationFrame(raf)
        for (const m of markers) {
          sdk.event.clearInstanceListeners(m)
          m.setMap(null)
        }
        for (const l of lines) l.setMap(null)
      }
    })
    return () => {
      cancelled = true
      cleanup()
    }
  }, [loaded, point, result, players, focus, disabled])
  useEffect(() => {
    if (!loaded || !map.current) return
    if (result) {
      const guesses = Object.entries(result.guesses)
        .filter(([id]) => !focus || id === focus)
        .flatMap(([, g]) => (g.point ? [g.point] : []))
      /* A fresh reveal starts where the guesses are, then flies out to the answer as the lines arrive. */
      if (reveal.current?.round !== result.round) {
        const still = matchMedia('(prefers-reduced-motion: reduce)').matches
        reveal.current = { round: result.round, start: still ? -Infinity : performance.now() }
        if (!still && guesses.length === 1) return map.current.setOptions({ center: guesses[0], zoom: 5 })
        if (!still && guesses.length > 1) return map.current.fitBounds(boundsForPoints(guesses), 60)
      }
      /* Mid-reveal, the landing does the framing. */
      if (performance.now() - reveal.current.start < REVEAL_LINE_MS) return
      map.current.fitBounds(boundsForPoints([result.location, ...guesses]), 45)
    } else {
      map.current.setOptions({
        center: region === 'india' ? { lat: 22.8, lng: 79 } : { lat: 20, lng: 0 },
        zoom: region === 'india' ? 4 : 2,
      })
    }
  }, [loaded, result, focus, region])
  return (
    <>
      <div
        ref={element}
        className="geo-map-canvas"
        data-lenis-prevent
        aria-label={result ? 'Round results map' : 'Guessing map'}
      />
      {error ? (
        <div className="geo-view-message" role="alert">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : !loaded ? (
        <div className="geo-view-message">
          <Loader2 className="animate-spin" />
          <span>Opening map…</span>
        </div>
      ) : null}
      {loaded && !result && !disabled && (
        <button
          className="geo-map-centre"
          onClick={() => {
            const center = map.current?.getCenter()
            if (center) onPin?.({ lat: center.lat(), lng: center.lng() })
          }}
        >
          <LocateFixed size={14} /> Pin map centre
        </button>
      )}
    </>
  )
}
