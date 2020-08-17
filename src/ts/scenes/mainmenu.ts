import { interp, createInterpolationData, Easing } from "../interpolate";
import { colourToHex } from "../util";
import { pushText, Align } from "../draw";
import { createScene, Scenes } from "../scene";
import { screenHeight, screenCenterX, screenCenterY } from "../screen";
import { renderNode } from "../node";

let alpha = 255;
let fade = createInterpolationData(0, 2000, 255, 0, Easing.EaseOutQuad);

export function setupMainMenu(): void
{
  const rootNodeId = createScene(
    Scenes.MainMenu,
    (now: number, delta: number) =>
    {
      let i = interp(now, fade);
      alpha = i._value;
      if (i._done)
      {
        fade._startTime = now;
        if (fade._origin === 255)
        {
          fade._origin = 0;
          fade._target = 255;
        }
        else
        {
          fade._origin = 255;
          fade._target = 0;
        }
      }
    },
    (now: number, delta: number) =>
    {
      renderNode(rootNodeId);
      pushText("404", screenCenterX, screenCenterY - 20, { textAlign: Align.Center, scale: 5, colour: colourToHex(alpha, 255, 255, 255) });
      pushText("(c) 2020 David Brad", 0, screenHeight - 9);
    });
}
