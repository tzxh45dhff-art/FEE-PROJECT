import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { CanvasTexture, Plane, Vector3, SRGBColorSpace, RepeatWrapping, type Group, type Mesh, type PerspectiveCamera } from 'three'
import { DESK, PEN_LENGTH, aimContact, sampleFlight, type Flick, type Pair, type Position } from './physics'
import type { GameSnapshot, PenStyle } from '../types'
import { usePageVisible } from '@/hooks/usePageVisible'

const MAX_PULL = 0.18
export type Aim = { dx: number; dz: number; power: number; contact: number }
const INKS = ['#2453a5', '#ae362c']

/** Seeded canvas textures: no downloaded models, texture requests, or heavy post-processing. */
function texture(kind: 'wood' | 'floor') {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const c = canvas.getContext('2d')!
  let seed = 29
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  c.fillStyle = kind === 'wood' ? '#956338' : '#b9b6a3'
  c.fillRect(0, 0, 512, 512)
  if (kind === 'wood') {
    for (let i = 0; i < 1800; i++) {
      const x = random() * 512, y = random() * 512
      c.strokeStyle = random() > 0.5 ? `rgba(75,39,14,${random() * 0.12})` : `rgba(255,225,163,${random() * 0.22})`
      c.lineWidth = random() * 1.2
      c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 4, y + 60, x - 3, y + 120, x + 1, y + 220); c.stroke()
    }
    c.strokeStyle = '#805a3470'; c.lineWidth = 1
    for (const x of [128, 340]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 1, 512); c.stroke() }
    c.strokeStyle = '#e4bb7b70'
    for (let i = 0; i < 45; i++) {
      const x = random() * 500, y = random() * 500
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + random() * 16 - 8, y + random() * 30); c.stroke()
    }
    c.strokeStyle = '#78522a55'; c.lineWidth = 2
    c.beginPath(); c.ellipse(370, 120, 19, 22, 0.3, 0, Math.PI * 2); c.stroke()
    c.font = '12px monospace'; c.fillStyle = '#69503865'; c.save(); c.translate(35, 390); c.rotate(-Math.PI / 2); c.fillText('LAST BENCH / HUDDLE', 0, 0); c.restore()
    c.font = '18px serif'; c.fillStyle = '#e1bb7a70'; c.fillText('A + B', 400, 430)
  } else {
    c.strokeStyle = '#6b6b5e'; c.lineWidth = 4
    for (let x = 0; x <= 512; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 512); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(512, x); c.stroke() }
  }
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  if (kind === 'floor') { map.wrapS = map.wrapT = RepeatWrapping; map.repeat.set(4, 4) }
  return map
}

function Desk({ x = 0, z = 0, main = false }: { x?: number; z?: number; main?: boolean }) {
  const wood = useMemo(() => texture('wood'), [])
  useEffect(() => () => wood.dispose(), [wood])
  return <group position={[x, 0, z]}>
    <mesh position={[0, -0.017, 0]} castShadow receiveShadow><boxGeometry args={[DESK.width, 0.034, DESK.depth]} /><meshStandardMaterial map={wood} roughness={0.87} /></mesh>
    {[-1, 1].flatMap(a => [-1, 1].map(b => <mesh key={`${a}${b}`} position={[a * 0.19, -0.23, b * 0.29]} rotation={[0, 0, a * 0.07]} castShadow><boxGeometry args={[0.025, 0.43, 0.025]} /><meshStandardMaterial color="#292c28" roughness={0.55} metalness={0.5} /></mesh>))}
    <mesh position={[0, -0.13, -0.28]}><boxGeometry args={[0.41, 0.045, 0.025]} /><meshStandardMaterial color="#30352c" /></mesh>
    {!main && <group position={[0.12, -0.16, 0.37]} rotation={[0.12, 0.08, -0.08]}>
      <mesh castShadow><boxGeometry args={[0.14, 0.21, 0.07]} /><meshStandardMaterial color={x > 0 ? '#374359' : '#6d3a30'} roughness={1} /></mesh>
      <mesh position={[0, -0.025, 0.045]}><boxGeometry args={[0.11, 0.09, 0.025]} /><meshStandardMaterial color={x > 0 ? '#2c3546' : '#562c27'} /></mesh>
    </group>}
  </group>
}

