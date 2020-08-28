import { createNode, node_visible, node_size, moveNode, addChildNode, renderNode, node_tags, TAG, setNodeDraggable, node_movement, node_enabled, setNodeHoverable, setNodeDropable, node_parent, node_droppable, node_children, node_scale, node_position, node_index, setNodeClickable, node_draggable } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { pushText, Align, pushSpriteAndSave, pushQuad, textWidth } from "../draw";
import { playerHand, Input, energy, eventsInPlay, playerResources, Resources, inPlayCards } from "../gamestate";
import { Easing } from "../interpolate";
import { createButton } from "../nodes/button";
import { buttonClick } from "../zzfx";
import { EventCard, drawCard, drawEvent, PlayerCards, EventCards } from "../cards";

export let gameScreenRootId = -1;

let endTurnButton = -1;

let playerCardIds: number[] = [];
let cardDeckSlotId = -1;
let playerCardSlotIds: number[] = [];

let playerDiceIds: number[] = [];
let playerDiceSlotIds: number[] = [];

let eventDeckSlotId = -1;
let eventCardSlotIds: number[] = [];
let eventCardIds: number[] = [];

let firstInPlayId = -1;

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
  setNodeHoverable(playerDeckId);

  const playerDiscardPileId = createNode();
  node_size[playerDiscardPileId] = [16, 16];
  node_scale[playerDiscardPileId] = 2;
  node_tags[playerDiscardPileId] = TAG.PLAYER_DISCARD;
  addChildNode(gameScreenRootId, playerDiscardPileId);
  moveNode(playerDiscardPileId, [464, 240]);

  const playerDiscardCardId = createNode();
  node_size[playerDiscardCardId] = [16, 16];
  node_scale[playerDiscardCardId] = 2;
  addChildNode(playerDiscardPileId, playerDiscardCardId);
  moveNode(playerDiscardCardId, [0, 0]);

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
    node_index[diceId] = i;
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

  for (let i = 0; i < 6; i++)
  {
    const eventCardSlotId = createNode();
    node_size[eventCardSlotId] = [16, 16];
    node_scale[eventCardSlotId] = 3;
    node_tags[eventCardSlotId] = TAG.EVENT_SLOT;
    if (i === 5)
    {
      node_tags[eventCardSlotId] = TAG.EVENT_SLOT_FINAL;
    }
    addChildNode(eventAreaId, eventCardSlotId);
    moveNode(eventCardSlotId, [320 - 64 * i, 0]);
    eventCardSlotIds.push(eventCardSlotId);

    const eventCardId = createNode();
    node_size[eventCardId] = [16, 16];
    node_scale[eventCardId] = 3;
    node_tags[eventCardId] = TAG.EVENT_CARD;
    node_enabled[eventCardId] = false;
    addChildNode(eventDeckSlotId, eventCardId);
    moveNode(eventCardId, [0, 0]);
    setNodeDropable(eventCardId);
    eventCardIds.push(eventCardId);
  }

  const eventDeckId = createNode();
  node_size[eventDeckId] = [16, 16];
  node_scale[eventDeckId] = 3;
  node_tags[eventDeckId] = TAG.EVENT_DECK;
  addChildNode(eventAreaId, eventDeckId);
  moveNode(eventDeckId, [384, 0]);

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

    if (firstInPlayId === -1) { firstInPlayId = inPlaySlotId; }

    const inPlayCardId = createNode();
    node_enabled[inPlayCardId] = false;
    node_size[inPlayCardId] = [16, 16];
    node_scale[inPlayCardId] = 3;
    node_tags[inPlayCardId] = TAG.IN_PLAY_CARD;
    setNodeDropable(inPlayCardId);
    addChildNode(inPlaySlotId, inPlayCardId);
  }
  //#endregion PLAY AREA

  endTurnButton = createButton("End Turn", [96, 32], [400, 192]);
  addChildNode(gameScreenRootId, endTurnButton);
}

