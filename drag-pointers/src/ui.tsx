import {
  engine,
  PrimaryPointerInfo
} from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, {
  Label,
  ReactEcsRenderer,
  UiEntity,
} from "@dcl/sdk/react-ecs";

const projectPath = "Hummingbirds";
const description =
  "A new bird spawns every time you click a tree. Each bird moves on its own to random positions.";
const Max_Chars = 45;

const uiComponent = () => [
  invButton(),
  inventory(),
  cursor(),
  // showSlider()
  // myUi()
  // Other UI elements
];

var showInv = false;
var onCursor = -1;
var dropTarget = [-1, -1];
var dragging = -1;

function invButton() {
  return (
    <UiEntity
      uiTransform={{
        width: "5%",
        height: "5%",
        position: {
          left: "47.5%",
          top: "5%",
        },
		
      }}
      uiBackground={{ color: Color4.Blue() }}
    >
      <Label
        value="inventory"
        onMouseDown={() => {
          showInv = !showInv;
        }}
      />
    </UiEntity>
  );
}

const InventoryArray = [
  [0, 1, -1, -1, -1],
  [-1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1],
];

const images = ["images/sword.png", "images/shield.png"];

function inventory() {
  if (!showInv) {
    return;
  }

  return (
    <UiEntity
      uiTransform={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UiEntity
        uiTransform={{
          width: "50%",
          height: "50%",
          flexDirection: "column",
        }}
      >
        {Object.values(InventoryArray).map((items, row) => {
          return (
            <UiEntity
              uiTransform={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
              }}
              uiBackground={{ color: { ...Color4.Red(), a: 0.5 } }}
            >
              {items.map((item, col) => {
                if (item === -1) {
                  return (
                    <UiEntity
                      uiTransform={{
                        margin: "2%",
                        width: "10vh",
                        height: "10vh",
                        minHeight: "10vh",
                        minWidth: "10vh",
                      }}
                      uiBackground={{
                        color: Color4.create(0.1, 0.1, 0.1, 1.0),
                      }}
                      onMouseDown={() => {}}
                      onMouseEnter={() => {
                        dropTarget = [row, col];
                      }}
                      onMouseLeave={() => {
                        if (dropTarget[0] == row && dropTarget[1] == col) {
                          dropTarget = [-1, -1];
                        }
                      }}
                    />
                  );
                } else {
                  return (
                    <UiEntity
                      uiTransform={{
                        margin: "2%",
                        width: "10vh",
                        height: "10vh",
                        minHeight: "10vh",
                        minWidth: "10vh",
                      }}
                      uiBackground={{ color: Color4.White() }}
                      onMouseDrag={() => {
                        onCursor = item;
                      }}
                      onMouseDragEnd={() => {
                        if (dropTarget[0] != -1) {
                          const tmp =
                            InventoryArray[dropTarget[0]][dropTarget[1]];
                          InventoryArray[dropTarget[0]][dropTarget[1]] =
                            onCursor;
                          InventoryArray[row][col] = tmp;
                        }
                        onCursor = -1;
                      }}
                      onMouseEnter={() => {
                        dropTarget = [row, col];
                      }}
                      onMouseLeave={() => {
                        if (dropTarget[0] == row && dropTarget[1] == col) {
                          dropTarget = [-1, -1];
                        }
                      }}
                    >
                      <UiEntity
                        uiTransform={{ width: "100%", height: "100%" }}
                        uiBackground={{
                          textureMode: "stretch",
                          texture: { src: images[item] },
                        }}
                      />
                    </UiEntity>
                  );
                }
              })}
            </UiEntity>
          );
        })}
      </UiEntity>
    </UiEntity>
  );
}

function cursor() {
  if (onCursor === -1) {
    return;
  } else {
    const pos = PrimaryPointerInfo.get(engine.RootEntity).screenCoordinates!;
    return (
      <UiEntity
        uiTransform={{
          positionType: "absolute",
          width: "50",
          height: "50",
          position: {
            left: pos.x + 5,
            top: pos.y + 5,
          },
		  zIndex: 1
        }}
        uiBackground={{
          textureMode: "stretch",
          texture: { src: images[onCursor] },
        }}
      />
    );
  }
}

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent);
}
