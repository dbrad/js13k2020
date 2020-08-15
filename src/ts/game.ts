// @ifdef DEBUG
import { tickStats } from "./stats";
// @endif

import { clear, flush, initGL, setClearColour } from "./gl";
import { loadAsset } from "./asset";
import { pushQuad, pushText, Align } from "./draw";
import { uiState } from "./imgui";
import { createInterpolationData, Easing, interp } from "./interpolate";


const screenWidth = 512;
const screenHeight = 288;
const screenCenterX = Math.floor(screenWidth / 2);
const screenCenterY = Math.floor(screenHeight / 2);

function random(min: number, max: number): number
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function colourToHex(a: number, b: number, g: number, r: number): number
{
  let out: number = 0x0;
  out = ((out | (a & 0xff)) << 8) >>> 0;
  out = ((out | (b & 0xff)) << 8) >>> 0;
  out = ((out | (g & 0xff)) << 8) >>> 0;
  out = ((out | (r & 0xff))) >>> 0;
  return out;
}


window.addEventListener("load", async () =>
{
  // @ifdef DEBUG
  console.log(`DEBUG BUILD`);
  document.title = `Game - DEBUG`;
  // @endif
  const canvas = document.querySelector("canvas");
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  initGL(canvas);

  document.addEventListener("pointermove", (e) =>
  {
    const canvasBounds = canvas.getBoundingClientRect();
    uiState.mouseX = Math.floor((e.clientX - canvasBounds.left) / (canvasBounds.width / screenWidth));
    uiState.mouseY = Math.floor((e.clientY - canvasBounds.top) / (canvasBounds.height / screenHeight));
  });

  document.addEventListener("pointerdown", (e) =>
  {
    uiState.mouseDown = true;
  });

  document.addEventListener("pointerup", (e) =>
  {
    uiState.mouseDown = false;
  })

  let then = 0;
  let delta = 0;
  let hue;
  let alpha = 255;
  let fade = createInterpolationData(0, 2000, 255, 0, Easing.EaseOutQuad);

  // @ifdef DEBUG
  let showFPS = true;
  // @endif
  function loop(now: number): void
  {
    // @ifdef DEBUG
    now = Math.round(now);
    // @endif

    delta = now - then;
    then = now;

    // Update
    let i = interp(now, fade);
    alpha = i._value;
    if (i._done)
    {
      fade._startTime = now;
      if (fade._origin === 255)
      {
        fade._origin = 0;
        fade._target = 255;
      }
      else
      {
        fade._origin = 255;
        fade._target = 0;
      }
    }

    // Render
    clear();

    for (let x = 0; x < screenWidth / 16; x++)
    {
      for (let y = 0; y < screenHeight / 16; y++)
      {
        hue = random(0, 55);
        pushQuad(x * 16, y * 16, 16, 16, colourToHex(255, hue, hue, hue));
      }
    }

    pushText("404", screenCenterX, screenCenterY - 20, { textAlign: Align.Center, scale: 5, colour: colourToHex(alpha, 255, 255, 255) });
    pushText("(c) 2020 David Brad", 0, screenHeight - 9);

    flush();
    // @ifdef DEBUG
    if (showFPS)
    {
      tickStats(delta, now, performance.now());
      flush();
    }
    // @endif
    requestAnimationFrame(loop);
  }

  await loadAsset("sheet");
  setClearColour(25, 25, 25);
  then = performance.now();
  fade._startTime = then;
  requestAnimationFrame(loop);
});