function PenModel({ index, positions, style }: { index: number; positions: React.RefObject<Pair>; style: PenStyle }) {
  const group = useRef<Group>(null)
  const fall = useRef(0)
  const last = useRef({ x: 0, z: 0 })
  useFrame((_, dt) => {
    const p = positions.current[index]!, g = group.current
    if (!g) return
    if (p.onDesk) { fall.current = 0; last.current = p }
    else fall.current = Math.min(0.8, fall.current + Math.min(dt, 0.04))
    const f = fall.current
    g.position.set(p.x + (p.x - last.current.x) * f * 4, 0.007 - f * f * 1.4, p.z + (p.z - last.current.z) * f * 4)
    g.rotation.set(f * 3, -p.angle, f * 2)
    g.visible = f < 0.72
  })
  const color = INKS[index]!, dark = style === 'fine' ? '#202a31' : color
  return <group ref={group}>
    <group rotation={[0, 0, -Math.PI / 2]}>
      <mesh castShadow><cylinderGeometry args={[0.0046, 0.0046, 0.104, 12]} /><meshStandardMaterial color={style === 'classic' ? '#eee9d9' : dark} roughness={0.32} metalness={style === 'fine' ? 0.4 : 0.05} /></mesh>
      <mesh position={[0, 0.057, 0]} castShadow><cylinderGeometry args={[0.0055, 0.0055, 0.032, 12]} /><meshStandardMaterial color={color} roughness={0.28} /></mesh>
      <mesh position={[0, -0.058, 0]} castShadow><cylinderGeometry args={[0.0046, 0.002, 0.013, 12]} /><meshStandardMaterial color={style === 'classic' ? '#ddd9cd' : '#adb3b4'} roughness={0.3} metalness={0.65} /></mesh>
      <mesh position={[0, -0.067, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.002, 0.008, 10]} /><meshStandardMaterial color="#7c898e" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, 0.048, 0.0058]} castShadow><boxGeometry args={[0.0025, 0.038, 0.0018]} /><meshStandardMaterial color={style === 'fine' ? '#c2c6c8' : color} metalness={0.45} roughness={0.25} /></mesh>
      {[0.035, 0.038].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.0049, 0.0049, 0.0015, 12]} /><meshStandardMaterial color="#292d33" /></mesh>)}
      {style === 'gel' && [-0.035, -0.03, -0.025, -0.02, -0.015].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.005, 0.005, 0.0015, 12]} /><meshStandardMaterial color="#26374b" /></mesh>)}
    </group>
  </group>
}

function CameraFit({ seat }: { seat: 0 | 1 }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const cam = camera as PerspectiveCamera
    // Keep the whole desk in frame, including narrow phones and short landscapes.
    const aspect = size.width / Math.max(1, size.height)
    const distance = Math.max(1.02, 0.72 / aspect)
    cam.position.set(0, distance * 0.91, distance * 0.69 * (seat === 0 ? 1 : -1))
    cam.fov = 42; cam.lookAt(0, -0.025, 0); cam.updateProjectionMatrix()
  }, [camera, size.width, size.height, seat])
  return null
}

