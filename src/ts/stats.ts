// @ifdef DEBUG
import { Align, pushQuad, pushText } from "./draw";

let frameCount: number = 0;
let fps: number = 60;
let lastFps: number = 0;
let ms: number = 1000 / fps;
let frameTime = 0;

let displayFps = "00.00 hz";
let displayMs = "00.00 ms";
let displayFrameTime = "0.00 ms";

export function tickStats(delta: number, beginTime: number, endTime: number): void
{
    ms = (0.9 * delta) + (0.1 * ms);
    frameTime = (0.9 * (endTime - beginTime)) + (0.1 * frameTime);

    if (ms > 99)
    {
        ms = 0;
        frameTime = 0;
    }
    if (beginTime >= lastFps + 1000)
    {
        fps = 0.9 * frameCount * 1000 / (beginTime - lastFps) + 0.1 * fps;
        displayFps = `${ fps.toFixed((2)) } hz`;
        displayMs = `${ ms.toFixed(2) } ms`;
        displayFrameTime = `${ frameTime.toFixed(2) } ms`;;

        lastFps = beginTime - (delta % 1000 / 60);
        frameCount = 0;
    }
    frameCount++;

    pushQuad(0, 0, 65, 29, 0x88333333);
    pushText(displayFps, 64, 0, { textAlign: Align.Right });
    pushText(displayMs, 64, 10, { textAlign: Align.Right });
    pushText(displayFrameTime, 64, 20, { textAlign: Align.Right });
}
// @endif