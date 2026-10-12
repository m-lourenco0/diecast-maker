import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { isCompactViewport } from '../../lib/device'
import { useConfigurator } from '../../store/configurator'
import { Scene } from './Scene'

export function ConfiguratorCanvas() {
  const markInteraction = useConfigurator((s) => s.markInteraction)
  const compact = useMemo(isCompactViewport, [])

  return (
    <div className="absolute inset-0 z-10" onPointerDownCapture={markInteraction}>
      <Canvas
        dpr={compact ? [1, 1.75] : [1, 2]}
        camera={{ fov: 32, position: [6.9, 3.0, 6.9], near: 0.1, far: 90 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.12
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
