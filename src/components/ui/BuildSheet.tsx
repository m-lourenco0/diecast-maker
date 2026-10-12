import { AnimatePresence, motion } from 'framer-motion'
import { byId } from '../../data/catalog'
import { computePrice, usd } from '../../lib/pricing'
import { shareUrl } from '../../lib/urlState'
import { useConfigurator } from '../../store/configurator'
import { IconClose, IconLock, IconReset, IconShare } from './icons'

export function BuildSheet() {
  const open = useConfigurator((s) => s.buildSheetOpen)
  const setOpen = useConfigurator((s) => s.setBuildSheet)
  const reset = useConfigurator((s) => s.reset)
  const showToast = useConfigurator((s) => s.showToast)
  const config = useConfigurator((s) => s.config)
  const model = byId.model(config.modelId)
  const paint = byId.paint(config.paintId)
  const price = computePrice(config)

  const copyLink = async () => {
    const url = shareUrl(config)
    try {
      await navigator.clipboard.writeText(url)
      showToast('Configuration link copied to clipboard')
    } catch {
      showToast(url)
    }
  }

  const reserve = () => {
    showToast('Reservation list opens soon — your build is saved.')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="build-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-mist-2">Your build · 1:18</div>
                <h2 className="mt-1 font-display text-[19px] tracking-[0.08em]">{model.name}</h2>
                <p className="mt-0.5 text-[11px] text-mist-2">{model.tagline}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-mist-2 transition-colors hover:border-line-strong hover:text-white"
              >
                <IconClose width={14} height={14} />
              </button>
            </header>

            <div className="scroll-slim flex-1 overflow-y-auto px-6 py-5">
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-[12.5px]">
                  <dt className="text-mist">
                    {model.name} — base model
                  </dt>
                  <dd className="tabular-nums text-white">{usd(price.base)}</dd>
                </div>
                {price.options.length > 0 && (
                  <div className="border-t border-line pt-3">
                    {price.options.map((line) => (
                      <div key={line.label} className="flex items-center justify-between gap-4 py-1.5 text-[12.5px]">
                        <dt className="text-mist">
                          <span className="text-mist-2">{line.label}: </span>
                          {line.value}
                        </dt>
                        <dd className="tabular-nums text-gold-soft">+{usd(line.price)}</dd>
                      </div>
                    ))}
                  </div>
                )}
              </dl>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-black/25 px-4 py-3.5">
                <div>
                  <div className="text-[9.5px] uppercase tracking-[0.22em] text-mist-2">Build total</div>
                  <div className="mt-0.5 text-[10.5px] text-mist-2">
                    Includes display plinth, certificate of authenticity
                  </div>
                </div>
                <div className="font-display text-[24px] tabular-nums text-white">{usd(price.total)}</div>
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-mist-2">
                <IconLock width={14} height={14} className="mt-0.5 shrink-0 text-gold-deep" />
                <span>
                  Paint swatch: <span className="text-mist">{paint.name}</span> · finishes are hand-polished at the
                  atelier; allow ±5% tonal variation on metallics and mattes.
                </span>
              </div>
            </div>

            <footer className="flex flex-col gap-2 border-t border-line px-6 py-5 sm:flex-row sm:items-center">
              <button
                onClick={copyLink}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-[11px] uppercase tracking-[0.16em] text-mist transition-colors hover:border-gold/50 hover:text-gold"
              >
                <IconShare width={15} height={15} />
                Copy share link
              </button>
              <button
                onClick={reset}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 text-[11px] uppercase tracking-[0.16em] text-mist-2 transition-colors hover:border-line-strong hover:text-white"
              >
                <IconReset width={15} height={15} />
                Reset
              </button>
              <button
                onClick={reserve}
                className="h-11 flex-1 rounded-xl bg-gold text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-soft"
              >
                Reserve build
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
