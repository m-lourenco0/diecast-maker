import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { CarDims } from '../../data/profiles'
import { byId } from '../../data/catalog'
import { buildBodyGeometry, buildCabinGeometry, taperFactor, TUMBLE } from '../../lib/carShapes'
import { useConfigurator } from '../../store/configurator'
import { useMaterials } from './materials'

/* ------------------------------------------------------------------ body */

export function CarBody({ dims }: { dims: CarDims }) {
  const { paint } = useMaterials()
  const geometry = useMemo(() => buildBodyGeometry(dims), [dims])
  return <mesh geometry={geometry} material={paint} />
}

export function Cabin({ dims }: { dims: CarDims }) {
  const { glass } = useMaterials()
  const geometry = useMemo(() => buildCabinGeometry(dims), [dims])
  return <mesh geometry={geometry} material={glass} />
}

export function RoofCap({ dims }: { dims: CarDims }) {
  const { paint } = useMaterials()
  const length = dims.windshieldTopX - dims.backlightTopX + 0.06
  const x = (dims.windshieldTopX + dims.backlightTopX) / 2
  const glassTop = Math.max(dims.width - 0.22, 0.9) * (1 - TUMBLE)
  return (
    <RoundedBox
      args={[length, 0.055, glassTop + 0.03]}
      radius={0.026}
      smoothness={3}
      position={[x, dims.roofY + 0.004, 0]}
      material={paint}
    />
  )
}

function archHalfSpan(dims: CarDims) {
  const dy = dims.bottomY - dims.wheelR
  return Math.sqrt(Math.max(dims.archR * dims.archR - dy * dy, 1e-6))
}

/* ------------------------------------------------------------ hinge parts */

export function bodyTopY(dims: CarDims, x: number): number {
  const pts = dims.bodyTop
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    if (x0 !== x1 && x >= Math.min(x0, x1) && x <= Math.max(x0, x1)) {
      const t = (x - x0) / (x1 - x0)
      return y0 + (y1 - y0) * t
    }
  }
  return dims.beltY
}

function HingeGroup({
  position,
  axis = 'y',
  base = 0,
  target,
  onToggle,
  children,
}: {
  position: [number, number, number]
  axis?: 'y' | 'z'
  base?: number
  target: number
  onToggle?: () => void
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  const current = useRef(0)
  const down = useRef<[number, number] | null>(null)

  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return
    const k = 1 - Math.exp(-5.5 * Math.min(delta, 0.05))
    current.current += (target - current.current) * k
    g.rotation[axis] = base + current.current
  })

  const interactive = onToggle
    ? {
        onPointerDown: (e: ThreeEvent<PointerEvent>) => {
          down.current = [e.clientX, e.clientY]
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          document.body.style.cursor = 'auto'
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          if (!down.current) return
          const threshold = (e.nativeEvent as PointerEvent).pointerType === 'touch' ? 12 : 6
          const moved = Math.hypot(e.clientX - down.current[0], e.clientY - down.current[1])
          down.current = null
          if (moved > threshold) return
          e.stopPropagation()
          onToggle()
        },
      }
    : {}

  return (
    <group ref={ref} position={position} {...interactive}>
      {children}
    </group>
  )
}

