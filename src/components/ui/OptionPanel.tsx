import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  BODYKITS,
  CALIPERS,
  CATEGORIES,
  INTERIORS,
  MODELS,
  PAINTS,
  SPOILERS,
  TINTS,
  WHEELS,
} from '../../data/catalog'
import { CAR_DIMS } from '../../data/profiles'
import { silhouettePath } from '../../lib/carShapes'
import { usd } from '../../lib/pricing'
import { useConfigurator } from '../../store/configurator'
import type { CategoryId, FinishId, ModelId, WheelOption } from '../../types'
import { IconCheck, IconClose } from './icons'

const DESCRIPTIONS: Record<CategoryId, string> = {
  model: 'Choose the silhouette that starts your build.',
  paint: 'Solid, metallic or atelier finishes, hand-polished.',
  wheels: 'Rims, stance and brake calipers.',
  glazing: 'Tint the glass house to taste.',
  aero: 'Body kits and rear-deck aero.',
  interior: 'Leather, alcantara and heritage inserts.',
}

const FINISH_CLASS: Record<FinishId, string> = {
  gloss: 'swatch-gloss',
  metallic: 'swatch-metallic',
  satin: 'swatch-satin',
  matte: 'swatch-matte',
  chrome: 'swatch-chrome',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
}

function PriceNote({ price, className = '' }: { price: number; className?: string }) {
  return <span className={className}>{price === 0 ? 'Included' : `+${usd(price)}`}</span>
}

/* ------------------------------------------------------------ model panel */

function ModelSilhouette({ modelId, active }: { modelId: ModelId; active: boolean }) {
  const dims = CAR_DIMS[modelId]
  const paths = useMemo(() => silhouettePath(dims, 260, 92, 4), [dims])
  const stroke = active ? '#c8a96a' : '#5d646e'
  return (
    <svg viewBox="0 0 260 92" className="h-[86px] w-full" aria-hidden>
      {paths.cabin && <path d={paths.cabin} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />}
      <path d={paths.body} fill={active ? 'rgba(200,169,106,0.14)' : 'rgba(255,255,255,0.05)'} stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" />
      <path d={paths.wheelFront} fill="none" stroke={stroke} strokeWidth={1.4} />
      <path d={paths.wheelRear} fill="none" stroke={stroke} strokeWidth={1.4} />
    </svg>
  )
}

