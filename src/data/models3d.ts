import type { ModelId } from '../types'

export interface GlbModelDef {
  /** url of the .glb asset (place files in /public/models) */
  url: string
  /** extra uniform scale multiplier applied after auto-fit */
  scale?: number
  /** yaw correction if the asset doesn't face +x */
  rotationY?: number
}

/**
 * Optional real-model registry. Any model listed here is rendered from GLB
 * instead of the built-in procedural geometry; if the file is missing the
 * configurator falls back to procedural automatically.
 *
 * Conventions for artists (one GLB per model, meters or any unit — auto-fit
 * normalizes length to the model profile):
 *
 * - Model faces +x, sits with wheels at y = 0, centered on x/z.
 * - Parts are matched by node/material NAME, case-insensitive:
 *     body | paint | shell          -> configurable paint (all finishes)
 *     glass | windshield | window  -> configurable tint
 *     rim | spoke | wheel_lip      -> wheel finish
 *     tire | rubber                -> tire rubber
 *     caliper                      -> caliper accent color
 *     disc | rotor | brake         -> dark trim
 *     seat | interior | leather | door_card -> interior leather
 *     dash | console | underbody | chassis | plastic -> dark trim
 *     chrome | bright | exhaust    -> chrome
 *     carbon                       -> carbon
 *     headlight | lens_front | drl -> emissive lamp
 *     taillight | lens_rear        -> emissive tail lamp
 * - Optional variant nodes are toggled by the configurator:
 *     wheel_<five|twinfive|mesh|dish>_<fl|fr|rl|rr>
 *     spoiler_<none|lip|ducktail|gtwing>
 *     kit_splitter | kit_skirts | kit_diffuser  (all non-stock kits)
 *     kit_flares   (widebody only)
 * - Optional hinged parts animate open/close. Place each node's ORIGIN on its
 *   hinge axis; the configurator damps its local rotation:
 *     door_l | door_r -> rotates around local Y (-/+ to swing outward)
 *     decklid | trunk -> rotates around local Z (negative lifts the rear)
 *     hood | bonnet   -> rotates around local Z (positive lifts the front)
 */
export const GLB_MODELS: Partial<Record<ModelId, GlbModelDef>> = {}
