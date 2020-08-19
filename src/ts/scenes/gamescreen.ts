import { createNode, node_visible, node_size, moveNode, addChildNode, renderNode, node_tags, TAG, setNodeDraggable, node_movement, node_enabled, setNodeHoverable } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { pushText, Align, pushQuad } from "../draw";
import { playerHand, Input } from "../gamestate";
import { Easing } from "../interpolate";
import { createButton } from "../nodes/button";

export let gameScreenRootId = -1;
let playerCardIds: number[] = [];
let cardDeckSlotId = -1;
let playerCardSlotIds: number[] = [];

let playerDiceIds: number[] = [];
let playerDiceSlotIds: number[] = [];

let eventDeckSlotId = -1;
let eventCardSlotIds: number[] = [];
let eventCardIds: number[] = [];
export function setupGameScreen(): void
{
  gameScreenRootId = createNode();
  node_visible[gameScreenRootId] = false;
  node_size[gameScreenRootId][0] = screenWidth;
  node_size[gameScreenRootId][1] = screenHeight;

  //#region PLAYER CARDS
  // Deck, Hand, and Cards
  const playerHandId = createNode();
  node_visible[playerHandId] = false;
  node_size[playerHandId] = [416, 32];
  addChildNode(gameScreenRootId, playerHandId);
  moveNode(playerHandId, [16, 240]);

  cardDeckSlotId = createNode();
  node_visible[cardDeckSlotId] = false;
  node_size[cardDeckSlotId] = [32, 32];
  addChildNode(playerHandId, cardDeckSlotId);

  const playerDeckId = createNode();
  node_size[playerDeckId] = [32, 32];
  node_tags[playerDeckId] = TAG.PLAYER_DECK;
  addChildNode(playerHandId, playerDeckId);

  const playerDiscardPileId = createNode();
  node_size[playerDiscardPileId] = [32, 32];
  node_tags[playerDiscardPileId] = TAG.PLAYER_DISCARD;
  addChildNode(gameScreenRootId, playerDiscardPileId);
  moveNode(playerDiscardPileId, [464, 240])

  for (let i = 0; i < 8; i++)
  {
    const cardSlotId = createNode();
    node_visible[cardSlotId] = false;
    node_size[cardSlotId] = [32, 32];
    addChildNode(playerHandId, cardSlotId);
    playerCardSlotIds.push(cardSlotId);

    const cardId = createNode();
    node_size[cardId] = [32, 32];
    node_tags[cardId] = TAG.PLAYER_CARD;
    setNodeDraggable(cardId);
    addChildNode(cardDeckSlotId, cardId);
    playerCardIds.push(cardId);
  }
  //#endregion PLAYER CARDS

  //#region PLAYER DICE
  // Dice
  const diceTrayId = createNode();
  node_visible[diceTrayId] = false;
  node_size[diceTrayId] = [32, 192];
  addChildNode(gameScreenRootId, diceTrayId);
  moveNode(diceTrayId, [16, 16])

  for (let i = 0; i < 6; i++)
  {
    const diceSlotId = createNode();
    node_size[diceSlotId] = [32, 32];
    node_tags[diceSlotId] = TAG.DICE_SLOT;
    addChildNode(diceTrayId, diceSlotId);
    moveNode(diceSlotId, [0, 32 * i]);

    playerDiceSlotIds.push(diceSlotId);

    const diceId = createNode();
    node_size[diceId] = [32, 32];
    node_tags[diceId] = TAG.DICE;
    setNodeDraggable(diceId);
    addChildNode(diceSlotId, diceId);

    playerDiceIds.push(diceId);
  }
  //#endregion PLAYER DICE

  //#region EVENT CARDS
  const eventAreaId = createNode();
  node_visible[eventAreaId] = false;
  node_size[eventAreaId] = [432, 48];
  addChildNode(gameScreenRootId, eventAreaId);
  moveNode(eventAreaId, [64, 16]);

  eventDeckSlotId = createNode();
  node_visible[eventDeckSlotId] = false;
  node_size[eventDeckSlotId] = [48, 48];
  addChildNode(eventAreaId, eventDeckSlotId);
  moveNode(eventDeckSlotId, [384, 0]);

  const eventDeckId = createNode();
  node_size[eventDeckId] = [48, 48];
  node_tags[eventDeckId] = TAG.EVENT_DECK;
  addChildNode(eventAreaId, eventDeckId);
  moveNode(eventDeckId, [384, 0]);

  for (let i = 0; i < 6; i++)
  {
    const eventCardSlotId = createNode();
    node_size[eventCardSlotId] = [48, 48];
    node_tags[eventCardSlotId] = TAG.EVENT_SLOT;
    addChildNode(eventAreaId, eventCardSlotId);
    moveNode(eventCardSlotId, [320 - 64 * i, 0]);
    eventCardSlotIds.push(eventCardSlotId);

    const eventCardId = createNode();
    node_size[eventCardId] = [48, 48];
    node_tags[eventCardId] = TAG.EVENT_CARD;
    addChildNode(eventDeckSlotId, eventCardId);
    eventCardIds.push(eventCardId);
  }
  //#endregion EVENT CARDS

  //#region PLAY AREA
  for (let i = 0; i < 7; i++)
  {
    const playAreaSlotId = createNode();
    node_size[playAreaSlotId] = [48, 48];
    node_tags[playAreaSlotId] = TAG.PLAY_SLOT;
    addChildNode(gameScreenRootId, playAreaSlotId);
    moveNode(playAreaSlotId, [64 + 64 * i, 128])
  }
  //#endregion PLAY AREA

  let endTurnButton = createButton("End Turn", [96, 32], [400, 192]);
  addChildNode(gameScreenRootId, endTurnButton);
}

export function gameScreen(now: number, delta: number): void
{

  // Card Arrangement
  for (let cardId of playerCardIds)
  {
    if (Input._active !== cardId)
    {
      node_enabled[cardId] = false;
      addChildNode(cardDeckSlotId, cardId);
    }
  }
  let offsetX = 48;
  for (let handIndex = 0, len = playerHand.length; handIndex < len; handIndex++)
  {
    const cardId = playerCardIds[handIndex];
    const slotId = playerCardSlotIds[handIndex];

    node_enabled[cardId] = true;

    if (!node_movement.has(slotId) && Input._hot !== cardId)
    {
      node_size[slotId] = [32, 32];
      moveNode(slotId, [offsetX, 0], Easing.EaseOutQuad, 300);
    }

    if (Input._active !== cardId)
    {
      addChildNode(slotId, cardId);
      if (!node_movement.has(slotId) && Input._hot === cardId)
      {
        moveNode(slotId, [offsetX, -5], Easing.Bounce, 300);
      }
      offsetX += 48;
    }
  }

  pushText("Turn 0", 448, 88, { _textAlign: Align.Center, _scale: 2 });

  renderNode(gameScreenRootId);
}