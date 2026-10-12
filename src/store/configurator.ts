import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { byId, CALIPERS, INTERIORS, PAINTS, MODELS, SPOILERS, BODYKITS, TINTS, WHEELS } from '../data/catalog'
import { DEFAULT_CONFIG, loadInitialConfig, persistConfig } from '../lib/urlState'
import type { BuildConfig, CategoryId, ModelId, ViewId } from '../types'

const pick = <T extends { id: string }>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

const HISTORY_LIMIT = 50

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

export interface ToastAction {
  label: string
  run: () => void
}

export interface ToastOptions {
  action?: ToastAction
  duration?: number
}

export interface Toast {
  id: number
  message: string
  action?: ToastAction
}

const TOAST_MS = 2600
const TOAST_ACTION_MS = 5200

const CATEGORY_KEYS: Record<CategoryId, keyof BuildConfig> = {
  model: 'modelId',
  paint: 'paintId',
  wheels: 'wheelId',
  glazing: 'tintId',
  aero: 'bodykitId',
  interior: 'interiorId',
}

const idsFor = (category: CategoryId, alt: boolean): string[] => {
  switch (category) {
    case 'model':
      return MODELS.map((m) => m.id)
    case 'paint':
      return PAINTS.map((p) => p.id)
    case 'wheels':
      return WHEELS.map((w) => w.id)
    case 'glazing':
      return TINTS.map((t) => t.id)
    case 'aero':
      return (alt ? SPOILERS : BODYKITS).map((a) => a.id)
    case 'interior':
      return INTERIORS.map((i) => i.id)
  }
}

