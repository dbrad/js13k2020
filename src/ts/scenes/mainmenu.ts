import { pushText, Align } from "../draw";
import { screenHeight, screenCenterX, screenCenterY, screenWidth } from "../screen";
import { renderNode, createNode, addChildNode, node_visible, node_size } from "../node";
import { createButton } from "../nodes/button";
import { Input } from "../gamestate";
import { pushScene, Scenes } from "../scene";
import { requestFullscreen } from "../game";
import { initializeGame } from "./gamescreen";

export let mainMenuRootId = -1;
let playGameButtonId = -1;
// let playGameFSButtonId = -1;
export function setupMainMenu(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  playGameButtonId = createButton("New Game", [104, 40], [screenCenterX - 52, screenCenterY]);
  addChildNode(mainMenuRootId, playGameButtonId);

  // if (!("ontouchstart" in window))
  // {
  //   playGameFSButtonId = createButton("New Game (Fullscreen)", [104, 40], [screenCenterX - 52, screenCenterY + 50]);
  //   addChildNode(mainMenuRootId, playGameFSButtonId);
  // }
}

export function mainMenu(now: number, delta: number): void
{
  if (Input._active === playGameButtonId)
  {
    initializeGame();
    pushScene(Scenes.Game);
  }

  // if (Input._active === playGameFSButtonId)
  // {
  //   requestFullscreen();
  //   initializeGame();
  //   pushScene(Scenes.Game);
  // }

  renderNode(mainMenuRootId);
  pushText("RESCUE  FOUND.", screenCenterX, screenCenterY - 90, { _textAlign: Align.Center, _scale: 4 });
  pushText("not", screenCenterX, screenCenterY - 76, { _textAlign: Align.Center, _scale: 2, _colour: 0xFF2020A0 });
  pushText("(c) 2020 David Brad", 0, screenHeight - 9);
}