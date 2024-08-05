import { CameraModeArea, CameraType, engine, Entity, Material, MeshRenderer, PBCameraModeArea, Transform } from "@dcl/sdk/ecs";
import { Color3, Color4, Quaternion, Scalar, Vector3 } from "@dcl/sdk/math";

function colorAddAlpha(baseColor: Color4 | Color3, a: number): Color4 {
  return { ...baseColor, a }
}

function createCameraModeArea(position: Vector3, size: Vector3, value: Partial<PBCameraModeArea>, debug: boolean = true) {
  // When debug=true, it enables a box with alpha representation
  if (debug) {
      const height = 0.1
      const floorRepresentationEntity = engine.addEntity()
      const floorPosition = Vector3.create(position.x, position.y - size.y / 2 + height, position.z)
      MeshRenderer.setBox(floorRepresentationEntity)
      Material.setPbrMaterial(floorRepresentationEntity, { albedoColor: colorAddAlpha(Color4.Magenta(), 0.2) })
      Transform.create(floorRepresentationEntity, { position: floorPosition, scale: Vector3.create(size.x, height, size.z) })

      const areaRepresentationEntity = engine.addEntity()
      MeshRenderer.setBox(areaRepresentationEntity)
      Material.setPbrMaterial(areaRepresentationEntity, { albedoColor: colorAddAlpha(Color4.Green(), 0.1) })
      const repPosition = Vector3.create(position.x, position.y, position.z)
      Transform.create(areaRepresentationEntity, { position: repPosition, scale:  size})
  }

  const entity = engine.addEntity()
  CameraModeArea.create(entity, {
      mode: CameraType.CT_FIRST_PERSON,
      area: size,
      ...value,
  })
  Transform.create(entity, { position })
}

function createLemniscateMovement(centerPosition: Vector3, height: number, pathLength: number, periodSeg: number = 1.0, showDebug: boolean = false): Entity {
  const movingEntity = engine.addEntity()
  const systemName = `${movingEntity}-bernoulli-lemniscate-curve-movement-system`
  const speedModifier = 2 * Math.PI / periodSeg

  // A small debug box to show the position of the entity moved and the boundary of the path
  if (showDebug) {
      const debug = engine.addEntity()
      const debugBoxSize = 0.1
      MeshRenderer.setBox(debug)
      Material.setPbrMaterial(debug, { albedoColor: Color4.Red() })
      Transform.create(debug, { scale: Vector3.create(debugBoxSize, debugBoxSize, debugBoxSize), parent: movingEntity })

      const debugArea = engine.addEntity()
      MeshRenderer.setBox(debugArea)
      Material.setPbrMaterial(debugArea, { albedoColor: colorAddAlpha(Color4.Magenta(), 0.2) })
      Transform.create(debugArea, { scale: Vector3.create(pathLength, height, pathLength * Math.sqrt(2) / 4), position: {...centerPosition} })
  }
  
  let t = 0
  const amplitude = pathLength / 2
  engine.addSystem((dt) => {
      const transform = Transform.getMutableOrNull(movingEntity)
      // auto clean
      if (!transform) {
          engine.removeSystem(systemName)
          return
      }

      // t is acummulated time but periodic each 2pi
      t = Scalar.repeat(t + (speedModifier * dt), 2 * Math.PI)
      const ct = Math.cos(t)
      const st = Math.sin(t)
      const previousPos = {...transform.position}

      // lemminiscate curve
      transform.position.x = centerPosition.x + (amplitude * ct / (1 + (st * st)))
      transform.position.z = centerPosition.z + (amplitude * ct * st / (1 + (st * st)))

      // sin square 
      transform.position.y = centerPosition.y - height / 2 + (height * Math.sin(t/2) * Math.sin(t/2))

      // rotation calculated from the previous position (with forward vector)
      Quaternion.fromLookAtToRef(previousPos, transform.position, Vector3.Up(), transform.rotation)
  }, 0, systemName)

  // Initial position
  Transform.create(movingEntity, { position: {...centerPosition} })

  return movingEntity
}

export function main() {
  console.log("## Cinematic Example Test ##")

  // Camera area position and size
  const cameraAreaPosition = Vector3.create(4, 2.5, 4)
  const cameraAreaSize = Vector3.create(3, 3, 3)

  // Movement parameters
  const movementCenteredPosition = Vector3.create(8, 2, 8)
  const pathHeight = 1.0
  const pathLength = 4.0
  const periodSeg = 6

  const movingEntity = createLemniscateMovement(movementCenteredPosition, pathHeight, pathLength, periodSeg, true)
  createCameraModeArea(cameraAreaPosition, cameraAreaSize, {
      mode: CameraType.CT_CINEMATIC,
      cinematicSettings: {
          cameraEntity: movingEntity
      }
  })
}