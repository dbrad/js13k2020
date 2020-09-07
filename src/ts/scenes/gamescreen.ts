import { createNode, node_visible, node_size, renderNode, node_scale, moveNode, addChildNode, setNodeDroppable, setNodeDraggable, node_tags, TAG, node_droppable, node_children, node_ref_index, nodeAbsolutePosition, node_home, returnNodeHome, node_parent, node_enabled, setNodeClickable, node_dice_value, node_button_text, nodeSize, node_draggable, setNodeHoverable, node_hoverable, node_movement } from "../node";
import { screenWidth, screenHeight, screenCenterX, screenCenterY } from "../screen";
import { v2, subV2 } from "../v2";
import { Quests, CrewMembers, newQuests, newCrew, CurrentQuestIndex, setCurrentQuest, Dice, isQuestComplete, Input, isQuestFailed, Resources, modifyResource, isQuestDone, ResourceNames, ResourceTypes, setGameOver, GameOverReasons, GameOver, setMusic } from "../gamestate";
import { Easing } from "../interpolate";
import { pushText, pushQuad, Align, textWidth } from "../draw";
import { createButton } from "../nodes/button";
import { white, mouseInside } from "../util";
import { rand, shuffle } from "../random";
import { buttonHover, zzfxP } from "../zzfx";
import * as gl from "../gl.js";
import { pushScene, Scenes } from "../scene";
import { gameOverRootId } from "./gameover";
import { createMusicButton } from "../nodes/musicButton";
import { createFullscreenButton } from "../nodes/fullscreenButton";

export let gameScreenRootId = -1;
let crewCardIds: number[] = [];
let diceIds: number[] = [];
let lockedIntoQuest: boolean = false;
let rollButtonId = -1;
let holdAreaId = -1;

