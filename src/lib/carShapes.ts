import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import type { CarDims } from '../data/profiles'

const BEVEL_T = 0.105
const BEVEL_S = 0.06
const BEVEL_SEGMENTS = 6

/** body plan-view taper toward the extremities (nose/tail narrower than the middle) */
export const TAPER = { front: 0.13, rear: 0.16, start: 0.42, power: 1.6 }

/** greenhouse tumblehome — glass leans inward toward the roof */
export const TUMBLE = 0.15

export function taperFactor(x: number, halfLength: number): number {
  const u = x / halfLength
  const amount = u >= 0 ? TAPER.front : TAPER.rear
  const t = Math.max(0, (Math.abs(u) - TAPER.start) / (1 - TAPER.start))
  return 1 - amount * Math.pow(t, TAPER.power)
}

/**
 * Sampled semicircular notch for a wheel arch: travels from the left foot of
 * the arch, up over the top, to the right foot — used when outlining the body
 * bottom edge from rear to front.
 */
export function archPoints(axleX: number, centerY: number, radius: number, bottomY: number, n = 28): THREE.Vector2[] {
  const dy = bottomY - centerY
  const halfSpan = Math.sqrt(Math.max(radius * radius - dy * dy, 1e-6))
  const aLeft = Math.atan2(dy, -halfSpan)
  const aRight = Math.atan2(dy, halfSpan)
  const a0 = aLeft + Math.PI * 2
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= n; i++) {
    const a = a0 + (aRight - a0) * (i / n)
    pts.push(new THREE.Vector2(axleX + Math.cos(a) * radius, centerY + Math.sin(a) * radius))
  }
  return pts
}

export function smoothOutline(points: [number, number][], divisions = 110): THREE.Vector2[] {
  const spline = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)))
  return spline.getPoints(divisions)
}

/** weld + smooth-shade an extruded solid so bevels read as soft metal */
export function finishGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  geometry.deleteAttribute('uv')
  geometry.deleteAttribute('normal')
  const merged = mergeVertices(geometry, 1e-4)
  merged.computeVertexNormals()
  return merged
}

/** Sculpt the extruded slab into a tapered body: narrower nose/tail, shoulders kept at the arches. */
export function sculptBody(geometry: THREE.BufferGeometry, d: CarDims): THREE.BufferGeometry {
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const halfLength = d.length / 2
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    pos.setZ(i, z * taperFactor(x, halfLength))
  }
  pos.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Solid body of the car: side-profile extrusion with beveled flanks and
 * wheel-arch notches cut into the rocker line.
 */
export function buildBodyGeometry(d: CarDims): THREE.BufferGeometry {
  const outline = smoothOutline(d.bodyTop)
  const pts: THREE.Vector2[] = [...outline]
  pts.push(...archPoints(d.rearAxle, d.wheelR, d.archR, d.bottomY))
  pts.push(...archPoints(d.frontAxle, d.wheelR, d.archR, d.bottomY))

  const shape = new THREE.Shape(pts)
  const depth = d.width - BEVEL_T * 2
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL_T,
    bevelSize: BEVEL_S,
    bevelOffset: 0,
    bevelSegments: BEVEL_SEGMENTS,
    curveSegments: 12,
  })
  geo.translate(0, 0, -depth / 2)
  return sculptBody(finishGeometry(geo), d)
}

/** Greenhouse / windscreen volume of the car. */
export function buildCabinGeometry(d: CarDims): THREE.BufferGeometry {
  const outline = smoothOutline(d.cabin, 72)
  const shape = new THREE.Shape(outline)
  const width = Math.max(d.width - (d.openTop ? 0.5 : 0.22), 0.9)
  const depth = width - 0.06
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelOffset: 0,
    bevelSegments: 4,
    curveSegments: 10,
  })
  geo.translate(0, 0, -depth / 2)
  const sculpted = finishGeometry(geo)

  const pos = sculpted.attributes.position as THREE.BufferAttribute
  const span = Math.max(d.roofY - d.beltY, 0.01)
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = Math.min(Math.max((y - d.beltY) / span, 0), 1)
    pos.setZ(i, pos.getZ(i) * (1 - TUMBLE * t))
  }
  pos.needsUpdate = true
  sculpted.computeVertexNormals()
  return sculpted
}

export interface SilhouettePaths {
  body: string
  wheelFront: string
  wheelRear: string
  cabin: string
}

/** 2D side-view silhouette paths (SVG) derived from the same splines the 3D body uses. */
export function silhouettePath(d: CarDims, width: number, height: number, pad = 6): SilhouettePaths {
  const pts = smoothOutline(d.bodyTop, 60)
  const minX = -d.length / 2 - 0.06
  const maxX = d.length / 2 + 0.06
  const minY = 0
  const maxY = Math.max(d.roofY, d.beltY) + 0.14
  const sx = (x: number) => pad + ((x - minX) / (maxX - minX)) * (width - pad * 2)
  const sy = (y: number) => height - pad - ((y - minY) / (maxY - minY)) * (height - pad * 2)

  const body = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')

  const wheel = (axle: number) => {
    const r = (d.wheelR / (maxX - minX)) * (width - pad * 2)
    const cx = sx(axle)
    const baseY = sy(d.bottomY)
    return `M${(cx - r).toFixed(2)},${baseY.toFixed(2)} a${r.toFixed(2)},${r.toFixed(2)} 0 0 1 ${(r * 2).toFixed(2)},0`
  }

  let cabin = ''
  if (d.cabin.length > 2) {
    const cpts = smoothOutline(d.cabin, 36)
    cabin = cpts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')
  }

  return {
    body: `${body} Z`,
    wheelFront: wheel(d.frontAxle),
    wheelRear: wheel(d.rearAxle),
    cabin: cabin ? `${cabin} Z` : '',
  }
}
