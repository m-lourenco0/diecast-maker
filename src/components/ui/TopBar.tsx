import { motion, useReducedMotion } from 'framer-motion'
import { CAR_DIMS } from '../../data/profiles'
import { byId } from '../../data/catalog'
import { VIEW_ORDER } from '../../lib/views'
import { useConfigurator } from '../../store/configurator'
import type { ViewId } from '../../types'
import { IconCar, IconCockpit, IconFront, IconKeyboard, IconProfile, IconRear, IconRotate, IconTop } from './icons'

const VIEW_META: Record<ViewId, { label: string; Icon: typeof IconCar }> = {
  front: { label: 'Front', Icon: IconFront },
  'three-quarter': { label: '3/4', Icon: IconCar },
  profile: { label: 'Profile', Icon: IconProfile },
  rear: { label: 'Rear', Icon: IconRear },
  top: { label: 'Top', Icon: IconTop },
  cockpit: { label: 'Cockpit', Icon: IconCockpit },
}

const VIEWS = VIEW_ORDER.map((id) => ({ id, ...VIEW_META[id] }))

export function TopBar() {
  const modelId = useConfigurator((s) => s.config.modelId)
  const view = useConfigurator((s) => s.view)
  const turntable = useConfigurator((s) => s.turntable)
  const setView = useConfigurator((s) => s.setView)
  const setTurntable = useConfigurator((s) => s.setTurntable)
  const toggleShortcuts = useConfigurator((s) => s.toggleShortcuts)
  const reduceMotion = useReducedMotion()
  const model = byId.model(modelId)
  const dims = CAR_DIMS[modelId]

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] md:p-6 md:pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-4">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel/80 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path d="M5 17.5 10.2 6.5h3.6L19 17.5h-2.9L12.6 9l-3.7 8.5Z" fill="#c8a96a" />
              <rect x="8" y="19" width="8" height="1.4" rx="0.7" fill="#8a7448" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-medium tracking-[0.32em] text-white">MERIDIAN</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-mist-2">Die-cast Atelier</div>
          </div>
        </div>

        <div className="pointer-events-auto hidden items-center gap-2 lg:flex">
          <div className="glass-chip flex flex-col rounded-xl px-4 py-2 leading-tight">
            <span className="font-display text-[13px] tracking-[0.14em] text-white">{model.name.toUpperCase()}</span>
            <span className="text-[10px] tracking-[0.18em] text-mist-2">
              {dims.length.toFixed(1)} m 1:1 · {model.scale} · {model.edition}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <div className="glass-chip hidden items-center gap-1 rounded-full p-1 md:flex" role="radiogroup" aria-label="Camera views">
            {VIEWS.map(({ id, label, Icon }) => {
              const active = view === id
              return (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  title={`${label} view (V)`}
                  aria-label={`${label} view`}
                  aria-checked={active}
                  role="radio"
                  className={`relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                    active ? 'text-ink' : 'text-mist hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="view-pill"
                      className="absolute inset-0 rounded-full bg-gold"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon width={15} height={15} />
                    <span className="hidden xl:inline">{label}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setTurntable(!turntable)}
            title="Turntable (T)"
            aria-label="Toggle turntable"
            aria-pressed={turntable}
            className={`glass-chip flex h-11 items-center gap-2 rounded-xl px-3.5 text-[11px] uppercase tracking-[0.16em] transition-colors ${
              turntable ? 'text-gold' : 'text-mist hover:text-white'
            }`}
          >
            <IconRotate
              width={17}
              height={17}
              className={turntable && !reduceMotion ? 'animate-[spin_9s_linear_infinite]' : ''}
            />
            <span className="hidden md:inline">Turntable</span>
          </button>
          <button
            onClick={toggleShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            className="glass-chip hidden h-11 w-11 items-center justify-center rounded-xl text-mist transition-colors hover:text-white md:flex"
          >
            <IconKeyboard width={17} height={17} />
          </button>
        </div>
      </div>

      <div className="pointer-events-auto flex justify-center md:hidden">
        <div className="glass-chip flex items-center gap-0.5 rounded-full p-1" role="radiogroup" aria-label="Camera views">
          {VIEWS.map(({ id, label, Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                title={label}
                aria-label={`${label} view`}
                aria-checked={active}
                role="radio"
                className={`relative flex h-9 w-10 items-center justify-center rounded-full transition-colors ${
                  active ? 'text-ink' : 'text-mist'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="view-pill-mobile"
                    className="absolute inset-0 rounded-full bg-gold"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon width={16} height={16} className="relative z-10" />
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