let rolling = false;
let turnOverStarted = false;
let turnOver = false;
const containerPositions: v2[] = [[16, 16], [224, 16], [16, 128], [224, 128]];
const containerSize: v2 = [176, 96];
export function setupGameScreen(): void
{
  gameScreenRootId = createNode();
  node_visible[gameScreenRootId] = false;
  node_size[gameScreenRootId][0] = screenWidth;
  node_size[gameScreenRootId][1] = screenHeight;

  const musicButton = createMusicButton([screenWidth - 64, 0]);
  addChildNode(gameScreenRootId, musicButton);

  const fullscreenButton = createFullscreenButton([screenWidth - 32, 0]);
  addChildNode(gameScreenRootId, fullscreenButton);

  //#region QUESTS
  for (let questContainerIdx = 0; questContainerIdx < 4; questContainerIdx++)
  {
    const questContainerId = createNode();
    node_visible[questContainerId] = false;
    node_size[questContainerId] = containerSize;
    node_tags[questContainerId] = TAG.QUEST_AREA;
    node_ref_index.set(questContainerId, questContainerIdx);
    setNodeDroppable(questContainerId);
    setNodeHoverable(questContainerId);
    addChildNode(gameScreenRootId, questContainerId);
    moveNode(questContainerId, containerPositions[questContainerIdx]);

    const questSlotId = createNode();
    node_size[questSlotId] = [16, 16];
    node_scale[questSlotId] = 3;
    node_tags[questSlotId] = TAG.QUEST_SLOT;
    node_ref_index.set(questSlotId, questContainerIdx);
    addChildNode(questContainerId, questSlotId);

    const crewSlotId = createNode();
    node_size[crewSlotId] = [16, 16];
    node_scale[crewSlotId] = 2;
    node_tags[crewSlotId] = TAG.CREW_SLOT;
    addChildNode(questContainerId, crewSlotId);
    moveNode(crewSlotId, [48, 16]);

    for (let diceIdx = 0; diceIdx < 4; diceIdx++)
    {
      const dieSlotId = createNode();
      node_size[dieSlotId] = [16, 16];
      node_scale[dieSlotId] = 2;
      node_tags[dieSlotId] = TAG.DICE_SLOT;
      node_ref_index.set(dieSlotId, diceIdx);
      addChildNode(questContainerId, dieSlotId);
      moveNode(dieSlotId, [48 * diceIdx, 64]);

      const diceId = createNode();
      node_enabled[diceId] = false;
      node_size[diceId] = [16, 16];
      node_scale[diceId] = 2;
      node_tags[diceId] = TAG.DICE;
      node_dice_value[diceId] = 0;
      node_home.set(diceId, dieSlotId)
      addChildNode(dieSlotId, diceId);
    }
  }
  //#endregion QUESTS

  //#region CREW CARDS
  for (let crewIdx = 0; crewIdx < 4; crewIdx++)
  {
    const crewSlotId = createNode();
    node_size[crewSlotId] = [16, 16];
    node_scale[crewSlotId] = 2;
    addChildNode(gameScreenRootId, crewSlotId);
    moveNode(crewSlotId, [16 + 48 * crewIdx, 240]);

    const crewCardId = createNode();
    node_size[crewCardId] = [16, 16];
    node_scale[crewCardId] = 2;
    node_tags[crewCardId] = TAG.CREW_CARD;
    node_ref_index.set(crewCardId, crewIdx);
    node_home.set(crewCardId, crewSlotId);
    setNodeDraggable(crewCardId);
    addChildNode(crewSlotId, crewCardId);
    crewCardIds.push(crewCardId);
  }
  //#endregion CREW CARDS

  //#region DICE
  for (let diceIdx = 0; diceIdx < 6; diceIdx++)
  {
    const diceSlotId = createNode();
    node_size[diceSlotId] = [16, 16];
    node_scale[diceSlotId] = 2;
    addChildNode(gameScreenRootId, diceSlotId);
    moveNode(diceSlotId, [224 + 48 * diceIdx, 240]);

    const diceId = createNode();
    node_enabled[diceId] = false;
    node_size[diceId] = [16, 16];
    node_scale[diceId] = 2;
    node_tags[diceId] = TAG.DICE;
    node_ref_index.set(diceId, diceIdx);
    node_dice_value[diceId] = 0;
    node_home.set(diceId, diceSlotId);
    setNodeDraggable(diceId);
    addChildNode(diceSlotId, diceId);
    diceIds.push(diceId);
  }
  //#endregion DICE

  rollButtonId = createButton(`Roll Dice`, [80, 32], [416, 192]);
  addChildNode(gameScreenRootId, rollButtonId);

  holdAreaId = createNode();
  node_size[holdAreaId] = [80, 64];
  node_tags[holdAreaId] = TAG.HOLD_AREA;
  setNodeDroppable(holdAreaId);
  addChildNode(gameScreenRootId, holdAreaId);
  moveNode(holdAreaId, [416, 112]);

  const holdSlotId = createNode();
  node_size[holdSlotId] = [16, 16];
  node_scale[holdSlotId] = 2;
  node_tags[holdSlotId] = TAG.HOLD_SLOT;
  addChildNode(holdAreaId, holdSlotId);
  moveNode(holdSlotId, [24, 8]);

  const holdDieId = createNode();
  node_enabled[holdDieId] = false;
  node_size[holdDieId] = [16, 16];
  node_scale[holdDieId] = 2;
  node_tags[holdDieId] = TAG.DICE;
  node_dice_value[holdDieId] = 0;
  node_home.set(holdDieId, holdSlotId);
  setNodeDraggable(holdDieId);
  addChildNode(holdSlotId, holdDieId);
}

export function initializeGame(): void
{
  setGameOver();
  newCrew();
  newQuests();
  moveNode(gameScreenRootId, [screenWidth, 0]);
  moveNode(gameScreenRootId, [0, 0], Easing.EaseOutQuad, 500).then(() =>
  {
    setTimeout(() => { setMusic(true) }, 1000);
    Input._enabled = true
  });

}

