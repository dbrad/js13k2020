import { createNode, setNodeClickable, node_tags, moveNode, node_size, TAG, node_scale } from "../node";
import { v2 } from "../v2";
export function createFullscreenButton(pos: v2): number
{
  const nodeId = createNode();
  node_size[nodeId] = [8, 8];
  node_scale[nodeId] = 2;
  moveNode(nodeId, pos);
  setNodeClickable(nodeId);
  node_tags[nodeId] = TAG.FULLSCREEN;
  return nodeId;
}