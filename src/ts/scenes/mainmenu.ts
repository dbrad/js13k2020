import { pushText, Align } from "../draw";
import { screenHeight, screenCenterX, screenCenterY, screenWidth } from "../screen";
import { renderNode, createNode, addChildNode, node_visible, node_size } from "../node";
import { createButton } from "../nodes/button";
import { Input, requestFullscreen } from "../gamestate";
import { pushScene, Scenes } from "../scene";

export let mainMenuRootId = -1;
let playGameButtonId = -1;
let playGameFSButtonId = -1;
export function setupMainMenu(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  playGameButtonId = createButton("New Game", [120, 40], [screenCenterX - 60, screenCenterY - 20]);
  addChildNode(mainMenuRootId, playGameButtonId);

  if (!("ontouchstart" in window))
  {
    playGameFSButtonId = createButton("New Game (Fullscreen)", [120, 40], [screenCenterX - 60, screenCenterY + 30]);
    addChildNode(mainMenuRootId, playGameFSButtonId);
  }
}

export function mainMenu(now: number, delta: number): void
{
  if (Input._active === playGameButtonId)
  {
    window.scrollTo(0, 1);
    pushScene(Scenes.Game);
  }

  if (Input._active === playGameFSButtonId)
  {
    requestFullscreen();
    window.scrollTo(0, 1);
    pushScene(Scenes.Game);
  }

  renderNode(mainMenuRootId);
  pushText("Main Menu", screenCenterX, screenCenterY - 70, { _textAlign: Align.Center, _scale: 4 });
  pushText("(c) 2020 David Brad", 0, screenHeight - 9);
}