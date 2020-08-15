import { pushQuad, pushText, textWidth, textHeight } from "./draw";

export const uiState = {
  mouseX: 0,
  mouseY: 0,
  mouseDown: false,

  hot: 0,
  active: 0,
};

export function mouseInside(x: number, y: number, w: number, h: number)
{
  if (uiState.mouseX < x || uiState.mouseY < y || uiState.mouseX >= x + w || uiState.mouseY >= y + h)
  {
    return false;
  }
  return true;
}

export function imguiStart()
{
  uiState.hot = 0;
}

export function imguiEnd()
{

  if (!uiState.mouseDown)
  {
    uiState.active = 0;
  }
  else
  {
    if (uiState.active === 0)
    {
      uiState.active = -1;
    }
  }
}

export function button(id: number, text: string, x: number, y: number)
{
  let textW = textWidth(text.length, 1);
  let textH = textHeight(1, 1);

  let buttonW = textW + 10;
  let buttonH = textH + 10;

  if (mouseInside(x, y, buttonW, buttonH))
  {
    uiState.hot = id;
    if (uiState.active === 0 && uiState.mouseDown)
    {
      uiState.active = id;
    }
  }

  // backdrop
  pushQuad(x + 2, y + 2, buttonW, buttonH, 0xFF000000);
  if (uiState.hot == id)
  {
    if (uiState.active == id)
    {
      // active and hot
      x += 2;
      y += 2;
      pushQuad(x, y, buttonW, buttonH, 0xFFEEEEEE);
    }
    else
    {
      // hot
      pushQuad(x, y, buttonW, buttonH, 0xFFEEEEEE);
    }
  }
  else
  {
    // default
    pushQuad(x, y, buttonW, buttonH, 0xFFAAAAAA);
  }

  pushText(text, x + 5, y + 5, { colour: 0xFF000000 });

  if (uiState.mouseDown && uiState.hot === id && uiState.active === id)
  {
    return true;
  }
  return false;
}