import { createNode, node_visible, node_size, nodeAbsolutePosition, renderNode, addChildNode, moveNode } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { pushText, Align } from "../draw";
import { GameOverReason, GameOverReasons, Input, setMusic } from "../gamestate";
import { createButton } from "../nodes/button";
import { pushScene, Scenes } from "../scene";
import { Easing } from "../interpolate";
import { mainMenuRootId } from "./mainmenu";

export let gameOverRootId = -1;
export let buttonId = -1;

export function setupGameOver(): void
{
  gameOverRootId = createNode();
  node_visible[gameOverRootId] = false;
  node_size[gameOverRootId][0] = screenWidth;
  node_size[gameOverRootId][1] = screenHeight;

  buttonId = createButton("Back To Menu", [112, 32], [192, screenHeight - 64]);
  addChildNode(gameOverRootId, buttonId);
}

export function gameOverScreen(now: number, delta: number): void
{
  const RootX = nodeAbsolutePosition(gameOverRootId)[0];
  const RootY = nodeAbsolutePosition(gameOverRootId)[1];



  let title = "Help has arrived!";
  let text = "A nearby ship receives your communications after following the distress signal. They have sent a shuttle to retrieve your crew, and not a moment too soon.";
  let colour = 0xFF32BF32;
  if (GameOverReason === GameOverReasons.NoCrew)
  {
    title = "No Oxygen...";
    text = "As the oxygen runs out, your final crew member slips away into unconsciousness as the shuttle drifts off aimlessly into space...";
    colour = 0XFF3232BF;
  }
  else if (GameOverReason === GameOverReasons.ShipDestroyed)
  {
    title = "Shuttle Destroyed";
    text = "The structural damage to the ship's hull becomes too great as it begins to break apart.";
    colour = 0XFF3232BF;
  }

  pushText(title,
    RootX + screenCenterX,
    RootY + screenCenterY - 90,
    { _textAlign: Align.Center, _scale: 3, _colour: colour });

  pushText(text,
    RootX + screenCenterX,
    RootY + screenCenterY - 60,
    { _textAlign: Align.Center, _scale: 2, _wrap: screenWidth - 16 })

  renderNode(gameOverRootId);

  if (Input._released === buttonId)
  {
    moveNode(gameOverRootId, [screenWidth, 0], Easing.EaseInOutBack, 750).then(() =>
    {
      setMusic(false);
      pushScene(Scenes.MainMenu);
      moveNode(mainMenuRootId, [0, 0], Easing.EaseOutQuad, 500);
    });
  }
}