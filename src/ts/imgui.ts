import { Input } from "./state";
import { node_position, node_size } from "./node";

export function mouseInside(x: number, y: number, w: number, h: number)
{
  if (Input.Pointer[0] < x || Input.Pointer[1] < y || Input.Pointer[0] >= x + w || Input.Pointer[1] >= y + h)
  {
    return false;
  }
  return true;
}

export function imguiStart()
{
  Input.Hot = 0;
}

export function imguiEnd()
{

  if (!Input.MouseDown)
  {
    Input.Active = 0;
  }
  else
  {
    if (Input.Active === 0)
    {
      Input.Active = -1;
    }
  }
}

export function active(id: number, pos: v2, size: v2)
{
  if (Input.Hot > 0)
  {
    return false;
  }

  let x = node_position[id][0];
  let y = node_position[id][1];
  let w = node_size[id][0];
  let h = node_size[id][0];

  if (mouseInside(x, y, w, h))
  {
    Input.Hot = id;
    if (Input.Active === 0 && Input.MouseDown)
    {
      Input.Active = id;
    }
  }

  // backdrop
  // pushQuad(x + 2, y + 2, w, h, 0xFF000000);
  if (Input.Hot === id)
  {
    if (Input.Active === id)
    {
      // Active and Hot (Clicked)
      // pushQuad(x, y, w, h, 0xFFEEEEEE);
    }
    else
    {
      // Hot (Hover)
      // pushQuad(x, y, w, h, 0xFFEEEEEE);
    }
  }
  else
  {
    // Default
    // pushQuad(x, y, w, h, 0xFFAAAAAA);
  }

  // pushText(text, x + 5, y + 5, { colour: 0xFF000000 });

  if (Input.MouseDown && Input.Hot === id && Input.Active === id)
  {
    return true;
  }
  return false;
}