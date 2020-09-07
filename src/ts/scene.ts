import { mainMenuRootId } from "./scenes/mainmenu";
import { gameScreenRootId } from "./scenes/gamescreen";
import { gameOverRootId } from "./scenes/gameover";

export const enum Scenes
{
  MainMenu,
  Game,
  GameOver
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
    case Scenes.GameOver:
      return gameOverRootId;
    case Scenes.MainMenu:
    default:
      return mainMenuRootId;
  }
}