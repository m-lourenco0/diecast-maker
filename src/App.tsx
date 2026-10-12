import { useMemo } from 'react'
import { ConfiguratorCanvas } from './components/three/ConfiguratorCanvas'
import { BuildSheet } from './components/ui/BuildSheet'
import { CategoryRail } from './components/ui/CategoryRail'
import { OptionPanel } from './components/ui/OptionPanel'
import { PartsControls } from './components/ui/PartsControls'
import { Splash } from './components/ui/Splash'
import { SummaryBar } from './components/ui/SummaryBar'
import { Toasts } from './components/ui/Toasts'
import { TopBar } from './components/ui/TopBar'

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function Fallback() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="glass-panel max-w-sm rounded-2xl p-6 text-center">
        <div className="font-display text-[14px] tracking-[0.2em] uppercase">Meridian Configurator</div>
        <p className="mt-2 text-[12px] leading-relaxed text-mist">
          This experience renders the miniature in 3D. Your browser doesn't support WebGL — try the latest Chrome,
          Safari or Edge with hardware acceleration enabled.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const webgl = useMemo(webglAvailable, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink text-white">
      <div className="viewport-backdrop absolute inset-0" />
      <div className="viewport-floor-glow absolute inset-0" />
      {webgl ? <ConfiguratorCanvas /> : <Fallback />}
      <div className="viewport-vignette pointer-events-none absolute inset-0 z-[15]" />
      <TopBar />
      <CategoryRail />
      <OptionPanel />
      <PartsControls />
      <SummaryBar />
      <BuildSheet />
      <Toasts />
      <Splash />
    </div>
  )
}
