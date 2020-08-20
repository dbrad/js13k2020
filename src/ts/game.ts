// @ifdef DEBUG
import { tickStats } from "./stats";
import { toggleDEBUG, requestFullscreen } from "./gamestate";
// @endif

import { clear, flush, initGL, setClearColour } from "./gl";
import { loadAsset } from "./asset";
import { CurrentScene, getSceneRoot, Scenes } from "./scene";
import { setupMainMenu, mainMenu } from "./scenes/mainmenu";
import { screenWidth, screenHeight } from "./screen";
import { Input } from "./gamestate";
import { nodeInput as nodeInput, node_movement, moveNode } from "./node";
import { interp } from "./interpolate";
import { v2 } from "./v2";
import { gameScreen, setupGameScreen } from "./scenes/gamescreen";

window.addEventListener("load", async () =>
{
  // @ifdef DEBUG
  console.log(`DEBUG BUILD`);
  document.title = `Game - DEBUG`;
  document.addEventListener("keyup", (event) =>
  {
    if (event.code === "KeyD")
    {
      toggleDEBUG();
    }
  })
  // @endif
  const canvas = document.querySelector("canvas");
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  initGL(canvas);
  setupMainMenu();
  setupGameScreen();

  function isTouch(e: Event | PointerEvent | TouchEvent): e is TouchEvent
  {
    return (e.type[0] === "t");
  }

  function pointerMove(e: PointerEvent | TouchEvent)
  {
    const canvasBounds = canvas.getBoundingClientRect();
    if (isTouch(e))
    {
      e.preventDefault();
      const touch: Touch = e.touches[0];
      Input._pointer[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
      Input._pointer[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
      return;
    }
    e = e as PointerEvent;
    Input._pointer[0] = Math.floor((e.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
    Input._pointer[1] = Math.floor((e.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
  }

  function pointerDown(e: PointerEvent | TouchEvent)
  {
    if (isTouch(e))
    {
      requestFullscreen();
      const canvasBounds = canvas.getBoundingClientRect();
      const touchEvent = e as TouchEvent;
      touchEvent.preventDefault();
      const touch: Touch = touchEvent.touches[0];
      Input._pointer[0] = Math.floor((touch.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
      Input._pointer[1] = Math.floor((touch.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
    }
    Input._mouseDown = true;
  }

  function pointerUp(e: PointerEvent | TouchEvent)
  {
    Input._mouseDown = false;
  }

  document.addEventListener("pointermove", pointerMove);
  document.addEventListener("touchmove", pointerMove);

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("touchstart", pointerDown);

  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("touchend", pointerUp);

  let then = 0;
  let delta = 0;
  function loop(now: number): void
  {
    // @ifdef DEBUG
    now = Math.round(now);
    // @endif
    delta = now - then;
    then = now;

    clear();

    let rootNodeId = getSceneRoot(CurrentScene);

    // if we were hovering something last frame, lets make note of that.
    if (Input._hot !== 0)
    {
      Input._lastHot = Input._hot;
    }
    Input._hot = 0;

    // Update
    // Input for Nodes
    nodeInput(rootNodeId);

    // Node Systems Here
    for (let [childId, iData] of node_movement)
    {
      let i = interp(now, iData);
      moveNode(childId, i._values as v2);
      if (i._done)
      {
        moveNode(childId, i._values as v2);
        node_movement.delete(childId);
      }
    }

    switch (CurrentScene)
    {
      case Scenes.Game:
        gameScreen(now, delta);
        break;
      case Scenes.MainMenu:
      default:
        mainMenu(now, delta);
    }

    // Check for Mouse Up to Reset Input States
    if (Input._hot === 0) { Input._lastHot = 0; }
    if (!Input._mouseDown)
    {
      Input._active = 0;
      Input._dragOffset[0] = 0;
      Input._dragOffset[1] = 0;
      Input._dragParent = 0;
    }

    flush();

    // @ifdef DEBUG
    tickStats(delta, now, performance.now());
    flush();
    // @endif

    requestAnimationFrame(loop);
  }

  await loadAsset("sheet");
  setClearColour(16, 16, 16);
  then = performance.now();
  requestAnimationFrame(loop);
});
