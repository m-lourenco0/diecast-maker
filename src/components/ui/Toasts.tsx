import { AnimatePresence, motion } from 'framer-motion'
import { useConfigurator } from '../../store/configurator'

export function Toasts() {
  const toast = useConfigurator((s) => s.toast)
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-20 z-50 flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="glass-panel pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full py-2.5 pl-5 pr-2.5 text-[12px] text-white"
          >
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            <span className="truncate">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.run}
                className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-[10.5px] uppercase tracking-[0.14em] text-gold transition-colors hover:bg-gold/10"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
