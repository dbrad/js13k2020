import { mainMenuRootId } from "./scenes/mainmenu";
import { gameScreenRootId } from "./scenes/gamescreen";

export const enum Scenes
{
  MainMenu,
  Game
}

export let CurrentScene: Scenes = Scenes.MainMenu;

export function pushScene(scene: Scenes): void
{
  CurrentScene = scene;
}

export function getSceneRoot(scene: Scenes): number 
{
  switch (scene)
  {
    case Scenes.Game:
      return gameScreenRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}