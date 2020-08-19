import { createNode, setNodeClickable, node_tags, moveNode, node_size, TAG, node_button_text } from "../node";
import { v2 } from "../v2";

export function createButton(text: string, size: v2, pos: v2): number
{
  const nodeId = createNode();
  node_size[nodeId] = size;
  moveNode(nodeId, pos);
  setNodeClickable(nodeId);
  node_tags[nodeId] = TAG.BUTTON;
  node_button_text.set(nodeId, text);
  return nodeId;
}