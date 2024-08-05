import { ColliderLayer, engine, GltfContainer, GltfContainerLoadingState, GltfNode, InputAction, inputSystem, Material, MeshCollider, MeshRenderer, PointerEvents, pointerEventsSystem, Transform, VideoPlayer, VisibilityComponent } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { assert, ensurePlayer, getGltfNodeOrNull, waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
	init().catch(console.error)
}

async function init(): Promise<void> {
	// First, we create the roller coaster entity with the GLTF component and place it in the scene
	const modelEntity = engine.addEntity() 
	GltfContainer.create(modelEntity, { 
		src: 'models/test.glb',
	})
	Transform.create(modelEntity, { 
		position: Vector3.create(4, 2, 12), 
		rotation: Quaternion.fromEulerDegrees(0, -90, 0),
	})

	const videoEntity = engine.addEntity()
	VideoPlayer.create(videoEntity, {
		src: "https://vod-progressive.akamaized.net/exp=1722885001~acl=%2Fvimeo-transcode-storage-prod-us-east1-h264-720p%2F01%2F781%2F10%2F253905163%2F925905540.mp4~hmac=83b623220e1772ecaf05116b52f3ebdc8979a217f3bc5cfbef4d20007baa54ef/vimeo-transcode-storage-prod-us-east1-h264-720p/01/781/10/253905163/925905540.mp4?download=1&filename=big_buck_bunny+(720p).mp4",
		loop: true,
		volume: 0.5
	})
	await waitUntilGltfIsLoaded([modelEntity])
	await ensurePlayer()

	const gltf = GltfContainerLoadingState.get(modelEntity)
	console.log(gltf)
	
	const videoNode = getGltfNodeOrNull(modelEntity, "Cube/Cube")
	Material.getOrCreateMutable(videoNode!).material = {
		$case: 'pbr',
		pbr: {
			texture: Material.Texture.Video({
				videoPlayerEntity: videoEntity,
			})
		}
	}
}
