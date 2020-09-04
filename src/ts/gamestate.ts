import { v2 } from "./v2";
import { rand } from "./random";

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

export type Crew = {
  _level: number,
  _dice: number[]
}

export type Quest = {
  _name: string,
  _crew?: Crew,
  _dice: number[],
  _objective: number[],
  _reward: () => void,
  _penalty: () => void
}

export const Dice: number[] = [1, 1, 1, 1, 1, 1];

export const CrewMembers: Crew[] = [];
export const Quests: Quest[] = [];
export let CurrentQuestIndex: number = -1;
export function setCurrentQuest(index: number): void
{
  CurrentQuestIndex = index;
}
export function isQuestComplete(quest: Quest): boolean
{
  for (const [idx, objective] of quest._objective.entries())
  {
    if (objective !== quest._dice[idx]) { return false; }
  }
  return true;
}
export function newQuests(): void
{
  Quests[0] = {
    _name: "Test",
    _dice: [],
    _objective: [1, 1],
    _reward: () =>
    {
      console.log("Winner");
    },
    _penalty: () =>
    {
      console.log("Boooo");
    }
  }
  Quests[1] = {
    _name: "Test",
    _dice: [],
    _objective: [1, 2],
    _reward: () =>
    {
      console.log("Winner");
    },
    _penalty: () =>
    {
      console.log("Boooo");
    }
  }
  Quests[2] = {
    _name: "Test",
    _dice: [],
    _objective: [1, 2],
    _reward: () =>
    {
      console.log("Winner");
    },
    _penalty: () =>
    {
      console.log("Boooo");
    }
  }
  Quests[3] = {
    _name: "Test",
    _dice: [],
    _objective: [1, 2],
    _reward: () =>
    {
      console.log("Winner");
    },
    _penalty: () =>
    {
      console.log("Boooo");
    }
  }
}

export function newCrew(): void
{
  CrewMembers[0] = {
    _level: 1,
    _dice: [1, 1, 1]
  };
  CrewMembers[1] = {
    _level: 1,
    _dice: [1, 1, 1]
  };
  CrewMembers[2] = {
    _level: 1,
    _dice: [1, 1, 1]
  };
  CrewMembers[3] = {
    _level: 1,
    _dice: [1, 1, 1]
  };
}
