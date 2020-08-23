import { createNode, node_visible, node_size, moveNode, addChildNode, renderNode, node_tags, TAG, setNodeDraggable, node_movement, node_enabled, setNodeHoverable, setNodeDropable, node_parent, node_droppable, node_children, node_scale, nodeAbsolutePosition, node_position, node_hoverable } from "../node";
import { screenWidth, screenHeight } from "../screen";
import { pushText, Align, pushSpriteAndSave } from "../draw";
import { playerHand, Input } from "../gamestate";
import { Easing } from "../interpolate";
import { createButton } from "../nodes/button";
import { subV2 } from "../v2";

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
  node_size[cardDeckSlotId] = [16, 16];
  node_scale[cardDeckSlotId] = 2;
  addChildNode(playerHandId, cardDeckSlotId);

  const playerDeckId = createNode();
  node_size[playerDeckId] = [16, 16];
  node_scale[playerDeckId] = 2;
  node_tags[playerDeckId] = TAG.PLAYER_DECK;
  addChildNode(playerHandId, playerDeckId);

  const playerDiscardPileId = createNode();
  node_size[playerDiscardPileId] = [16, 16];
  node_scale[playerDiscardPileId] = 2;
  node_tags[playerDiscardPileId] = TAG.PLAYER_DISCARD;
  addChildNode(gameScreenRootId, playerDiscardPileId);
  moveNode(playerDiscardPileId, [464, 240])

  for (let i = 0; i < 8; i++)
  {
    const cardSlotId = createNode();
    node_visible[cardSlotId] = false;
    node_size[cardSlotId] = [16, 16];
    node_scale[cardSlotId] = 2;
    addChildNode(playerHandId, cardSlotId);
    playerCardSlotIds.push(cardSlotId);

    const cardId = createNode();
    node_size[cardId] = [16, 16];
    node_scale[cardId] = 2;
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
    node_size[diceSlotId] = [16, 16];
    node_scale[diceSlotId] = 2;
    node_tags[diceSlotId] = TAG.DICE_SLOT;
    addChildNode(diceTrayId, diceSlotId);
    moveNode(diceSlotId, [0, 32 * i]);

    playerDiceSlotIds.push(diceSlotId);

    const diceId = createNode();
    node_size[diceId] = [16, 16];
    node_scale[diceId] = 2;
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
  node_size[eventDeckSlotId] = [16, 16];
  node_scale[eventDeckSlotId] = 3;
  addChildNode(eventAreaId, eventDeckSlotId);
  moveNode(eventDeckSlotId, [384, 0]);

  const eventDeckId = createNode();
  node_size[eventDeckId] = [16, 16];
  node_scale[eventDeckId] = 3;
  node_tags[eventDeckId] = TAG.EVENT_DECK;
  addChildNode(eventAreaId, eventDeckId);
  moveNode(eventDeckId, [384, 0]);

  for (let i = 0; i < 6; i++)
  {
    const eventCardSlotId = createNode();
    node_size[eventCardSlotId] = [16, 16];
    node_scale[eventCardSlotId] = 3;
    node_tags[eventCardSlotId] = TAG.EVENT_SLOT;
    addChildNode(eventAreaId, eventCardSlotId);
    moveNode(eventCardSlotId, [320 - 64 * i, 0]);
    eventCardSlotIds.push(eventCardSlotId);

    const eventCardId = createNode();
    node_size[eventCardId] = [16, 16];
    node_scale[eventCardId] = 3;
    node_tags[eventCardId] = TAG.EVENT_CARD;
    addChildNode(eventDeckSlotId, eventCardId);
    eventCardIds.push(eventCardId);
  }
  //#endregion EVENT CARDS

  //#region PLAY AREA
  for (let i = 0; i < 7; i++)
  {
    const inPlaySlotId = createNode();
    node_size[inPlaySlotId] = [16, 16];
    node_scale[inPlaySlotId] = 3;
    node_tags[inPlaySlotId] = TAG.IN_PLAY_SLOT;
    setNodeDropable(inPlaySlotId);
    addChildNode(gameScreenRootId, inPlaySlotId);
    moveNode(inPlaySlotId, [64 + 64 * i, 128])

    const inPlayCardId = createNode();
    node_enabled[inPlayCardId] = false;
    node_size[inPlayCardId] = [16, 16];
    node_scale[inPlayCardId] = 3;
    node_tags[inPlayCardId] = TAG.IN_PLAY_CARD;
    setNodeDropable(inPlayCardId);
    addChildNode(inPlaySlotId, inPlayCardId);
  }
  //#endregion PLAY AREA

  let endTurnButton = createButton("End Turn", [96, 32], [400, 192]);
  addChildNode(gameScreenRootId, endTurnButton);
}

