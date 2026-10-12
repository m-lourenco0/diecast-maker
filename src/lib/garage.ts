import { byId } from '../data/catalog'
import { encodeConfig } from './urlState'
import type { BuildConfig } from '../types'

export interface SavedBuild {
  id: string
  name: string
  code: string
  config: BuildConfig
  savedAt: number
}

const STORAGE_KEY = 'meridian-garage-v1'
const LIMIT = 12

export function loadGarage(): SavedBuild[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedBuild[]
    return Array.isArray(parsed) ? parsed.filter((b) => b && b.config && b.code) : []
  } catch {
    return []
  }
}

function persist(garage: SavedBuild[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(garage))
  } catch {
    /* ignore */
  }
}

export function buildName(config: BuildConfig): string {
  return `${byId.model(config.modelId).name} · ${byId.paint(config.paintId).name}`
}

/** Save a build; saving the same configuration again just moves it to the top. */
export function saveBuild(config: BuildConfig): SavedBuild[] {
  const code = encodeConfig(config)
  const now = Date.now()
  const garage = loadGarage()
  const duplicate = garage.find((b) => b.code === code)
  const entry: SavedBuild = {
    id: duplicate?.id ?? `build-${now.toString(36)}`,
    name: buildName(config),
    code,
    config,
    savedAt: now,
  }
  const next = [entry, ...garage.filter((b) => b.id !== entry.id)].slice(0, LIMIT)
  persist(next)
  return next
}

export function removeBuild(id: string): SavedBuild[] {
  const garage = loadGarage().filter((b) => b.id !== id)
  persist(garage)
  return garage
}

/** Restore a previously removed build (used by the delete-undo toast). */
export function restoreBuild(entry: SavedBuild): SavedBuild[] {
  const garage = [entry, ...loadGarage().filter((b) => b.id !== entry.id)].slice(0, LIMIT)
  persist(garage)
  return garage
}

export function formatSavedAt(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
