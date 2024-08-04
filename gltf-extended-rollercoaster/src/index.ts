import { Animator, CameraModeArea, CameraType, engine, GltfContainer, GltfContainerLoadingState, GltfNode, GltfNodeState, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { assert, ensurePlayer, waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
	init().catch(console.error)
}

async function init(): Promise<void> {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const rollerCoasterEntity = engine.addEntity() 
	GltfContainer.create(rollerCoasterEntity, { 
		src: 'models/roller_coaster_animation.glb',
	})
	Transform.create(rollerCoasterEntity, { 
		position: Vector3.create(32, 4, 32), 
		scale: Vector3.create(0.085, 0.085, 0.085), 
		rotation: Quaternion.fromEulerDegrees(0, 45, 0) 
	})
	await waitUntilGltfIsLoaded([rollerCoasterEntity])

	
	await ensurePlayer()

	// After the GLTF is loaded, we can create the Animator component and the head entity which is a internal part of the roller coaster
	const gltf = GltfContainerLoadingState.get(rollerCoasterEntity)
	assert(gltf.animationNames.length === 1)	
	Animator.create(rollerCoasterEntity, {
		states: [
			{
				clip: gltf.animationNames[0],
				playing: false,
				speed: 0.0,
			}
		]
	})

	// We search for the head entity in the GLTF node paths, if you created the GLTF you should know the path of the head entity
	//	in this case I've opened the GLB file in Blender and I know the path of the head entity (at least I know the first part of the path)
	const head = gltf.nodePaths.filter((node) => node.includes('Suzanne_Material_001_0'))
	assert(head.length > 0)

	const headEntity = engine.addEntity()
	GltfNode.create(headEntity, { path: head[0] })
	Transform.create(headEntity, { parent: rollerCoasterEntity })
	await waitUntilGltfNodeIsLoaded([headEntity])

	// Once the head entity is loaded, the Transform is being updated by the GLTF system, so we can get the position and rotation of the head entity
	// 	also we can attach a camera to the head entity to follow the roller coaster
	const attachedEntity = engine.addEntity()
	Transform.create(attachedEntity, { parent: headEntity })

	const cameraArea = engine.addEntity()
	CameraModeArea.create(cameraArea, {
		area: Vector3.create(1000,1000,1000),
		mode: CameraType.CT_CINEMATIC,
		cinematicSettings: {
			cameraEntity: attachedEntity,
			allowManualRotation: true,
		}
	})

}
