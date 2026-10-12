import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function Splash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1700)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-ink"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="h-14 w-14"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <path d="M5 17.5 10.2 6.5h3.6L19 17.5h-2.9L12.6 9l-3.7 8.5Z" fill="#c8a96a" />
            <rect x="8" y="19" width="8" height="1.4" rx="0.7" fill="#8a7448" />
          </motion.svg>
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.44em' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[17px] text-white"
          >
            MERIDIAN
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-1.5 text-[9.5px] uppercase tracking-[0.34em] text-mist-2"
          >
            Die-cast Atelier
          </motion.div>
          <div className="mt-8 h-px w-44 overflow-hidden rounded-full bg-white/8">
            <div className="shimmer-line h-full w-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
