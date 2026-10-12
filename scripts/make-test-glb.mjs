/**
 * Generates a deliberately simple test asset that follows the GLB conventions
 * documented in src/data/models3d.ts (named parts, variant nodes, material names).
 * Used to verify the GLB pipeline works end to end:
 *
 *   node scripts/make-test-glb.mjs [outFile]
 *
 * Drop your real artist-made assets in public/models/<id>.glb and register them
 * in src/data/models3d.ts instead.
 */
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const out = resolve(process.argv[2] ?? 'public/models/veloce-gt.glb')

// GLTFExporter expects a browser FileReader even for binary output — minimal shim for node.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer
        this.onloadend?.()
      })
    }
  }
}

const mat = (name, color, extra = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...extra })
  m.name = name
  return m
}

const paint = mat('paint_gloss', 0x8899aa)
const glass = mat('glass', 0x99aabb, { transparent: true, opacity: 0.55 })
const tire = mat('tire_rubber', 0x141414, { roughness: 0.9 })
const rim = mat('rim_metal', 0xcfd3d8, { metalness: 0.9, roughness: 0.2 })
const leather = mat('interior_leather', 0x8a5527)
const dashDark = mat('dash_plastic', 0x1a1b1f)
const chrome = mat('chrome_trim', 0xdde3e8, { metalness: 1, roughness: 0.1 })
const caliper = mat('caliper', 0x222222)
const disc = mat('brake_disc', 0x666666, { metalness: 0.8 })
const carbon = mat('carbon', 0x1b1d21)
const lampF = mat('headlight_lens', 0xffeecc, { emissive: 0xfff3d0, emissiveIntensity: 0.6 })
const lampR = mat('taillight_lens', 0xff2211, { emissive: 0xff2d1f, emissiveIntensity: 1.2 })

const mesh = (name, geo, material, pos = [0, 0, 0], rot = [0, 0, 0]) => {
  const m = new THREE.Mesh(geo, material)
  m.name = name
  m.position.set(...pos)
  m.rotation.set(...rot)
  return m
}

const root = new THREE.Group()
root.name = 'VeloceGT_test'

root.add(mesh('body_shell', new THREE.BoxGeometry(4.2, 0.62, 1.8), paint, [0, 0.57, 0]))
root.add(mesh('glass_canopy', new THREE.BoxGeometry(2.0, 0.42, 1.5), glass, [-0.25, 1.09, 0]))

root.add(mesh('interior_seat_driver', new THREE.BoxGeometry(0.4, 0.5, 0.34), leather, [-0.25, 0.98, 0.32]))
root.add(mesh('interior_seat_passenger', new THREE.BoxGeometry(0.4, 0.5, 0.34), leather, [-0.25, 0.98, -0.32]))
root.add(mesh('dash_top', new THREE.BoxGeometry(0.3, 0.2, 1.2), dashDark, [0.55, 0.98, 0]))
root.add(mesh('underbody_chassis', new THREE.BoxGeometry(3.9, 0.2, 1.6), dashDark, [0, 0.3, 0]))

root.add(mesh('headlight_lens_l', new THREE.BoxGeometry(0.08, 0.12, 0.3), lampF, [2.12, 0.52, 0.56]))
root.add(mesh('headlight_lens_r', new THREE.BoxGeometry(0.08, 0.12, 0.3), lampF, [2.12, 0.52, -0.56]))
root.add(mesh('taillight_bar', new THREE.BoxGeometry(0.08, 0.08, 1.2), lampR, [-2.12, 0.78, 0]))
root.add(mesh('exhaust_tip_l', new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), chrome, [-2.16, 0.36, 0.4], [0, 0, Math.PI / 2]))
root.add(mesh('exhaust_tip_r', new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), chrome, [-2.16, 0.36, -0.4], [0, 0, Math.PI / 2]))

root.add(mesh('spoiler_lip', new THREE.BoxGeometry(0.22, 0.05, 1.2), paint, [-1.92, 0.92, 0]))
root.add(mesh('spoiler_gtwing', new THREE.BoxGeometry(0.32, 0.04, 1.4), carbon, [-2.0, 1.24, 0]))
root.add(mesh('kit_splitter', new THREE.BoxGeometry(0.26, 0.06, 1.5), carbon, [2.0, 0.24, 0]))
root.add(mesh('kit_flares', new THREE.TorusGeometry(0.4, 0.06, 10, 20, Math.PI * 1.4), paint, [1.28, 0.31, 0.88], [0, 0, Math.PI * 0.1]))

function wheel(style, corner, x, z) {
  const group = new THREE.Group()
  group.name = `wheel_${style}_${corner}`
  group.position.set(x, 0.31, z)
  group.add(mesh('tire', new THREE.TorusGeometry(0.22, 0.09, 14, 30), tire))
  group.add(mesh('rim_face', new THREE.CylinderGeometry(0.2, 0.2, 0.07, 24), rim, [0, 0, z >= 0 ? 0.05 : -0.05], [Math.PI / 2, 0, 0]))
  const spokes = style === 'five' ? 5 : 12
  for (let i = 0; i < spokes; i++) {
    const angle = (i * Math.PI * 2) / spokes
    const spoke = mesh(
      'spoke',
      new THREE.BoxGeometry(style === 'five' ? 0.06 : 0.03, 0.36, 0.04),
      rim,
      [Math.cos(angle) * 0, Math.sin(angle) * 0, z >= 0 ? 0.09 : -0.09],
      [0, 0, angle],
    )
    spoke.children = []
    group.add(spoke)
    // reposition spoke so it radiates from the hub
    spoke.position.set(Math.cos(angle + Math.PI / 2) * 0.18, Math.sin(angle + Math.PI / 2) * 0.18, z >= 0 ? 0.09 : -0.09)
    spoke.rotation.set(0, 0, angle + Math.PI / 2 + Math.PI / 2)
  }
  group.add(mesh('brake_disc', new THREE.CylinderGeometry(0.17, 0.17, 0.02, 20), disc, [0, 0, 0], [Math.PI / 2, 0, 0]))
  group.add(mesh('caliper', new THREE.BoxGeometry(0.07, 0.16, 0.05), caliper, [0.14, 0.09, 0]))
  return group
}

const corners = [
  ['fl', 1.25, 0.78],
  ['fr', 1.25, -0.78],
  ['rl', -1.3, 0.78],
  ['rr', -1.3, -0.78],
]
for (const [corner, x, z] of corners) {
  root.add(wheel('five', corner, x, z))
  root.add(wheel('mesh', corner, x, z))
}

const exporter = new GLTFExporter()
exporter.parse(
  root,
  (result) => {
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, Buffer.from(result))
    console.log(`wrote ${out} (${(result.byteLength / 1024).toFixed(1)} kB)`)
  },
  (error) => {
    console.error('export failed:', error)
    process.exit(1)
  },
  { binary: true },
)
