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