export function gameScreen(now: number, delta: number): void
{
  const RootX = nodeAbsolutePosition(gameScreenRootId)[0];
  const RootY = nodeAbsolutePosition(gameScreenRootId)[1];
  if (GameOver)
  {
    if (!node_movement.get(gameScreenRootId))
    {
      Input._enabled = false;
      turnOverStarted = true;
      moveNode(gameScreenRootId, [-screenWidth, 0], Easing.EaseInOutBack, 1000)
        .then(() =>
        {
          moveNode(gameOverRootId, [screenWidth, 0]);
          moveNode(gameOverRootId, [0, 0], Easing.EaseInBack, 500);
          pushScene(Scenes.GameOver);
          Input._enabled = true;
        });
    }
  }
  let diceRemaining = 0;
  for (const diceId of diceIds)
  {
    diceRemaining += (node_enabled[diceId] ? 1 : 0);
  }

  let crewRemaining = 0;
  for (const crewId of crewCardIds)
  {
    if (node_enabled[crewId])
    {
      crewRemaining++;
    }
  }

  for (let i = 0, t = 0; i < 4; i++)
  {
    if (isQuestDone(i))
    {
      t++;
    }
    if (t >= crewRemaining) { turnOver = true; }
  }

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

  node_button_text.set(rollButtonId, "Discard & Re-roll");
  if (rolling)
  {
    node_button_text.set(rollButtonId, "Rolling..");
    for (let i = 0; i < diceIds.length; i++)
    {
      if (node_enabled[diceIds[i]])
      {
        Dice[i] = rand(1, 6);
        node_dice_value[diceIds[i]] = Dice[i];
      }
    }
  }

  if (diceRemaining === 0) 
  {
    node_enabled[rollButtonId] = false;
  }
  else if (diceRemaining === 1)
  {
    node_button_text.set(rollButtonId, "End Task");
  }

  //#region BUTTON CLICK
  if (Input._active === rollButtonId)
  {
    if (diceRemaining > 1)
    {
      setNodeClickable(rollButtonId, false);
      Input._active = 0;
      for (let i = 5; i >= 0; i--)
      {
        if (node_enabled[diceIds[i]])
        {
          node_enabled[diceIds[i]] = false;
          node_dice_value[diceIds[i]] = 0;
          break;
        }
      }
      rolling = true;
      queueTimer(() =>
      {
        setNodeClickable(rollButtonId);
        rolling = false;
        zzfxP(buttonHover);
      }, 500);
    }
    else
    {
      diceRemaining = 0;
      node_enabled[rollButtonId] = false;
      node_button_text.set(rollButtonId, "Roll Dice");
    }
  }
  //#endregion BUTTON CLICK

  //#region Droppable Logic
  for (let [parentId, droppable] of node_droppable)
  {
    if (!droppable) { continue; }
    const parentTag = node_tags[parentId];
    const children = node_children[parentId];
    for (let childId of children)
    {
      const childTag = node_tags[childId];
      const childPosition = nodeAbsolutePosition(childId);
      const childIndex = node_ref_index.get(childId);

      switch (parentTag) 
      {
        case TAG.HOLD_AREA:
          if (childTag === TAG.DICE
            && node_tags[node_home.get(childId)] !== TAG.HOLD_SLOT)
          {
            const holdSlotId = node_children[parentId][0];
            const hiddenDieId = node_children[holdSlotId][0];
            moveNode(hiddenDieId, subV2(childPosition, nodeAbsolutePosition(holdSlotId)));
            moveNode(hiddenDieId, [0, 0], Easing.EaseOutQuad, 250);
            node_enabled[hiddenDieId] = true;

            node_dice_value[hiddenDieId] = node_dice_value[childId];
            node_dice_value[childId] = 0;
            returnNodeHome(childId);
            node_enabled[childId] = false;
          }
          else if (childTag === TAG.DICE || childTag === TAG.CREW_CARD)
          {
            returnNodeHome(childId);
          }
          break;
        case TAG.QUEST_AREA:
          const questIndex = node_ref_index.get(parentId);
          const quest = Quests[questIndex];

          switch (childTag)
          {
            case TAG.CREW_CARD:
              //#region DROP CREW CARD LOGIC
              if (quest._crew)
              {
                returnNodeHome(childId);
                break;
              }
              let crewSlotId = -1;
              for (let searchId of children)
              {
                if (node_tags[searchId] === TAG.CREW_SLOT)
                {
                  crewSlotId = searchId;
                  break;
                }
              }
              const crew = CrewMembers[childIndex];
              addChildNode(crewSlotId, childId);
              moveNode(childId, subV2(childPosition, nodeAbsolutePosition(crewSlotId)));
              moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
              quest._crew = crew;
              setCurrentQuest(questIndex);

              lockedIntoQuest = true;
              for (let i = 0; i < 3 + crew._level; i++)
              {
                node_dice_value[diceIds[i]] = 1;
                diceRemaining++;
              }
              rolling = true;
              queueTimer(() =>
              {
                rolling = false;
                node_enabled[rollButtonId] = true;
              }, 400);

              for (const crewCard of crewCardIds)
              {
                setNodeDraggable(crewCard, false);
              }
              break;
            //#endregion DROP CREW CARD LOGIC

            case TAG.DICE:
              //#region DROP DICE LOGIC
              if (CurrentQuestIndex !== questIndex)
              {
                returnNodeHome(childId);
                break;
              }
              let dieValue = node_dice_value[childId];
              let diceSlotId = -1;
              for (let searchId of children)
              {
                // Needs to be a dice slot, empty, and the value of the die should match its objective value
                let objectiveValue = Quests[CurrentQuestIndex]._objective[node_ref_index.get(searchId)];
                if (node_tags[searchId] === TAG.DICE_SLOT
                  && quest._dice[node_ref_index.get(searchId)] === undefined
                  && objectiveValue !== undefined
                  && objectiveValue === dieValue)
                {
                  diceSlotId = searchId;
                  break;
                }
              }
              if (diceSlotId === -1)
              {
                returnNodeHome(childId);
                break;
              }
              const hiddenDieId = node_children[diceSlotId][0];
              moveNode(hiddenDieId, subV2(childPosition, nodeAbsolutePosition(diceSlotId)));
              moveNode(hiddenDieId, [0, 0], Easing.EaseOutQuad, 250);
              node_enabled[hiddenDieId] = true;

              returnNodeHome(childId);
              node_enabled[childId] = false;

              node_dice_value[hiddenDieId] = node_dice_value[childId];
              node_dice_value[childId] = 0;
              quest._dice[node_ref_index.get(diceSlotId)] = dieValue;
              break;
            //#endregion DROP DICE LOGIC
          }
          break;
      }
    }
  }
  //#endregion Droppable Logic

  for (const [nodeId, value] of node_dice_value.entries())
  {
    if (value === 0)
    {
      node_enabled[nodeId] = false;
    }
    else if (value >= 1)
    {
      node_enabled[nodeId] = true;
    }
  }

  // check if quest complete or out of chances
  if (CurrentQuestIndex >= 0 && isQuestComplete(CurrentQuestIndex)
    || diceRemaining === 0)
  {
    for (const diceId of diceIds)
    {
      node_enabled[diceId] = false;
    }
    lockedIntoQuest = false;
    for (const crewCard of crewCardIds)
    {
      if (node_parent[crewCard] !== node_home.get(crewCard)) continue;
      setNodeDraggable(crewCard);
    }
    setCurrentQuest(-1);
  }

  //#region RESOURCES
  for (let r = 0; r < 4; r++)
  {
    let off = 20 * r;
    if (r === 3)
    {
      off += 8;
    }
    pushText(ResourceNames[r], RootX + 416, RootY + 16 + off, { _wrap: 80 }); // Label
    if (r === 3)
    {
      off += 10;
    }
    pushQuad(RootX + 416, RootY + 25 + off, 80, 8, white);
    pushQuad(RootX + 417, RootY + 26 + off, 78, 6, 0xFF333333);
    pushQuad(RootX + 418, RootY + 27 + off, 76, 4, 0xFF101010);
    if (r === 3)
    {
      pushQuad(
        RootX + 418,
        RootY + 27 + off,
        (Resources[r] === 0 ? 0 : (Resources[r] * 26 - 2) - (Resources[r] === 5 ? 2 : 0)),
        4, 0xFFFF4040);
      for (let l = 0; l < 2; l++)
      {
        pushQuad(RootX + 442 + l * 26, RootY + 27 + off, 1, 4, 0xFF333333);
      }
    }
    else
    {
      pushQuad(RootX + 418, RootY + 27 + off, (Resources[r] === 0 ? 0 : (Resources[r] * 16 - 2) - (Resources[r] === 5 ? 2 : 0)), 4, 0xFF4040FF);
      for (let l = 0; l < 4; l++)
      {
        pushQuad(RootX + 432 + l * 16, RootY + 27 + off, 1, 4, 0xFF333333);
      }
    }
  }
  //#endregion RESOURCES

  pushQuad(RootX + 416, RootY + 112, 80, 64, white);
  pushQuad(RootX + 417, RootY + 113, 78, 62, 0xFF101010);
  pushText(`Hold Die`, RootX + 456, RootY + 160, { _textAlign: Align.Center });

  renderNode(gameScreenRootId);

  //#region Hover Task Areas Highlight
  if (Input._hot && node_hoverable.get(Input._hot) && node_tags[Input._hot] === TAG.QUEST_AREA)
  {
    let pos = nodeAbsolutePosition(Input._hot);
    let size = nodeSize(Input._hot);
    gl.save();
    gl.translate(pos[0], pos[1]);
    pushQuad(-1, -1, 1, size[1] + 2, 0xFF888888);
    pushQuad(-1, -1, size[0] + 2, 1, 0xFF888888);
    pushQuad(size[0], -1, 1, size[1] + 2, 0xFF888888);
    pushQuad(-1, size[1], size[0] + 2, 1, 0xFF888888);
    gl.restore();
  }
  //#endregion Hover Task Areas Highlight

  //#region Hover Drop Highlight
  if (Input._active && node_draggable.get(Input._active))
  {
    for (const [nodeId, droppable] of node_droppable)
    {
      let pos = nodeAbsolutePosition(nodeId);
      let size = nodeSize(nodeId);
      if (droppable && mouseInside(pos[0], pos[1], size[0], size[1]))
      {
        if (node_tags[nodeId] === TAG.HOLD_AREA && node_tags[Input._active] !== TAG.DICE)
          continue;
        if (node_tags[nodeId] === TAG.QUEST_AREA &&
          (isQuestDone(node_ref_index.get(nodeId))
            || (CurrentQuestIndex >= 0
              && CurrentQuestIndex !== node_ref_index.get(nodeId))))
          continue;
        gl.save();
        gl.translate(pos[0], pos[1]);
        pushQuad(-1, -1, 1, size[1] + 2, 0xFF42ff42);
        pushQuad(-1, -1, size[0] + 2, 1, 0xFF42ff42);
        pushQuad(size[0], -1, 1, size[1] + 2, 0xFF42ff42);
        pushQuad(-1, size[1], size[0] + 2, 1, 0xFF42ff42);
        gl.restore();
        break;
      }
    }
  }
  //#endregion Hover Drop Highlight

  for (let i = 0; i < 4; i++)
  {
    let pos = containerPositions[i];
    if (isQuestComplete(i))
    {
      pushQuad(RootX + pos[0], RootY + pos[1], containerSize[0], containerSize[1], 0x99000000);
      pushText("TASK COMPLETE",
        RootX + pos[0] + containerSize[0] / 2,
        RootY + 4 + pos[1] + containerSize[1] / 2,
        { _colour: 0XFF32bf32, _textAlign: Align.Center });
    }
    else if (isQuestFailed(i))
    {
      pushQuad(RootX + pos[0], RootY + pos[1], containerSize[0], containerSize[1], 0x99000000);
      pushText("TASK FAILED",
        RootX + pos[0] + containerSize[0] / 2,
        RootY + 4 + pos[1] + containerSize[1] / 2,
        { _colour: 0XFF3232BF, _textAlign: Align.Center });
    }
    else if (lockedIntoQuest)
    {
      if (i == CurrentQuestIndex) continue;
      pushQuad(RootX + pos[0], RootY + pos[1], containerSize[0], containerSize[1], 0x99000000);
      pushText("TASK IN PROGRESS",
        RootX + pos[0] + containerSize[0] / 2,
        RootY + 4 + pos[1] + containerSize[1] / 2,
        { _colour: 0XFF3232BF, _textAlign: Align.Center })
    }
  }

  //#region END OF TURN
  if (turnOver && !turnOverStarted)
  {
    turnOverStarted = true;
    setCurrentQuest(-1);
    for (let q = 0; q < 4; q++)
    {
      queueTimer(() =>
      {
        const quest = Quests[q];
        if (isQuestComplete(q))
        {
          quest._crew._exp += 1;
          if (quest._crew._exp === 2)
          {
            quest._crew._level = Math.min(quest._crew._level + 1, 3);
            quest._crew._exp = 0;
          }
          quest._reward();
        }
        else
        {
          quest._penalty();
        }
      }, 500 * (q + 1));
    }

    // for (let r = 1; r < 3; r++)
    // {
    // Take resource costs
    queueTimer(() => { modifyResource(ResourceTypes.Oxygen, -1); }, 2000);
    // }

    queueTimer(() =>
    {
      // Reset dice values
      for (const [nodeId, value] of node_dice_value.entries())
      {
        if (value >= 0)
        {
          node_dice_value[nodeId] = 0
          node_enabled[nodeId] = false;
        }
      }

      // Reset crew cards
      for (let c = 0; c < 4; c++)
      {
        returnNodeHome(crewCardIds[c]);
        setNodeDraggable(crewCardIds[c]);
      }

      if (Resources[ResourceTypes.Power] === 0)
      {
        modifyResource(ResourceTypes.Oxygen, -1);
      }

      if (Resources[ResourceTypes.Oxygen] === 0)
      {
        let foundCrew = false;
        const randomCrews = shuffle([...crewCardIds]);
        for (const crewId of randomCrews)
        {
          if (node_enabled[crewId])
          {
            node_enabled[crewId] = false;
            foundCrew = true;
            break;
          }
        }
        if (!foundCrew)
        {
          setGameOver(true, GameOverReasons.NoCrew);
        }
      }

      if (Resources[ResourceTypes.Hull] === 0)
      {
        setGameOver(true, GameOverReasons.ShipDestroyed);
      }
      else
      {
        newQuests();
      }

      turnOverStarted = false;
      turnOver = false;
    }, 4500);
  }
  //#endregion END OF TURN

  //#region TOOLTIPS
  if (Input._hot > 0)
  {
    const nodeId = Input._hot;
    let text: string[] = [];
    switch (node_tags[nodeId])
    {
      case TAG.CREW_CARD:
        const crew = CrewMembers[node_ref_index.get(nodeId)];
        text[0] = crew._name;
        text[1] = `Level ${ crew._level }`;
        if (crew._level < 3)
        {
          text[2] = `Exp: ${ crew._exp }/2`;
        }
        break;
      case TAG.QUEST_AREA:
        const quest = Quests[node_ref_index.get(nodeId)];
        text = [...quest._tooltip];
        break;
    }
    const tw = Math.max(...text.map(t => t.length));
    let w = textWidth(tw, 1) + 10;
    let h = 10 + text.length * 9;
    let x = Input._pointer[0];
    let y = Input._pointer[1];
    if (x > screenCenterX)
    {
      x -= w + 20;
    }
    else
    {
      x += 20;
    }
    if (y > screenCenterY)
    {
      y -= h;
    }
    else
    {
      y -= Math.floor(h / 4);
    }
    if (text.length > 0)
    {
      pushQuad(x, y, w, h, 0xEE000000);
      for (let i = 0; i < text.length; i++)
      {
        pushText(text[i], x + 5, y + 5 + (i * 9));
      }
    }
  }
  //#endregion TOOLTIPS
}

//#region TIMER STUFF
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
//#endregion TIMER STUFF
