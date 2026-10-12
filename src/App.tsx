import { useEffect, useMemo } from 'react'
import { MotionConfig } from 'framer-motion'
import { ConfiguratorCanvas } from './components/three/ConfiguratorCanvas'
import { BuildSheet } from './components/ui/BuildSheet'
import { CategoryRail } from './components/ui/CategoryRail'
import { OptionPanel } from './components/ui/OptionPanel'
import { PartsControls } from './components/ui/PartsControls'
import { Shortcuts } from './components/ui/Shortcuts'
import { Splash } from './components/ui/Splash'
import { SummaryBar } from './components/ui/SummaryBar'
import { Toasts } from './components/ui/Toasts'
import { TopBar } from './components/ui/TopBar'
import { useShortcuts } from './hooks/useShortcuts'
import { MODEL_REVISION } from './lib/revision'
import { gpuProbe } from './lib/perf'
import { isCompactViewport } from './lib/device'
import { useConfigurator } from './store/configurator'

const HINT_KEY = 'meridian-shortcuts-hint'

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

function FirstRunHint() {
  const showToast = useConfigurator((s) => s.showToast)

  useEffect(() => {
    let seen = true
    try {
      seen = Boolean(window.localStorage.getItem(HINT_KEY))
    } catch {
      /* ignore */
    }
    if (seen || isCompactViewport()) return
    const markSeen = () => {
      try {
        window.localStorage.setItem(HINT_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    const timer = setTimeout(() => {
      const state = useConfigurator.getState()
      const alreadyExploring =
        state.past.length > 0 || state.buildSheetOpen || state.shortcutsOpen || state.preview !== null
      markSeen()
      if (alreadyExploring) return
      showToast('Tip: press ? for shortcuts · hover swatches to preview', { duration: 6200 })
    }, 2400)
    return () => clearTimeout(timer)
  }, [showToast])

  return null
}

export default function App() {
  const webgl = useMemo(() => gpuProbe().webgl, [])
  useEffect(() => {
    console.info(`[meridian] model revision: ${MODEL_REVISION}`)
  }, [])
  useShortcuts()

  return (
    <MotionConfig reducedMotion="user">
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
        <Shortcuts />
        <Toasts />
        <Splash />
        <FirstRunHint />
      </div>
    </MotionConfig>
  )
}
