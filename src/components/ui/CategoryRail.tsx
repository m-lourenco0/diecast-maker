import { motion } from 'framer-motion'
import { CATEGORIES } from '../../data/catalog'
import { useConfigurator } from '../../store/configurator'
import type { CategoryId } from '../../types'
import { IconAero, IconCar, IconGlazing, IconPaint, IconSeat, IconWheel } from './icons'

const ICONS: Record<CategoryId, typeof IconCar> = {
  model: IconCar,
  paint: IconPaint,
  wheels: IconWheel,
  glazing: IconGlazing,
  aero: IconAero,
  interior: IconSeat,
}

export function CategoryRail() {
  const category = useConfigurator((s) => s.category)
  const panelOpen = useConfigurator((s) => s.panelOpen)
  const setCategory = useConfigurator((s) => s.setCategory)
  const togglePanel = useConfigurator((s) => s.togglePanel)

  return (
    <nav className="absolute bottom-[calc(84px+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 md:bottom-auto md:left-5 md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
      <div className="glass-panel flex flex-row items-center gap-0.5 rounded-2xl p-1.5 md:flex-col md:gap-1 md:p-2">
        {CATEGORIES.map(({ id, label }) => {
          const Icon = ICONS[id]
          const active = category === id && panelOpen
          return (
            <button
              key={id}
              onClick={() => (active ? togglePanel() : setCategory(id))}
              className={`group relative flex flex-col items-center gap-1 rounded-xl px-2.5 py-2 transition-colors md:w-[62px] md:px-1 md:py-2.5 ${
                active ? 'bg-white/[0.06] text-gold' : 'text-mist-2 hover:bg-white/[0.04] hover:text-white'
              }`}
              aria-pressed={active}
            >
              {active && (
                <motion.span
                  layoutId="rail-indicator"
                  className="absolute -top-0.5 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-gold md:-left-2 md:top-1/2 md:h-6 md:w-[3px] md:-translate-y-1/2 md:translate-x-0"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <Icon width={19} height={19} />
              <span className="hidden text-[9px] uppercase tracking-[0.14em] md:block">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
