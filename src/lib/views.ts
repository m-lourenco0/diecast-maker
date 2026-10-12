import type { ViewId } from '../types'

/** Camera views in shortcut-cycling order. */
export const VIEW_ORDER: ViewId[] = ['front', 'three-quarter', 'profile', 'rear', 'top', 'cockpit']

export function cycleView(view: ViewId, dir: 1 | -1): ViewId {
  const idx = Math.max(VIEW_ORDER.indexOf(view), 0)
  return VIEW_ORDER[(idx + dir + VIEW_ORDER.length) % VIEW_ORDER.length]
}
