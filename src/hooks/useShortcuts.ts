import { useEffect } from 'react'
import { CATEGORIES } from '../data/catalog'
import { cycleView } from '../lib/views'
import { useConfigurator } from '../store/configurator'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))

/**
 * Global keyboard shortcuts. Deliberately plain keys (no modifiers) so the
 * configurator can be driven like a game: 1–6 categories, arrows options,
 * V views, T turntable, D/L hinged parts, R randomize, S build sheet, ? help.
 */
export function useShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const state = useConfigurator.getState()
      const key = event.key.toLowerCase()
      const mod = event.metaKey || event.ctrlKey

      if (mod) {
        if (key === 'z') {
          event.preventDefault()
          if (event.shiftKey) state.redo()
          else state.undo()
        } else if (key === 'y') {
          event.preventDefault()
          state.redo()
        }
        return
      }
      if (event.altKey) return

      // while a dialog is up, only allow closing / help
      if (state.shortcutsOpen && event.key !== 'Escape' && event.key !== '?') return
      if (state.buildSheetOpen && event.key !== 'Escape') return

      if (event.key === '?') {
        event.preventDefault()
        state.toggleShortcuts()
        return
      }
      if (event.key === 'Escape') {
        if (state.shortcutsOpen) state.setShortcuts(false)
        else if (state.buildSheetOpen) state.setBuildSheet(false)
        else if (state.panelOpen) state.closePanel()
        return
      }
      if (state.shortcutsOpen || state.buildSheetOpen) return

      // 1–6 — jump between customization categories
      if (/^[1-6]$/.test(event.key)) {
        const category = CATEGORIES[Number(event.key) - 1]
        if (category) {
          event.preventDefault()
          state.setCategory(category.id)
        }
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
        case '[':
          event.preventDefault()
          if (!state.panelOpen) state.setCategory(state.category)
          state.cycleOption(-1, event.shiftKey)
          return
        case 'ArrowRight':
        case ']':
          event.preventDefault()
          if (!state.panelOpen) state.setCategory(state.category)
          state.cycleOption(1, event.shiftKey)
          return
        default:
          break
      }

      switch (key) {
        case 'v':
          event.preventDefault()
          state.setView(cycleView(state.view, event.shiftKey ? -1 : 1))
          break
        case 't':
          event.preventDefault()
          state.toggleTurntable()
          break
        case 'd':
          event.preventDefault()
          state.togglePart('doors')
          break
        case 'l':
          event.preventDefault()
          state.togglePart('lid')
          break
        case 'r':
          event.preventDefault()
          state.randomize()
          break
        case 's':
          event.preventDefault()
          state.setBuildSheet(true)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
