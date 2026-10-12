import type {
  BodykitOption,
  CaliperOption,
  InteriorOption,
  ModelOption,
  PaintOption,
  SpoilerOption,
  TintOption,
  WheelOption,
} from '../types'

export const MODELS: ModelOption[] = [
  {
    id: 'veloce-gt',
    name: 'Veloce GT',
    tagline: 'Featherweight fastback coupé',
    blurb:
      'A grand-touring coupé in the classic tradition — long hood, muscular haunches and a roofline that sweeps straight into the tail.',
    basePrice: 179,
    scale: '1:18',
    edition: '999 pieces',
    parts: 412,
    specs: [
      { label: 'Scale', value: '1:18' },
      { label: 'Body', value: 'Zinc alloy die-cast' },
      { label: 'Parts', value: '412' },
      { label: 'Doors', value: 'Opening, etched hinges' },
      { label: 'Edition', value: '999 pieces' },
    ],
  },
  {
    id: 'aurora-spyder',
    name: 'Aurora Spyder',
    tagline: 'Open-top barchetta',
    blurb:
      'A wind-swept barchetta with an exposed cockpit and sculpted rear deck. Configure the interior the way you would sit in it.',
    basePrice: 189,
    scale: '1:18',
    edition: '999 pieces',
    parts: 386,
    specs: [
      { label: 'Scale', value: '1:18' },
      { label: 'Body', value: 'Zinc alloy die-cast' },
      { label: 'Parts', value: '386' },
      { label: 'Roof', value: 'Open cockpit, removable tonneau' },
      { label: 'Edition', value: '999 pieces' },
    ],
  },
  {
    id: 'nero-rs',
    name: 'Nero RS',
    tagline: 'Track-bred GT',
    blurb:
      'Lower, wider, meaner. The RS rides on motorsport arches with a stance set for the apex — the boldest canvas in the collection.',
    basePrice: 219,
    scale: '1:18',
    edition: '750 pieces',
    parts: 448,
    specs: [
      { label: 'Scale', value: '1:18' },
      { label: 'Body', value: 'Zinc alloy die-cast' },
      { label: 'Parts', value: '448' },
      { label: 'Aero', value: 'Motorsport arches, vented hood' },
      { label: 'Edition', value: '750 pieces' },
    ],
  },
]

export const PAINTS: PaintOption[] = [
  { id: 'jet-black', name: 'Jet Black', hex: '#0c0d10', finish: 'gloss', price: 0 },
  { id: 'alpine-white', name: 'Alpine White', hex: '#f1f0ea', finish: 'gloss', price: 0 },
  { id: 'monza-red', name: 'Monza Red', hex: '#c8102e', finish: 'gloss', price: 0 },
  { id: 'speed-yellow', name: 'Speed Yellow', hex: '#f2c000', finish: 'gloss', price: 0 },
  { id: 'riviera-blue', name: 'Riviera Blue', hex: '#2c8fd8', finish: 'gloss', price: 0 },
  { id: 'racing-green', name: 'Racing Green', hex: '#15503c', finish: 'metallic', price: 12 },
  { id: 'liquid-silver', name: 'Liquid Silver', hex: '#c7ccd1', finish: 'metallic', price: 12 },
  { id: 'midnight-sapphire', name: 'Midnight Sapphire', hex: '#1a2f5e', finish: 'metallic', price: 12, note: 'Deep flake' },
  { id: 'champagne', name: 'Champagne', hex: '#c9a86b', finish: 'metallic', price: 12 },
  { id: 'stealth-black', name: 'Stealth Black', hex: '#191a1d', finish: 'matte', price: 18 },
  { id: 'satin-olive', name: 'Satin Olive', hex: '#6d7050', finish: 'satin', price: 18 },
  { id: 'mirror-chrome', name: 'Mirror Chrome', hex: '#dfe5ea', finish: 'chrome', price: 24, note: 'Atelier finish' },
]

export const WHEELS: WheelOption[] = [
  {
    id: 'classic-five',
    name: 'Classic Five',
    style: 'five',
    finishHex: '#cfd3d8',
    finishMetalness: 0.9,
    finishRoughness: 0.22,
    price: 0,
  },
  {
    id: 'twin-five',
    name: 'Twin Five Sport',
    style: 'twinfive',
    finishHex: '#8d939b',
    finishMetalness: 0.85,
    finishRoughness: 0.3,
    price: 12,
  },
  {
    id: 'mesh-racing',
    name: 'Mesh Racing',
    style: 'mesh',
    finishHex: '#b9bec4',
    finishMetalness: 0.9,
    finishRoughness: 0.26,
    price: 16,
  },
  {
    id: 'turbo-dish',
    name: 'Turbo Dish',
    style: 'dish',
    finishHex: '#101114',
    finishMetalness: 0.6,
    finishRoughness: 0.35,
    lipHex: '#d8dde2',
    price: 14,
  },
]

