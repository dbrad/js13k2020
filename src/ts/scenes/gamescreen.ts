import { createNode, node_visible, node_size, renderNode, node_scale, moveNode, addChildNode, setNodeDroppable, setNodeDraggable, node_tags, TAG, node_droppable, node_children, node_ref_index, nodeAbsolutePosition, node_home } from "../node";
import { screenWidth, screenHeight } from "../screen";
import { v2, subV2 } from "../v2";
import { Quests, CrewMembers, newQuests, newCrew } from "../gamestate";
import { Easing } from "../interpolate";

export let gameScreenRootId = -1;
export function setupGameScreen(): void
{
  gameScreenRootId = createNode();
  node_visible[gameScreenRootId] = false;
  node_size[gameScreenRootId][0] = screenWidth;
  node_size[gameScreenRootId][1] = screenHeight;

  //#region QUESTS
  const containerPositions: v2[] = [[16, 16], [224, 16], [16, 128], [224, 128]];
  for (let questContainerIdx = 0; questContainerIdx < 4; questContainerIdx++)
  {
    const questContainerId = createNode();
    node_visible[questContainerId] = false;
    node_size[questContainerId] = [176, 96];
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
    node_home.set(diceId, diceSlotId);
    setNodeDraggable(diceId);
    addChildNode(diceSlotId, diceId);
  }
  //#endregion DICE
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
          const pos = nodeAbsolutePosition(childId);
          const homeId = node_home.get(childId);
          const childIndex = node_ref_index.get(childId);

          switch (childTag)
          {
            case TAG.CREW_CARD:
              if (Quests[questIndex]._crew)
              {
                addChildNode(homeId, childId);
                moveNode(childId, subV2(pos, nodeAbsolutePosition(homeId)));
                moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
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
              setNodeDraggable(childId, false);
              Quests[questIndex]._crew = CrewMembers[childIndex];
              break;

            case TAG.DICE:
              if (!Quests[questIndex]._crew)
              {
                addChildNode(homeId, childId);
                moveNode(childId, subV2(pos, nodeAbsolutePosition(homeId)));
                moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
                break;
              }
              // TODO(dbrad): find an empty die slot that matches the value of the dropped die
              let diceSlotId = -1;
              for (let searchId of children)
              {
                if (node_tags[searchId] === TAG.DICE_SLOT && node_children[searchId].length === 0)
                {
                  diceSlotId = searchId;
                  break;
                }
              }
              addChildNode(diceSlotId, childId);
              moveNode(childId, subV2(pos, nodeAbsolutePosition(diceSlotId)));
              moveNode(childId, [0, 0], Easing.EaseOutQuad, 250);
              setNodeDraggable(childId, false);
              break;
          }
          break;
      }
    }
  }



  renderNode(gameScreenRootId);
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