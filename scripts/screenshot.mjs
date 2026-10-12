import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? '/tmp/dc-shot.png'
const wait = Number(process.argv[4] ?? 4200)
const clicks = (process.argv[5] ?? '').split('|').map((s) => s.trim()).filter(Boolean)
const settle = Number(process.argv[6] ?? 1400)

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
].filter(Boolean)

const executablePath = CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error('No Chrome/Chromium found. Set CHROME_PATH to your browser binary.')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [
    '--hide-scrollbars',
    '--enable-gpu',
    ...(process.platform === 'darwin'
      ? ['--use-angle=metal']
      : process.env.GPU === '1'
        ? ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist']
        : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']),
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1600,1000',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/dc-chrome-profile',
  ],
})

const page = await browser.newPage()
const mobile = process.env.MOBILE === '1'
const vw = Number(process.env.VW ?? 0)
const vh = Number(process.env.VH ?? 0)
await page.setViewport(
  mobile
    ? { width: vw || 414, height: vh || 896, deviceScaleFactor: 2 }
    : { width: vw || 1600, height: vh || 1000, deviceScaleFactor: 1 },
)
page.on('console', (msg) => {
  const t = msg.type()
  if (t === 'error' || t === 'warning') console.log('[console]', t, msg.text().slice(0, 300))
})
page.on('pageerror', (err) => console.log('[pageerror]', err.message.slice(0, 500)))

if (process.env.CLEAR) {
  await page.evaluateOnNewDocument(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, wait))

async function clickByText(text) {
  const clicked = await page.evaluate((t) => {
    const els = Array.from(document.querySelectorAll('button'))
    const el = els.find((b) => (b.textContent ?? '').toLowerCase().includes(t.toLowerCase()) || b.getAttribute('aria-label') === t)
    if (el) {
      el.click()
      return true
    }
    return false
  }, text)
  if (!clicked) console.log('click target not found:', text)
  await new Promise((r) => setTimeout(r, 900))
}

for (const c of clicks) await clickByText(c)

const coord = (process.env.COORD ?? '').split(',').map(Number)
if (coord.length === 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1])) {
  await page.mouse.click(coord[0], coord[1])
  await new Promise((r) => setTimeout(r, 900))
}

const hover = (process.env.HOVER ?? '').split(',').map(Number)
if (hover.length === 2 && Number.isFinite(hover[0]) && Number.isFinite(hover[1])) {
  await page.mouse.move(hover[0], hover[1])
  await new Promise((r) => setTimeout(r, 1200))
}

const hoverEnd = (process.env.HOVER_END ?? '').split(',').map(Number)
if (hoverEnd.length === 2 && Number.isFinite(hoverEnd[0]) && Number.isFinite(hoverEnd[1])) {
  await page.mouse.move(hoverEnd[0], hoverEnd[1])
  await new Promise((r) => setTimeout(r, 1400))
}

const keys = (process.env.KEYS ?? '').split('|').map((s) => s.trim()).filter(Boolean)
for (const k of keys) {
  if (k.startsWith('type:')) {
    await page.keyboard.type(k.slice(5))
  } else {
    await page.keyboard.press(k)
  }
  await new Promise((r) => setTimeout(r, 600))
}

const zoom = Number(process.env.ZOOM ?? 0)
if (zoom) {
  await page.mouse.move(800, 480)
  for (let i = 0; i < Math.abs(zoom); i++) {
    await page.mouse.wheel({ deltaY: zoom > 0 ? -220 : 220 })
    await new Promise((r) => setTimeout(r, 120))
  }
  await new Promise((r) => setTimeout(r, 900))
}

// DRAG="x1,y1,x2,y2[,steps]" — orbit the camera (and any zoom afterwards)
const drag = (process.env.DRAG ?? '').split(',').map(Number)
if (drag.length >= 4 && drag.every((n) => Number.isFinite(n))) {
  const [x1, y1, x2, y2, steps = 16] = drag
  await page.mouse.move(x1, y1)
  await page.mouse.down()
  await page.mouse.move(x2, y2, { steps })
  await page.mouse.up()
  await new Promise((r) => setTimeout(r, 1200))
}

await new Promise((r) => setTimeout(r, settle))
await page.screenshot({ path: out })
await browser.close()
console.log('saved', out)
