# Meridian — Die-cast Atelier

An interactive 3D configurator for a fictional 1:18 die-cast miniature car collection. Pick a model, specify paint, wheels, glazing, aero and interior, orbit the piece on its display plinth, open the doors and decklid, then share, save or price out your build.

The app is a client-side React + Three.js experience — no backend, no checkout. Builds live in the URL and in `localStorage`, so the whole configurator can be hosted as static files.

---

## Highlights

- **Live 3D miniature** rendered with three.js — procedural bodywork, configurable materials and a studio-lit display plinth
- **Six customization categories** — 3 models plus 39 finishes, parts and trim options across model, paint, wheels + calipers, glazing, aero and interior
- **Hover-to-preview** — hovering any swatch previews it on the model before you commit
- **Six camera views** (Front, 3/4, Profile, Rear, Top, Cockpit) with smooth transitions and a showroom turntable
- **Opening parts** — click the doors or hood/decklid in 3D, or toggle them from the UI
- **Build sheet** with itemized upgrade pricing, a live animated total, and an "Included" vs "+$" breakdown
- **Your garage** — save up to 12 builds locally, reload them, delete with undo
- **Share links** — the full configuration is encoded in the URL (`?c=…`); on mobile the build sheet uses the native share sheet
- **Keyboard-first UX** — drive the whole configurator like a game (see [Keyboard shortcuts](#keyboard-shortcuts))
- **Undo/redo** history (50 steps) with action toasts; randomize and reset are undoable
- **Adaptive performance** — GPU capability probe, software-renderer "lite mode" and an adaptive-resolution probe that keeps frame times smooth
- **Accessible** — focus-visible rings, ARIA roles and labels throughout, dialog semantics, and `prefers-reduced-motion` support

## Tech stack

| Layer | Choice |
| --- | --- |
| UI framework | React 19 + TypeScript (strict) |
| Build tool | Vite 7 |
| 3D | three.js via `@react-three/fiber` 9 and `@react-three/drei` 10 |
| State | Zustand 5 (single store, transient hover preview) |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite`, custom theme tokens in `src/index.css` |
| Motion | Motion (framer-motion) 12, reduced-motion aware |
| Fonts | Inter Variable + Space Grotesk via `@fontsource` (self-hosted) |
| Screenshot tooling | `puppeteer-core` (dev only) |

## Getting started

### Requirements

- **Node.js 20.19+ or 22.12+** (required by Vite 7)
- A WebGL-capable browser (Chrome, Edge, Safari, Firefox) with hardware acceleration enabled

### Scripts

```bash
npm install

npm run dev        # start the dev server at http://localhost:5173
npm run build      # typecheck (tsc --noEmit) + production build to dist/
npm run preview    # serve the production build locally
npm run typecheck  # TypeScript only, no emit
npm run shot       # screenshot the running app (see Tooling)
```

### Deployment

`npm run build` emits a fully static site in `dist/` — deploy it to any static host (GitHub Pages, Netlify, Vercel, S3, …). There are no server-side dependencies; sharing, persistence and the garage all work client-side.

## Using the configurator

- **Orbit / zoom** — drag to rotate the camera, scroll to dolly in and out
- **Click open parts** — click a door or the hood/decklid on the model to swing it open; a click that turns into a drag simply orbits
- **Preview before you commit** — hover (or keyboard-focus) any paint, wheel, caliper, glazing, aero or interior option to preview it live on the model
- **Best-view button** — each category panel has a focus button that jumps the camera to the angle that shows that category off best
- **Turntable** — auto-spins on the default 3/4 view after a few idle seconds; it disengages as soon as you interact

### Camera views

| View | Shows off |
| --- | --- |
| Front | Nose, lamps, splitter |
| 3/4 | The classic showroom angle (default) |
| Profile | Wheels, stance, silhouette |
| Rear | Aero kit, spoiler, tail |
| Top | Roof, proportions |
| Cockpit | Interior trim, seats, dash |

### Keyboard shortcuts

The configurator is fully operable from the keyboard. Press `?` in the app for the interactive overlay.

| Keys | Action |
| --- | --- |
| `1` … `6` | Switch customization category (Model, Paint, Wheels, Glazing, Aero, Interior) |
| `←` / `→` (or `[` / `]`) | Previous / next option in the current category |
| `Shift` + `←` / `→` | Cycle the rear-deck aero while in the Aero category |
| `V` / `Shift+V` | Next / previous camera view |
| `T` | Toggle the turntable |
| `D` | Open / close the doors |
| `L` | Open / close the hood (spyder) or decklid (coupés) |
| `R` | Surprise me — roll a random build (undoable) |
| `S` | Open the build sheet |
| `?` | Show / hide the shortcuts overlay |
| `Esc` | Close the panel, build sheet or overlay |
| `⌘/Ctrl+Z` | Undo |
| `⇧⌘/Ctrl+Z` or `Ctrl+Y` | Redo |

### Saving, sharing, resetting

- **Build sheet** (`S` or the Reserve build button) — itemized price breakdown, save to garage, copy share link, reset
- **Share link** — encodes the entire configuration in the `?c=` query parameter, e.g. `/…?c=veloce-gt~liquid-silver~classic-five~…`
- **Autosave** — every change is persisted to `localStorage`, so a reload keeps your build
- **Garage** — up to 12 named builds stored locally; deleting one offers an Undo toast
- **Reset** — returns the build to its stock configuration (undoable with `⌘Z`)

> **Reserve build** is a placeholder: it shows a "reservation list opens soon" toast. There is no ordering backend.

## Project structure

```
diecast-maker/
├─ index.html                 # shell + meta tags
├─ vite.config.ts             # React + Tailwind plugins
├─ scripts/
│  ├─ screenshot.mjs          # puppeteer-core screenshot/automation harness
│  └─ make-test-glb.mjs       # generates a convention-following test GLB
├─ public/
│  ├─ favicon.svg
│  └─ models/                 # optional artist-made .glb assets (create as needed)
└─ src/
   ├─ main.tsx                # fonts + CSS + root render
   ├─ App.tsx                 # composition, WebGL fallback, first-run hint
   ├─ index.css               # Tailwind 4 theme tokens + glass/swatch styles
   ├─ types.ts                # BuildConfig, catalog option types, ids
   ├─ store/
   │  └─ configurator.ts      # Zustand store: config, preview, history, UI, toasts
   ├─ data/
   │  ├─ catalog.ts           # models, paints, wheels, calipers, tints, kits, interiors
   │  ├─ profiles.ts          # numeric dimensions + silhouette splines per model
   │  └─ models3d.ts          # optional GLB registry + artist naming conventions
   ├─ hooks/
   │  └─ useShortcuts.ts      # global keyboard map
   ├─ lib/
   │  ├─ carShapes.ts         # extrudes & sculpts body/cabin geometry, SVG silhouettes
   │  ├─ pricing.ts           # itemized price computation
   │  ├─ urlState.ts          # encode/decode config, share URL, localStorage autosave
   │  ├─ garage.ts            # saved-builds store (save/load/remove/restore)
   │  ├─ perf.ts              # WebGL capability probe + software-renderer detection
   │  ├─ device.ts            # compact-viewport helper
   │  ├─ views.ts             # camera view order/cycling
   │  ├─ plaid.ts             # generated pepita plaid CanvasTexture
   │  └─ revision.ts          # model revision marker (stale-tab debugging)
   └─ components/
      ├─ three/
      │  ├─ ConfiguratorCanvas.tsx  # <Canvas> setup, DPR caps, tone mapping
      │  ├─ Scene.tsx               # plinth, lighting environment, cameras, turntable, perf probe
      │  ├─ materials.tsx           # shared material palette + animated finish/tint/leather lerps
      │  ├─ CarParts.tsx            # procedural body, cabin, doors, lid, wheels, interior, aero…
      │  ├─ DiecastCar.tsx          # assembles the procedural car from profile dimensions
      │  └─ GltfCar.tsx             # GLB loading, material remap, variant nodes, hinges, fallback
      └─ ui/
         ├─ TopBar.tsx              # brand, model chip, view switcher, turntable
         ├─ CategoryRail.tsx        # 1–6 category tabs
         ├─ OptionPanel.tsx         # per-category option lists with hover preview
         ├─ PartsControls.tsx       # doors / decklid toggles
         ├─ SummaryBar.tsx          # animated build total, randomize, undo, build sheet
         ├─ BuildSheet.tsx          # price breakdown, garage, share, reset, reserve
         ├─ Shortcuts.tsx           # keyboard overlay
         ├─ Splash.tsx              # once-per-session intro
         ├─ Toasts.tsx              # action toasts (undo/redo/remove…)
         └─ icons.tsx               # inline SVG icon set
```

## How it works

### State

A single Zustand store (`src/store/configurator.ts`) owns:

- `config` — the committed `BuildConfig` (model, paint, wheel, caliper, tint, bodykit, spoiler, interior ids)
- `preview` — a transient hover/focus overlay that is *merged over* the config for rendering only; it never touches history
- `past` / `future` — 50-step undo/redo stacks
- UI state: active category, panel open, camera view, turntable, hinged parts, dialogs, toast

Rendering code inside `<Canvas>` reads the merged "effective config" (`useEffectiveConfig`), whose shallow-compared selector only re-renders when a rendered value actually changes. Every commit (option change, randomize, reset, undo…) also autosaves to `localStorage`.

### Rendering & materials

Each model is defined numerically in `src/data/profiles.ts` — length/width, belt and roof heights, axle positions, arch radii, plus two splines: the side silhouette and the greenhouse outline. `src/lib/carShapes.ts` extrudes those splines into a beveled, smooth-shaded solid, tapers nose and tail, cuts wheel arches and applies greenhouse tumblehome.

`materials.tsx` keeps one shared material palette for the whole scene and animates color/finish toward the active config every frame (paint clearcoat per finish, glass tint + opacity, rim metalness, leather roughness, plaid texture for the heritage interior). The scene uses a baked `ContactShadows` pass (`frames={1}`) rotated rigidly with the turntable — no per-frame shadow cost.

### Persistence & sharing

- `src/lib/urlState.ts` encodes the eight option ids as a `~`-joined string inside `?c=`; decoding falls back per-field on unknown ids
- Autosave key: `meridian-build-v1`; garage key: `meridian-garage-v1`
- On load the URL wins over storage, storage wins over the default stock build

### Performance

- `src/lib/perf.ts` probes WebGL at boot; browsers without WebGL get a friendly fallback panel
- Software renderers (SwiftShader/llvmpipe/remote desktops) automatically switch to a **lite mode**: lower DPR, no MSAA, paint shader compiled without the clearcoat lobe, no auto-turntable spin
- `PerfProbe` samples real frame times for the first seconds and drops the render resolution once if the median frame time is poor
- The live canvas is never blurred: the "glass" panels are opaque gradients, avoiding per-frame `backdrop-filter` cost

### Accessibility

- Global focus-visible rings, ARIA `radiogroup`/`tablist`/`dialog` semantics, `aria-pressed` on options
- Full keyboard operation with a discoverable shortcuts overlay (`?`)
- Motion respects `prefers-reduced-motion` both in CSS and through `MotionConfig reducedMotion="user"`; the turntable defaults off for those users

## The catalog

All option data lives in `src/data/catalog.ts` and is plain TypeScript — extend the arrays and the UI picks the options up automatically.

### Models

| Model | Character | Base price | Parts | Edition |
| --- | --- | --- | --- | --- |
| Veloce GT | Featherweight fastback coupé | $179 | 412 | 999 pieces |
| Aurora Spyder | Open-top barchetta | $189 | 386 | 999 pieces |
| Nero RS | Track-bred GT, wide arches | $219 | 448 | 750 pieces |

### Options

- **Paints (12)** — gloss, metallic, satin, matte and an atelier chrome finish, $0–$24
- **Wheels (4)** — Classic Five, Twin Five Sport, Mesh Racing, Turbo Dish, $0–$16
- **Calipers (5)** — five brake caliper finishes, $0–$6
- **Glazing (5)** — Clear through Dark Smoke, Sapphire and Bronze, $0–$8
- **Body kits (3)** — Factory, Street Aero, Widebody RS (widens the track), $0–$38
- **Rear deck (4)** — Decklid, Lip, Ducktail, GT Wing, $0–$18
- **Interiors (6)** — leathers, Slate Alcantara and the Heritage Pepita plaid, $0–$16

The default stock build is a Liquid Silver Veloce GT with Cognac leather. Pricing is computed in `src/lib/pricing.ts` — base model plus any non-zero options.

## 3D model pipeline

### Procedural models (default)

All three models are built procedurally from their profiles: extruded and sculpted body, greenhouse, hinged doors and lid, four wheels (tires, barrels, lips, spokes/dish, hub, brake disc and caliper), cockpit interior, side details, lights and aero parts. `src/lib/revision.ts` stamps a model revision string that is shown in the Model panel and logged on boot, so a stale browser tab is easy to spot.

### Real GLB assets (optional)

The configurator can render artist-made GLB models instead of the procedural geometry. To add one:

1. Drop the file in `public/models/<id>.glb`
2. Register it in `src/data/models3d.ts`:

```ts
export const GLB_MODELS = {
  'veloce-gt': { url: '/models/veloce-gt.glb' /* scale?, rotationY? */ },
}
```

If the asset fails to load, the configurator silently falls back to the procedural model.

**Artist conventions** (documented in detail in `src/data/models3d.ts`):

- Model faces **+x**, wheels sit at **y = 0**, centered on x/z; any unit — length is auto-fitted to the profile
- Parts are matched and remapped to the shared configurable materials **by node/material name** (case-insensitive): `body|paint|shell`, `glass|window`, `rim|spoke`, `tire|rubber`, `caliper`, `seat|interior|leather`, `chrome|exhaust`, `carbon`, `headlight|drl`, `taillight`, …
- Optional **variant nodes** are toggled by the configurator: `wheel_<five|twinfive|mesh|dish>_<fl|fr|rl|rr>`, `spoiler_<none|lip|ducktail|gtwing>`, `kit_splitter|kit_skirts|kit_diffuser`, `kit_flares`
- Optional **hinged parts** animate open/closed: name them `door_l`/`door_r` (origin on the hinge, rotates about local Y) or `decklid|hood|trunk|bonnet` (rotates about local Z)
- A test asset that follows every convention can be generated with `node scripts/make-test-glb.mjs`

## Tooling

### Screenshot harness

`scripts/screenshot.mjs` drives a headless Chrome/Chromium via `puppeteer-core` — handy for visual checks and quick UI automation.

```bash
npm run dev                        # in one terminal
npm run shot                       # → /tmp/dc-shot.png of http://localhost:5173/
node scripts/screenshot.mjs http://localhost:5173/ out.png 4200 "Paint|Interior" 1400
```

Positional arguments: `url`, `out`, `wait` (ms), `clicks` (pipe-separated button texts), `settle` (ms).

Useful environment variables:

| Variable | Effect |
| --- | --- |
| `CHROME_PATH` | Path to the browser binary (otherwise common macOS/Linux locations are probed) |
| `GPU=1` | Use real GPU rendering instead of bundled SwiftShader |
| `MOBILE=1` | Emulate a 414×896 @2x mobile viewport |
| `VW` / `VH` | Custom viewport size |
| `CLEAR` | Wipe `localStorage`/`sessionStorage` before load |
| `COORD="x,y"` | Click at coordinates |
| `HOVER="x,y"` / `HOVER_END="x,y"` | Move the pointer (e.g. to trigger previews) |
| `KEYS="r|v|type:hello"` | Press keys in sequence (`type:` types text) |
| `ZOOM="4"` | Scroll to zoom in (negative zooms out) |
| `DRAG="x1,y1,x2,y2[,steps]"` | Drag to orbit |

### Test GLB generator

```bash
node scripts/make-test-glb.mjs [outFile]   # default: public/models/veloce-gt.glb
```

Generates a deliberately simple GLB that follows the naming conventions above — useful to verify the GLB pipeline end to end before artist assets exist.

## Project status & notes

- This is a **design/portfolio prototype**: the atelier, models and pricing are fictional, and "Reserve build" has no backend behind it.
- The procedural models are intentional placeholders for the GLB pipeline; the Model panel shows the current model revision.
- No license file is included yet — add one before distributing or reusing the code.
