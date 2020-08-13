import { clear, flush, initGL, setClearColour } from "./gl";

import { loadAsset } from "./asset";
import { pushQuad } from "./draw";
// @ifdef DEBUG
import { tickStats } from "./stats";
// @endif

const screenWidth = 512;
const screenHeight = 288;

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

  let then = 0;
  let delta = 0;
  function loop(now: number): void
  {
    requestAnimationFrame(loop);
    // @ifdef DEBUG
    now = Math.round(now);
    // @endif

    delta = now - then;
    then = now;
    clear();

    // @ifdef DEBUG
    for (let x = 0; x < screenWidth / 16; x++)
    {
      for (let y = 0; y < screenHeight / 16; y++)
      {
        pushQuad(x * 16, y * 16, 16, 16, colourToHex(255, random(100, 255), random(0, 125), random(0, 125)));
      }
    }
    // @endif

    flush();
    // @ifdef DEBUG
    tickStats(delta, now, performance.now());
    flush();
    // @endif
  }

  await loadAsset("sheet");
  setClearColour(25, 25, 25);
  then = performance.now();
  requestAnimationFrame(loop);
});