function Scene({ snapshot, seat, viewSeat, enabled, dragEnabled = true, aim, onAim, onFlick }: {
  snapshot: GameSnapshot; seat: 0 | 1; viewSeat?: 0 | 1; enabled: boolean; dragEnabled?: boolean; aim: Aim | null
  onAim: (aim: Aim | null) => void; onFlick: (shot: Flick) => void
}) {
  const positions = useRef<Pair>(snapshot.pens)
  const pointer = useRef<{ id: number; start: [number, number]; contact: number } | null>(null)
  const draft = useRef<Aim | null>(null)
  const ring = useRef<Mesh>(null)
  const arrow = useRef<Group>(null)
  const floor = useMemo(() => texture('floor'), [])
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  useEffect(() => () => floor.dispose(), [floor])
  useEffect(() => { pointer.current = null; draft.current = null; onAim(null) }, [snapshot.epoch, snapshot.seq, enabled, onAim])
  useFrame(() => {
    const elapsed = Date.now() - snapshot.receivedAt + snapshot.serverNow - (snapshot.shot?.startedAt ?? snapshot.serverNow)
    positions.current = snapshot.shot ? sampleFlight(snapshot.shot, elapsed) : snapshot.pens
    const p = positions.current[seat]
    if (ring.current) { ring.current.position.set(p.x, 0.001, p.z); ring.current.visible = enabled && !aim }
    if (arrow.current) {
      arrow.current.visible = !!aim && enabled
      if (aim) {
        const length = 0.035 + aim.power * 0.15
        const heading = Math.atan2(aim.dz, aim.dx)
        arrow.current.position.set(p.x, 0.002, p.z)
        arrow.current.rotation.y = -heading
        arrow.current.scale.set(length, 1, 1)
      }
    }
  })
  const hit = (e: ThreeEvent<PointerEvent>) => {
    const p = new Vector3()
    return e.ray.intersectPlane(plane, p) ? p : null
  }
  const update = (e: ThreeEvent<PointerEvent>) => {
    const current = pointer.current, p = hit(e)
    if (!current || current.id !== e.pointerId || !p) return
    const dx = current.start[0] - p.x, dz = current.start[1] - p.z
    const length = Math.hypot(dx, dz)
    draft.current = { dx: dx / (length || 1), dz: dz / (length || 1), power: Math.min(1, length / MAX_PULL), contact: current.contact }
    onAim(draft.current)
  }
  const cancel = () => { pointer.current = null; draft.current = null; onAim(null) }
  useEffect(() => {
    const cancel = () => { pointer.current = null; draft.current = null; onAim(null) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel() }
    window.addEventListener('blur', cancel); window.addEventListener('keydown', key)
    return () => { window.removeEventListener('blur', cancel); window.removeEventListener('keydown', key) }
  }, [onAim])
  return <>
    <CameraFit seat={viewSeat ?? seat} />
    <color attach="background" args={['#777d65']} />
    <hemisphereLight args={['#fff0cf', '#353e31', 1.8]} />
    <directionalLight position={[-0.8, 1.7, 0.4]} intensity={2} color="#fff0d1" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-1.5} shadow-camera-right={1.5} shadow-camera-top={1.5} shadow-camera-bottom={-1.5} shadow-bias={-0.0003} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow><planeGeometry args={[4, 4]} /><meshStandardMaterial map={floor} roughness={1} /></mesh>
    <Desk main /><Desk x={-0.83} z={-0.35} /><Desk x={0.83} z={-0.35} />
    <mesh position={[0, -0.31, 0.52]} castShadow><boxGeometry args={[0.33, 0.025, 0.23]} /><meshStandardMaterial color="#805632" /></mesh>
    {[0, 1].map(i => <PenModel key={i} index={i} positions={positions} style={snapshot.styles[i]!} />)}
    <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.025, 0.027, 48]} /><meshBasicMaterial color="#f9e3a5" transparent opacity={0.8} /></mesh>
    <group ref={arrow}>
      <mesh position={[0.48, 0, 0]}><boxGeometry args={[0.8, 0.001, 0.003]} /><meshBasicMaterial color="#f9edbc" /></mesh>
      <mesh position={[0.95, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.007, 0.1, 3]} /><meshBasicMaterial color="#fff3c5" /></mesh>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}
      onPointerDown={e => {
        if (!enabled || !dragEnabled || pointer.current || e.button !== 0 || !e.isPrimary) return
        const p = hit(e), mine: Position = positions.current[seat]
        if (!p || !mine.onDesk) return
        const along = (p.x - mine.x) * Math.cos(mine.angle) + (p.z - mine.z) * Math.sin(mine.angle)
        const clamped = Math.max(-PEN_LENGTH / 2, Math.min(PEN_LENGTH / 2, along))
        const distance = Math.hypot(p.x - mine.x - Math.cos(mine.angle) * clamped, p.z - mine.z - Math.sin(mine.angle) * clamped)
        if (distance > 0.035) return
        e.stopPropagation()
        ;(e.target as unknown as Element).setPointerCapture(e.pointerId)
        pointer.current = { id: e.pointerId, start: [p.x, p.z], contact: aimContact(along) }
        onAim({ dx: 0, dz: seat === 0 ? -1 : 1, power: 0, contact: pointer.current.contact })
      }}
      onPointerMove={update}
      onPointerUp={e => {
        if (pointer.current?.id !== e.pointerId) return
        update(e)
        const shot = draft.current
        cancel()
        ;(e.target as unknown as Element).releasePointerCapture(e.pointerId)
        if (enabled && shot && shot.power >= 0.06) onFlick(shot)
      }}
      onPointerCancel={cancel} onLostPointerCapture={cancel}>
      <planeGeometry args={[8, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  </>
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="pf-render-error">The 3D desk couldn’t open. Enable hardware acceleration in your browser, then reopen Pen Fight.</div> : this.props.children }
}
export default function PenFightTable(props: Parameters<typeof Scene>[0]) {
  const visible = usePageVisible()
  return <SceneBoundary><Canvas frameloop={visible ? 'always' : 'demand'} shadows dpr={[1, 1.5]} camera={{ fov: 42 }} gl={{ antialias: true, alpha: false }} style={{ touchAction: 'none' }}><Scene {...props} /></Canvas></SceneBoundary>
}
