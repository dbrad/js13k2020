import { createNode, node_size } from "./node";
import { screenWidth, screenHeight } from "./screen";

export const enum Scenes
{
  MainMenu,
  Game
}

export type scene_update_fn = (now: number, delta: number) => void;
export type scene_render_fn = (now: number, delta: number) => void;
export const scene_root: number[] = [];
export const scene_update: scene_update_fn[] = [];
export const scene_render: scene_render_fn[] = [];

export let CurrentScene: Scenes = Scenes.MainMenu;

export function pushScene(scene: Scenes): void
{
  CurrentScene = scene;
}

export function createScene(scene: Scenes, updateFn: scene_update_fn, renderFn: scene_render_fn): number
{
  scene_update[scene] = updateFn;
  scene_render[scene] = renderFn;

  let rootId = createNode();
  scene_root[scene] = rootId;
  node_size[rootId][0] = screenWidth;
  node_size[rootId][1] = screenHeight;
  return rootId;
}