export function Doors({ dims }: { dims: CarDims }) {
  const { paint, leather, darkTrim } = useMaterials()
  const doorsOpen = useConfigurator((s) => s.parts.doors)
  const togglePart = useConfigurator((s) => s.togglePart)

  const doorLen = Math.abs(dims.doorFrontX - dims.doorRearX)
  const doorH = dims.beltY - dims.bottomY - 0.05
  const cy = (dims.beltY + dims.bottomY) / 2 - 0.01
  const half = dims.width / 2

  return (
    <>
      {([1, -1] as const).map((side) => (
        <group key={side}>
          <RoundedBox
            args={[doorLen - 0.06, doorH - 0.06, 0.016]}
            radius={0.008}
            smoothness={2}
            material={darkTrim}
            position={[dims.doorFrontX - doorLen / 2, cy, side * (half - 0.006)]}
          />
          <HingeGroup
            position={[dims.doorFrontX, cy, side * (half - 0.019)]}
            axis="y"
            target={doorsOpen ? side * 0.75 : 0}
            onToggle={() => togglePart('doors')}
          >
            <RoundedBox
              args={[doorLen, doorH, 0.05]}
              radius={0.012}
              smoothness={3}
              material={paint}
              position={[-doorLen / 2, 0, 0]}
            />
            <RoundedBox
              args={[doorLen - 0.1, doorH - 0.1, 0.016]}
              radius={0.008}
              smoothness={2}
              material={leather}
              position={[-doorLen / 2, -0.01, -side * 0.034]}
            />
            <RoundedBox
              args={[doorLen * 0.52, 0.05, 0.03]}
              radius={0.012}
              smoothness={2}
              material={darkTrim}
              position={[-doorLen * 0.42, -0.13, -side * 0.048]}
            />
          </HingeGroup>
        </group>
      ))}
    </>
  )
}

export function Lid({ dims }: { dims: CarDims }) {
  const { paint, darkTrim, rimLip, carbon } = useMaterials()
  const lidOpen = useConfigurator((s) => s.parts.lid)
  const togglePart = useConfigurator((s) => s.togglePart)

  const front = dims.openTop
  const hingeX = front ? dims.cabFront - 0.08 : dims.backlightTopX - 0.25
  const endX = front ? dims.length / 2 - 0.12 : -dims.length / 2 + 0.3
  const len = Math.abs(endX - hingeX)
  const base = Math.asin(Math.max(-1, Math.min(1, (bodyTopY(dims, endX) - bodyTopY(dims, hingeX)) / len)))
  const dir = front ? 1 : -1
  const midX = (hingeX + endX) / 2
  const apertureW = dims.width * taperFactor(midX, dims.length / 2) - 0.14
  const lidW = apertureW + 0.03
  const center = (dir * len) / 2

  return (
    <group>
      <group position={[hingeX, bodyTopY(dims, hingeX) + 0.012, 0]} rotation={[0, 0, base]}>
        <RoundedBox args={[len - 0.04, 0.012, apertureW]} radius={0.006} smoothness={2} material={darkTrim} position={[center, 0.004, 0]} />
        <RoundedBox args={[len * 0.42, 0.05, apertureW * 0.5]} radius={0.015} smoothness={2} material={darkTrim} position={[center, 0.03, 0]} />
        <RoundedBox args={[len * 0.3, 0.04, apertureW * 0.16]} radius={0.012} smoothness={2} material={rimLip} position={[center - dir * len * 0.12, 0.048, apertureW * 0.18]} />
        <RoundedBox args={[len * 0.3, 0.04, apertureW * 0.16]} radius={0.012} smoothness={2} material={rimLip} position={[center - dir * len * 0.12, 0.048, -apertureW * 0.18]} />
        <RoundedBox args={[len * 0.16, 0.06, apertureW * 0.3]} radius={0.015} smoothness={2} material={carbon} position={[center + dir * len * 0.28, 0.045, 0]} />
      </group>
      <HingeGroup
        position={[hingeX, bodyTopY(dims, hingeX) + 0.012, 0]}
        axis="z"
        base={base}
        target={lidOpen ? dir * 0.62 : 0}
        onToggle={() => togglePart('lid')}
      >
        <RoundedBox args={[len, 0.075, lidW]} radius={0.02} smoothness={3} material={paint} position={[center, 0.032, 0]} />
      </HingeGroup>
    </group>
  )
}

export function Underbody({ dims }: { dims: CarDims }) {
  const { darkTrim } = useMaterials()
  const h = archHalfSpan(dims)
  const from = dims.rearAxle + h
  const to = dims.frontAxle - h
  const length = Math.max(to - from, 0.5)
  return (
    <RoundedBox
      args={[length, 0.045, dims.width - 0.16]}
      radius={0.012}
      smoothness={2}
      position={[(from + to) / 2, dims.bottomY + 0.012, 0]}
      material={darkTrim}
    />
  )
}

