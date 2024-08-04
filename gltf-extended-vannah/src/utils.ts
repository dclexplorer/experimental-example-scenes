import {
	engine,
	type Entity,
	GltfContainerLoadingState,
	GltfNode,
	GltfNodeState,
	GltfNodeStateValue,
	LoadingState,
	Transform
} from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/src/players'

const nextTickFuture: Array<() => void> = []

export async function waitTime(timeoutMs: number): Promise<void> {
	const start = new Date().getTime()
	while (true) {
		if (new Date().getTime() - start > timeoutMs) {
			return
		}

		await waitNextTick()
	}
}

export async function waitNextTick(): Promise<void> {
	await new Promise<void>((resolve) => {
		nextTickFuture.push(resolve)
	})
}

engine.addSystem(function () {
	while (nextTickFuture.length > 0) {
		nextTickFuture.shift()?.()
	}
})

export async function waitUntilGltfIsLoaded(
	entities: Entity[],
	timeout: number = 60000
): Promise<void> {
	while (true) {
		const isLoaded = entities.every((entity) => {
			return (
				GltfContainerLoadingState.getOrNull(entity)?.currentState ===
				LoadingState.FINISHED
			)
		})

		if (isLoaded) break
		if (timeout <= 0) throw new Error('Timeout waiting for gltf to load')
		await waitNextTick()
	}
}

export async function waitUntilGltfNodeIsLoaded(
	entities: Entity[],
	timeout: number = 60000
): Promise<void> {
	while (true) {
		const isLoaded = entities.every((entity) => {
			const state = GltfNodeState.getOrNull(entity)
			if (state === null) return false
			return (
				state.state !== GltfNodeStateValue.GNSV_PENDING
			)
		})

		if (isLoaded) break
		if (timeout <= 0) throw new Error('Timeout waiting for gltf to load')
		await waitNextTick()
	}
}

export function getGltfNodeOrNull(
	gltfContainer: Entity,
	nodeName: string
): Entity | null {
	const gltf = GltfContainerLoadingState.getOrNull(gltfContainer)
	if (gltf === null) return null
	if (gltf.currentState !== LoadingState.FINISHED) return null
	if (!gltf.nodePaths.includes(nodeName)) return null

	for (const [entity, node, transform] of engine.getEntitiesWith(
		GltfNode,
		Transform
	)) {
		if (transform.parent === gltfContainer && node.path === nodeName) {
			return entity
		}
	}

	const newEntity = engine.addEntity()
	Transform.create(newEntity, { parent: gltfContainer })
	GltfNode.create(newEntity, { path: nodeName })
	return newEntity
}

export function assert(condition: any, msg?: string): asserts condition {
	if (!condition) {
		throw new Error(msg ?? 'Assertion failed');
	}
}

export async function ensurePlayer(): Promise<
  Exclude<ReturnType<typeof getPlayer>, null>
> {
  let player = getPlayer()
  if (player !== null) return player

  do {
    await waitNextTick()
    player = getPlayer()
  } while (player === null)

  return player
}