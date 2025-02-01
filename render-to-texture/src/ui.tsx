import { openExternalUrl } from "~system/RestrictedActions";
import ReactEcs, {
  Label,
  ReactEcsRenderer,
  UiEntity,
} from "@dcl/sdk/react-ecs";
import {
  engine,
  type Entity,
  TextAlignMode,
  TextureFilterMode,
  TextureWrapMode,
  UiScrollResult,
  VideoPlayer,
} from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import { birdCamera } from "./hummingBird";

const projectPath = "Hummingbirds";
const description =
  "A new bird spawns every time you click a tree. Each bird moves on its own to random positions.";
const Max_Chars = 45;

const uiComponent = () => [
  GitHubLinkUi(),
  // descriptionUI(),
  showHummingbird(),
  // Other UI elements
];

let videoEntity: Entity;

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent);
  const diegetic = engine.addEntity();
  console.log(`diegetic: ${diegetic}`);
  videoEntity = engine.addEntity();
  VideoPlayer.createOrReplace(videoEntity, {
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  });
  return diegetic;
}

function showHummingbird() {
  if (birdCamera == engine.RootEntity) {
    return;
  }

  return (
    <UiEntity
      uiTransform={{
        positionType: "absolute",
        position: {
          left: "60%",
          top: "10%",
          right: "10%",
          bottom: "60%",
        },
        margin: "3px",
      }}
      uiBackground={{
        color: Color4.Blue(),
      }}
    >
      <UiEntity
        uiTransform={{
          width: "80%",
          height: "80%",
		  position: {
			left: "10%",
			top: "10%",
		  }
        }}
        uiBackground={{
          videoTexture: { videoPlayerEntity: birdCamera },
        }}
      />
    </UiEntity>
  );
}


function GitHubLinkUi() {
  const fullPath =
    "https://github.com/decentraland/sdk7-goerli-plaza/tree/main/" +
    projectPath;

  return (
    <UiEntity
      uiTransform={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        positionType: "absolute",
        position: { right: "8%", bottom: "3%" },
      }}
    >
      <UiEntity
        uiTransform={{
          width: "100",
          height: "100",
        }}
        uiBackground={{
          textureMode: "stretch",
          videoTexture: {
            videoPlayerEntity: videoEntity,
          },
        }}
        onMouseDown={() => {
          console.log("OPENING LINK");
          openExternalUrl({ url: fullPath });
        }}
      />
      <Label
        value="View code"
        color={Color4.Black()}
        fontSize={18}
        textAlign="middle-center"
      />
    </UiEntity>
  );
}

function descriptionUI() {
  const multiLineDescription = breakLines(description, Max_Chars);

  return (
    <UiEntity
      uiTransform={{
        width: "auto",
        height: "auto",
        display: "flex",
        flexDirection: "row",
        alignSelf: "stretch",
        positionType: "absolute",
        flexShrink: 1,
        maxWidth: 600,
        maxHeight: 300,
        minWidth: 200,
        padding: 4,
        position: { right: "3%", bottom: "20%" },
      }}
      uiBackground={{ color: Color4.fromHexString("#4d544e") }}
    >
      <UiEntity
        uiTransform={{
          width: "auto",
          height: "auto",
          alignSelf: "center",
          padding: 4,
          justifyContent: "flex-start",
          alignContent: "flex-start",
        }}
        uiBackground={{ color: Color4.fromHexString("#92b096") }}
      >
        <Label
          value={multiLineDescription}
          fontSize={18}
          textAlign="middle-center"
          uiTransform={{
            width: "auto",
            height: "auto",
            alignSelf: "center",
            margin: "16px 16px 8px 16px",
          }}
        />
      </UiEntity>
    </UiEntity>
  );
}

function breakLines(text: string, linelength: number) {
  const lineBreak = "\n";
  let counter = 0;
  let line = "";
  let returnText = "";
  let bMatchFound = false;
  const lineLen = linelength || 50;

  if (!text) return "";
  if (text.length < lineLen + 1) {
    return text;
  }

  while (counter < text.length) {
    line = text.substring(counter, counter + lineLen);
    bMatchFound = false;
    if (line.length == lineLen) {
      for (let i = line.length; i > -1; i--) {
        if (line.substring(i, i + 1) == " ") {
          counter += line.substring(0, i).length;
          line = line.substring(0, i) + lineBreak;
          returnText += line;
          bMatchFound = true;
          break;
        }
      }

      if (!bMatchFound) {
        counter += line.length;
        line = line + lineBreak;
        returnText += line;
      }
    } else {
      returnText += line;
      break; // We're breaking out of the the while(), not the for()
    }
  }

  return returnText;
}
