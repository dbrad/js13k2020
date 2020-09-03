import { assert, DEBUG } from "./debug";

import * as gl from "./gl.js";
import { v2, subV2 } from "./v2";
import { Input } from "./gamestate";
import { pushQuad, parseText, Align, pushText, pushSprite, pushSpriteAndSave } from "./draw";
import { mouseInside, white } from "./util.js";
import { Easing, InterpolationData, createInterpolationData } from "./interpolate";
import { buttonClick, buttonHover } from "./zzfx";

export const enum TAG
{
  BUTTON,
  DICE,
  DICE_SLOT,
  QUEST_AREA,
  QUEST_CARD,
  QUEST_SLOT,
  CREW_CARD,
  CREW_SLOT
}

export const node_position: v2[] = [];
export const node_abs_position: v2[] = [];
export const node_movement: Map<number, InterpolationData> = new Map();
export const node_size: v2[] = [];
export const node_scale: number[] = [];
export const node_enabled: boolean[] = [];

export const node_tags: TAG[] = [];

export const node_ref_index: Map<number, number> = new Map();
export const node_home: Map<number, number> = new Map();

export const node_draggable: Map<number, boolean> = new Map();
export const node_droppable: Map<number, boolean> = new Map();
export const node_clickable: Map<number, boolean> = new Map();
export const node_hoverable: Map<number, boolean> = new Map();

export const node_button_text: Map<number, string> = new Map();

export const node_visible: boolean[] = [];

export const node_parent: number[] = [0];
export const node_children: number[][] = [[]];

let nextNodeId = 1;

export function createNode(): number
{
  let id = nextNodeId++;

  node_children[id] = [];
  node_parent[id] = 0;
  node_children[0].push(id);

  node_size[id] = [16, 16];
  node_scale[id] = 1;
  node_position[id] = [0, 0];

  node_enabled[id] = true;
  node_visible[id] = true;

  return id;
}

export function addChildNode(parentId: number, childId: number): void
{
  // get the list of the current parent's child node
  const arr = node_children[node_parent[childId]];
  let index = -1
  for (let i = 0; i < arr.length; i++)
  {
    // find this node in the parent's child list
    if (arr[i] === childId)
    {
      index = i;
      break;
    }
  }

  assert(index !== -1, `[${ childId }] This node was not present in its parrent's child list [${ parentId }]`)
  // Remove this node from that list
  if (index > -1)
  {
    arr.splice(index, 1);
  }

  // set this node's parent to the new parent Id
  node_parent[childId] = parentId;

  // add this node to that parent node's child list
  node_children[parentId].push(childId);
}

export function moveNode(nodeId: number, pos: v2, ease: Easing = Easing.None, duration: number = 0): Promise<void>
{
  if (node_position[nodeId][0] === pos[0]
    && node_position[nodeId][1] === pos[1])
  {
    return Promise.resolve();
  }
  if (ease !== Easing.None
    && !node_movement.has(nodeId)
    && duration > 0)
  {
    return new Promise((resolve, reject) =>
    {
      node_movement.set(nodeId, createInterpolationData(duration, node_position[nodeId], pos, ease, resolve));
    });
  }
  node_position[nodeId][0] = pos[0];
  node_position[nodeId][1] = pos[1];
  node_abs_position[nodeId] = nodeAbsolutePosition(nodeId, true);
  return Promise.resolve();
}

export function nodeSize(nodeId: number): v2
{
  const size = node_size[nodeId];
  const scale = node_scale[nodeId];
  return [size[0] * scale, size[1] * scale];
}

export function nodeAbsolutePosition(nodeId: number, refresh: boolean = false): v2
{
  if (node_abs_position[nodeId] && !refresh)
  {
    return node_abs_position[nodeId];
  }
  let result: v2 = [...node_position[nodeId]];
  nodeId = node_parent[nodeId];
  while (nodeId !== 0)
  {
    result[0] += node_position[nodeId][0];
    result[1] += node_position[nodeId][1];
    nodeId = node_parent[nodeId];
  }
  node_abs_position[nodeId] = result;
  return result;
}

function nodesUnderPoint(nodeId: number, point: v2): number[]
{
  let pos = nodeAbsolutePosition(nodeId);
  let size = nodeSize(nodeId);
  let result: number[] = [];

  if (mouseInside(pos[0], pos[1], size[0], size[1]))
  {
    result.push(nodeId);
    for (let childId of node_children[nodeId])
    {
      result.push(...nodesUnderPoint(childId, point));
    }
  }
  return result;
}

export function setNodeDroppable(nodeId: number, val: boolean = true): void
{
  node_droppable.set(nodeId, val);
}

export function setNodeDraggable(nodeId: number, val: boolean = true): void
{
  node_draggable.set(nodeId, val);
  node_clickable.set(nodeId, val);
  node_hoverable.set(nodeId, val);
}

export function setNodeClickable(nodeId: number, val: boolean = true): void
{
  node_clickable.set(nodeId, val);
  node_hoverable.set(nodeId, val);
}

