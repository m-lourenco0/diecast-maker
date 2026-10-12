interface GpuProbe {
  webgl: boolean
  software: boolean
}

let probe: GpuProbe | null = null

/** One-off WebGL capability probe, cached for the whole session. */
export function gpuProbe(): GpuProbe {
  if (probe) return probe
  probe = { webgl: false, software: false }
  if (typeof document === 'undefined') return probe
  try {
    const canvas = document.createElement('canvas')
    // browsers refuse a caveat-free context when they'd fall back to software
    const accel = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ?? canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return probe
    probe.webgl = true
    if (!accel) {
      probe.software = true
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return probe
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = String(
      (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null) ?? gl.getParameter(gl.RENDERER) ?? '',
    )
    probe.software = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(name)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    /* treat as no webgl */
  }
  return probe
}

/** Browsers without GPU acceleration (remote desktops, VMs, --disable-gpu). */
export const softwareRenderer = gpuProbe().software
