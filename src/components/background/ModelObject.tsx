import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3, type Group } from 'three'

/**
 * Lazily imported — this module is what pulls in three.js, so it must only ever
 * be reached when `hasModels` is true.
 */

function NormalisedModel({ url, spin }: { url: string; spin: number }) {
  const { scene } = useGLTF(url)
  const group = useRef<Group>(null)

  /*
   * Fit any GLB into a unit cube centred on the origin. Downloaded models come
   * at wildly different scales and origins; without this, one model fills the
   * frame and the next is a speck. On-screen size stays a CSS concern.
   */
  const object = useMemo(() => {
    const clone = scene.clone(true)

    const bounds = new Box3().setFromObject(clone)
    const size = bounds.getSize(new Vector3())
    const longestAxis = Math.max(size.x, size.y, size.z) || 1
    clone.scale.multiplyScalar(1 / longestAxis)

    const rescaled = new Box3().setFromObject(clone)
    clone.position.sub(rescaled.getCenter(new Vector3()))

    return clone
  }, [scene])

  useFrame((_, delta) => {
    if (group.current && spin !== 0) group.current.rotation.y += delta * spin
  })

  return (
    <group ref={group}>
      <primitive object={object} />
    </group>
  )
}

type ModelObjectProps = {
  url: string
  /** Radians per second around Y. */
  spin?: number
  still?: boolean
}

export default function ModelObject({ url, spin = 0.25, still = false }: ModelObjectProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      /* z=2.6 clears the 1.73-unit diagonal of a unit cube as it rotates. */
      camera={{ position: [0, 0, 2.6], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      frameloop={still ? 'demand' : 'always'}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      {/* Signal-coloured rim, so models sit in the same light as the CSS objects. */}
      <directionalLight position={[-4, -1, -3]} intensity={0.8} color="#3ee9b0" />
      <Suspense fallback={null}>
        <NormalisedModel url={url} spin={still ? 0 : spin} />
      </Suspense>
    </Canvas>
  )
}
