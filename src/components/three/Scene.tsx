import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls, ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { useConfigurator } from '../../store/configurator'
import { isCompactViewport } from '../../lib/device'
import type { ViewId } from '../../types'
import { CarModel } from './GltfCar'
import { MaterialsProvider } from './materials'

const VIEWS: Record<ViewId, { position: [number, number, number]; target: [number, number, number] }> = {
  'three-quarter': { position: [6.9, 3.0, 6.9], target: [0, 0.72, 0] },
  front: { position: [8.6, 1.8, 0.001], target: [0, 0.6, 0] },
  profile: { position: [-0.6, 1.5, 8.8], target: [-0.6, 0.68, 0] },
  rear: { position: [-8.4, 1.15, 0.001], target: [0, 0.62, 0] },
  top: { position: [0.001, 9.8, 1.1], target: [0, 0.3, 0] },
  cockpit: { position: [2.8, 2.0, 1.9], target: [-0.1, 0.85, 0] },
}

function Plinth() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2.6, 2.67, 0.12, 96]} />
        <meshStandardMaterial color="#0d0e11" metalness={0.35} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.121, 0]}>
        <cylinderGeometry args={[2.52, 2.6, 0.016, 96]} />
        <meshStandardMaterial color="#0f1114" metalness={0.45} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.34, 0.006, 10, 160]} />
        <meshStandardMaterial color="#c8a96a" metalness={1} roughness={0.25} envMapIntensity={1.4} />
      </mesh>
    </group>
  )
}

export function Scene() {
  const controls = useRef<React.ComponentRef<typeof CameraControls> | null>(null)
  const turntable = useRef<THREE.Group>(null)
  const spinT = useRef(1)
  const snapTarget = useRef<number | null>(null)
  const view = useConfigurator((s) => s.view)
  const viewEpoch = useConfigurator((s) => s.viewEpoch)
  const modelEpoch = useConfigurator((s) => s.modelEpoch)
  const panelOpen = useConfigurator((s) => s.panelOpen)
  const compact = useMemo(isCompactViewport, [])
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)
  const lastViewKey = useRef('')

  useEffect(() => {
    const c = controls.current
    if (c) {
      c.smoothTime = 0.45
      c.dollySpeed = 0.85
      c.truckSpeed = 0.9
    }
  }, [])

  useEffect(() => {
    const v = VIEWS[view]
    const aspect = Math.max(size.width / Math.max(size.height, 1), 0.3)
    const mult = Math.min(Math.max(1.5 / aspect, 1), 2.05)
    let [px, py, pz] = v.position
    const [tx, ty, tz] = v.target
    if (view === 'profile' && compact) {
      px = tx
    }
    const camX = tx + (px - tx) * mult
    const camY = ty + (py - ty) * mult
    const camZ = tz + (pz - tz) * mult
    const baseDist = Math.hypot(px - tx, py - ty, pz - tz)
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 32
    const visibleH = 2 * baseDist * mult * Math.tan((fov * Math.PI) / 360)
    const lift = compact && aspect < 1 && panelOpen ? 0.21 * visibleH : 0
    controls.current?.setLookAt(camX, camY, camZ, tx, ty - lift, tz, true)

    const viewKey = `${view}:${viewEpoch}`
    if (lastViewKey.current !== viewKey) {
      lastViewKey.current = viewKey
      const g = turntable.current
      if (g) {
        const twoPi = Math.PI * 2
        snapTarget.current = Math.round(g.rotation.y / twoPi) * twoPi
      }
    }
  }, [view, viewEpoch, panelOpen, size.width, size.height, compact, camera])

  useEffect(() => {
    spinT.current = 0
  }, [modelEpoch])

  useFrame((_, delta) => {
    const g = turntable.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    const state = useConfigurator.getState()
    const idle = performance.now() - state.lastInteraction
    if (state.turntable && idle > 3200 && snapTarget.current === null) g.rotation.y += 0.22 * dt

    if (snapTarget.current !== null) {
      const diff = snapTarget.current - g.rotation.y
      if (Math.abs(diff) < 0.002) {
        g.rotation.y = snapTarget.current
        snapTarget.current = null
      } else {
        g.rotation.y += diff * Math.min(1, dt * 3.2)
      }
    }

    if (spinT.current < 1) {
      const prev = spinT.current
      spinT.current = Math.min(1, spinT.current + dt / 1.15)
      const ease = (t: number) => 1 - Math.pow(1 - t, 3)
      g.rotation.y += (ease(spinT.current) - ease(prev)) * Math.PI * 0.85
    }
  })

  return (
    <>
      <MaterialsProvider>
        <group ref={turntable}>
          <Plinth />
          <group position={[0, 0.128, 0]}>
            <CarModel />
          </group>
        </group>
      </MaterialsProvider>

      <ContactShadows position={[0, 0.004, 0]} opacity={0.62} scale={9.5} blur={2.4} far={2.9} resolution={compact ? 512 : 1024} color="#000000" />

      <Environment resolution={512} frames={1}>
        <color attach="background" args={['#39414d']} />
        <Lightformer form="rect" intensity={1.8} rotation-x={Math.PI / 2} position={[0, 5, -1]} scale={[7, 4, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.3} rotation-x={Math.PI / 2} rotation-z={Math.PI / 4} position={[0, 4.5, 3]} scale={[7, 2.5, 1]} color="#e7edff" />
        <Lightformer form="rect" intensity={1.1} rotation-y={-Math.PI / 3} position={[6, 2.5, 2]} scale={[5, 2.5, 1]} color="#fff3e0" />
        <Lightformer form="rect" intensity={1.0} rotation-y={Math.PI / 3} position={[-6, 2.5, -3]} scale={[5, 2.5, 1]} color="#d4ddff" />
        <Lightformer form="rect" intensity={1.2} rotation-y={Math.PI} position={[0, 3, 7.5]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} rotation-y={Math.PI / 2.2} position={[7.5, 3, -4]} scale={[6, 3, 1]} color="#f2f5fa" />
        <Lightformer form="rect" intensity={0.7} rotation-x={-Math.PI / 2} position={[0, -2.5, 0]} scale={[6, 3, 1]} color="#3a4250" />
      </Environment>

      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 7, 4]} intensity={1.15} color="#fff6e8" />
      <directionalLight position={[-5, 4, -6]} intensity={0.5} color="#c9d4ff" />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={4}
        maxDistance={24}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minPolarAngle={0.12}
      />
    </>
  )
}
