import { byId } from '../data/catalog'
import type { BuildConfig } from '../types'

export const DEFAULT_CONFIG: BuildConfig = {
  modelId: 'veloce-gt',
  paintId: 'liquid-silver',
  wheelId: 'classic-five',
  caliperId: 'caliper-black',
  tintId: 'tint-light',
  bodykitId: 'kit-stock',
  spoilerId: 'spoiler-none',
  interiorId: 'int-cognac',
}

const STORAGE_KEY = 'meridian-build-v1'

export function encodeConfig(config: BuildConfig): string {
  return [
    config.modelId,
    config.paintId,
    config.wheelId,
    config.caliperId,
    config.tintId,
    config.bodykitId,
    config.spoilerId,
    config.interiorId,
  ].join('~')
}

export function decodeConfig(raw: string): BuildConfig {
  const parts = decodeURIComponent(raw).split('~')
  const [modelId, paintId, wheelId, caliperId, tintId, bodykitId, spoilerId, interiorId] = [
    parts[0],
    parts[1],
    parts[2],
    parts[3],
    parts[4],
    parts[5],
    parts[6],
    parts[7],
  ]

  const model = byId.model(modelId)
  return {
    modelId: model.id,
    paintId: byId.paint(paintId).id,
    wheelId: byId.wheel(wheelId).id,
    caliperId: byId.caliper(caliperId).id,
    tintId: byId.tint(tintId).id,
    bodykitId: byId.bodykit(bodykitId).id,
    spoilerId: byId.spoiler(spoilerId).id,
    interiorId: byId.interior(interiorId).id,
  }
}

export function shareUrl(config: BuildConfig): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('c', encodeConfig(config))
  return url.toString()
}

export function loadInitialConfig(): BuildConfig {
  try {
    const param = new URL(window.location.href).searchParams.get('c')
    if (param) return decodeConfig(param)
  } catch {
    /* fall through */
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return decodeConfig(stored)
  } catch {
    /* fall through */
  }
  return DEFAULT_CONFIG
}

export function persistConfig(config: BuildConfig) {
  try {
    window.localStorage.setItem(STORAGE_KEY, encodeConfig(config))
  } catch {
    /* ignore */
  }
}
