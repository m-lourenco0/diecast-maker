import { byId } from '../data/catalog'
import type { BuildConfig } from '../types'

export interface PriceLine {
  label: string
  value: string
  price: number
}

export interface BuildPrice {
  base: number
  options: PriceLine[]
  total: number
}

export function computePrice(config: BuildConfig): BuildPrice {
  const model = byId.model(config.modelId)
  const paint = byId.paint(config.paintId)
  const wheel = byId.wheel(config.wheelId)
  const caliper = byId.caliper(config.caliperId)
  const tint = byId.tint(config.tintId)
  const bodykit = byId.bodykit(config.bodykitId)
  const spoiler = byId.spoiler(config.spoilerId)
  const interior = byId.interior(config.interiorId)

  const options: PriceLine[] = [
    { label: 'Paint', value: `${paint.name} · ${paint.finish}`, price: paint.price },
    { label: 'Wheels', value: wheel.name, price: wheel.price },
    { label: 'Caliper finish', value: caliper.name, price: caliper.price },
    { label: 'Glazing', value: tint.name, price: tint.price },
    { label: 'Aero kit', value: bodykit.name, price: bodykit.price },
    { label: 'Rear deck', value: spoiler.name, price: spoiler.price },
    { label: 'Interior', value: interior.name, price: interior.price },
  ].filter((line) => line.price > 0)

  const total = model.basePrice + options.reduce((sum, line) => sum + line.price, 0)
  return { base: model.basePrice, options, total }
}

export const usd = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`
