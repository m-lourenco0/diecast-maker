import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { byId } from '../../data/catalog'
import { getPlaidTexture } from '../../lib/plaid'
import { useConfigurator } from '../../store/configurator'
import type { FinishId } from '../../types'

interface FinishTargets {
  metalness: number
  roughness: number
  clearcoat: number
  clearcoatRoughness: number
  envMapIntensity: number
}

export function finishTargets(finish: FinishId): FinishTargets {
  switch (finish) {
    case 'metallic':
      return { metalness: 0.75, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.4 }
    case 'satin':
      return { metalness: 0.32, roughness: 0.5, clearcoat: 0.55, clearcoatRoughness: 0.45, envMapIntensity: 0.95 }
    case 'matte':
      return { metalness: 0.05, roughness: 0.85, clearcoat: 0, clearcoatRoughness: 1, envMapIntensity: 0.5 }
    case 'chrome':
      return { metalness: 1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.55 }
    case 'gloss':
    default:
      return { metalness: 0.12, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.1 }
  }
}

export interface MaterialsApi {
  paint: THREE.MeshPhysicalMaterial
  glass: THREE.MeshPhysicalMaterial
  rim: THREE.MeshPhysicalMaterial
  rimLip: THREE.MeshPhysicalMaterial
  caliper: THREE.MeshStandardMaterial
  leather: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  plaid: THREE.MeshStandardMaterial
  darkTrim: THREE.MeshStandardMaterial
  carbon: THREE.MeshStandardMaterial
  chrome: THREE.MeshStandardMaterial
  tire: THREE.MeshStandardMaterial
  headlight: THREE.MeshStandardMaterial
  taillight: THREE.MeshStandardMaterial
}

const MaterialsContext = createContext<MaterialsApi | null>(null)

export function useMaterials(): MaterialsApi {
  const api = useContext(MaterialsContext)
  if (!api) throw new Error('useMaterials must be used within <MaterialsProvider>')
  return api
}

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo<MaterialsApi>(() => {
    const paint = new THREE.MeshPhysicalMaterial({ color: '#c7ccd1', clearcoat: 1, clearcoatRoughness: 0.06 })
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#aab6bf',
      transparent: true,
      opacity: 0.5,
      roughness: 0.03,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.8,
      depthWrite: false,
    })
    const rim = new THREE.MeshPhysicalMaterial({ color: '#cfd3d8', metalness: 0.9, roughness: 0.22, envMapIntensity: 1.2 })
    const rimLip = new THREE.MeshPhysicalMaterial({ color: '#d8dde2', metalness: 0.95, roughness: 0.16, envMapIntensity: 1.3 })
    const caliper = new THREE.MeshStandardMaterial({ color: '#15161a', metalness: 0.35, roughness: 0.42 })
    const leather = new THREE.MeshStandardMaterial({ color: '#8a5527', metalness: 0.02, roughness: 0.62 })
    const accent = new THREE.MeshStandardMaterial({ color: '#c08a4d', metalness: 0.05, roughness: 0.6 })
    const plaid = new THREE.MeshStandardMaterial({ map: getPlaidTexture(), color: '#ffffff', roughness: 0.68, metalness: 0 })
    const darkTrim = new THREE.MeshStandardMaterial({ color: '#141519', metalness: 0.25, roughness: 0.5 })
    const carbon = new THREE.MeshStandardMaterial({ color: '#1b1d21', metalness: 0.45, roughness: 0.38 })
    const chrome = new THREE.MeshPhysicalMaterial({ color: '#dde3e8', metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4 })
    const tire = new THREE.MeshStandardMaterial({ color: '#17181b', metalness: 0, roughness: 0.92 })
    const headlight = new THREE.MeshStandardMaterial({ color: '#e9e6da', emissive: '#fff3d0', emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.18 })
    const taillight = new THREE.MeshStandardMaterial({ color: '#3a0d0c', emissive: '#ff2d1f', emissiveIntensity: 6, metalness: 0.15, roughness: 0.45 })
    return { paint, glass, rim, rimLip, caliper, leather, accent, plaid, darkTrim, carbon, chrome, tire, headlight, taillight }
  }, [])

  const tmp = useMemo(() => ({ color: new THREE.Color(), target: new THREE.Color() }), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const k = 1 - Math.exp(-8 * dt)
    const { config } = useConfigurator.getState()

    const paint = byId.paint(config.paintId)
    const finish = finishTargets(paint.finish)
    materials.paint.color.lerp(tmp.target.set(paint.hex), k)
    const p = materials.paint
    p.metalness += (finish.metalness - p.metalness) * k
    p.roughness += (finish.roughness - p.roughness) * k
    p.clearcoat += (finish.clearcoat - p.clearcoat) * k
    p.clearcoatRoughness += (finish.clearcoatRoughness - p.clearcoatRoughness) * k
    p.envMapIntensity += (finish.envMapIntensity - p.envMapIntensity) * k

    const tint = byId.tint(config.tintId)
    materials.glass.color.lerp(tmp.target.set(tint.hex), k)
    materials.glass.opacity += (tint.opacity - materials.glass.opacity) * k

    const wheel = byId.wheel(config.wheelId)
    materials.rim.color.lerp(tmp.target.set(wheel.finishHex), k)
    materials.rim.metalness += (wheel.finishMetalness - materials.rim.metalness) * k
    materials.rim.roughness += (wheel.finishRoughness - materials.rim.roughness) * k
    materials.rimLip.color.lerp(tmp.target.set(wheel.lipHex ?? wheel.finishHex), k)

    const caliper = byId.caliper(config.caliperId)
    materials.caliper.color.lerp(tmp.target.set(caliper.hex), k)

    const interior = byId.interior(config.interiorId)
    materials.leather.color.lerp(tmp.target.set(interior.hex), k)
    materials.accent.color.lerp(tmp.target.set(interior.accentHex), k)
    const leatherRough = interior.material === 'alcantara' ? 0.92 : 0.6
    materials.leather.roughness += (leatherRough - materials.leather.roughness) * k
  })

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>
}
