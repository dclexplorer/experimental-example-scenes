import { ColliderLayer, engine, GlobalLight, GltfContainer, Light, Material, MeshRenderer, Schemas, Transform } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";

const LightMarker = engine.defineComponent("LightMarker", { offset: Schemas.Number });

export function main(): void {
	init().catch(console.error)
}

function createLight(color: Color4, offset: number) {
	const light = engine.addEntity();

	// setting a light on a non-root entity creates a point light
	Light.createOrReplace(light, { illuminance: 100000, shadows: true, color: color })
	
	// we can add spotlight angles to make it a spotlight instead
	// Spotlight.createOrReplace(light, {angle: 3.141592 / 4})

	// visual representation of the light
	MeshRenderer.setSphere(light);
	Material.setPbrMaterial(light, {albedoColor: color, emissiveColor: color, castShadows: false})
	
	// just for the movement system
	LightMarker.createOrReplace(light, { offset })	

	// placing it in the scene
	Transform.createOrReplace(light, { position: Vector3.create(8, 6.5, 0), scale: Vector3.create(0.2,0.2,0.2) })
}

function updateLights(dt: number) {
	for (const [entity] of engine.getEntitiesWith(LightMarker)) {
		const transform = Transform.getMutable(entity) 
		const marker = LightMarker.getMutable(entity)
		marker.offset += dt / 2
		transform.position.z = Math.sin(marker.offset) * 2.5 + 3
		transform.position.x = Math.cos(marker.offset) * 2.5 + 8
	}
}

async function init(): Promise<void> {
	// setting a light on the root entity controls the sunlight brightness / color / shadows
	Light.createOrReplace(engine.RootEntity, {
		illuminance: 1000,  // brightness
		shadows: true,  // cast shadows
		color: Color4.Red()
	})
	
	// on the root we can also control the sunlight direction and the ambient light color/brightness
	GlobalLight.createOrReplace(engine.RootEntity, {
		direction: Vector3.Down(),
		ambientColor: Color4.create(0.0, 0.0, 0.0), // ambient color
		ambientBrightness: 1,
	})

	createLight(Color4.Red(), 0);
	createLight(Color4.Green(), 2 * Math.PI / 3);
	createLight(Color4.Blue(), 4 * Math.PI / 3);
	console.log("made lights")

	engine.addSystem(updateLights) 

	const planePlatform = engine.addEntity();
	MeshRenderer.setBox(planePlatform);
	Transform.createOrReplace(planePlatform, { position: Vector3.create(9, 2.5, 3), scale: Vector3.create(0.5, 3.0, 0.5)});

	const monkehEntity = engine.addEntity() 
	GltfContainer.create(monkehEntity, { 
		src: 'models/monkeh.gltf',
		visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
	})
	Transform.create(monkehEntity, { 
		position: Vector3.create(8, 0, 8), 
	})
}
