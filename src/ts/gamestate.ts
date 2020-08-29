import { v2 } from "./v2";
import { EventCard, PlayerCard } from "./cards";
import { shuffle } from "./random";

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
export let playerDeck: PlayerCard[] = [];

export function newDecks(): void
{
  playerDeck = shuffle([
    PlayerCard.Food,
    PlayerCard.Food,
    PlayerCard.Food,
    PlayerCard.Water,
    PlayerCard.Water,
    PlayerCard.Water,
    PlayerCard.Oxygen,
    PlayerCard.Oxygen,
    PlayerCard.Oxygen,
  ]);

  eventDeck = shuffle([
    EventCard.Food,
    EventCard.Food,
    EventCard.Food,
    EventCard.Water,
    EventCard.Water,
    EventCard.Water,
    EventCard.Oxygen,
    EventCard.Oxygen,
    EventCard.Oxygen,
  ]);
}
export let playerHand: PlayerCard[] = [];
export let playerDiscard: PlayerCard[] = [];
export let inPlayCards: PlayerCard[] = [0, 0, 0, 0, 0, 0, 0];

export let eventDeck: number[] = [EventCard.Food, EventCard.Water];
export let eventsInPlay: EventCard[] = [0, 0, 0, 0, 0, 0];

export let energy: Uint8Array = new Uint8Array([0, 0, 0, 0, 0, 0]);

export function clearState(): void
{
  inPlayCards = [0, 0, 0, 0, 0, 0, 0];
  eventsInPlay = [0, 0, 0, 0, 0, 0];
  energy = new Uint8Array([0, 0, 0, 0, 0, 0]);
}