function ModelPanel() {
  const modelId = useConfigurator((s) => s.config.modelId)
  const setModel = useConfigurator((s) => s.setModel)
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {MODELS.map((m) => {
        const active = m.id === modelId
        return (
          <motion.button
            key={m.id}
            variants={item}
            onClick={() => setModel(m.id)}
            className={`relative w-full rounded-2xl border p-3.5 text-left transition-colors ${
              active ? 'border-gold/60 bg-gold/[0.07]' : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
            }`}
            aria-pressed={active}
          >
            {active && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                <IconCheck width={12} height={12} />
              </span>
            )}
            <ModelSilhouette modelId={m.id} active={active} />
            <div className="mt-1 flex items-baseline justify-between gap-3">
              <span className="font-display text-[14px] tracking-[0.1em]">{m.name}</span>
              <span className="font-display text-[13px] text-gold-soft">{usd(m.basePrice)}</span>
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-mist-2">{m.tagline}</div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-mist">{m.blurb}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {m.specs.slice(0, 4).map((s) => (
                <span key={s.label} className="rounded-md border border-line bg-black/20 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-mist-2">
                  {s.value}
                </span>
              ))}
            </div>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

/* ------------------------------------------------------------ paint panel */

function Swatch({
  hex,
  finish,
  active,
  onClick,
  label,
  price,
  note,
  size = 'lg',
}: {
  hex: string
  finish: FinishId | 'glass' | 'plaid'
  active: boolean
  onClick: () => void
  label: string
  price: number
  note?: string
  size?: 'lg' | 'sm'
}) {
  const overlay =
    finish === 'glass' || finish === 'plaid' ? '' : FINISH_CLASS[finish]
  return (
    <motion.button variants={item} onClick={onClick} className="group flex flex-col items-center gap-1.5" aria-pressed={active}>
      <span
        className={`relative overflow-hidden rounded-full border border-white/10 transition-transform duration-200 group-hover:scale-[1.07] ${
          size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
        } ${active ? 'ring-2 ring-gold ring-offset-2 ring-offset-[#13151a]' : ''}`}
        style={{ backgroundColor: hex }}
      >
        {overlay && <span className={`absolute inset-0 ${overlay}`} />}
        {finish === 'plaid' && <span className="absolute inset-0 swatch-plaid" />}
        {active && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
            <IconCheck width={14} height={14} />
          </span>
        )}
      </span>
      <span className={`text-center leading-tight ${active ? 'text-white' : 'text-mist'}`}>
        <span className="block text-[10px]">{label}</span>
      </span>
      <PriceNote price={price} className={`text-[9.5px] ${price ? 'text-gold-soft' : 'text-mist-2'}`} />
      {note && <span className="-mt-1 text-[8.5px] uppercase tracking-wider text-mist-2">{note}</span>}
    </motion.button>
  )
}

function PaintPanel() {
  const paintId = useConfigurator((s) => s.config.paintId)
  const setOption = useConfigurator((s) => s.setOption)
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-4 gap-x-2 gap-y-5">
      {PAINTS.map((p) => (
        <Swatch
          key={p.id}
          hex={p.hex}
          finish={p.finish}
          active={p.id === paintId}
          onClick={() => setOption('paintId', p.id)}
          label={p.name}
          price={p.price}
          note={p.note}
        />
      ))}
    </motion.div>
  )
}

/* ----------------------------------------------------------- wheels panel */

function WheelIcon({ wheel, active }: { wheel: WheelOption; active: boolean }) {
  const spokes = useMemo(() => {
    switch (wheel.style) {
      case 'five':
        return Array.from({ length: 5 }, (_, i) => (i * 360) / 5)
      case 'twinfive':
        return Array.from({ length: 10 }, (_, i) => (i * 36) + (i % 2 ? 4.5 : -4.5))
      case 'mesh':
        return Array.from({ length: 18 }, (_, i) => (i * 360) / 18)
      default:
        return []
    }
  }, [wheel.style])

  const color = wheel.finishHex
  const stroke = active ? '#c8a96a' : 'rgba(255,255,255,0.22)'
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
      {wheel.lipHex && <circle cx="24" cy="24" r="20.5" fill="none" stroke={wheel.lipHex} strokeWidth="2.4" />}
      {wheel.style === 'dish' ? (
        <>
          <circle cx="24" cy="24" r="17" fill={color} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i * Math.PI) / 3
            return <circle key={i} cx={24 + Math.cos(a) * 10} cy={24 + Math.sin(a) * 10} r="2.6" fill="#0b0c0e" opacity="0.85" />
          })}
          <circle cx="24" cy="24" r="4.4" fill="rgba(255,255,255,0.35)" />
        </>
      ) : (
        <>
          <circle cx="24" cy="24" r="19.5" fill="none" stroke={color} strokeWidth="3" opacity="0.9" />
          {spokes.map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            return (
              <line
                key={i}
                x1={24 + Math.cos(rad) * 5}
                y1={24 + Math.sin(rad) * 5}
                x2={24 + Math.cos(rad) * 18}
                y2={24 + Math.sin(rad) * 18}
                stroke={color}
                strokeWidth={wheel.style === 'mesh' ? 1.6 : 2.6}
              />
            )
          })}
          <circle cx="24" cy="24" r="5" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
        </>
      )}
      <circle cx="24" cy="24" r="21.4" fill="none" stroke={stroke} strokeWidth="1" />
    </svg>
  )
}