/* ----------------------------------------------------------------- wheels */

function Wheel({ dims, axleX, side }: { dims: CarDims; axleX: number; side: 1 | -1 }) {
  const wheelId = useConfigurator((s) => s.config.wheelId)
  const bodykitId = useConfigurator((s) => s.config.bodykitId)
  const { rim, rimLip, caliper, tire, chrome, darkTrim } = useMaterials()

  const wheel = byId.wheel(wheelId)
  const rimR = dims.wheelR * 0.64
  const half = dims.wheelW / 2
  const faceZ = half - 0.03
  const tireTube = Math.min(half * 0.84, 0.095)
  const tireMajor = dims.wheelR - tireTube
  const stance = bodykitId === 'kit-widebody' ? 0.045 : 0
  const trackZ = dims.width / 2 - half - 0.022 + stance

  const spokes = useMemo(() => {
    const items: { angle: number; width: number }[] = []
    switch (wheel.style) {
      case 'five':
        for (let i = 0; i < 5; i++) items.push({ angle: (i * Math.PI * 2) / 5, width: 0.09 })
        break
      case 'twinfive':
        for (let i = 0; i < 10; i++) items.push({ angle: (i * Math.PI * 2) / 10 + (i % 2 ? 0.07 : -0.07), width: 0.05 })
        break
      case 'mesh':
        for (let i = 0; i < 18; i++) items.push({ angle: (i * Math.PI * 2) / 18, width: 0.026 })
        break
      case 'dish':
      default:
        break
    }
    return items
  }, [wheel.style])

  return (
    <group position={[axleX, dims.wheelR, side * trackZ]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
      {/* tire */}
      <mesh material={tire}>
        <torusGeometry args={[tireMajor, tireTube, 20, 48]} />
      </mesh>
      {/* rim barrel (open tube) */}
      <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.005]}>
        <cylinderGeometry args={[rimR, rimR, dims.wheelW * 0.66, 36, 1, true]} />
      </mesh>
      {/* rim lips, outer + inner */}
      <mesh material={rimLip} position={[0, 0, faceZ]}>
        <torusGeometry args={[rimR, 0.024, 12, 48]} />
      </mesh>
      <mesh material={rimLip} position={[0, 0, -faceZ]}>
        <torusGeometry args={[rimR, 0.024, 12, 48]} />
      </mesh>
      {wheel.style === 'dish' ? (
        <>
          <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, faceZ - 0.03]}>
            <cylinderGeometry args={[rimR * 0.92, rimR * 0.92, 0.035, 36]} />
          </mesh>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 6
            return (
              <mesh
                key={i}
                material={darkTrim}
                rotation={[Math.PI / 2, 0, 0]}
                position={[Math.cos(a) * rimR * 0.55, Math.sin(a) * rimR * 0.55, faceZ - 0.012]}
              >
                <cylinderGeometry args={[0.03, 0.03, 0.012, 12]} />
              </mesh>
            )
          })}
        </>
      ) : (
        spokes.map((s, i) => (
          <group key={i} rotation={[0, 0, s.angle]}>
            <mesh material={rim} position={[0, rimR * 0.5, faceZ - 0.012]}>
              <boxGeometry args={[s.width, rimR * 0.99, 0.04]} />
            </mesh>
          </group>
        ))
      )}
      {/* hub */}
      <mesh material={rim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, faceZ - 0.015]}>
        <cylinderGeometry args={[0.068, 0.068, 0.05, 20]} />
      </mesh>
      <mesh material={chrome} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, faceZ + 0.012]}>
        <cylinderGeometry args={[0.028, 0.028, 0.012, 16]} />
      </mesh>
      {/* brake disc + caliper visible through the rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[rimR * 0.84, rimR * 0.84, 0.018, 32]} />
        <meshStandardMaterial color="#565b62" metalness={0.85} roughness={0.38} />
      </mesh>
      <RoundedBox
        args={[0.07, 0.16, 0.05]}
        radius={0.015}
        smoothness={2}
        material={caliper}
        position={[0.14, 0.09, 0.03]}
        rotation={[0, 0, -0.2]}
      />
    </group>
  )
}

export function Wheels({ dims }: { dims: CarDims }) {
  return (
    <>
      <Wheel dims={dims} axleX={dims.frontAxle} side={1} />
      <Wheel dims={dims} axleX={dims.frontAxle} side={-1} />
      <Wheel dims={dims} axleX={dims.rearAxle} side={1} />
      <Wheel dims={dims} axleX={dims.rearAxle} side={-1} />
    </>
  )
}

/* --------------------------------------------------------------- interior */

function Seat({ dims, seatX, seatZ, heritage }: { dims: CarDims; seatX: number; seatZ: number; heritage: boolean }) {
  const { leather, plaid } = useMaterials()
  const floorY = dims.beltY - 0.015

  return (
    <group>
      <RoundedBox
        args={[0.36, 0.08, 0.28]}
        radius={0.028}
        smoothness={3}
        material={leather}
        position={[seatX, floorY + 0.042, seatZ]}
      />
      {heritage && (
        <mesh material={plaid} position={[seatX, floorY + 0.085, seatZ]}>
          <boxGeometry args={[0.22, 0.014, 0.14]} />
        </mesh>
      )}
      <group position={[seatX - 0.17, floorY, seatZ]} rotation={[0, 0, 0.17]}>
        <RoundedBox args={[0.08, 0.21, 0.28]} radius={0.028} smoothness={3} material={leather} position={[0, 0.155, 0]} />
        {heritage && (
          <mesh material={plaid} position={[0.042, 0.155, 0]}>
            <boxGeometry args={[0.012, 0.15, 0.14]} />
          </mesh>
        )}
        <RoundedBox args={[0.07, 0.06, 0.15]} radius={0.02} smoothness={3} material={leather} position={[0, 0.285, 0]} />
      </group>
    </group>
  )
}

export function Interior({ dims }: { dims: CarDims }) {
  const interiorId = useConfigurator((s) => s.config.interiorId)
  const { leather, accent, darkTrim } = useMaterials()
  const heritage = interiorId === 'int-heritage'

  const floorY = dims.beltY - 0.015
  const cabinW = dims.width - 0.24
  const cockpitFrom = dims.cabRear + (dims.openTop ? 0.15 : 0.25)
  const cockpitTo = dims.cabFront - 0.02
  const cockpitLen = Math.max(cockpitTo - cockpitFrom, 0.6)
  const cockpitX = (cockpitFrom + cockpitTo) / 2
  const seatX = dims.cabFront - 0.72
  const seatZ = cabinW * 0.28

  return (
    <group>
      <RoundedBox
        args={[cockpitLen + 0.3, 0.02, cabinW]}
        radius={0.008}
        smoothness={2}
        material={darkTrim}
        position={[cockpitX, floorY, 0]}
      />
      <RoundedBox
        args={[0.14, 0.17, cabinW - 0.08]}
        radius={0.03}
        smoothness={3}
        material={darkTrim}
        position={[dims.cabFront - 0.13, floorY + 0.095, 0]}
      />
      <RoundedBox
        args={[0.09, 0.05, 0.2]}
        radius={0.015}
        smoothness={2}
        material={darkTrim}
        position={[dims.cabFront - 0.06, floorY + 0.215, seatZ]}
      />
      {/* steering wheel */}
      <group position={[dims.cabFront - 0.33, floorY + 0.11, seatZ]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={darkTrim} position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.16, 12]} />
        </mesh>
        <mesh material={darkTrim} rotation={[0.28, 0, 0]}>
          <torusGeometry args={[0.082, 0.013, 12, 32]} />
        </mesh>
      </group>
      <Seat dims={dims} seatX={seatX} seatZ={seatZ} heritage={heritage} />
      <Seat dims={dims} seatX={seatX} seatZ={-seatZ} heritage={heritage} />
      <RoundedBox
        args={[0.5, 0.07, 0.13]}
        radius={0.02}
        smoothness={2}
        material={darkTrim}
        position={[seatX + 0.08, floorY + 0.035, 0]}
      />
      {/* bulkhead / parcel shelf */}
      <RoundedBox
        args={[0.05, 0.14, cabinW - 0.08]}
        radius={0.015}
        smoothness={2}
        material={darkTrim}
        position={[dims.cabRear + 0.18, floorY + 0.07, 0]}
      />
      {/* door cards */}
      {[1, -1].map((side) => (
        <group key={side}>
          <RoundedBox
            args={[cockpitLen * 0.85, 0.16, 0.04]}
            radius={0.015}
            smoothness={2}
            material={leather}
            position={[cockpitX, floorY + 0.075, side * (cabinW / 2 - 0.025)]}
          />
          <RoundedBox
            args={[cockpitLen * 0.85, 0.03, 0.045]}
            radius={0.01}
            smoothness={2}
            material={accent}
            position={[cockpitX, floorY + 0.16, side * (cabinW / 2 - 0.025)]}
          />
        </group>
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- details */

function PillarStrip({
  from,
  to,
  zStart,
  zEnd,
  material,
}: {
  from: [number, number]
  to: [number, number]
  zStart: number
  zEnd: number
  material: THREE.Material
}) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)
  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(length, 0.05, 0.048)
    const pos = g.attributes.position as THREE.BufferAttribute
    const dzdx = (zEnd - zStart) / length
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + dzdx * pos.getX(i))
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [length, zStart, zEnd])
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (zStart + zEnd) / 2]}
      rotation={[0, 0, angle]}
    />
  )
}

