import { engine, GltfContainer, GltfContainerLoadingState, GltfNode, InputAction, Material, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { assert, ensurePlayer, getGltfNodeOrNull, waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
	init().catch(console.error)
}

async function init(): Promise<void> {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const pufferEntity = engine.addEntity() 
	GltfContainer.create(pufferEntity, { 
		src: 'models/puffer.glb',
	})
	Transform.create(pufferEntity, { 
		position: Vector3.create(8, 1, 8), 
		scale: Vector3.create(0.1, 0.1, 0.1), 
		rotation: Quaternion.fromEulerDegrees(0, 45, 0) 
	})

	await waitUntilGltfIsLoaded([pufferEntity])
	await ensurePlayer()

	// After the GLTF is loaded, we can create the Animator component and the head entity which is a internal part of the roller coaster
	const gltf = GltfContainerLoadingState.get(pufferEntity)
	console.log({gltf})

	// Using the internal material in a external plane
	{
		assert(gltf.materialNames.length === 1)
		const testPlane = engine.addEntity()
		MeshRenderer.setPlane(testPlane)
		Material.create(testPlane, { gltf: { 
			gltfSrc: 'models/puffer.glb',
			name: gltf.materialNames[0],
		}})
		
		Transform.create(testPlane, {
			position: Vector3.create(4, 1.5, 8),
			scale: Vector3.create(2,2,2)
		})
	}

	// Modifying the color of a internal node
	{
		const pufferMeshEntity = getGltfNodeOrNull(pufferEntity, 'node-0/buffer-0-mesh-0')
		const pufferColliderEntity = getGltfNodeOrNull(pufferEntity, 'mesh_collider/Cube.001')
		assert(pufferMeshEntity && pufferColliderEntity)

		await waitUntilGltfNodeIsLoaded([pufferMeshEntity!, pufferColliderEntity!])
		
		pointerEventsSystem.onPointerDown({
			entity: pufferColliderEntity, 
			opts: { 
				button: InputAction.IA_POINTER, 
				hoverText: 'Change color!' 
			}
		}, () => {
			Material.getMutable(pufferMeshEntity).material = {
				$case: 'pbr', 
				pbr: {
					albedoColor: Color4.create(1, Math.random(), 0, 1)
				}
			}
		})
	}
}