interface ConfiguratorState {
  config: BuildConfig
  /** transient hover/focus preview — merged over the config for rendering only */
  preview: Partial<BuildConfig> | null
  past: BuildConfig[]
  future: BuildConfig[]
  parts: { doors: boolean; lid: boolean }
  category: CategoryId
  panelOpen: boolean
  view: ViewId
  turntable: boolean
  lastInteraction: number
  modelEpoch: number
  viewEpoch: number
  buildSheetOpen: boolean
  shortcutsOpen: boolean
  toast: Toast | null
  setCategory: (category: CategoryId) => void
  togglePanel: () => void
  closePanel: () => void
  setOption: <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => void
  setConfig: (config: BuildConfig) => void
  cycleOption: (dir: 1 | -1, alt?: boolean) => void
  setModel: (id: ModelId) => void
  setView: (view: ViewId) => void
  setTurntable: (on: boolean) => void
  toggleTurntable: () => void
  markInteraction: () => void
  togglePart: (part: 'doors' | 'lid') => void
  randomize: () => void
  reset: () => void
  undo: () => void
  redo: () => void
  setPreview: (patch: Partial<BuildConfig>) => void
  clearPreview: () => void
  setBuildSheet: (open: boolean) => void
  setShortcuts: (open: boolean) => void
  toggleShortcuts: () => void
  showToast: (message: string, options?: ToastOptions) => void
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
let toastId = 0

export const useConfigurator = create<ConfiguratorState>((set, get) => {
  const applyOption = <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) => {
    const state = get()
    if (state.config[key] === value) return
    const config = { ...state.config, [key]: value }
    persistConfig(config)
    if (key !== 'modelId') {
      set({ config, past: [...state.past, state.config].slice(-HISTORY_LIMIT), future: [], preview: null })
      return
    }
    // a model swap is a bigger moment: push history, spin the turntable
    set({
      config,
      past: [...state.past, state.config].slice(-HISTORY_LIMIT),
      future: [],
      preview: null,
      modelEpoch: state.modelEpoch + 1,
      parts: { doors: false, lid: false },
      lastInteraction: performance.now(),
    })
  }

  return {
    config: DEFAULT_CONFIG,
    preview: null,
    past: [],
    future: [],
    parts: { doors: false, lid: false },
    category: 'paint',
    panelOpen: true,
    view: 'three-quarter',
    turntable: !prefersReducedMotion(),
    lastInteraction: 0,
    modelEpoch: 0,
    viewEpoch: 0,
    buildSheetOpen: false,
    shortcutsOpen: false,
    toast: null,

    setCategory: (category) => set({ category, panelOpen: true, preview: null }),

    togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen, preview: null })),

    closePanel: () => set({ panelOpen: false, preview: null }),

    setOption: applyOption,

    setConfig: (config) => {
      const state = get()
      persistConfig(config)
      set({
        config,
        past: [...state.past, state.config].slice(-HISTORY_LIMIT),
        future: [],
        preview: null,
        modelEpoch: config.modelId !== state.config.modelId ? state.modelEpoch + 1 : state.modelEpoch,
        lastInteraction: performance.now(),
      })
    },

    cycleOption: (dir, alt = false) => {
      const { category, config } = get()
      const key = category === 'aero' && alt ? 'spoilerId' : CATEGORY_KEYS[category]
      const ids = idsFor(category, alt)
      const idx = ids.indexOf(config[key])
      const next = ids[(idx + dir + ids.length) % ids.length]
      if (next && next !== config[key]) applyOption(key, next)
    },

    setModel: (id) => applyOption('modelId', id),

    setView: (view) =>
      set((s) => ({ view, lastInteraction: performance.now(), viewEpoch: s.viewEpoch + 1 })),

    setTurntable: (turntable) => set({ turntable, lastInteraction: performance.now() }),

    toggleTurntable: () =>
      set((s) => ({ turntable: !s.turntable, lastInteraction: performance.now() })),

    markInteraction: () => set({ lastInteraction: performance.now() }),

    togglePart: (part) =>
      set((s) => ({
        parts: { ...s.parts, [part]: !s.parts[part] },
        lastInteraction: performance.now(),
      })),

    randomize: () => {
      const state = get()
      const current = state.config
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
      set({
        config,
        past: [...state.past, current].slice(-HISTORY_LIMIT),
        future: [],
        preview: null,
        modelEpoch: state.modelEpoch + 1,
        parts: { doors: false, lid: false },
        lastInteraction: performance.now(),
      })
      get().showToast('Rolled a fresh build', { action: { label: 'Undo', run: () => get().undo() } })
    },

    reset: () => {
      const state = get()
      persistConfig(DEFAULT_CONFIG)
      set({
        config: DEFAULT_CONFIG,
        past: [...state.past, state.config].slice(-HISTORY_LIMIT),
        future: [],
        preview: null,
        modelEpoch: state.modelEpoch + 1,
        parts: { doors: false, lid: false },
        lastInteraction: performance.now(),
      })
      get().showToast('Build reset to stock', { action: { label: 'Undo', run: () => get().undo() } })
    },

    undo: () => {
      const { past, config } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]
      persistConfig(previous)
      set((s) => ({
        config: previous,
        past: s.past.slice(0, -1),
        future: [...s.future, config].slice(-HISTORY_LIMIT),
        preview: null,
        modelEpoch: previous.modelId !== config.modelId ? s.modelEpoch + 1 : s.modelEpoch,
        lastInteraction: performance.now(),
      }))
      get().showToast('Change undone', { action: { label: 'Redo', run: () => get().redo() } })
    },

    redo: () => {
      const { future, config } = get()
      if (future.length === 0) return
      const next = future[future.length - 1]
      persistConfig(next)
      set((s) => ({
        config: next,
        past: [...s.past, config].slice(-HISTORY_LIMIT),
        future: s.future.slice(0, -1),
        preview: null,
        modelEpoch: next.modelId !== config.modelId ? s.modelEpoch + 1 : s.modelEpoch,
        lastInteraction: performance.now(),
      }))
      get().showToast('Change reapplied', { action: { label: 'Undo', run: () => get().undo() } })
    },

    setPreview: (patch) => {
      const { preview } = get()
      const same =
        preview !== null &&
        Object.entries(patch).every(([k, v]) => (preview as Record<string, unknown>)[k] === v)
      if (same) return
      set((s) => ({ preview: { ...s.preview, ...patch } }))
    },

    clearPreview: () => set((s) => (s.preview ? { preview: null } : s)),

    setBuildSheet: (buildSheetOpen) => set({ buildSheetOpen, preview: null }),

    setShortcuts: (shortcutsOpen) => set({ shortcutsOpen, preview: null }),

    toggleShortcuts: () => set((s) => ({ shortcutsOpen: !s.shortcutsOpen, preview: null })),

    showToast: (message, options) => {
      if (toastTimer) clearTimeout(toastTimer)
      set({ toast: { id: ++toastId, message, action: options?.action } })
      toastTimer = setTimeout(
        () => set({ toast: null }),
        options?.duration ?? (options?.action ? TOAST_ACTION_MS : TOAST_MS),
      )
    },
  }
})

// hydrate from URL / storage before first paint
useConfigurator.setState({ config: loadInitialConfig() })

export const modelOf = (config: BuildConfig) => byId.model(config.modelId)

/** Merge a transient preview over the committed config. */
export const withPreview = (config: BuildConfig, preview: Partial<BuildConfig> | null): BuildConfig =>
  preview ? { ...config, ...preview } : config

/** Config including any hover preview, for render code inside <Canvas>. */
export const getEffectiveConfig = () => {
  const { config, preview } = useConfigurator.getState()
  return withPreview(config, preview)
}

/** Reactive effective config (only re-renders when a rendered value actually changes). */
export function useEffectiveConfig(): BuildConfig {
  return useConfigurator(useShallow((s) => withPreview(s.config, s.preview)))
}

/** Props that preview an option on the model while hovering / focusing it. */
export const previewProps = (patch: Partial<BuildConfig>) => ({
  onMouseEnter: () => useConfigurator.getState().setPreview(patch),
  onMouseLeave: () => useConfigurator.getState().clearPreview(),
  onFocus: () => useConfigurator.getState().setPreview(patch),
  onBlur: () => useConfigurator.getState().clearPreview(),
})
