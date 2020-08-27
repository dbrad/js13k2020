import { v2 } from "./v2";
import { EventCard, PlayerCard } from "./cards";

// @ifdef DEBUG
export let DEBUG: boolean = false;
export function toggleDEBUG(): void
{
  DEBUG = !DEBUG;
}
// @endif

export const Input = {
  _enabled: true,
  _pointer: [0, 0] as v2,
  _dragOffset: [0, 0] as v2,
  _dragParent: 0,
  _mouseDown: false,
  _lastHot: 0,
  _hot: 0,
  _active: 0
}

export const enum Resources
{
  Food,
  Water,
  O2,
  Materials
}

export const playerResources: number[] = [5, 10, 3, 0];
export let playerDeck: PlayerCard[] = [PlayerCard.Water, PlayerCard.Oxygen, PlayerCard.Food];
export let playerHand: PlayerCard[] = [];
export let playerDiscard: PlayerCard[] = [];
export let inPlayCards: PlayerCard[] = [0, 0, 0, 0, 0, 0, 0];

export let eventDeck: number[] = [EventCard.Food, EventCard.Water];
export let eventsInPlay: EventCard[] = [EventCard.None, EventCard.None, EventCard.None, EventCard.None, EventCard.None, EventCard.None];

export let energy: Uint8Array = new Uint8Array([0, 0, 0, 0, 0, 0]);