export function gameScreen(now: number, delta: number): void
{
  // Process Timed Functions
  for (let [idx, timer] of timers.entries())
  {
    if (timer._start === -1)
    {
      timer._start = now;
    }
    if (now - timer._start >= timer._delay)
    {
      timer._fn();
      timers.splice(idx, 1);
    }
  }

  // Process Cards that shouldn't be in hand
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
    node_index[cardId] = -1;
  }

  // Process and Arrange Card in hand
  let offsetX = 48;
  for (let handIndex = 0, len = Math.min(playerHand.length, 8); handIndex < len; handIndex++)
  {
    const cardId = playerCardIds[handIndex];
    const slotId = playerCardSlotIds[handIndex];

    node_index[cardId] = handIndex;

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
            // Node Id of the "fake" card in play
            inPlayCardId = childId;
          }
          else if (node_tags[childId] === TAG.PLAYER_CARD)
          {
            // Node Id of the card that stays in the player's hand
            handCardId = childId;
          }
        }
        node_scale[inPlayCardId] = 2;
        node_enabled[inPlayCardId] = true;
        node_droppable.set(droppableId, false);
        moveNode(inPlayCardId, node_position[handCardId]);

        let idx = node_index[handCardId];
        let ipIdx = droppableId - firstInPlayId;
        const card = playerHand.splice(idx, 1);
        inPlayCards[ipIdx] = card[0];
        node_index[inPlayCardId] = ipIdx;

        // Make sure removing the card doesn't cause jank animations
        for (let handIndex = idx, len = playerHand.length;
          handIndex < len;
          handIndex++)
        {
          const cardId = playerCardIds[handIndex];
          const slotId = playerCardSlotIds[handIndex];
          const slotPos = node_position[slotId];
          node_index[cardId] = handIndex;
          addChildNode(slotId, cardId);
          if (handIndex > idx)
          {
            moveNode(slotId, [slotPos[0] + 48, 0]);
          }
          moveNode(cardId, [0, 0]);
        }

        for (let handIndex = playerHand.length,
          len = playerCardIds.length;
          handIndex < len;
          handIndex++)
        {
          const cardId = playerCardIds[handIndex];
          node_index[cardId] = -1;
          node_enabled[cardId] = false;
        }

        setNodeDraggable(handCardId, false);

        Input._hot = 0;
        Input._lastHot = 0;
        Input._active = 0;

        // Move the fake card into place and scale it up
        moveNode(inPlayCardId, [0, 0], Easing.EaseOutQuad, 150)
          .then(() =>
          {
            node_scale[inPlayCardId] = 3;
          });
      }
    }
    else if (node_tags[droppableId] === TAG.IN_PLAY_CARD
      || node_tags[droppableId] === TAG.EVENT_CARD)
    {
      if (node_children[droppableId].length === 1)
      {
        const nodeId = node_children[droppableId][0];
        if (node_draggable.get(nodeId))
        {
          setNodeDraggable(nodeId, false);
          moveNode(nodeId, [8, 8], Easing.EaseOutQuad, 200).then(() =>
          {
            if (node_tags[droppableId] === TAG.IN_PLAY_CARD)
            {
              const card = inPlayCards[node_index[droppableId]];
              PlayerCards.get(card)._effect(energy[node_index[nodeId]]);
              //discardCard(card);
            }
            else
            {
              const card = eventsInPlay[node_index[droppableId]];
              EventCards.get(card)._effect(energy[node_index[nodeId]]);
            }
            node_enabled[nodeId] = false;
            addChildNode(gameScreenRootId, nodeId);
          });
        }
      }
    }
  }

  if (Input._active === endTurnButton)
  {
    endPhase();
    drawPhase();
    Input._active = 0;
    Input._hot = 0;
    Input._lastHot = 0;
    Input._enabled = false;
    setNodeClickable(endTurnButton, false);
  }

  pushText("Turn 0", 448, 88, { _textAlign: Align.Center, _scale: 2 });

  pushSpriteAndSave("food", 64, 68 + 16);
  pushText(`${ playerResources[Resources.Food] }`, 80, 68 + 16);

  pushSpriteAndSave("water", 64, 68 + 32);
  pushText(`${ playerResources[Resources.Water] }`, 80, 68 + 32);

  pushSpriteAndSave("o2", 64 + 64, 68 + 16);
  pushText(`${ playerResources[Resources.O2] }`, 80 + 64, 68 + 16);

  pushSpriteAndSave("mat", 64 + 64, 68 + 32);
  pushText(`${ playerResources[Resources.Materials] }`, 80 + 64, 68 + 32);

  renderNode(gameScreenRootId);

  // Tooltips
  if (Input._hot > 0 && Input._active === 0)
  {
    if (node_tags[Input._hot] === TAG.BUTTON) { }
    else
    {
      let text = "";
      let w = 120;
      let h = 50
      switch (node_tags[Input._hot])
      {
        case TAG.PLAYER_DECK:
          text = "Player Deck";
          h = 8 + 10;
          break;
        case TAG.DICE:
          text = "Energy Node";
          h = 8 + 10;
          break;
      }
      w = textWidth(text.length, 1) + 10;
      let x = Input._pointer[0];
      let y = Input._pointer[1];
      if (x > screenCenterX)
      {
        x -= w + 10;
      }
      else
      {
        x += 10;
      }
      if (y > screenCenterY)
      {
        y -= h + 10;
      }
      else
      {
        y -= Math.floor(h / 2);
      }
      if (text !== "")
      {
        pushQuad(x, y, w, h, 0xDD000000);
        pushText(text, x + 5, y + 5);
      }
    }
  }
}

