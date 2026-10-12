import { CAR_DIMS } from '../../data/profiles'
import { useConfigurator } from '../../store/configurator'
import { Aero, Cabin, CarBody, Doors, Interior, Lid, Lights, RoofCap, SideDetails, Underbody, Wheels } from './CarParts'

export function ProceduralCar() {
  const modelId = useConfigurator((s) => s.config.modelId)
  const dims = CAR_DIMS[modelId]

  return (
    <group>
      <CarBody dims={dims} />
      <Underbody dims={dims} />
      <Cabin dims={dims} />
      {!dims.openTop && <RoofCap dims={dims} />}
      <Interior dims={dims} />
      <Doors dims={dims} />
      <Lid dims={dims} />
      <Wheels dims={dims} />
      <SideDetails dims={dims} />
      <Lights dims={dims} />
      <Aero dims={dims} />
    </group>
  )
}
