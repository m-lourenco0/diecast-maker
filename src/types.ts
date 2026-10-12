export type FinishId = 'gloss' | 'metallic' | 'satin' | 'matte' | 'chrome'

export interface PaintOption {
  id: string
  name: string
  hex: string
  finish: FinishId
  price: number
  note?: string
}

export interface WheelOption {
  id: string
  name: string
  style: 'five' | 'twinfive' | 'mesh' | 'dish'
  finishHex: string
  finishMetalness: number
  finishRoughness: number
  lipHex?: string
  price: number
}

export interface CaliperOption {
  id: string
  name: string
  hex: string
  price: number
}

export interface TintOption {
  id: string
  name: string
  hex: string
  opacity: number
  price: number
}

export interface BodykitOption {
  id: string
  name: string
  blurb: string
  price: number
}

export interface SpoilerOption {
  id: string
  name: string
  blurb: string
  price: number
}

export interface InteriorOption {
  id: string
  name: string
  hex: string
  accentHex: string
  material: 'leather' | 'alcantara' | 'heritage'
  price: number
  note?: string
}

export type ModelId = 'veloce-gt' | 'aurora-spyder' | 'nero-rs'

export interface ModelOption {
  id: ModelId
  name: string
  tagline: string
  blurb: string
  basePrice: number
  scale: string
  edition: string
  parts: number
  specs: { label: string; value: string }[]
}

export interface BuildConfig {
  modelId: ModelId
  paintId: string
  wheelId: string
  caliperId: string
  tintId: string
  bodykitId: string
  spoilerId: string
  interiorId: string
}

export type CategoryId = 'model' | 'paint' | 'wheels' | 'glazing' | 'aero' | 'interior'

export type ViewId = 'three-quarter' | 'front' | 'profile' | 'rear' | 'top' | 'cockpit'
