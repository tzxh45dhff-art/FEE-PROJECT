import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace } from 'three'
import type { Mesh, PointLight } from 'three'

/**
 * The hero's soap bubble.
 *
 * Lazily imported — this is what pulls in three.js, so it must never be reached
 * on the first paint.
 *
 * The rainbow is thin-film interference, not a painted gradient and not an
 * environment map. `iridescence` on MeshPhysicalMaterial models the way light
 * reflecting off the inner and outer surfaces of a soap film interferes with
 * itself, so the colour depends on viewing angle and film thickness — it shifts
 * as the bubble turns and as you move the pointer. An HDRI would have meant a
 * network fetch for something that is physically the wrong model anyway.
 */

const LIGHTS: { colour: string; position: [number, number, number]; intensity: number }[] = [
  { colour: '#ff2f5e', position: [-4, 3, 4], intensity: 34 },
  { colour: '#2b6bff', position: [4, -2, 4], intensity: 16 },
  { colour: '#26e6c8', position: [0, 4, -3], intensity: 26 },
  { colour: '#ffd166', position: [3, 3, 1], intensity: 20 },
  { colour: '#ffffff', position: [0, -4, 2], intensity: 30 },
]

/**
 * A painted equirectangular environment, generated once into a 2D canvas.
 *
 * Iridescence and transmission both need something to reflect and refract —
 * with no environment they resolve to flat grey, which is exactly what a glass
 * ball in an empty room looks like. Building the map here rather than fetching
 * an HDRI keeps it offline, keeps the palette ours, and costs one 512×256
 * canvas at mount.
 */
function useEnvironment() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const context = canvas.getContext('2d')!

    /* Bright and fully saturated. A dark environment reflects as grey, which
       is exactly the mistake that turns a soap bubble into a marble. */
    const base = context.createLinearGradient(0, 0, 512, 256)
    base.addColorStop(0, '#ff2f5e')
    base.addColorStop(0.28, '#a01aff')
    base.addColorStop(0.52, '#2b6bff')
    base.addColorStop(0.74, '#26e6c8')
    base.addColorStop(1, '#ffd166')
    context.fillStyle = base
    context.fillRect(0, 0, 512, 256)

    // A dark band gives the film something to break against.
    const shade = context.createLinearGradient(0, 0, 0, 256)
    shade.addColorStop(0, 'rgba(0,0,0,0)')
    shade.addColorStop(0.55, 'rgba(0,0,0,0.55)')
    shade.addColorStop(1, 'rgba(0,0,0,0.05)')
    context.fillStyle = shade
    context.fillRect(0, 0, 512, 256)

    /* Bright, saturated sources. These are what the film picks up and splits
       into colour — a dim environment gives a dim, muddy bubble. */
    const lamps: [number, number, number, string][] = [
      [90, 60, 110, '#ffffff'],
      [300, 40, 130, '#ffffff'],
      [430, 170, 100, '#26e6c8'],
      [180, 210, 95, '#ffd166'],
      [30, 190, 85, '#ff2f5e'],
    ]

    context.globalCompositeOperation = 'lighter'
    for (const [x, y, radius, colour] of lamps) {
      const glow = context.createRadialGradient(x, y, 0, x, y, radius)
      glow.addColorStop(0, colour)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      context.fillStyle = glow
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    const texture = new CanvasTexture(canvas)
    texture.mapping = EquirectangularReflectionMapping
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [])
}

function Environment() {
  const texture = useEnvironment()
  const { scene } = useThree()

  useEffect(() => {
    scene.environment = texture
    return () => {
      scene.environment = null
      texture.dispose()
    }
  }, [scene, texture])

  return null
}

function Bubble({ pointer }: { pointer: { x: number; y: number } }) {
  const mesh = useRef<Mesh>(null)
  const { viewport } = useThree()

  useFrame((state, delta) => {
    if (!mesh.current) return

    // Slow idle turn, plus a gentle lean toward the cursor.
    mesh.current.rotation.y += delta * 0.14
    mesh.current.rotation.x += delta * 0.045

    mesh.current.position.x += (pointer.x * 0.4 - mesh.current.position.x) * 0.04
    mesh.current.position.y += (-pointer.y * 0.28 - mesh.current.position.y) * 0.04
    mesh.current.rotation.z += (pointer.y * 0.22 - mesh.current.rotation.z) * 0.03

    // Breathe, very slightly — a perfectly still sphere reads as a static image.
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.55) * 0.018
    mesh.current.scale.setScalar(breathe * Math.min(viewport.width, viewport.height) * 0.36)
  })

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 128, 128]} />
      <meshPhysicalMaterial
        /* Held well below 1 on purpose. Light passing straight through carries
           no film colour, and on a black page a highly transmissive sphere
           simply disappears — the rainbow lives in the surface reflection. */
        transmission={0.3}
        thickness={0.22}
        roughness={0.02}
        ior={1.31}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.02}
        /* Thin-film interference — the whole rainbow comes from these three. */
        iridescence={1}
        iridescenceIOR={1.32}
        iridescenceThicknessRange={[180, 1100]}
        specularIntensity={1}
        envMapIntensity={4.2}
        color="#ffffff"
      />
    </mesh>
  )
}

/** Coloured lights that orbit slowly, so the film keeps shifting hue. */
function Lights() {
  const group = useRef<(PointLight | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.forEach((light, index) => {
      if (!light) return
      const base = LIGHTS[index]!
      const drift = 0.5 + index * 0.12
      light.position.x = base.position[0] + Math.sin(t * drift) * 1.1
      light.position.y = base.position[1] + Math.cos(t * drift * 0.8) * 0.9
    })
  })

  return (
    <>
      {/* Kept low — the environment map is doing the lighting now, and
          ambient light only flattens the film back toward grey. */}
      <ambientLight intensity={0.12} />
      {LIGHTS.map((light, index) => (
        <pointLight
          key={light.colour}
          ref={(node) => {
            group.current[index] = node
          }}
          color={light.colour}
          intensity={light.intensity}
          distance={18}
          position={light.position}
        />
      ))}
    </>
  )
}

export default function HeroOrb() {
  const pointer = useRef({ x: 0, y: 0 })

  return (
    <div
      className="size-full"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Environment />
        <Lights />
        <Bubble pointer={pointer.current} />
      </Canvas>
    </div>
  )
}
