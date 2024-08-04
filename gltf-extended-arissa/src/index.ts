import { Animator, engine, GltfContainer, GltfContainerLoadingState, GltfNode, InputAction, Material, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { assert, ensurePlayer, getGltfNodeOrNull, waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
	init().catch(console.error)
}

async function arissaWithSword() {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const arisaEntity = engine.addEntity() 
	GltfContainer.create(arisaEntity, { 
		src: 'models/arissa.glb',
	})
	Transform.create(arisaEntity, { 
		position: Vector3.create(4, 1, 8),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0) 
	})

	await waitUntilGltfIsLoaded([arisaEntity])
	await ensurePlayer()

	const gltf = GltfContainerLoadingState.get(arisaEntity)
	const rightHandNodeName = gltf.nodePaths.filter(name => name.toLowerCase().endsWith('righthand'))[0]
	const rightHandNodeEntity = getGltfNodeOrNull(arisaEntity, rightHandNodeName)
	const sword = engine.addEntity()
	GltfContainer.create(sword, { src: 'models/Sword_01.glb' })
	Transform.create(sword, {
		position: Vector3.create(0, 0, 0),
		parent: rightHandNodeEntity!
	})
}

async function arissaDying() {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const arisaEntity = engine.addEntity() 
	GltfContainer.create(arisaEntity, { 
		src: 'models/arissa.glb',
	})
	Transform.create(arisaEntity, { 
		position: Vector3.create(8, 1, 8),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0) 
	})

	await waitUntilGltfIsLoaded([arisaEntity])
	await ensurePlayer()

	const gltf = GltfContainerLoadingState.get(arisaEntity)
	console.log(gltf.animationNames)

	// Off 
	Animator.create(arisaEntity, {
		states: gltf.animationNames.map(name => ({ clip: name, playing: true, loop: false, shouldReset: true, speed: 0.0 })),
	})
	console.log(Animator.get(arisaEntity).states)

	const allNodes = gltf.nodePaths.map(name => getGltfNodeOrNull(arisaEntity, name)!)

	await waitUntilGltfNodeIsLoaded(allNodes)

	let t = 0
	engine.addSystem((dt) => {
		t += dt
		if (t < 2) return
		const transform = Transform.getMutableOrNull(arisaEntity)
		if (transform){
			transform.position.y = Math.max(0, transform.position.y - dt)
		}
		for (const node of allNodes) {
			const transform = Transform.getMutableOrNull(node)
			if (transform){
				transform.position.y = Math.max(0, transform.position.y - dt)
			} else {
				console.log('Transform not found')
			}
		}
	})
}

async function init(): Promise<void> {
	await Promise.all([arissaDying(), arissaWithSword()])
}

