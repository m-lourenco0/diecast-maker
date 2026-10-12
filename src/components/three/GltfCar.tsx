import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CAR_DIMS, type CarDims } from '../../data/profiles'
import { GLB_MODELS, type GlbModelDef } from '../../data/models3d'
import { useConfigurator } from '../../store/configurator'
import { ProceduralCar } from './DiecastCar'
import { useMaterials, type MaterialsApi } from './materials'

function matchMaterial(label: string, mats: MaterialsApi): THREE.Material | null {
  const n = label.toLowerCase()
  if (/(headlight|lamp_front|lens_front|drl)/.test(n)) return mats.headlight
  if (/(taillight|tail_light|lens_rear|lamp_rear)/.test(n)) return mats.taillight
  if (/(glass|window|windshield|windscreen|backlight|glazing)/.test(n)) return mats.glass
  if (/(tire|tyre|rubber)/.test(n)) return mats.tire
  if (/(caliper|brake_cal)/.test(n)) return mats.caliper
  if (/(disc|rotor|brake)/.test(n)) return mats.darkTrim
  if (/(rim_lip|wheel_lip|lip)/.test(n)) return mats.rimLip
  if (/(rim|spoke|hub)/.test(n)) return mats.rim
  if (/(carbon)/.test(n)) return mats.carbon
  if (/(chrome|bright|exhaust)/.test(n)) return mats.chrome
  if (/(seat|interior|leather|door_card)/.test(n)) return mats.leather
  if (/(dash|console|underbody|chassis|plastic|grille|trim)/.test(n)) return mats.darkTrim
  if (/(body|paint|shell|panel)/.test(n)) return mats.paint
  return null
}

const DOOR_RE = /^door_([lr])/
const LID_RE = /^(decklid|hood|trunk|bonnet)/

function GltfCar({ def, dims }: { def: GlbModelDef; dims: CarDims }) {
  const gltf = useGLTF(def.url)
  const mats = useMaterials()
  const wheelId = useConfigurator((s) => s.config.wheelId)
  const spoilerId = useConfigurator((s) => s.config.spoilerId)
  const bodykitId = useConfigurator((s) => s.config.bodykitId)
  const doorsOpen = useConfigurator((s) => s.parts.doors)
  const lidOpen = useConfigurator((s) => s.parts.lid)
  const togglePart = useConfigurator((s) => s.togglePart)
  const down = useRef<[number, number] | null>(null)

  const { clone, nodes, hinges, fit } = useMemo(() => {
    const source = gltf.scene
    const clone = source.clone(true)
    const collected: THREE.Object3D[] = []
    const hingeNodes: { node: THREE.Object3D; kind: 'door_l' | 'door_r' | 'lid'; base: number }[] = []
    clone.traverse((o) => {
      collected.push(o)
      const n = o.name.toLowerCase()
      const door = DOOR_RE.exec(n)
      if (door) hingeNodes.push({ node: o, kind: door[1] === 'r' ? 'door_r' : 'door_l', base: o.rotation.y })
      else if (LID_RE.test(n)) hingeNodes.push({ node: o, kind: 'lid', base: o.rotation.z })
      if ((o as THREE.Mesh).isMesh) {
        const mesh = o as THREE.Mesh
        const materialName = Array.isArray(mesh.material) ? '' : (mesh.material?.name ?? '')
        const target = matchMaterial(`${mesh.name} ${materialName}`, mats)
        if (target) mesh.material = target
      }
    })

    const rotationY = def.rotationY ?? 0
    clone.rotation.y = rotationY
    clone.updateWorldMatrix(false, true)
    const box = new THREE.Box3().setFromObject(clone)
    clone.rotation.y = 0
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = (def.scale ?? 1) * (dims.length / Math.max(size.x, 1e-3))
    return {
      clone,
      nodes: collected,
      hinges: hingeNodes,
      fit: {
        scale,
        offset: [-center.x, -box.min.y, -center.z] as [number, number, number],
        rotationY,
      },
    }
  }, [gltf, def, dims, mats])

  useEffect(() => {
    const wheelNodes = nodes.filter((o) => /^wheel_(five|twinfive|mesh|dish)_/i.test(o.name))
    if (wheelNodes.length > 0) {
      const style = wheelId.replace('classic-five', 'five').replace('twin-five', 'twinfive').replace('mesh-racing', 'mesh').replace('turbo-dish', 'dish')
      wheelNodes.forEach((node) => {
        node.visible = node.name.toLowerCase().includes(`_${style}_`)
      })
    }

    const spoilerNodes = nodes.filter((o) => /^spoiler_/i.test(o.name))
    if (spoilerNodes.length > 0) {
      const key = spoilerId.replace('spoiler-', '')
      spoilerNodes.forEach((node) => {
        node.visible = node.name.toLowerCase() === `spoiler_${key}`
      })
    }

    const kitNodes = nodes.filter((o) => /^kit_/i.test(o.name))
    if (kitNodes.length > 0) {
      const street = bodykitId !== 'kit-stock'
      const wide = bodykitId === 'kit-widebody'
      kitNodes.forEach((node) => {
        node.visible = node.name.toLowerCase().includes('flare') ? wide : street
      })
    }
  }, [nodes, wheelId, spoilerId, bodykitId])

  useFrame((_, delta) => {
    if (hinges.length === 0) return
    const k = 1 - Math.exp(-5.5 * Math.min(delta, 0.05))
    for (const hinge of hinges) {
      if (hinge.kind === 'door_l' || hinge.kind === 'door_r') {
        const target = doorsOpen ? (hinge.kind === 'door_r' ? 0.75 : -0.75) : 0
        hinge.node.rotation.y += (hinge.base + target - hinge.node.rotation.y) * k
      } else {
        const target = lidOpen ? -0.62 : 0
        hinge.node.rotation.z += (hinge.base + target - hinge.node.rotation.z) * k
      }
    }
  })

  const interactive = {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      down.current = [e.clientX, e.clientY]
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      const n = e.object.name.toLowerCase()
      if (!DOOR_RE.test(n) && !LID_RE.test(n)) return
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
      const n = e.object.name.toLowerCase()
      if (DOOR_RE.test(n)) {
        e.stopPropagation()
        togglePart('doors')
      } else if (LID_RE.test(n)) {
        e.stopPropagation()
        togglePart('lid')
      }
    },
  }

  return (
    <group scale={fit.scale}>
      <group position={fit.offset} rotation={[0, fit.rotationY, 0]}>
        <primitive object={clone} {...interactive} />
      </group>
    </group>
  )
}

class GltfBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function CarModel() {
  const modelId = useConfigurator((s) => s.config.modelId)
  const def = GLB_MODELS[modelId]
  const procedural = <ProceduralCar />

  if (!def) return procedural

  return (
    <GltfBoundary key={modelId} fallback={procedural}>
      <Suspense fallback={procedural}>
        <GltfCar def={def} dims={CAR_DIMS[modelId]} />
      </Suspense>
    </GltfBoundary>
  )
}
