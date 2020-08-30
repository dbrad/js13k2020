import { tickStats } from "./stats";
import { toggleDEBUG } from "./debug";

import { clear, flush, initGL, setClearColour } from "./gl";
import { loadAsset } from "./asset";
import { CurrentScene, getSceneRoot, Scenes } from "./scene";
import { setupMainMenu, mainMenu } from "./scenes/mainmenu";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "./screen";
import { Input } from "./gamestate";
import { nodeInput as nodeInput, node_movement, moveNode } from "./node";
import { interp } from "./interpolate";
import { v2 } from "./v2";
import { gameScreen, setupGameScreen } from "./scenes/gamescreen";
import { pushSpriteAndSave } from "./draw";
import { colourToHex } from "./util";

let canvas: HTMLCanvasElement;
// export function requestFullscreen(): void
// {
//   if (document.fullscreenEnabled)
//   {
//     if (!document.fullscreenElement)
//     {
//       const fullscreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullscreen || canvas.msRequestFullscreen;
//       //@ts-ignore
//       fullscreen.call(canvas).then(() =>
//       {
//         window.screen.orientation.lock("landscape").catch(_ => _);
//       }).catch(_ => _);
//     }
//   }
// }

window.addEventListener("load", async () =>
{
  type star = { _position: v2, velocity: v2 };
  const stars: star[] = [];
  // @ifdef DEBUG
  console.log(`DEBUG BUILD`);
  document.title = `Rescue Not Found - DEBUG BUILD`;
  document.addEventListener("keyup", (event) =>
  {
    if (event.code === "KeyD")
    {
      toggleDEBUG();
    }
  })
  // @endif
  canvas = document.querySelector("canvas");
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
      // requestFullscreen();
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

    if (stars.length < 300 && Math.random() < .5)
    {
      let star: star = { _position: [0, 0], velocity: [-0.5 + Math.random() * 1, -0.5 + Math.random() * 1] };
      stars.push(star);
    }

    for (let n = 0, len = stars.length; n < len; n++)
    {
      let pos = stars[n]._position;
      pos[0] += stars[n].velocity[0];
      pos[1] += stars[n].velocity[1];
      if (pos[0] > screenCenterX || pos[0] < -screenCenterX)
      {
        pos[0] = pos[1] = 0;
      }
      let c = Math.max(16, Math.floor((Math.abs(pos[0]) + Math.abs(pos[1])) / 2));
      let s = ((Math.abs(pos[1] / 100 + n / 200) / 4) / 0.2) * 0.2;
      pushSpriteAndSave("star", screenCenterX + pos[0], screenCenterY + pos[1], colourToHex(
        255,
        Math.min(255, c * (n % 6 === 0 ? 1.5 : 1)),
        c,
        Math.min(255, c * (n % 14 === 0 ? 1.5 : 1))),
        s, s)
    }

    let rootNodeId = getSceneRoot(CurrentScene);

    // if we were hovering something last frame, lets make note of that.
    if (Input._hot !== 0)
    {
      Input._lastHot = Input._hot;
    }
    Input._hot = 0;

    // Update
    // Input for Nodes
    if (Input._enabled)
    {
      nodeInput(rootNodeId);
    }

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
