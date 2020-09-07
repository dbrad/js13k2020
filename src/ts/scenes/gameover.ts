import { createNode, node_visible, node_size, nodeAbsolutePosition, renderNode } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { pushText, Align } from "../draw";

export let gameOverRootId = -1;
export function setupGameOver(): void
{
  gameOverRootId = createNode();
  node_visible[gameOverRootId] = false;
  node_size[gameOverRootId][0] = screenWidth;
  node_size[gameOverRootId][1] = screenHeight;
}

export function gameOverScreen(now: number, delta: number): void
{
  const RootX = nodeAbsolutePosition(gameOverRootId)[0];
  const RootY = nodeAbsolutePosition(gameOverRootId)[1];

  pushText("Game Over...", RootX + screenCenterX, RootY + screenCenterY, { _textAlign: Align.Center, _scale: 3 });

  // TODO(dbrad): win / lose text
  // TODO(dbrad): button back to menu

  renderNode(gameOverRootId);
}