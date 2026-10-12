import { motion } from 'framer-motion'
import { CAR_DIMS } from '../../data/profiles'
import { useConfigurator } from '../../store/configurator'
import { IconDoor, IconLid } from './icons'
import type { ReactNode } from 'react'

function PartButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 items-center gap-2 rounded-full px-3.5 text-[10.5px] uppercase tracking-[0.16em] transition-colors ${
        active ? 'bg-gold/15 text-gold' : 'text-mist hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  )
}

export function PartsControls() {
  const parts = useConfigurator((s) => s.parts)
  const togglePart = useConfigurator((s) => s.togglePart)
  const modelId = useConfigurator((s) => s.config.modelId)
  const lidLabel = CAR_DIMS[modelId].openTop ? 'Hood' : 'Decklid'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.9, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute bottom-6 left-6 z-30 max-md:bottom-auto max-md:left-1/2 max-md:top-[calc(env(safe-area-inset-top)+132px)] max-md:-translate-x-1/2"
    >
      <div className="glass-chip pointer-events-auto flex items-center gap-0.5 rounded-full p-1">
        <PartButton active={parts.doors} onClick={() => togglePart('doors')} label="Doors">
          <IconDoor width={16} height={16} />
        </PartButton>
        <PartButton active={parts.lid} onClick={() => togglePart('lid')} label={lidLabel}>
          <IconLid width={16} height={16} />
        </PartButton>
      </div>
    </motion.div>
  )
}
