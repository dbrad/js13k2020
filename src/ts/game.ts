// @ifdef DEBUG
import { tickStats } from "./stats";
// @endif

import { clear, flush, initGL, setClearColour } from "./gl";
import { loadAsset } from "./asset";
import { uiState, imguiStart, imguiEnd } from "./imgui";
import { scene_render, CurrentScene, scene_update, scene_root } from "./scene";
import { setupMainMenu } from "./scenes/mainmenu";
import { screenWidth, screenHeight } from "./screen";
import { toggleDEBUG, Input } from "./state";
import { renderNode, updateNode } from "./node";

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

  document.addEventListener("pointermove", (e) =>
  {
    const canvasBounds = canvas.getBoundingClientRect();
    Input.Pointer[0] = Math.floor((e.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
    Input.Pointer[1] = Math.floor((e.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
  });

  document.addEventListener("pointerdown", (e) =>
  {
    Input.MouseDown = true;
  });

  document.addEventListener("pointerup", (e) =>
  {
    Input.MouseDown = false;
  });

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

    let rootNodeId = scene_root[CurrentScene];

    imguiStart();
    // Update
    updateNode(rootNodeId);
    scene_update[CurrentScene](now, delta);

    // Render
    renderNode(rootNodeId);
    scene_render[CurrentScene](now, delta);
    imguiEnd();

    flush();
    // @ifdef DEBUG
    tickStats(delta, now, performance.now());
    flush();
    // @endif
    requestAnimationFrame(loop);
  }

  await loadAsset("sheet");
  setClearColour(25, 25, 25);
  then = performance.now();
  requestAnimationFrame(loop);
});