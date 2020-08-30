import { eventsInPlay, eventDeck, playerDeck, playerHand, playerDiscard, Resources, playerResources } from "./gamestate";
import { shuffle } from "./random";

enum CardType
{
  Generator,
  Penalty,
  Boon,
  Peril,
  Quest
}

type CardData = {
  _name: string,
  _art: string,
  _type: CardType,
  _ongoing?: () => void
  _effect: (energy?: number) => void,
  _condition?: () => boolean
}

const _FOOD: string = "Food";
const _OXYGEN = "O2";
const _WATER = "Water";
const _MATERIALS = "Materials";
const _HULL_BREACH = "Hull Breach";
const _BOOST_SIGNAL = "Boost Signal";

const art_food = "food";
const art_water = "water";
const art_o2 = "o2";
const art_mat = "mat";
const art_skull = "skull";
const art_quest = "!";

//#region Player Cards
export const enum PlayerCard
{
  None,
  Food,
  Oxygen,
  Water
}

export const PlayerCards: Map<PlayerCard, CardData> = new Map([
  [PlayerCard.Food, {
    _name: _FOOD,
    _art: art_food,
    _type: CardType.Generator,
    _effect: (value: number) => { gain(Resources.Food, value) }
  }],
  [PlayerCard.Oxygen, {
    _name: _OXYGEN,
    _art: art_o2,
    _type: CardType.Generator,
    _effect: (value: number) => { gain(Resources.O2, value) }
  }],
  [PlayerCard.Water, {
    _name: _WATER,
    _art: art_water,
    _type: CardType.Generator,
    _effect: (value: number) => { gain(Resources.Water, value) }
  }],
]);

export function drawCard(): void
{
  if (playerDeck.length === 0) { reshuffle(); }
  if (playerDeck.length === 0) { return; }
  if (playerHand.length >= 8) { return; }
  let cardId = playerDeck.pop();
  playerHand.push(cardId);
}

export function discardCard(index: number): void
{
  const cardId = playerHand.splice(index, 1);
  playerDiscard.push(...cardId);
}

export function reshuffle(): void
{
  let cards = [...playerDiscard];
  playerDiscard.length = 0;
  cards = shuffle(cards);
  playerDeck.unshift(...cards);
}
//#endregion Player Cards

//#region Event Cards
export const enum EventCard
{
  None,
  Food,
  Oxygen,
  Water,
  Materials,
  HullBreach,
  BoostSignal
}

export const EventCards: Map<EventCard, CardData> = new Map([
  [EventCard.Food, {
    _name: _FOOD,
    _art: art_food,
    _type: CardType.Boon,
    _effect: (value: number) => { gain(Resources.Food, value) }
  }],
  [EventCard.Oxygen, {
    _name: _OXYGEN,
    _art: art_o2,
    _type: CardType.Boon,
    _effect: (value: number) => { gain(Resources.O2, value) }
  }],
  [EventCard.Water, {
    _name: _WATER,
    _art: art_water,
    _type: CardType.Boon,
    _effect: (value: number) => { gain(Resources.Water, value) }
  }],
  [EventCard.Materials, {
    _name: _MATERIALS,
    _art: art_mat,
    _type: CardType.Boon,
    _effect: (value: number) => { gain(Resources.Materials, value) }
  }],
  [EventCard.HullBreach, {
    _name: _HULL_BREACH,
    _art: art_skull,
    _type: CardType.Peril,
    _effect: (value: number) => { gain(Resources.Food, value) }
  }],
  [EventCard.BoostSignal, {
    _name: _BOOST_SIGNAL,
    _art: art_quest,
    _type: CardType.Quest,
    _effect: (value: number) => { gain(Resources.Food, value) }
  }],
]);

export function drawEvent(): void
{
  eventsInPlay[5] = eventsInPlay[4];
  eventsInPlay[4] = eventsInPlay[3];
  eventsInPlay[3] = eventsInPlay[2];
  eventsInPlay[2] = eventsInPlay[1];
  eventsInPlay[1] = eventsInPlay[0];
  if (eventDeck.length === 0) { eventsInPlay[0] = EventCard.None; return; }
  eventsInPlay[0] = eventDeck.pop();
}

export function getEventCard(idx: number)
{
  if (idx < 0) { return null; }
  return EventCards.get(eventsInPlay[idx]);
}
//#endregion Event Cards

export function gain(res: Resources, amount: number = 1): void
{
  playerResources[res] += amount;
}

export function lose(res: Resources, amount: number = 1): void
{
  playerResources[res] -= amount;
  playerResources[res] = Math.max(playerResources[res], 0);
}

export function boost(final: boolean): void
{

}