import { AnimatePresence, motion } from 'framer-motion'
import { useConfigurator } from '../../store/configurator'

export function Toasts() {
  const toast = useConfigurator((s) => s.toast)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="glass-panel max-w-md truncate rounded-full px-5 py-2.5 text-[12px] text-white"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
