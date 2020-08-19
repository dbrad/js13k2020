import * as gl from "./gl.js";

import { TEXTURE_CACHE, Texture } from "./texture.js";

export function pushSprite(textureName: string, x: number, y: number, colour: number = 0xFFFFFFFF, sx: number = 1, sy: number = 1): void
{
  const t: Texture = TEXTURE_CACHE.get(textureName);
  // @ifdef DEBUG
  if (!t)
  {
    throw new Error(`No such texture as ${ textureName }`);
  }
  // @endif
  gl.translate(x, y);
  gl.push(t._atlas, 0, 0, t.w * sx, t.h * sy, t.u0, t.v0, t.u1, t.v1, colour);
}


export function pushQuad(x: number, y: number, w: number, h: number, colour: number = 0xFFFFFFFF): void
{
  const t: Texture = TEXTURE_CACHE.get("flat");
  // @ifdef DEBUG
  if (!t)
  {
    throw new Error(`No such texture as flat`);
  }
  // @endif
  gl.save();
  gl.translate(x, y);
  gl.push(t._atlas, 0, 0, w, h, t.u0, t.v0, t.u1, t.v1, colour);
  gl.restore();
}

export const enum Align
{
  Left,
  Center,
  Right
}

export type TextParams = {
  _colour?: number,
  _textAlign?: Align,
  _scale?: number,
  _wrap?: number
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

export function parseText(text: string, params: TextParams = { _colour: 0xFFFFFFFF, _textAlign: Align.Left, _scale: 1, _wrap: 0 }): number
{
  params._colour = params._colour || 0xFFFFFFFF;
  params._textAlign = params._textAlign || Align.Left;
  params._scale = params._scale || 1;
  params._wrap = params._wrap || 0;
  const letterSize: number = fontSize * params._scale;
  const allWords: string[] = text.split(" ");

  let lines: string[] = [];
  if (textCache.has(`${ text }_${ params._scale }_${ params._wrap }`))
  {
    lines = textCache.get(`${ text }_${ params._scale }_${ params._wrap }`);
  }

  if (lines.length === 0)
  {
    if (params._wrap === 0)
    {
      lines = [allWords.join(" ")];
    }
    else
    {
      let line: string[] = [];
      for (const word of allWords)
      {
        line.push(word);
        if (line.join(" ").length * letterSize >= params._wrap)
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
    textCache.set(`${ text }_${ params._scale }_${ params._wrap }`, lines);
  }
  return lines.length;
}

export function pushText(text: string, x: number, y: number, params: TextParams = { _colour: 0xFFFFFFFF, _textAlign: Align.Left, _scale: 1, _wrap: 0 }): number
{
  params._colour = params._colour || 0xFFFFFFFF;
  params._textAlign = params._textAlign || Align.Left;
  params._scale = params._scale || 1;
  params._wrap = params._wrap || 0;
  const letterSize: number = fontSize * params._scale;

  const orgx: number = x;
  let offx: number = 0;

  parseText(text, params);
  const lines: string[] = textCache.get(`${ text }_${ params._scale }_${ params._wrap }`);

  for (const line of lines)
  {
    const words: string[] = line.split(" ");
    const lineLength: number = line.length * letterSize;

    let alignmentOffset: number = 0;
    if (params._textAlign === Align.Center)
    {
      alignmentOffset = ~~((-lineLength + (1 * params._scale)) / 2);
    }
    else if (params._textAlign === Align.Right)
    {
      alignmentOffset = ~~-(lineLength - (1 * params._scale));
    }

    for (const word of words)
    {
      for (const letter of word.split(""))
      {
        const t: Texture = TEXTURE_CACHE.get(letter);
        x = orgx + offx + alignmentOffset;
        // @ifdef DEBUG
        if (!t)
        {
          throw new Error(`No such texture as ${ letter }`);
        }
        // @endif
        gl.save();
        gl.translate(x, y); // translate by the real x,y
        gl.scale(params._scale, params._scale); // scale up the matrix
        gl.push(t._atlas, 0, 0, t.w, t.h, t.u0, t.v0, t.u1, t.v1, params._colour);
        gl.restore();
        offx += letterSize;
      }
      offx += letterSize;
    }
    y += letterSize + params._scale * 2;
    offx = 0;
  }
  return lines.length;
}