export const CALIPERS: CaliperOption[] = [
  { id: 'caliper-black', name: 'Gloss Black', hex: '#15161a', price: 0 },
  { id: 'caliper-red', name: 'Rosso', hex: '#c4161c', price: 4 },
  { id: 'caliper-yellow', name: 'Giallo', hex: '#e8b90c', price: 4 },
  { id: 'caliper-gold', name: 'Champagne Gold', hex: '#c8a96a', price: 6 },
  { id: 'caliper-blue', name: 'Cobalt', hex: '#1f5fd6', price: 4 },
]

export const TINTS: TintOption[] = [
  { id: 'tint-clear', name: 'Clear', hex: '#dbe6ec', opacity: 0.3, price: 0 },
  { id: 'tint-light', name: 'Light Smoke', hex: '#aab6bf', opacity: 0.5, price: 4 },
  { id: 'tint-dark', name: 'Dark Smoke', hex: '#3a444d', opacity: 0.68, price: 6 },
  { id: 'tint-sapphire', name: 'Sapphire', hex: '#5d8fc4', opacity: 0.55, price: 8 },
  { id: 'tint-bronze', name: 'Bronze', hex: '#a4763e', opacity: 0.5, price: 8 },
]

export const BODYKITS: BodykitOption[] = [
  { id: 'kit-stock', name: 'Factory', blurb: 'Clean, as the works delivered it.', price: 0 },
  { id: 'kit-street', name: 'Street Aero', blurb: 'Splitter, side skirts and diffuser.', price: 22 },
  { id: 'kit-widebody', name: 'Widebody RS', blurb: 'Bolted flares, deeper stance, full aero.', price: 38 },
]

export const SPOILERS: SpoilerOption[] = [
  { id: 'spoiler-none', name: 'Decklid', blurb: 'Uninterrupted tail line.', price: 0 },
  { id: 'spoiler-lip', name: 'Lip Spoiler', blurb: 'A subtle motorsport duck lip.', price: 8 },
  { id: 'spoiler-ducktail', name: 'Ducktail', blurb: 'Sculpted rally-style tail.', price: 12 },
  { id: 'spoiler-gtwing', name: 'GT Wing', blurb: 'Fixed carbon wing on twin pylons.', price: 18 },
]

export const INTERIORS: InteriorOption[] = [
  {
    id: 'int-onyx',
    name: 'Onyx',
    hex: '#1b1c20',
    accentHex: '#3a3d44',
    material: 'leather',
    price: 0,
  },
  {
    id: 'int-cognac',
    name: 'Cognac',
    hex: '#8a5527',
    accentHex: '#c08a4d',
    material: 'leather',
    price: 10,
  },
  {
    id: 'int-bordeaux',
    name: 'Bordeaux',
    hex: '#5e1622',
    accentHex: '#8e3040',
    material: 'leather',
    price: 10,
  },
  {
    id: 'int-ivory',
    name: 'Ivory',
    hex: '#d9d2c2',
    accentHex: '#b3a88f',
    material: 'leather',
    price: 10,
  },
  {
    id: 'int-alcantara',
    name: 'Slate Alcantara',
    hex: '#3d4149',
    accentHex: '#8f959e',
    material: 'alcantara',
    price: 14,
  },
  {
    id: 'int-heritage',
    name: 'Heritage Pepita',
    hex: '#1b1c20',
    accentHex: '#b9bec4',
    material: 'heritage',
    price: 16,
    note: 'Plaid inserts',
  },
]

export const byId = {
  model: (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0],
  paint: (id: string) => PAINTS.find((p) => p.id === id) ?? PAINTS[0],
  wheel: (id: string) => WHEELS.find((w) => w.id === id) ?? WHEELS[0],
  caliper: (id: string) => CALIPERS.find((c) => c.id === id) ?? CALIPERS[0],
  tint: (id: string) => TINTS.find((t) => t.id === id) ?? TINTS[0],
  bodykit: (id: string) => BODYKITS.find((b) => b.id === id) ?? BODYKITS[0],
  spoiler: (id: string) => SPOILERS.find((s) => s.id === id) ?? SPOILERS[0],
  interior: (id: string) => INTERIORS.find((i) => i.id === id) ?? INTERIORS[0],
}

export const CATEGORIES = [
  { id: 'model', label: 'Model' },
  { id: 'paint', label: 'Paint' },
  { id: 'wheels', label: 'Wheels' },
  { id: 'glazing', label: 'Glazing' },
  { id: 'aero', label: 'Aero' },
  { id: 'interior', label: 'Interior' },
] as const