function drawPhase(): void
{
  for (let i = 0; i < 6; i++)
  {
    let slotId = playerDiceSlotIds[i];
    let diceId = playerDiceIds[i];
    if (node_parent[diceId] !== slotId)
    {
      addChildNode(slotId, diceId);
      node_enabled[diceId] = true;
      setNodeDraggable(diceId);
      moveNode(diceId, [0, 0])
      energy[i] = 0;
    }
  }
  let stagger = 250;
  for (let d = 0; d < 6; d++)
  {
    queueTimer(() => { energy[d] = Math.min(energy[d] + 1, 9); buttonClick(); }, stagger);
    stagger += 75;
  }
  // draw card
  stagger += 250;
  queueTimer(() => { drawCard(); }, stagger);
  stagger += 250;
  queueTimer(() => { drawCard(); }, stagger);
  stagger += 250;
  queueTimer(() => { drawCard(); }, stagger);
  queueTimer(() =>
  {
    drawEvent();
    // Process and Arrange Event Cards
    for (let eventsIdx = 0,
      len = Math.min(eventsInPlay.length, 6);
      eventsIdx < len;
      eventsIdx++)
    {
      const cardId = eventCardIds[eventsIdx];
      const slotId = eventCardSlotIds[eventsIdx];

      if (eventsInPlay[eventsIdx] !== EventCard.None)
      {
        node_index[cardId] = eventsIdx;
        node_enabled[cardId] = true;
        addChildNode(slotId, cardId);
        moveNode(cardId, [64, 0]);
        queueTimer(() =>
        {
          moveNode(cardId, [0, 0], Easing.EaseOutQuad, 300);
        }, 600 - eventsIdx * 75);
      }
      else
      {
        node_index[cardId] = -1;
        node_enabled[cardId] = false;
      }
    }
  }, stagger);

  // event card
  queueTimer(() => { Input._enabled = true; setNodeClickable(endTurnButton); }, stagger + 500);
}

function endPhase(): void
{
  playerResources[Resources.Food] = Math.max(playerResources[Resources.Food] - 1, 0);
  playerResources[Resources.Water] = Math.max(playerResources[Resources.Water] - 1, 0);
  playerResources[Resources.O2] = Math.max(playerResources[Resources.O2] - 1, 0);

  // TODO(dbrad): Action all ongoing card effects
}

function discardInPlayCard(index: number): void
{
  const card = inPlayCards.splice(index, 1);
  // remove card from in play
  // start animation for discard pile...
  // show the discard card, move to the pile
  // then, add to discard pile
  // hide the discard card
  // discard pile should show last card on top
}

type timer = {
  _start: number,
  _delay: number,
  _fn: () => void
}

const timers: timer[] = [];

function queueTimer(fn: () => void, delay: number): void
{
  timers.push({ _start: -1, _delay: delay, _fn: fn });
}

function cardTooltip(): void
{

}