import { v2 } from "./types";

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