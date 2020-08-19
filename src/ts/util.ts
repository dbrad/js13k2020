import { Input } from "./gamestate";

export function random(min: number, max: number): number
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function colourToHex(a: number, b: number, g: number, r: number): number
{
  let out: number = 0x0;
  out = ((out | (a & 0xff)) << 8) >>> 0;
  out = ((out | (b & 0xff)) << 8) >>> 0;
  out = ((out | (g & 0xff)) << 8) >>> 0;
  out = ((out | (r & 0xff))) >>> 0;
  return out;
}

export function mouseInside(x: number, y: number, w: number, h: number)
{
  if (Input._pointer[0] < x || Input._pointer[1] < y || Input._pointer[0] >= x + w || Input._pointer[1] >= y + h)
  {
    return false;
  }
  return true;
}