export function gameScreen(now: number, delta: number): void
{
  for (let emptyIdx = playerHand.length; emptyIdx < playerCardSlotIds.length; emptyIdx++)
  {
    const cardId = playerCardIds[emptyIdx];
    const slotId = playerCardSlotIds[emptyIdx];
    node_enabled[cardId] = false;
    if (node_parent[cardId] !== slotId)
    {
      addChildNode(slotId, cardId);
    }
    moveNode(slotId, [0, 0]);
    moveNode(cardId, [0, 0]);
  }

  let offsetX = 48;
  for (let handIndex = 0, len = playerHand.length; handIndex < len; handIndex++)
  {
    const cardId = playerCardIds[handIndex];
    const slotId = playerCardSlotIds[handIndex];

    if (node_droppable.get(node_parent[cardId])) { continue; }

    node_enabled[cardId] = true;
    setNodeDraggable(cardId, true);

    if (Input._active === cardId)
    {
      moveNode(slotId, [offsetX, 0]);
    }
    else
    {
      if (node_parent[cardId] !== slotId)
      {
        addChildNode(slotId, cardId);
        moveNode(cardId, [0, 0]);
      }

      if (!node_movement.has(slotId) && !node_movement.has(cardId))
      {
        if (Input._hot === cardId)
        {
          moveNode(slotId, [offsetX, -10], Easing.EaseOutQuad, 160);
        }
        else
        {
          moveNode(slotId, [offsetX, 0], Easing.EaseOutQuad, 160);
        }
      }
      offsetX += 48;
    }
  }

  // Iterate droppables
  for (let [droppableId, droppable] of node_droppable)
  {
    if (!droppable) { continue; }
    // Play Slot Drop
    if (node_tags[droppableId] === TAG.IN_PLAY_SLOT)
    {
      if (node_children[droppableId].length > 1)
      {
        let inPlayCardId = -1;
        let handCardId = -1;
        for (let childId of node_children[droppableId])
        {
          if (node_tags[childId] === TAG.IN_PLAY_CARD)
          {
            inPlayCardId = childId;
          }
          else if (node_tags[childId] === TAG.PLAYER_CARD)
          {
            handCardId = childId;
          }
        }
        node_scale[inPlayCardId] = 2;
        node_enabled[inPlayCardId] = true;
        node_droppable.set(droppableId, false);
        moveNode(inPlayCardId, node_position[handCardId]);

        let idx = -1;
        for (let i = 0; i < playerCardIds.length; i++)
        {
          if (playerCardIds[i] === handCardId)
          {
            idx = i;
            break;
          }
        }
        playerHand.splice(idx, 1);



        for (let handIndex = idx, len = playerHand.length;
          handIndex < len;
          handIndex++)
        {
          const cardId = playerCardIds[handIndex];
          const slotId = playerCardSlotIds[handIndex];
          const slotPos = node_position[slotId];
          addChildNode(slotId, cardId);
          if (handIndex > idx)
          {
            moveNode(slotId, [slotPos[0] + 48, 0]);
          }
          moveNode(cardId, [0, 0]);
        }

        setNodeDraggable(handCardId, false);

        Input._hot = 0;
        Input._lastHot = 0;
        Input._active = 0;

        moveNode(inPlayCardId, [0, 0], Easing.EaseOutQuad, 150)
          .then(() =>
          {
            node_scale[inPlayCardId] = 3;
          });
      }
    }
    else if (node_tags[droppableId] === TAG.IN_PLAY_CARD)
    {
      if (node_children[droppableId].length > 0)
      {
        console.log("DROPPED DICE");
      }
    }
  }

  pushText("Turn 0", 448, 88, { _textAlign: Align.Center, _scale: 2 });

  pushSpriteAndSave("food", 64, 68 + 16);
  pushText("0", 80, 68 + 16);

  pushSpriteAndSave("water", 64, 68 + 32);
  pushText("0", 80, 68 + 32);

  pushSpriteAndSave("o2", 64 + 64, 68 + 16);
  pushText("0", 80 + 64, 68 + 16);

  pushSpriteAndSave("mat", 64 + 64, 68 + 32);
  pushText("0", 80 + 64, 68 + 32);

  renderNode(gameScreenRootId);
}