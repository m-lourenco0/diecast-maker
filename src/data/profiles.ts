import type { ModelId } from '../types'

export interface CarDims {
  /** overall body length (x), width (z), beltline/roof heights (y) */
  length: number
  width: number
  bottomY: number
  beltY: number
  roofY: number
  tailY: number
  /** wheels */
  wheelR: number
  wheelW: number
  archR: number
  frontAxle: number
  rearAxle: number
  /** side silhouette spline, front-bottom → over the top → rear-bottom */
  bodyTop: [number, number][]
  /** greenhouse spline, front sill → roof → rear sill (empty for open cars) */
  cabin: [number, number][]
  cabFront: number
  cabRear: number
  windshieldTopX: number
  backlightTopX: number
  /** open cockpit (roadster) */
  openTop: boolean
  /** door shut-lines */
  doorFrontX: number
  doorRearX: number
}

export const CAR_DIMS: Record<ModelId, CarDims> = {
  'veloce-gt': {
    length: 4.3,
    width: 1.82,
    bottomY: 0.26,
    beltY: 0.88,
    roofY: 1.22,
    tailY: 0.9,
    wheelR: 0.315,
    wheelW: 0.22,
    archR: 0.345,
    frontAxle: 1.25,
    rearAxle: -1.3,
    bodyTop: [
      [2.15, 0.26],
      [2.15, 0.42],
      [2.08, 0.58],
      [1.35, 0.74],
      [0.6, 0.85],
      [-0.6, 0.88],
      [-1.6, 0.91],
      [-2.02, 0.89],
      [-2.13, 0.8],
      [-2.15, 0.5],
      [-2.15, 0.26],
    ],
    cabin: [
      [0.55, 0.86],
      [0.78, 1.03],
      [1.02, 1.21],
      [-0.55, 1.22],
      [-1.03, 1.18],
      [-1.42, 1.0],
      [-1.7, 0.87],
    ],
    cabFront: 0.55,
    cabRear: -1.7,
    windshieldTopX: 1.02,
    backlightTopX: -1.0,
    openTop: false,
    doorFrontX: 0.55,
    doorRearX: -0.6,
  },
  'aurora-spyder': {
    length: 4.15,
    width: 1.78,
    bottomY: 0.26,
    beltY: 0.84,
    roofY: 1.2,
    tailY: 0.8,
    wheelR: 0.305,
    wheelW: 0.21,
    archR: 0.335,
    frontAxle: 1.18,
    rearAxle: -1.26,
    bodyTop: [
      [2.075, 0.26],
      [2.075, 0.42],
      [2.02, 0.6],
      [1.3, 0.72],
      [0.55, 0.82],
      [-0.5, 0.83],
      [-1.2, 0.855],
      [-1.68, 0.87],
      [-1.98, 0.82],
      [-2.075, 0.72],
      [-2.075, 0.45],
      [-2.075, 0.26],
    ],
    cabin: [
      [0.42, 0.8],
      [0.5, 0.96],
      [0.56, 1.05],
      [0.68, 1.04],
    ],
    cabFront: 0.42,
    cabRear: -0.95,
    windshieldTopX: 0.56,
    backlightTopX: 0.56,
    openTop: true,
    doorFrontX: 0.42,
    doorRearX: -0.58,
  },
  'nero-rs': {
    length: 4.55,
    width: 1.98,
    bottomY: 0.22,
    beltY: 0.84,
    roofY: 1.18,
    tailY: 0.86,
    wheelR: 0.34,
    wheelW: 0.245,
    archR: 0.385,
    frontAxle: 1.38,
    rearAxle: -1.42,
    bodyTop: [
      [2.275, 0.22],
      [2.275, 0.38],
      [2.19, 0.54],
      [1.45, 0.68],
      [0.45, 0.8],
      [-0.6, 0.84],
      [-1.7, 0.88],
      [-2.15, 0.86],
      [-2.24, 0.76],
      [-2.275, 0.48],
      [-2.275, 0.22],
    ],
    cabin: [
      [0.38, 0.82],
      [0.58, 0.98],
      [0.95, 1.16],
      [-0.5, 1.18],
      [-0.92, 1.13],
      [-1.25, 0.98],
      [-1.55, 0.83],
    ],
    cabFront: 0.38,
    cabRear: -1.55,
    windshieldTopX: 0.95,
    backlightTopX: -0.9,
    openTop: false,
    doorFrontX: 0.38,
    doorRearX: -0.77,
  },
}
