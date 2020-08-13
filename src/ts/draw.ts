import * as gl from "./gl.js";

import { TEXTURE_CACHE, Texture } from "./texture.js";

export function pushSprite(textureName: string, x: number, y: number, colour: number = 0xFFFFFFFF, sx: number = 1, sy: number = 1): void
{
  const t: Texture = TEXTURE_CACHE.get(textureName);
  if (!t)
  {
    throw new Error(`No such texture as ${ textureName }`);
  }
  gl.save();
  gl.translate(x, y);
  gl.scale(sx, sy);
  gl.push(t.atlas, 0, 0, t.w, t.h, t.u0, t.v0, t.u1, t.v1, colour);
  gl.restore();
}


export function pushQuad(x: number, y: number, w: number, h: number, colour: number = 0xFFFFFFFF): void
{
  const t: Texture = TEXTURE_CACHE.get("flat");
  if (!t)
  {
    throw new Error(`No such texture as flat`);
  }
  gl.save();
  gl.translate(x, y);
  gl.scale(w, h);
  gl.push(t.atlas, 0, 0, t.w, t.h, t.u0, t.v0, t.u1, t.v1, colour);
  gl.restore();
}

export enum Align
{
  Left,
  Center,
  Right
}

export type TextParams = {
  colour?: number,
  textAlign?: Align,
  scale?: number,
  wrap?: number
};

const textCache: Map<string, string[]> = new Map();
const fontSize: number = 8;
export function textWidth(characterCount: number, scale: number): number
{
  return fontSize * scale * characterCount;
}

export function textHeight(lineCount: number, scale: number): number
{
  return (fontSize * scale + scale) * lineCount;
}

export function parseText(text: string, params: TextParams = { colour: 0xFFFFFFFF, textAlign: Align.Left, scale: 1, wrap: 0 }): number
{
  params.colour = params.colour || 0xFFFFFFFF;
  params.textAlign = params.textAlign || Align.Left;
  params.scale = params.scale || 1;
  params.wrap = params.wrap || 0;
  const letterSize: number = fontSize * params.scale;
  const allWords: string[] = text.split(" ");

  let lines: string[] = [];
  if (textCache.has(`${ text }_${ params.scale }_${ params.wrap }`))
  {
    lines = textCache.get(`${ text }_${ params.scale }_${ params.wrap }`);
  }

  if (lines.length === 0)
  {
    if (params.wrap === 0)
    {
      lines = [allWords.join(" ")];
    }
    else
    {
      let line: string[] = [];
      for (const word of allWords)
      {
        line.push(word);
        if (line.join(" ").length * letterSize >= params.wrap)
        {
          const lastWord: string = line.pop();
          lines.push(line.join(" "));
          line = [lastWord];
        }
      }
      if (line.length > 0)
      {
        lines.push(line.join(" "));
      }
    }
    textCache.set(`${ text }_${ params.scale }_${ params.wrap }`, lines);
  }
  return lines.length;
}

export function pushText(text: string, x: number, y: number, params: TextParams = { colour: 0xFFFFFFFF, textAlign: Align.Left, scale: 1, wrap: 0 }): number
{
  params.colour = params.colour || 0xFFFFFFFF;
  params.textAlign = params.textAlign || Align.Left;
  params.scale = params.scale || 1;
  params.wrap = params.wrap || 0;
  const letterSize: number = fontSize * params.scale;

  const orgx: number = x;
  let offx: number = 0;

  parseText(text, params);
  const lines: string[] = textCache.get(`${ text }_${ params.scale }_${ params.wrap }`);

  for (const line of lines)
  {
    const words: string[] = line.split(" ");
    const lineLength: number = line.length * letterSize;

    let alignmentOffset: number = 0;
    if (params.textAlign === Align.Center)
    {
      alignmentOffset = ~~((-lineLength + (1 * params.scale)) / 2);
    }
    else if (params.textAlign === Align.Right)
    {
      alignmentOffset = ~~-(lineLength - (1 * params.scale));
    }

    for (const word of words)
    {
      for (const letter of word.split(""))
      {
        const t: Texture = TEXTURE_CACHE.get(letter);
        x = orgx + offx + alignmentOffset;

        gl.save();
        gl.translate(x, y); // translate by the real x,y
        gl.scale(params.scale, params.scale); // scale up the matrix
        gl.push(t.atlas, 0, 0, t.w, t.h, t.u0, t.v0, t.u1, t.v1, params.colour);
        gl.restore();
        offx += letterSize;
      }
      offx += letterSize;
    }
    y += letterSize + params.scale * 2;
    offx = 0;
  }
  return lines.length;
}