export function setNodeHoverable(nodeId: number, val: boolean = true): void
{
  node_hoverable.set(nodeId, val);
}

export function nodeInput(nodeId: number, rootId: number = nodeId): void
{
  if (node_enabled[nodeId])
  {
    let pos = nodeAbsolutePosition(nodeId, true);
    const size = nodeSize(nodeId);

    if (Input._active > 0)
    {
      Input._hot = Input._active;
    }

    // Hover
    if (node_hoverable.get(nodeId)
      && Input._hot <= 0
      && mouseInside(pos[0], pos[1], size[0], size[1])
      && !node_movement.has(nodeId))
    {
      Input._hot = nodeId;
    }

    // Mouse Down
    if (node_clickable.get(nodeId)
      && Input._active === 0
      && Input._hot === nodeId
      && Input._mouseDown)
    {
      Input._active = nodeId;
      if (node_draggable.get(nodeId))
      {
        Input._dragOffset = subV2(Input._pointer, pos);
        Input._dragParent = node_parent[nodeId];
      }
    }

    // Drag
    if (Input._active === nodeId
      && node_draggable.get(nodeId)
      && !node_movement.has(nodeId))
    {
      if (node_parent[nodeId] !== rootId)
      {
        addChildNode(rootId, nodeId);
      }

      moveNode(nodeId, subV2(Input._pointer, Input._dragOffset));
    }

    // Mouse Up
    if (Input._active === nodeId && !Input._mouseDown)
    {
      // If this node is draggable
      if (node_draggable.get(nodeId))
      {
        // Attempt to drop
        // Look for nodes under the mouse right now
        let targetIds = nodesUnderPoint(rootId, Input._pointer);
        let dropped = false;
        for (const targetId of targetIds)
        {
          // Check if the target is enabled, and droppable
          if (node_enabled[targetId] && node_droppable.get(targetId))
          {
            pos = nodeAbsolutePosition(nodeId);
            addChildNode(targetId, nodeId);
            moveNode(nodeId, subV2(pos, nodeAbsolutePosition(targetId)));
            dropped = true;
            break;
          }
        }
        // If we didn't find a drop target, send it back to where it came from.
        if (!dropped)
        {
          pos = nodeAbsolutePosition(nodeId);
          addChildNode(Input._dragParent, nodeId);
          moveNode(nodeId, subV2(pos, nodeAbsolutePosition(Input._dragParent)));
          moveNode(nodeId, [0, 0], Easing.EaseOutQuad, 250);
        }
      }
      Input._active = 0;
      Input._dragOffset[0] = 0;
      Input._dragOffset[1] = 0;
      Input._dragParent = 0;
    }

    for (let childId of node_children[nodeId])
    {
      nodeInput(childId, rootId);
    }
  }
}

export function renderNode(nodeId: number): void
{
  if (node_enabled[nodeId])
  {
    const pos = node_position[nodeId];
    const size = nodeSize(nodeId);
    const scale = node_scale[nodeId];
    gl.save();

    if (node_visible[nodeId])
    {
      switch (node_tags[nodeId])
      {
        case TAG.CREW_CARD:
          gl.translate(pos[0], pos[1]);
          pushSpriteAndSave("t1", size[0] / 4, size[0] / 4, white, scale, scale);
          pushSprite("card", 0, 0, 0xFF33FF33, scale, scale);
          break;
        case TAG.DICE:
          pushSprite(`d1`, pos[0], pos[1], white, scale, scale);
          break;
        case TAG.QUEST_SLOT:
        case TAG.CREW_SLOT:
          pushSprite(`cs`, pos[0], pos[1], white, scale, scale);
          break;
        case TAG.DICE_SLOT:
          pushSprite(`ds`, pos[0], pos[1], white, scale, scale);
          break;
        case TAG.BUTTON:
          //#region Render Button
          if (Input._active === nodeId)
          {
            pushQuad(pos[0], pos[1], size[0], size[1], 0xFF111111);
            buttonClick();

          }
          else if (Input._hot === nodeId)
          {
            pushQuad(pos[0], pos[1], size[0], size[1], white);
            if (Input._lastHot !== nodeId)
            {
              buttonHover();
            }
          }
          else
          {
            pushQuad(pos[0], pos[1], size[0], size[1], 0xFFAAAAAA);

          }
          pushQuad(pos[0] + 1, pos[1] + 1, size[0] - 2, size[1] - 2, 0xFF2d2d2d);
          gl.translate(pos[0], pos[1]);
          const lineCount = parseText(node_button_text.get(nodeId), { _textAlign: Align.Center, _wrap: size[0] - 2 });
          pushText(node_button_text.get(nodeId),
            size[0] / 2, size[1] / 2 - (lineCount * 8 / 2),
            { _textAlign: Align.Center, _wrap: size[0] - 2 });
          //#endregion Render Button
          break;
        default:
          gl.translate(pos[0], pos[1]);
      }
    }
    else
    {
      gl.translate(pos[0], pos[1]);
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

    for (let childId of node_children[nodeId])
    {
      renderNode(childId);
    }
    gl.restore();
  }
}