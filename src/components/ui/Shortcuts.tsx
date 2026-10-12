import { AnimatePresence, motion } from 'framer-motion'
import { useConfigurator } from '../../store/configurator'
import { IconClose } from './icons'

function Keys({ children }: { children: React.ReactNode }) {
  return <span className="flex shrink-0 items-center gap-1">{children}</span>
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="kbd">{children}</kbd>
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-[7px]">
      <span className="min-w-0 whitespace-nowrap text-[12px] text-mist">
        {label}
        {hint && <span className="ml-1.5 text-[10px] text-mist-2">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-gold-soft/80">{title}</h3>
      <div className="divide-y divide-line">{children}</div>
    </section>
  )
}

export function Shortcuts() {
  const open = useConfigurator((s) => s.shortcutsOpen)
  const setOpen = useConfigurator((s) => s.setShortcuts)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="shortcuts"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-2xl scroll-slim"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-mist-2">Drive the configurator</div>
                <h2 className="mt-1 font-display text-[18px] tracking-[0.08em]">Keyboard shortcuts</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close shortcuts"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-mist-2 transition-colors hover:border-line-strong hover:text-white"
              >
                <IconClose width={14} height={14} />
              </button>
            </header>

            <div className="grid gap-x-10 gap-y-6 px-6 py-5 sm:grid-cols-2">
              <Section title="Customize">
                <Row label="Switch category">
                  <Keys>
                    <Kbd>1</Kbd>
                    <span className="text-[10px] text-mist-2">…</span>
                    <Kbd>6</Kbd>
                  </Keys>
                </Row>
                <Row label="Previous / next option">
                  <Keys>
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                  </Keys>
                </Row>
                <Row label="Next rear-deck aero" hint="Aero">
                  <Keys>
                    <Kbd>⇧</Kbd>
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                  </Keys>
                </Row>
                <Row label="Undo / redo">
                  <Keys>
                    <Kbd>⌘Z</Kbd>
                    <Kbd>⇧⌘Z</Kbd>
                  </Keys>
                </Row>
                <Row label="Surprise me">
                  <Keys>
                    <Kbd>R</Kbd>
                  </Keys>
                </Row>
              </Section>

              <Section title="Look around">
                <Row label="Next / previous view">
                  <Keys>
                    <Kbd>V</Kbd>
                    <Kbd>⇧V</Kbd>
                  </Keys>
                </Row>
                <Row label="Turntable">
                  <Keys>
                    <Kbd>T</Kbd>
                  </Keys>
                </Row>
                <Row label="Doors">
                  <Keys>
                    <Kbd>D</Kbd>
                  </Keys>
                </Row>
                <Row label="Hood / decklid">
                  <Keys>
                    <Kbd>L</Kbd>
                  </Keys>
                </Row>
                <Row label="Orbit the model" hint="mouse">
                  <Keys>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-mist-2">drag · scroll</span>
                  </Keys>
                </Row>
              </Section>

              <Section title="Build">
                <Row label="Open build sheet">
                  <Keys>
                    <Kbd>S</Kbd>
                  </Keys>
                </Row>
                <Row label="Shortcuts">
                  <Keys>
                    <Kbd>?</Kbd>
                  </Keys>
                </Row>
                <Row label="Close panel or dialog">
                  <Keys>
                    <Kbd>Esc</Kbd>
                  </Keys>
                </Row>
              </Section>

              <Section title="Tip">
                <p className="py-2 text-[11.5px] leading-relaxed text-mist-2">
                  Hover any swatch to preview it on the model before committing — the paint, wheels, glass,
                  aero and interior all preview live.
                </p>
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
