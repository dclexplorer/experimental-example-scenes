import { ColliderLayer, engine, GltfContainer, GltfContainerLoadingState, GltfNode, InputAction, inputSystem, Material, MeshCollider, MeshRenderer, PointerEvents, pointerEventsSystem, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { assert, ensurePlayer, waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
	init().catch(console.error)
}

async function init(): Promise<void> {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const houseEntity = engine.addEntity() 
	GltfContainer.create(houseEntity, { 
		src: 'models/vannah/scene.gltf',
	})
	Transform.create(houseEntity, { 
		position: Vector3.create(4, 0, 12), 
	})

	await waitUntilGltfIsLoaded([houseEntity])
	await ensurePlayer()

	// Having the internal data in the `gltf` component, we can create the internal entities as a mapping
	const gltf = GltfContainerLoadingState.get(houseEntity)
	const doorEntities = gltf.nodePaths.filter((node) => node.includes('Object_21') || node.includes('Object_22')).map((nodeName) => {
		const entity = engine.addEntity()
		GltfNode.create(entity, { path: nodeName })
		Transform.create(entity, { parent: houseEntity })
		return entity
	})

	const bedEntities = gltf.nodePaths.filter((node) => node.includes('Object_111') || node.includes('Object_113')).map((nodeName, index) => {
		const entity = engine.addEntity()
		GltfNode.create(entity, { path: nodeName })
		Transform.create(entity, { parent: houseEntity })
		return entity
	})

	// Wait until all internal nodes are loaded
	await waitUntilGltfNodeIsLoaded([...bedEntities, ...doorEntities])

	// Modify adding visibility component to internal nodes

	const redButton = engine.addEntity()
	{
		// This is only for the example, a red box as a button...
		MeshRenderer.setBox(redButton)
		Material.setPbrMaterial(redButton, { albedoColor: Color4.Red() })
		MeshCollider.setBox(redButton, ColliderLayer.CL_POINTER)
		Transform.create(redButton, { position: Vector3.create(4, 1, 4), scale: Vector3.create(0.5, 0.5, 0.5) })
	}

	pointerEventsSystem.onPointerDown({ entity: redButton, opts: {
		hoverText: 'Click me to toggle doors visibility',
		button: InputAction.IA_POINTER
	}}, () => {
		doorEntities.forEach((entity) => {
			const value = VisibilityComponent.getOrCreateMutable(entity)
			value.visible = !value.visible
		})
	})

	// Modyfing adding pointer events to internal nodes
	for (const entity of bedEntities) {
		const mesh = MeshRenderer.getOrNull(entity)
		if (mesh === null) continue
		assert(mesh.mesh?.$case === 'gltf')

		MeshCollider.setGltfMesh(entity, mesh.mesh.gltf.gltfSrc, mesh.mesh.gltf.name, ColliderLayer.CL_POINTER)
		pointerEventsSystem.onPointerDown({ entity: entity, opts: {
			hoverText: 'Rest in bed ' + entity,
			button: InputAction.IA_POINTER
		}}, () => {
			console.log('Rest in bed ' + entity)
		})
	}
}
