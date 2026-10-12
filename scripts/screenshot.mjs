import puppeteer from 'puppeteer-core'

const url = process.argv[2] ?? 'http://localhost:5173/'
const out = process.argv[3] ?? '/tmp/dc-shot.png'
const wait = Number(process.argv[4] ?? 4200)
const clicks = (process.argv[5] ?? '').split('|').map((s) => s.trim()).filter(Boolean)
const settle = Number(process.argv[6] ?? 1400)

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: [
    '--hide-scrollbars',
    '--use-angle=metal',
    '--enable-gpu',
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

const zoom = Number(process.env.ZOOM ?? 0)
if (zoom) {
  await page.mouse.move(800, 480)
  for (let i = 0; i < Math.abs(zoom); i++) {
    await page.mouse.wheel({ deltaY: zoom > 0 ? -220 : 220 })
    await new Promise((r) => setTimeout(r, 120))
  }
  await new Promise((r) => setTimeout(r, 900))
}

await new Promise((r) => setTimeout(r, settle))
await page.screenshot({ path: out })
await browser.close()
console.log('saved', out)
