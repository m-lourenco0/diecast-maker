import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { computePrice, usd } from '../../lib/pricing'
import { useConfigurator } from '../../store/configurator'
import { IconSheet, IconSparkle, IconUndo } from './icons'

/** Animates the price without re-rendering React: it writes textContent directly. */
function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(value)

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = usd(v)
      },
    })
    return () => controls.stop()
  }, [value, mv])

  return (
    <span ref={ref} className="tabular-nums">
      {usd(value)}
    </span>
  )
}

export function SummaryBar() {
  const config = useConfigurator((s) => s.config)
  const canUndo = useConfigurator((s) => s.past.length > 0)
  const randomize = useConfigurator((s) => s.randomize)
  const undo = useConfigurator((s) => s.undo)
  const setBuildSheet = useConfigurator((s) => s.setBuildSheet)
  const price = computePrice(config)
  const upgrades = price.options.length

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">
      <motion.div
        className="glass-panel pointer-events-auto flex w-full items-center gap-2 rounded-2xl p-2.5 md:w-auto md:gap-3"
      >
        <button
          onClick={randomize}
          title="Surprise me (R)"
          aria-label="Surprise me with a random build"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-mist transition-colors hover:border-gold/50 hover:text-gold"
        >
          <IconSparkle width={18} height={18} />
        </button>
        {canUndo && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16 }}
            onClick={undo}
            title="Undo (⌘Z)"
            aria-label="Undo last change"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-mist transition-colors hover:border-gold/50 hover:text-gold"
          >
            <IconUndo width={18} height={18} />
          </motion.button>
        )}
        <div className="hidden h-9 w-px bg-line md:block" />
        <div className="min-w-0 flex-1 px-1 md:px-2">
          <div className="text-[9.5px] uppercase tracking-[0.2em] text-mist-2">
            <span className="whitespace-nowrap">Build total</span>
            {upgrades > 0 && (
              <span className="hidden sm:inline">
                {' '}· {upgrades} upgrade{upgrades === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <div className="font-display text-[20px] leading-tight text-white md:text-[22px]">
            <AnimatedPrice value={price.total} />
          </div>
        </div>
        <button
          onClick={() => setBuildSheet(true)}
          title="Build sheet (S)"
          className="hidden h-11 items-center gap-2 rounded-xl border border-line px-4 text-[11px] uppercase tracking-[0.16em] text-mist transition-colors hover:border-line-strong hover:text-white md:flex"
        >
          <IconSheet width={15} height={15} />
          Build sheet
        </button>
        <button
          onClick={() => setBuildSheet(true)}
          className="flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-soft"
        >
          Reserve build
        </button>
      </motion.div>
    </div>
  )
}
