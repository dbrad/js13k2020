import { createNode, node_visible, node_size, renderNode, node_scale, moveNode, addChildNode, setNodeDroppable, setNodeDraggable, node_tags, TAG, node_droppable, node_children, node_ref_index, nodeAbsolutePosition, node_home, returnNodeHome, node_parent } from "../node";
import { screenWidth, screenHeight } from "../screen";
import { v2, subV2 } from "../v2";
import { Quests, CrewMembers, newQuests, newCrew, CurrentQuestIndex, setCurrentQuest, Dice, isQuestComplete } from "../gamestate";
import { Easing } from "../interpolate";
import { pushText, pushQuad, Align, pushSprite } from "../draw";
import { createButton } from "../nodes/button";
import * as gl from "../gl.js";
import { white } from "../util";

export let gameScreenRootId = -1;
let crewCardIds: number[] = [];
let diceIds: number[] = [];
let lockedIntoQuest: boolean = false;
let rollButtonId = -1;

const containerPositions: v2[] = [[16, 16], [224, 16], [16, 128], [224, 128]];
const containerSize: v2 = [176, 96];
export function setupGameScreen(): void
{
  gameScreenRootId = createNode();
  node_visible[gameScreenRootId] = false;
  node_size[gameScreenRootId][0] = screenWidth;
  node_size[gameScreenRootId][1] = screenHeight;

  //#region QUESTS

  for (let questContainerIdx = 0; questContainerIdx < 4; questContainerIdx++)
  {
    const questContainerId = createNode();
    node_visible[questContainerId] = false;
    node_size[questContainerId] = containerSize;
    node_tags[questContainerId] = TAG.QUEST_AREA;
    node_ref_index.set(questContainerId, questContainerIdx);
    setNodeDroppable(questContainerId);
    addChildNode(gameScreenRootId, questContainerId);
    moveNode(questContainerId, containerPositions[questContainerIdx]);

    const questSlotId = createNode();
    node_size[questSlotId] = [16, 16];
    node_scale[questSlotId] = 3;
    node_tags[questSlotId] = TAG.QUEST_SLOT;
    addChildNode(questContainerId, questSlotId);

    const questCardId = createNode();
    node_size[questCardId] = [16, 16];
    node_scale[questCardId] = 3;
    addChildNode(questSlotId, questCardId);

    const crewSlotId = createNode();
    node_size[crewSlotId] = [16, 16];
    node_scale[crewSlotId] = 2;
    node_tags[crewSlotId] = TAG.CREW_SLOT;
    addChildNode(questContainerId, crewSlotId);
    moveNode(crewSlotId, [64, 16]);

    for (let diceIdx = 0; diceIdx < 4; diceIdx++)
    {
      const dieSlotId = createNode();
      node_size[dieSlotId] = [16, 16];
      node_scale[dieSlotId] = 2;
      node_tags[dieSlotId] = TAG.DICE_SLOT;
      node_ref_index.set(dieSlotId, diceIdx);
      addChildNode(questContainerId, dieSlotId);
      moveNode(dieSlotId, [48 * diceIdx, 64]);
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
    node_size[diceId] = [16, 16];
    node_scale[diceId] = 2;
    node_tags[diceId] = TAG.DICE;
    node_ref_index.set(diceId, diceIdx);
    node_home.set(diceId, diceSlotId);
    setNodeDraggable(diceId);
    addChildNode(diceSlotId, diceId);
    diceIds.push(diceId);
  }
  //#endregion DICE

  rollButtonId = createButton(`Roll Dice`, [80, 32], [416, 192]);
  addChildNode(gameScreenRootId, rollButtonId);

  const holdAreaId = createNode();
  node_size[holdAreaId] = [80, 64];
  addChildNode(gameScreenRootId, holdAreaId);
  moveNode(holdAreaId, [416, 112]);

  const holdSlotId = createNode();
  node_size[holdSlotId] = [16, 16];
  node_scale[holdSlotId] = 2;
  node_tags[holdSlotId] = TAG.HOLD_SLOT;
  addChildNode(holdAreaId, holdSlotId);
  moveNode(holdSlotId, [24, 8]);
}

export function initializeGame(): void
{
  newQuests();
  newCrew();
}

export function gameScreen(now: number, delta: number): void
{
  for (let [parentId, droppable] of node_droppable)
  {
    if (!droppable) { continue; }
    const parentTag = node_tags[parentId];
    const children = node_children[parentId];
    for (let childId of children)
    {
      const childTag = node_tags[childId];
      switch (parentTag) 
      {
        case TAG.QUEST_AREA:
          const questIndex = node_ref_index.get(parentId);
          const quest = Quests[questIndex];
          const pos = nodeAbsolutePosition(childId);
          const childIndex = node_ref_index.get(childId);

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
              addChildNode(crewSlotId, childId);
              moveNode(childId, subV2(pos, nodeAbsolutePosition(crewSlotId)));
              moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
              quest._crew = CrewMembers[childIndex];
              setCurrentQuest(questIndex);

              lockedIntoQuest = true;
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
              let dieValue = Dice[node_ref_index.get(childId)];
              let diceSlotId = -1;
              for (let searchId of children)
              {
                // Needs to be a dice slot, empty, and the value of the die should match its objective value
                let objetiveValue = Quests[CurrentQuestIndex]._objective[node_ref_index.get(searchId)];
                if (node_tags[searchId] === TAG.DICE_SLOT
                  && node_children[searchId].length === 0
                  && objetiveValue === dieValue)
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
              addChildNode(diceSlotId, childId);
              moveNode(childId, subV2(pos, nodeAbsolutePosition(diceSlotId)));
              moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
              setNodeDraggable(childId, false);
              quest._dice[node_ref_index.get(diceSlotId)] = dieValue;
              break;
            //#endregion DROP DICE LOGIC
          }
          break;
      }
    }
  }

  // check if quest complete or out of chances
  if (CurrentQuestIndex >= 0 || Dice.length === 0)
  {
    if (isQuestComplete(Quests[CurrentQuestIndex]))
    {
      lockedIntoQuest = false;
      for (const crewCard of crewCardIds)
      {
        if (node_parent[crewCard] !== node_home.get(crewCard)) continue;
        setNodeDraggable(crewCard);
      }
      setCurrentQuest(-1);
    }
  }

  const res = [3, 2, 4];
  const resName = ["Oxygen", "Hull", "Power"];
  for (let r = 0; r < 3; r++)
  {
    let off = 32 * r;
    pushText(resName[r], 416, 16 + off);
    pushQuad(416, 25 + off, 80, 8, white);
    pushQuad(417, 26 + off, 78, 6, 0xFF333333);
    pushQuad(418, 27 + off, 76, 4, 0xFF101010);
    pushQuad(418, 27 + off, (res[r] * 16 - 2) - (res[r] === 5 ? 2 : 0), 4, 0xFF4040FF);
    for (let l = 0; l < 4; l++)
    {
      pushQuad(432 + l * 16, 27 + off, 1, 4, 0xFF333333);
    }
  }

  pushQuad(416, 112, 80, 64, white);
  pushQuad(417, 113, 78, 62, 0xFF101010);
  pushText(`Hold Die`, 456, 160, { _textAlign: Align.Center });

  renderNode(gameScreenRootId);

  if (lockedIntoQuest)
  {
    for (let i = 0; i < 4; i++)
    {
      if (i == CurrentQuestIndex) continue;
      let pos = containerPositions[i];
      pushQuad(pos[0], pos[1], containerSize[0], containerSize[1], 0x99000000);
      pushText("QUEST IN PROGRESS", pos[0] + containerSize[0] / 2, pos[1] + containerSize[1] / 2, { _colour: 0XFF3232BF, _textAlign: Align.Center })
    }
  }
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