export function SideDetails({ dims }: { dims: CarDims }) {
  const { darkTrim, paint } = useMaterials()
  const glassBase = Math.max(dims.width - 0.22, 0.9)
  const glassTop = glassBase * (1 - TUMBLE)
  const span = Math.max(dims.roofY - dims.beltY, 0.01)
  const bPillarY = dims.beltY + 0.15
  const bPillarZ = (glassBase / 2) * (1 - (TUMBLE * (bPillarY - dims.beltY)) / span) + 0.004
  const bPillarGeom = useMemo(() => {
    const g = new THREE.BoxGeometry(0.024, 0.24, 0.04)
    const pos = g.attributes.position as THREE.BufferAttribute
    const dzdy = (-(glassBase / 2) * TUMBLE) / span
    for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) + dzdy * pos.getY(i))
    pos.needsUpdate = true
    g.computeVertexNormals()
    return g
  }, [glassBase, span])

  return (
    <group>
      {[1, -1].map((side) => (
        <group key={side}>
          {!dims.openTop && (
            <>
              <PillarStrip
                from={[dims.cabFront + 0.03, dims.beltY + 0.03]}
                to={[dims.windshieldTopX - 0.02, dims.roofY - 0.015]}
                zStart={side * (glassBase / 2 + 0.008)}
                zEnd={side * (glassTop / 2 + 0.006)}
                material={paint}
              />
              <PillarStrip
                from={[dims.backlightTopX + 0.02, dims.roofY - 0.015]}
                to={[dims.cabRear + 0.09, dims.beltY + 0.012]}
                zStart={side * (glassTop / 2 + 0.006)}
                zEnd={side * (glassBase / 2 + 0.008)}
                material={paint}
              />
              <mesh
                material={paint}
                position={[(dims.windshieldTopX + dims.backlightTopX) / 2, dims.roofY - 0.01, side * (glassTop / 2 + 0.004)]}
              >
                <boxGeometry args={[Math.abs(dims.windshieldTopX - dims.backlightTopX) + 0.1, 0.042, 0.05]} />
              </mesh>
              <mesh geometry={bPillarGeom} material={darkTrim} position={[dims.doorRearX - 0.01, bPillarY, side * bPillarZ]} />
            </>
          )}
          {/* mirror */}
          <mesh material={darkTrim} rotation={[Math.PI / 2, 0, 0]} position={[dims.cabFront + 0.05, dims.beltY + 0.07, side * (dims.width / 2 + 0.03)]}>
            <cylinderGeometry args={[0.013, 0.013, 0.11, 10]} />
          </mesh>
          <RoundedBox
            args={[0.05, 0.085, 0.15]}
            radius={0.02}
            smoothness={3}
            material={paint}
            position={[dims.cabFront + 0.03, dims.beltY + 0.14, side * (dims.width / 2 + 0.085)]}
          />
        </group>
      ))}
    </group>
  )
}

