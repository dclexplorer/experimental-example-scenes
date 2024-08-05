import { Billboard, engine, TextShape, Transform } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"
import { ReactEcsRenderer } from "@dcl/sdk/react-ecs"
import { UiExample } from "./ui"

export function main(): void {
    const ui = new UiExample()
    ReactEcsRenderer.setUiRenderer(ui.render.bind(ui))

    const textShapeEntity = engine.addEntity()
    TextShape.create(textShapeEntity, {
        text: "Scrollable UI - Example",
        fontSize: 20,
        textColor: Color4.Red(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.2
    })
    Transform.create(textShapeEntity, {
      position: Vector3.create(8, 1, 8)
    })
    Billboard.create(textShapeEntity)
  }
  