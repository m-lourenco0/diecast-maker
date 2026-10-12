import { create } from 'zustand'
import { byId, CALIPERS, INTERIORS, PAINTS, MODELS, SPOILERS, BODYKITS, TINTS, WHEELS } from '../data/catalog'
import { DEFAULT_CONFIG, loadInitialConfig, persistConfig } from '../lib/urlState'
import type { BuildConfig, CategoryId, ModelId, ViewId } from '../types'

const pick = <T extends { id: string }>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

interface ConfiguratorState {
  config: BuildConfig
  parts: { doors: boolean; lid: boolean }
  category: CategoryId
  panelOpen: boolean
  view: ViewId
  turntable: boolean
  lastInteraction: number
  modelEpoch: number
  viewEpoch: number
  buildSheetOpen: boolean
  toast: string | null
  setCategory: (category: CategoryId) => void
  togglePanel: () => void
  closePanel: () => void
  setOption: <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => void
  setModel: (id: ModelId) => void
  setView: (view: ViewId) => void
  setTurntable: (on: boolean) => void
  markInteraction: () => void
  togglePart: (part: 'doors' | 'lid') => void
  randomize: () => void
  reset: () => void
  setBuildSheet: (open: boolean) => void
  showToast: (message: string) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useConfigurator = create<ConfiguratorState>((set, get) => ({
  config: DEFAULT_CONFIG,
  parts: { doors: false, lid: false },
  category: 'paint',
  panelOpen: true,
  view: 'three-quarter',
  turntable: true,
  lastInteraction: 0,
  modelEpoch: 0,
  viewEpoch: 0,
  buildSheetOpen: false,
  toast: null,

  setCategory: (category) => set({ category, panelOpen: true }),

  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),

  closePanel: () => set({ panelOpen: false }),

  setOption: (key, value) => {
    const config = { ...get().config, [key]: value }
    persistConfig(config)
    set({ config })
  },

  setModel: (id) => {
    const config = { ...get().config, modelId: id }
    persistConfig(config)
    set((s) => ({ config, modelEpoch: s.modelEpoch + 1, lastInteraction: performance.now() }))
  },

  setView: (view) =>
    set((s) => ({ view, lastInteraction: performance.now(), viewEpoch: s.viewEpoch + 1 })),

  setTurntable: (turntable) => set({ turntable, lastInteraction: performance.now() }),

  markInteraction: () => set({ lastInteraction: performance.now() }),

  togglePart: (part) =>
    set((s) => ({
      parts: { ...s.parts, [part]: !s.parts[part] },
      lastInteraction: performance.now(),
    })),

  randomize: () => {
    const current = get().config
    let model = pick(MODELS)
    for (let tries = 0; tries < 4 && model.id === current.modelId; tries++) model = pick(MODELS)
    const config: BuildConfig = {
      modelId: model.id,
      paintId: pick(PAINTS).id,
      wheelId: pick(WHEELS).id,
      caliperId: pick(CALIPERS).id,
      tintId: pick(TINTS).id,
      bodykitId: pick(BODYKITS).id,
      spoilerId: pick(SPOILERS).id,
      interiorId: pick(INTERIORS).id,
    }
    persistConfig(config)
    set((s) => ({ config, modelEpoch: s.modelEpoch + 1, lastInteraction: performance.now() }))
  },

  reset: () => {
    persistConfig(DEFAULT_CONFIG)
    set((s) => ({
      config: DEFAULT_CONFIG,
      modelEpoch: s.modelEpoch + 1,
      lastInteraction: performance.now(),
    }))
  },

  setBuildSheet: (buildSheetOpen) => set({ buildSheetOpen }),

  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toast: message })
    toastTimer = setTimeout(() => set({ toast: null }), 2600)
  },
}))

// hydrate from URL / storage before first paint
useConfigurator.setState({ config: loadInitialConfig() })

export const modelOf = (config: BuildConfig) => byId.model(config.modelId)
