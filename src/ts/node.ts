import * as gl from "./gl.js";
import { v2 } from "./types";
import { DEBUG, Input } from "./state";
import { pushQuad, pushSprite } from "./draw";
import { mouseInside } from "./imgui.js";

export const node_position: v2[] = [];
export const node_size: v2[] = [];
export const node_enabled: boolean[] = [];
export const node_draggable: boolean[] = [];
export const node_clickable: boolean[] = [];
export const node_hoverable: boolean[] = [];
export const node_update: boolean[] = [];
export const node_render: boolean[] = [];
export const node_children: number[][] = [];

let nextNodeId = 1;

export function createNode(): number
{
  let id = nextNodeId++;
  node_position[id] = [0, 0];
  node_size[id] = [16, 16];
  node_enabled[id] = true;
  node_clickable[id] = false;
  node_hoverable[id] = false;
  node_children[id] = [];
  return id;
}

export function addChildNode(parentId: number, childId: number): void
{
  node_children[parentId].push(childId);
}

export function updateNode(nodeId: number): void
{
  if (node_enabled[nodeId])
  {
    let pos = node_position[nodeId];
    let size = node_size[nodeId];

    if (node_hoverable[nodeId]
      && Input.Hot <= 0
      && mouseInside(pos[0], pos[1], size[0], size[1]))
    {
      Input.Hot = nodeId;
    }

    if (node_clickable[nodeId]
      && Input.Active === 0
      && Input.Hot === nodeId
      && Input.MouseDown)
    {
      Input.Active = nodeId;
    }

    for (let childId of node_children[nodeId])
    {
      updateNode(childId);
    }
  }
}

export function renderNode(nodeId: number): void
{
  if (node_enabled[nodeId])
  {
    let pos = node_position[nodeId];
    let size = node_size[nodeId];
    gl.save();

    if (node_render[nodeId])
    {
      pushSprite(".", pos[0], pos[1], 0x55FFFFFF, 2, 2);
    }

    // @ifdef DEBUG
    if (DEBUG)
    {
      pushQuad(0, 0, 1, size[1], 0xFF00ff00);
      pushQuad(0, 0, size[0], 1, 0xFF00ff00);
      pushQuad(size[0] - 1, 0, 1, size[1], 0xFF00ff00);
      pushQuad(0, size[1] - 1, size[0], 1, 0xFF00ff00);
    }
    // @endif

    if (node_hoverable[nodeId] && Input.Hot === nodeId)
    {
      pushQuad(0, 0, 1, size[1], 0xFF00ffFF);
      pushQuad(0, 0, size[0], 1, 0xFF00ffFF);
      pushQuad(size[0] - 1, 0, 1, size[1], 0xFF00ffFF);
      pushQuad(0, size[1] - 1, size[0], 1, 0xFF00ffFF);
    }

    for (let childId of node_children[nodeId])
    {
      renderNode(childId);
    }
    gl.restore();
  }
}