export function Lights({ dims }: { dims: CarDims }) {
  const { headlight, taillight, darkTrim, chrome } = useMaterials()
  const lensY = dims.bottomY + 0.16
  const lensZ = dims.width / 2 - 0.38

  return (
    <group>
      {[1, -1].map((side) => (
        <RoundedBox
          key={side}
          args={[0.07, 0.085, 0.3]}
          radius={0.02}
          smoothness={3}
          material={headlight}
          position={[dims.length / 2 - 0.008, lensY, side * lensZ]}
        />
      ))}
      <RoundedBox
        args={[0.055, 0.065, dims.width - 0.6]}
        radius={0.02}
        smoothness={3}
        material={taillight}
        position={[-dims.length / 2 + 0.026, dims.tailY - 0.17, 0]}
      />
      <RoundedBox
        args={[0.06, 0.14, dims.width - 0.6]}
        radius={0.02}
        smoothness={3}
        material={darkTrim}
        position={[dims.length / 2 - 0.02, dims.bottomY + 0.12, 0]}
      />
      <RoundedBox
        args={[0.03, 0.09, 0.3]}
        radius={0.012}
        smoothness={2}
        material={darkTrim}
        position={[-dims.length / 2 + 0.022, dims.bottomY + 0.4, 0]}
      />
      {[0.4, -0.4].map((z) => (
        <mesh key={z} material={chrome} rotation={[0, 0, Math.PI / 2]} position={[-dims.length / 2 - 0.02, dims.bottomY + 0.1, z]}>
          <cylinderGeometry args={[0.042, 0.042, 0.14, 16]} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------- aero */

export function Aero({ dims }: { dims: CarDims }) {
  const bodykitId = useConfigurator((s) => s.config.bodykitId)
  const spoilerId = useConfigurator((s) => s.config.spoilerId)
  const { darkTrim, carbon, paint } = useMaterials()
  const rearX = -dims.length / 2
  const archH = archHalfSpan(dims)
  const noseHalf = (dims.width / 2) * taperFactor(dims.length / 2, dims.length / 2)
  const tailHalf = (dims.width / 2) * taperFactor(-dims.length / 2, dims.length / 2)
  const splitterW = noseHalf * 2 - 0.08
  const diffuserW = tailHalf * 2 - 0.1

  // deck-hugging helpers: mount spoilers on the actual body-top surface, tilted to its local slope
  const deckTilt = (x: number, halfLen: number) =>
    Math.asin(
      Math.max(-1, Math.min(1, (bodyTopY(dims, x + halfLen) - bodyTopY(dims, x - halfLen)) / (2 * halfLen))),
    )
  const lipX = rearX + 0.18
  const duckX = rearX + 0.16
  const wingX = rearX + 0.22

  return (
    <group>
      {bodykitId === 'kit-street' && (
        <>
          <RoundedBox args={[0.2, 0.05, splitterW]} radius={0.015} smoothness={2} material={darkTrim} position={[dims.length / 2 - 0.045, dims.bottomY - 0.005, 0]} />
          <RoundedBox args={[0.16, 0.07, diffuserW]} radius={0.015} smoothness={2} material={darkTrim} position={[rearX + 0.035, dims.bottomY + 0.01, 0]} />
          {[1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[(dims.frontAxle - archH - (dims.rearAxle + archH)) * 1.02, 0.07, 0.07]}
              radius={0.018}
              smoothness={2}
              material={darkTrim}
              position={[(dims.rearAxle + archH + dims.frontAxle - archH) / 2, dims.bottomY - 0.035, side * (dims.width / 2 - 0.005)]}
            />
          ))}
        </>
      )}

      {bodykitId === 'kit-widebody' && (
        <>
          <RoundedBox args={[0.24, 0.05, splitterW + 0.05]} radius={0.015} smoothness={2} material={carbon} position={[dims.length / 2 - 0.06, dims.bottomY - 0.01, 0]} />
          <RoundedBox args={[0.2, 0.09, diffuserW + 0.05]} radius={0.02} smoothness={2} material={carbon} position={[rearX + 0.015, dims.bottomY + 0.005, 0]} />
          {[1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[(dims.frontAxle - archH - (dims.rearAxle + archH)) * 1.05, 0.075, 0.1]}
              radius={0.02}
              smoothness={2}
              material={paint}
              position={[(dims.rearAxle + archH + dims.frontAxle - archH) / 2, dims.bottomY - 0.035, side * (dims.width / 2 + 0.005)]}
            />
          ))}
          {[
            { x: dims.frontAxle, side: 1 },
            { x: dims.frontAxle, side: -1 },
            { x: dims.rearAxle, side: 1 },
            { x: dims.rearAxle, side: -1 },
          ].map(({ x, side }, i) => {
            const bodyHalf = (dims.width / 2) * taperFactor(x, dims.length / 2)
            const tireFace = dims.width / 2 + 0.023
            const inner = bodyHalf - 0.012
            const outer = tireFace + 0.008
            return (
              <mesh
                key={i}
                material={paint}
                position={[x, dims.wheelR, side * ((inner + outer) / 2)]}
                rotation={[0, 0, Math.PI / 2 - 1.35]}
                scale={[1, 1, Math.max((outer - inner) / 0.12, 0.3)]}
              >
                <torusGeometry args={[dims.archR + 0.055, 0.06, 12, 28, 2.7]} />
              </mesh>
            )
          })}
        </>
      )}

      {spoilerId === 'spoiler-lip' && (
        <RoundedBox
          args={[0.17, 0.032, dims.width - 0.5]}
          radius={0.012}
          smoothness={2}
          material={paint}
          position={[lipX, bodyTopY(dims, lipX) + 0.012, 0]}
          rotation={[0, 0, deckTilt(lipX, 0.085) - 0.13]}
        />
      )}

      {spoilerId === 'spoiler-ducktail' && (
        <mesh
          material={paint}
          position={[duckX, bodyTopY(dims, duckX) - 0.02, -(dims.width - 0.52) / 2]}
          rotation={[0, 0, deckTilt(duckX, 0.12)]}
        >
          <extrudeGeometry
            args={[
              (() => {
                const shape = new THREE.Shape([
                  new THREE.Vector2(0.105, 0),
                  new THREE.Vector2(-0.105, 0),
                  new THREE.Vector2(-0.12, 0.11),
                  new THREE.Vector2(-0.015, 0.16),
                  new THREE.Vector2(0.12, 0.05),
                ])
                return shape
              })(),
              { depth: dims.width - 0.52, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 },
            ]}
          />
        </mesh>
      )}

      {spoilerId === 'spoiler-gtwing' && (
        <group>
          {[1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.06, 0.2, 0.045]}
              radius={0.015}
              smoothness={2}
              material={carbon}
              position={[wingX, bodyTopY(dims, wingX) + 0.085, side * (dims.width / 2 - 0.34)]}
            />
          ))}
          <RoundedBox
            args={[0.28, 0.035, dims.width - 0.52]}
            radius={0.012}
            smoothness={2}
            material={carbon}
            position={[wingX, bodyTopY(dims, wingX) + 0.202, 0]}
            rotation={[0, 0, -0.11]}
          />
          {[1, -1].map((side) => (
            <RoundedBox
              key={side}
              args={[0.24, 0.1, 0.018]}
              radius={0.01}
              smoothness={2}
              material={carbon}
              position={[wingX, bodyTopY(dims, wingX) + 0.202, side * (dims.width / 2 - 0.27)]}
            />
          ))}
        </group>
      )}
    </group>
  )
}