function WheelsPanel() {
  const wheelId = useConfigurator((s) => s.config.wheelId)
  const caliperId = useConfigurator((s) => s.config.caliperId)
  const setOption = useConfigurator((s) => s.setOption)

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="space-y-2">
        {WHEELS.map((w) => {
          const active = w.id === wheelId
          return (
            <motion.button
              key={w.id}
              variants={item}
              onClick={() => setOption('wheelId', w.id)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3.5 rounded-xl border p-3 text-left transition-colors ${
                active ? 'border-gold/60 bg-gold/[0.07]' : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
              }`}
            >
              <WheelIcon wheel={w} active={active} />
              <span className="flex-1">
                <span className="block text-[12.5px] tracking-wide">{w.name}</span>
                <PriceNote price={w.price} className={`text-[10.5px] ${w.price ? 'text-gold-soft' : 'text-mist-2'}`} />
              </span>
              {active && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                  <IconCheck width={12} height={12} />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <motion.h3 variants={item} className="mt-6 text-[10.5px] uppercase tracking-[0.2em] text-mist-2">
        Brake calipers
      </motion.h3>
      <motion.div variants={item} className="mt-3 flex flex-wrap gap-3">
        {CALIPERS.map((c) => {
          const active = c.id === caliperId
          return (
            <button
              key={c.id}
              onClick={() => setOption('caliperId', c.id)}
              title={`${c.name}${c.price ? ` · +${usd(c.price)}` : ''}`}
              aria-label={c.name}
              aria-pressed={active}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={`h-8 w-8 rounded-full border border-white/15 transition-transform group-hover:scale-110 ${
                  active ? 'ring-2 ring-gold ring-offset-2 ring-offset-[#13151a]' : ''
                }`}
                style={{ backgroundColor: c.hex }}
              />
              <span className={`text-[8.5px] uppercase tracking-wider ${active ? 'text-gold' : 'text-mist-2'}`}>{c.name}</span>
            </button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

/* ---------------------------------------------------------- glazing panel */

function GlazingPanel() {
  const tintId = useConfigurator((s) => s.config.tintId)
  const setOption = useConfigurator((s) => s.setOption)
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
      {TINTS.map((t) => {
        const active = t.id === tintId
        return (
          <motion.button
            key={t.id}
            variants={item}
            onClick={() => setOption('tintId', t.id)}
            aria-pressed={active}
            className={`flex w-full items-center gap-3.5 rounded-xl border p-3 text-left transition-colors ${
              active ? 'border-gold/60 bg-gold/[0.07]' : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
            }`}
          >
            <span className="relative h-10 w-14 overflow-hidden rounded-lg border border-white/12">
              <span className="absolute inset-0" style={{ backgroundColor: t.hex, opacity: 0.35 + t.opacity * 0.65 }} />
              <span className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,transparent_38%,rgba(255,255,255,0.16)_60%,transparent_100%)]" />
            </span>
            <span className="flex-1">
              <span className="block text-[12.5px] tracking-wide">{t.name}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-mist-2">
                {Math.round(t.opacity * 100)}% VLT
              </span>
            </span>
            <PriceNote price={t.price} className={`text-[10.5px] ${t.price ? 'text-gold-soft' : 'text-mist-2'}`} />
            {active && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                <IconCheck width={12} height={12} />
              </span>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

/* ------------------------------------------------------------- aero panel */

function RadioCard({
  active,
  onClick,
  name,
  blurb,
  price,
}: {
  active: boolean
  onClick: () => void
  name: string
  blurb: string
  price: number
}) {
  return (
    <motion.button
      variants={item}
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
        active ? 'border-gold/60 bg-gold/[0.07]' : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
      }`}
    >
      <span>
        <span className="block text-[12.5px] tracking-wide">{name}</span>
        <span className="mt-0.5 block text-[10.5px] leading-snug text-mist-2">{blurb}</span>
      </span>
      <span className="flex items-center gap-2.5">
        <PriceNote price={price} className={`text-[10.5px] ${price ? 'text-gold-soft' : 'text-mist-2'}`} />
        <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? 'border-gold bg-gold' : 'border-line-strong'}`}>
          {active && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
        </span>
      </span>
    </motion.button>
  )
}

function AeroPanel() {
  const bodykitId = useConfigurator((s) => s.config.bodykitId)
  const spoilerId = useConfigurator((s) => s.config.spoilerId)
  const setOption = useConfigurator((s) => s.setOption)
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.h3 variants={item} className="text-[10.5px] uppercase tracking-[0.2em] text-mist-2">
        Body kit
      </motion.h3>
      <div className="mt-2.5 space-y-2">
        {BODYKITS.map((k) => (
          <RadioCard
            key={k.id}
            active={k.id === bodykitId}
            onClick={() => setOption('bodykitId', k.id)}
            name={k.name}
            blurb={k.blurb}
            price={k.price}
          />
        ))}
      </div>
      <motion.h3 variants={item} className="mt-6 text-[10.5px] uppercase tracking-[0.2em] text-mist-2">
        Rear deck
      </motion.h3>
      <div className="mt-2.5 space-y-2">
        {SPOILERS.map((s) => (
          <RadioCard
            key={s.id}
            active={s.id === spoilerId}
            onClick={() => setOption('spoilerId', s.id)}
            name={s.name}
            blurb={s.blurb}
            price={s.price}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* --------------------------------------------------------- interior panel */

function InteriorPanel() {
  const interiorId = useConfigurator((s) => s.config.interiorId)
  const setOption = useConfigurator((s) => s.setOption)
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
      {INTERIORS.map((o) => {
        const active = o.id === interiorId
        return (
          <motion.button
            key={o.id}
            variants={item}
            onClick={() => setOption('interiorId', o.id)}
            aria-pressed={active}
            className={`flex w-full items-center gap-3.5 rounded-xl border p-3 text-left transition-colors ${
              active ? 'border-gold/60 bg-gold/[0.07]' : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
            }`}
          >
            <span
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/12"
              style={{ backgroundColor: o.material === 'heritage' ? undefined : o.hex }}
            >
              {o.material === 'heritage' && <span className="block h-full w-full swatch-plaid" />}
              {o.material === 'alcantara' && <span className="block h-full w-full swatch-matte" />}
              {o.material === 'leather' && <span className="block h-full w-full swatch-satin" />}
            </span>
            <span className="flex-1">
              <span className="block text-[12.5px] tracking-wide">{o.name}</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-mist-2">
                {o.material === 'heritage' ? 'Heritage · contrast bolsters' : o.material}
              </span>
            </span>
            <PriceNote price={o.price} className={`text-[10.5px] ${o.price ? 'text-gold-soft' : 'text-mist-2'}`} />
            {active && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                <IconCheck width={12} height={12} />
              </span>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

/* ------------------------------------------------------------------- shell */

function PanelContent({ category }: { category: CategoryId }) {
  switch (category) {
    case 'model':
      return <ModelPanel />
    case 'paint':
      return <PaintPanel />
    case 'wheels':
      return <WheelsPanel />
    case 'glazing':
      return <GlazingPanel />
    case 'aero':
      return <AeroPanel />
    case 'interior':
      return <InteriorPanel />
  }
}

export function OptionPanel() {
  const category = useConfigurator((s) => s.category)
  const panelOpen = useConfigurator((s) => s.panelOpen)
  const closePanel = useConfigurator((s) => s.closePanel)
  const meta = CATEGORIES.find((c) => c.id === category)

  return (
    <AnimatePresence>
      {panelOpen && meta && (
        <motion.aside
          key="option-panel"
          initial={{ opacity: 0, x: -26 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -26 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel absolute bottom-[calc(150px+env(safe-area-inset-bottom))] left-3 right-3 z-20 flex h-[42vh] flex-col overflow-hidden rounded-4xl md:bottom-[104px] md:left-[96px] md:right-auto md:top-[86px] md:h-auto md:w-[370px]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[14px] uppercase tracking-[0.2em]">{meta.label}</h2>
              <p className="mt-1 text-[11px] leading-snug text-mist-2">{DESCRIPTIONS[category]}</p>
            </div>
            <button
              onClick={closePanel}
              aria-label="Close options"
              className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border border-line text-mist-2 transition-colors hover:border-line-strong hover:text-white"
            >
              <IconClose width={13} height={13} />
            </button>
          </header>
          <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
            <PanelContent category={category} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
