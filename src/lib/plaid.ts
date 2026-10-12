import * as THREE from 'three'

let cached: THREE.CanvasTexture | null = null

/** Pepita-style plaid insert texture, generated once. */
export function getPlaidTexture(): THREE.CanvasTexture {
  if (cached) return cached
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#17181c'
  ctx.fillRect(0, 0, size, size)

  const cell = size / 8
  const band = (color: string, offset: number) => {
    ctx.fillStyle = color
    for (let i = 0; i < 8; i += 2) {
      ctx.fillRect((i + offset) * cell, 0, cell * 0.36, size)
      ctx.fillRect(0, (i + offset) * cell, size, cell * 0.36)
    }
  }

  ctx.globalAlpha = 0.95
  band('#c23a38', 0)
  ctx.globalAlpha = 0.85
  band('#e8e2d6', 0.5)
  ctx.globalAlpha = 0.75
  band('#3b4fae', 0.25)

  ctx.globalAlpha = 0.22
  ctx.fillStyle = '#000'
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(i * cell + cell * 0.36, 0, cell * 0.14, size)
    ctx.fillRect(0, i * cell + cell * 0.36, size, cell * 0.14)
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cached = tex
  return tex
}
