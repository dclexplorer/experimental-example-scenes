import {
  Animator,
  AudioSource,
  ColliderLayer,
  engine,
  type Entity,
  GltfContainer,
  GltfContainerLoadingState,
  GltfNode,
  GltfNodeState,
  GltfNodeStateValue,
  InputAction,
  LoadingState,
  MeshCollider,
  MeshRenderer,
  type PBPointerEventsResult,
  pointerEventsSystem,
  Transform
} from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { createHummingBird } from "./hummingBird";
import { setupUi } from "./ui";

const nextTickFuture: Array<() => void> = [];

engine.addSystem(function () {
  while (nextTickFuture.length > 0) {
    nextTickFuture.shift()?.();
  }
});

async function waitNextTick(): Promise<void> {
  await new Promise<void>((resolve) => {
    nextTickFuture.push(resolve);
  });
}

async function waitUntilGltfIsLoaded(
  entities: Entity[],
  timeout: number = 60000
): Promise<void> {
  while (true) {
    const isLoaded = entities.every((entity) => {
      return (
        GltfContainerLoadingState.getOrNull(entity)?.currentState ===
        LoadingState.FINISHED
      );
    });

    if (isLoaded) break;
    if (timeout <= 0) throw new Error("Timeout waiting for gltf to load");
    await waitNextTick();
  }
}

async function waitUntilGltfNodeIsLoaded(
  entities: Entity[],
  timeout: number = 60000
): Promise<void> {
  while (true) {
    const isLoaded = entities.every((entity) => {
      const state = GltfNodeState.getOrNull(entity);
      if (state === null) return false;
      return state.state !== GltfNodeStateValue.GNSV_PENDING;
    });

    if (isLoaded) break;
    if (timeout <= 0) throw new Error("Timeout waiting for gltf to load");
    await waitNextTick();
  }
}

export function main() {
  const ground = engine.addEntity();
  Transform.create(ground, {
    position: { x: 8, y: 0, z: 8 },
    rotation: { x: 0, y: 0, z: 0, w: 0 },
    scale: { x: 1.6, y: 1.6, z: 1.6 },
  });
  GltfContainer.create(ground, {
    src: "models/Ground.gltf",
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
  });

  // add moveCallback to each mesh in the gltf
  waitUntilGltfIsLoaded([ground]).then(() => {
    console.log("loaded");
    const paths = GltfContainerLoadingState.get(ground).nodePaths;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const e = engine.addEntity();
      Transform.create(e, { parent: ground });
      GltfNode.create(e, { path });
      waitUntilGltfNodeIsLoaded([e]).then(() => {
        if (!MeshRenderer.has(e)) {
          engine.removeEntity(e);
          return;
        }
        pointerEventsSystem.onPointerDragLocked(
          { entity: e, opts: { button: InputAction.IA_ANY } },
          moveCallback(e)
        );
        console.log(path);
      });
    }
  });

  const tree = engine.addEntity();
  Transform.create(tree, {
    position: { x: 8, y: 0, z: 8 },
    rotation: { x: 0, y: 0, z: 0, w: 0 },
    scale: { x: 1.6, y: 1.6, z: 1.6 },
  });
  GltfContainer.create(tree, {
    src: "models/Tree.gltf",
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
    invisibleMeshesCollisionMask: undefined,
  });

  AudioSource.create(tree, {
    audioClipUrl: "sounds/pickUp.mp3",
    loop: false,
    playing: false,
  });

  Animator.create(tree, {
    states: [
      {
        clip: "Tree_Action",
        loop: false,
        playing: false,
        shouldReset: true,
      },
    ],
  });

  pointerEventsSystem.onPointerDown(
    {
      entity: tree,
      opts: {
        button: InputAction.IA_PRIMARY,
        hoverText: "Shake",
      },
    },
    function () {
      createHummingBird();
      const anim = Animator.getMutable(tree);
      anim.states[0].playing = true;
      const audioSource = AudioSource.getMutable(tree);
      audioSource.playing = true;
    }
  );

  // UI with GitHub link
  setupUi();

  // box?
  const boxx = engine.addEntity();
  Transform.create(boxx, {
    position: Vector3.create(4, 4, 4),
    scale: Vector3.create(2, 2, 2),
  });
  MeshRenderer.setBox(boxx);
  MeshCollider.setBox(boxx);


  pointerEventsSystem.onPointerDragLocked(
    {
      entity: boxx,
      opts: {
        button: InputAction.IA_ANY,
        hoverText:
          "Drag with Pointer to move\nDrag with Primary button to rotate\nDrag with Secondary button to Scale",
      },
    },
    moveCallback(boxx)
  );
  

  const dopple = engine.addEntity();
  Transform.create(dopple, {parent: engine.PlayerEntity, position: Vector3.create(1,0,0)})
  // AvatarShape.create(dopple);
}

function transform_vec_by_quat(q: Quaternion, v: Vector3): Vector3 {
  // q * v = q * Q(0, v.x, v.y, v.z) * Q(q.w, -q.x, -q.y, -q.z)
  const pure_v = Quaternion.create(v.x, v.y, v.z, 0);
  const inv_q = Quaternion.create(-q.x, -q.y, -q.z, q.w);
  const transformed = Quaternion.multiply(
    Quaternion.multiply(q, pure_v),
    inv_q
  );
  return Vector3.create(transformed.x, transformed.y, transformed.z);
}

function moveCallback(e: Entity) {
  return function (props: PBPointerEventsResult) {
    const cursor_direction = props.hit?.direction!;
    if (cursor_direction === undefined) {
      return;
    }
    const transform = Transform.getMutable(e);
    if (props.button == InputAction.IA_POINTER) {
      const scaled_direction = Vector3.multiply(
        cursor_direction,
        Vector3.create(0.01, 0.01, 0.01)
      );
      const cam_transform = Transform.get(engine.CameraEntity);
      const up_unit = transform_vec_by_quat(
        cam_transform.rotation,
        Vector3.Down()
      );
      const up = Vector3.multiply(
        up_unit,
        Vector3.create(
          scaled_direction.y,
          scaled_direction.y,
          scaled_direction.y
        )
      );
      const right_unit = transform_vec_by_quat(
        cam_transform.rotation,
        Vector3.Right()
      );
      const right = Vector3.multiply(
        right_unit,
        Vector3.create(
          scaled_direction.x,
          scaled_direction.x,
          scaled_direction.x
        )
      );
      transform.position = Vector3.add(
        transform.position,
        Vector3.add(up, right)
      );
    } else if (props.button == InputAction.IA_PRIMARY) {
      const rotate_by = Quaternion.fromEulerDegrees(
        cursor_direction.x,
        cursor_direction.y,
        0
      );
      transform.rotation = Quaternion.multiply(transform.rotation, rotate_by);
    } else if (props.button == InputAction.IA_SECONDARY) {
      const scale_by = Math.exp(
        (cursor_direction.x + cursor_direction.y) * 0.01
      );
      transform.scale = Vector3.multiply(
        transform.scale,
        Vector3.create(scale_by, scale_by, scale_by)
      );
    }
  };
}
