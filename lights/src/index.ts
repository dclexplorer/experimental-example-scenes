
import { Billboard, ColliderLayer, engine, GltfContainer, GltfContainerLoadingState, GltfNode, Material, TextShape, Transform, UiCanvas } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"
import { ReactEcsRenderer } from "@dcl/sdk/react-ecs"
import { UiExample } from "./ui"
import { waitUntilGltfIsLoaded, waitUntilGltfNodeIsLoaded } from "./utils"

export function main(): void {
  init().catch(console.error)
}

async function setupScroll() {
    const use_texture = true;

    const ui = new UiExample()

    const uiCanvas = engine.addEntity();
    if (use_texture) {
      UiCanvas.create(uiCanvas, { width: 1024, height: 1024, color: Color4.Black() });
      ReactEcsRenderer.setTextureRenderer(uiCanvas, ui.render.bind(ui));
    } else {
      ReactEcsRenderer.setUiRenderer(ui.render.bind(ui));
    }

    const textShapeEntity = engine.addEntity();
    TextShape.create(textShapeEntity, {
        text: "Scrollable UI - Example",
        fontSize: 20,
        textColor: Color4.Red(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.2
    });
    Transform.create(textShapeEntity, {
      position: Vector3.create(8, 1, 8)
    });
    Billboard.create(textShapeEntity);

    console.log("make display");
    const uiDisplay = engine.addEntity();
    Transform.create(uiDisplay, { position: Vector3.create(8,1,8), scale: Vector3.create(2,2,2) });
    GltfContainer.create(uiDisplay, { src: "models/screen.gltf", visibleMeshesCollisionMask: ColliderLayer.CL_POINTER } );
    await waitUntilGltfIsLoaded([uiDisplay])
    
    console.log("paths:")
    GltfContainerLoadingState.get(uiDisplay).nodePaths.forEach((p) => {
      console.log(p)
    });
    console.log("end paths")

    console.log("make screen");
    const screen = engine.addEntity();
    Transform.createOrReplace(screen, { parent: uiDisplay });
    GltfNode.create(screen, { path: "Plane/Plane" });
    await waitUntilGltfNodeIsLoaded([screen]);

    console.log(`has mat?: ${Material.has(screen)}`);

    if (use_texture) {
      Material.setPbrMaterial(screen, {
        texture: {
          tex: {
            $case: 'uiTexture',
            uiTexture: {
              uiCanvasEntity: uiCanvas,
            }
          }
        }
      })  
    }
  }
  
async function init(): Promise<void> {
  await Promise.all([setupScroll()])
}
  