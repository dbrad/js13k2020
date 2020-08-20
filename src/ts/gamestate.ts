import { v2 } from "./v2";

// @ifdef DEBUG
export let DEBUG: boolean = false;
export function toggleDEBUG(): void
{
  DEBUG = !DEBUG;
}
// @endif

export const Input = {
  _pointer: [0, 0] as v2,
  _dragOffset: [0, 0] as v2,
  _dragParent: 0,
  _mouseDown: false,
  _lastHot: 0,
  _hot: 0,
  _active: 0
}

export let playerDeck: number[] = [];
export let playerHand: number[] = [0, 0, 0, 0, 0, 0, 0];

// Dice Array
// Player Deck
// Player Hand
// Event Deck
// Event In-Play Area

export function requestFullscreen(): void
{
  if (document.fullscreenEnabled)
  {
    if (!document.fullscreenElement)
    {
      if (document.documentElement.requestFullscreen)
      {
        document.documentElement.requestFullscreen();
      }
      else if (document.documentElement.mozRequestFullScreen)
      {
        document.documentElement.mozRequestFullScreen();
      }
      else if (document.documentElement.webkitRequestFullscreen)
      {
        document.documentElement.webkitRequestFullscreen();
      }
      else if (document.documentElement.msRequestFullscreen)
      {
        document.documentElement.msRequestFullscreen();
      }
    }
  }
}