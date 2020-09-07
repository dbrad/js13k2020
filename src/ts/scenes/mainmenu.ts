import { pushText, Align } from "../draw";
import { screenHeight, screenCenterX, screenCenterY, screenWidth } from "../screen";
import { renderNode, createNode, addChildNode, node_visible, node_size, moveNode, nodeAbsolutePosition } from "../node";
import { createButton } from "../nodes/button";
import { Input } from "../gamestate";
import { pushScene, Scenes } from "../scene";
import { initializeGame } from "./gamescreen";
import { Easing } from "../interpolate";
import { explosionSound, zzfxP } from "../zzfx";

export let mainMenuRootId = -1;
let playGameButtonId = -1;
export function setupMainMenu(): void
{
  mainMenuRootId = createNode();
  node_visible[mainMenuRootId] = false;
  node_size[mainMenuRootId][0] = screenWidth;
  node_size[mainMenuRootId][1] = screenHeight;

  playGameButtonId = createButton("Launch Shuttle", [104, 40], [screenCenterX - 52, screenCenterY]);
  addChildNode(mainMenuRootId, playGameButtonId);
}

export function mainMenu(now: number, delta: number): void
{
  const RootX = nodeAbsolutePosition(mainMenuRootId)[0];
  const RootY = nodeAbsolutePosition(mainMenuRootId)[1];
  if (Input._released === playGameButtonId)
  {
    Input._enabled = false;
    zzfxP(explosionSound);
    moveNode(mainMenuRootId, [0, 0]);
    moveNode(mainMenuRootId, [-screenWidth, 0], Easing.EaseInOutBack, 750).then(
      () =>
      {
        initializeGame();
        pushScene(Scenes.Game);
      }
    )
  }

  if (document.monetization && document.monetization.state === "pending")
  {
    pushText("Checking Coil Subscription...",
      RootX + screenCenterX,
      RootY + screenCenterY - 26,
      { _textAlign: Align.Center, _scale: 1, _colour: 0xFFAAAAAA });
  } else if (document.monetization && document.monetization.state === "started")
  {
    pushText("Welcome Coil User!",
      RootX + screenCenterX,
      RootY + screenCenterY - 26,
      { _textAlign: Align.Center, _scale: 1, _colour: 0xFFAAAAAA });

    pushText("Enjoy a level 2 crew member from the start!",
      RootX + screenCenterX,
      RootY + screenCenterY - 16,
      { _textAlign: Align.Center, _scale: 1, _colour: 0xFFAAAAAA });
  }
  renderNode(mainMenuRootId);
  pushText("RESCUE  FOUND.",
    RootX + screenCenterX,
    RootY + screenCenterY - 90,
    { _textAlign: Align.Center, _scale: 4 });
  pushText("not",
    RootX + screenCenterX,
    RootY + screenCenterY - 76,
    { _textAlign: Align.Center, _scale: 2, _colour: 0xFF2020A0 });
  pushText("(c) 2020 David Brad", RootX + 0, RootY + screenHeight - 9);
}