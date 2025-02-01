import {
  Animator,
  AudioSource,
  CameraLayer,
  CameraLayers,
  // CameraLayers,
  ColliderLayer,
  engine,
  GltfContainer,
  GltfNode,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshCollider,
  MeshRenderer,
  PointerEvents,
  pointerEventsSystem,
  Texture,
  TextureCamera,
  // TextureCamera,
  TextureUnion,
  Transform,
  UiCanvas
} from '@dcl/sdk/ecs'
import { createHummingBird } from './hummingBird'
import { setupUi } from './ui'
import { Color3, Color4, Quaternion, Vector2, Vector3 } from '@dcl/sdk/math'

export function main() {
  CameraLayers.create(engine.RootEntity, { layers: [0,1]})
  const ground = engine.addEntity()
  Transform.create(ground, {
    position: { x: 8, y: 0, z: 8 },
    rotation: { x: 0, y: 0, z: 0, w: 0 },
    scale: { x: 1.6, y: 1.6, z: 1.6 }
  })
  GltfContainer.create(ground, {
    src: 'models/Ground.gltf'
  })
  // CameraLayers.create(ground, {layers: [0,1]});

  const tree = engine.addEntity()
  Transform.create(tree, {
    position: { x: 8, y: 0, z: 8 },
    rotation: { x: 0, y: 0, z: 0, w: 0 },
    scale: { x: 1.6, y: 1.6, z: 1.6 }
  })
  GltfContainer.create(tree, {
    src: 'models/Tree.gltf',
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
    invisibleMeshesCollisionMask: undefined
  })
  // CameraLayers.create(tree, {layers: [1]});

  AudioSource.create(tree, {
    audioClipUrl: 'sounds/pickUp.mp3',
    loop: false,
    playing: false
  })

  Animator.create(tree, {
    states: [
      {
        clip: 'Tree_Action',
        loop: false,
        playing: false,
        shouldReset: true
      }
    ]
  })

  pointerEventsSystem.onPointerDown(
    {
      entity: tree,
      opts: {
        button: InputAction.IA_PRIMARY,
        hoverText: 'Shake'
      }
    },
    function () {
      createHummingBird()
      const anim = Animator.getMutable(tree)
      anim.states[0].playing = true
      const audioSource = AudioSource.getMutable(tree)
      audioSource.playing = true
    }
  )
  // UI with GitHub link
  const diegetic_root = setupUi();
  UiCanvas.createOrReplace(diegetic_root, { width: 1024, height: 1024, color: Color4.create(0.0, 0.0, 1.0, 0.5)});

  const diegetic_display = engine.addEntity();
  Transform.create(diegetic_display, { position: Vector3.create(8,2,8), scale: Vector3.create(1, 0.01, 0.2), rotation: Quaternion.fromEulerDegrees(90,0,0) });
  MeshRenderer.setGltfMesh(diegetic_display, 'models/Tree.gltf', 'Cube.001');
  MeshCollider.setGltfMesh(diegetic_display, 'models/Tree.gltf', 'Cube.001');
  Material.setPbrMaterial(diegetic_display, {
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
    texture: {
      tex: {
        $case: 'uiTexture',
        uiTexture: { uiCanvasEntity: diegetic_root },
      },
    },
  })

  // texturecam
  const cam = engine.addEntity();
  const camPos = Vector3.create(0, 1, 0);
  const camTarget = Vector3.create(8, 1, 8);
  
  CameraLayer.create(cam, {
    layer: 1,
    directionalLight: true,
    showAvatars: false,
    showSkybox: true,
    showFog: true,
    // ambientColorOverride: Color3.Blue(),
    // ambientBrightnessOverride: 1
  });

  Transform.create(cam, {position: camPos, rotation: Quaternion.fromLookAt(camPos, camTarget, Vector3.Up()) });
  TextureCamera.create(cam, {
    width: 512, 
    height: 512, 
    layer: 1, 
    clearColor: Color4.create(0.4, 0.4, 1.0, 0.5),
    mode: {
      // $case: "orthographic",
      // orthographic: { verticalRange: 10 }
      $case: "perspective",
      perspective: { fieldOfView: 0.8 }
    }
  });
  engine.addSystem((dt) => {
    time += dt;
    const transform = Transform.getMutable(cam);
    transform.position.x = 8 + Math.sin(time) * 8;
    transform.position.z = 8 + Math.cos(time) * 8;
    transform.rotation = Quaternion.fromLookAt(transform.position, camTarget, Vector3.Up())
  })

  // sign
  const sign = engine.addEntity();
  CameraLayers.create(sign, { layers: [0,1] })
  Transform.create(sign, {parent: tree});
  GltfNode.create(sign, {path: "Cube/Cube.001"});
  Material.setPbrMaterial(sign, {texture: Material.Texture.Video({videoPlayerEntity: cam}), }); 
} 

var time = 0;
