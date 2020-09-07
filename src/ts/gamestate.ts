import { v2 } from "./v2";
import { rand, shuffle } from "./random";
import { music, startMusic } from "./zzfx";

export const Input = {
  _enabled: true,
  _pointer: [0, 0] as v2,
  _dragOffset: [0, 0] as v2,
  _dragParent: 0,
  _mouseDown: false,
  _lastHot: 0,
  _hot: 0,
  _released: 0,
  _active: 0
}

export type Crew = {
  _name: string,
  _level: number,
  _exp: number
}

export type Quest = {
  _tooltip: string[],
  _crew?: Crew,
  _questType: QuestType,
  _penaltyResource?: ResourceTypes,
  _dice: number[],
  _objective: number[],
  _reward: () => void,
  _penalty: () => void
}

export const enum ResourceTypes
{
  Hull,
  Power,
  Oxygen,
  Signal
};

export const enum QuestDifficulty
{
  Easy,
  Medium,
  Hard
}

export const enum QuestType
{
  Hull,
  Power,
  Oxygen,
  Peril,
  Progress,
  Victory
}

export let musicEnabled = true;
export function setMusic(val: boolean): void
{
  musicEnabled = val;
  if (!musicEnabled)
  {
    music.stop();
  }
  else
  {
    startMusic();
  }
}
export let coilEnabled = false;
export function setCoil(val: boolean): void
{
  coilEnabled = val;
}
export const Dice: number[] = [1, 1, 1, 1, 1, 1];
export const Resources: number[] = [3, 3, 3, 0];
export const ResourceNames = ["Hull", "Power", "Oxygen", "Distress Signal"];

export let GameOver = false;
export const enum GameOverReasons
{
  None,
  Win,
  NoCrew,
  ShipDestroyed
}
export let GameOverReason: GameOverReasons = GameOverReasons.None;
export function setGameOver(gameOver: boolean = false, reason: GameOverReasons = GameOverReasons.None): void
{
  GameOver = gameOver;
  GameOverReason = reason;
}

export function modifyResource(resource: ResourceTypes, amount: number): void
{
  const cap = resource === ResourceTypes.Signal ? 3 : 5;
  Resources[resource] = Math.max(Math.min(Resources[resource] + amount, cap), 0);
}

export const CrewMembers: Crew[] = [];
export const Quests: Quest[] = [];
export let CurrentQuestIndex: number = -1;
export function setCurrentQuest(index: number): void
{
  CurrentQuestIndex = index;
}
export function isQuestComplete(questId: number): boolean
{
  const quest = Quests[questId];
  for (const [idx, objective] of quest._objective.entries())
  {
    if (objective !== quest._dice[idx]) { return false; }
  }
  return true;
}
export function isQuestFailed(questId: number): boolean
{
  const quest = Quests[questId];
  return quest._crew && questId !== CurrentQuestIndex;
}

export function isQuestDone(questId: number): boolean
{
  return isQuestComplete(questId) || isQuestFailed(questId);
}
export function newQuests(): void
{
  const questIdx = shuffle([0, 1, 2, 3]);
  let questDifficulties: QuestDifficulty[] = [];
  let combinedLevel = 0;
  for (const crew of CrewMembers)
  {
    const random = rand(1, 100);
    combinedLevel += crew._level;
    switch (crew._level)
    {
      case 1:
        questDifficulties.push(QuestDifficulty.Easy);
        break;
      case 2:
        questDifficulties.push(random < 50 ? QuestDifficulty.Easy : QuestDifficulty.Medium);
        break;
      case 3:
        questDifficulties.push(random < 50 ? QuestDifficulty.Medium : QuestDifficulty.Hard);
        break;
    }
  }
  questDifficulties = shuffle(questDifficulties);
  let numberOfPerils = combinedLevel < 8 ? 1 : 2;
  const allowResourcePerils = numberOfPerils === 2;

  for (let r = 0; r < CrewMembers.length; r++)
  {
    let objective: number[] = [];
    let questType: QuestType;
    let reward: () => void = () => { };
    let penalty: () => void = () => { };
    let rewardDesc: string[] = [`None`];
    let penaltyDesc: string[] = [`None`];
    let penaltyResource = -1;

    if (r === 3) // Non-resource specific tasks
    {

      if (Resources[ResourceTypes.Signal] >= 3)
      {
        questType = QuestType.Victory;
        rewardDesc = ["Get rescued!"];
        reward = () =>
        {
          setGameOver(true, GameOverReasons.Win);
        };
      }
      else if ((Resources[ResourceTypes.Power] >= 3
        && rand(1, 100) > 50)
        || Resources[ResourceTypes.Power] >= 4)
      {
        questType = QuestType.Progress;
        rewardDesc = [`-2 ${ ResourceNames[ResourceTypes.Power] }`, `+1 ${ ResourceNames[ResourceTypes.Signal] }`];
        reward = () =>
        {
          modifyResource(ResourceTypes.Power, -2);
          modifyResource(ResourceTypes.Signal, 1);
        };

      }
      else
      {
        if (numberOfPerils > 0)
        {
          questType = QuestType.Peril;
          penaltyResource = ResourceTypes.Hull;
          penaltyDesc = [`-1 ${ ResourceNames[penaltyResource] }`];
          penalty = () =>
          {
            modifyResource(penaltyResource, -1);
          }
        }
        else
        {
          questType = QuestType.Power;
          rewardDesc = [`+1 ${ ResourceNames[ResourceTypes.Power] }`];
          reward = () =>
          {
            modifyResource(ResourceTypes.Power, 1);
          };
        }
      }
    }
    else // Resource Based Task
    {

      questType = r;
      const amount = questDifficulties[r] > QuestDifficulty.Easy ? 2
        : Resources[r] <= 2 ? 2
          : 1;
      rewardDesc = [`+${ amount } ${ ResourceNames[r] }`];
      reward = () =>
      {
        modifyResource(r, amount);
      };

      if (allowResourcePerils && numberOfPerils > 0 && rand(1, 100) > 50)
      {
        numberOfPerils--;
        penaltyResource = rand(0, 2);
        penaltyDesc = [`-1 ${ ResourceNames[penaltyResource] }`];
        penalty = () =>
        {
          modifyResource(penaltyResource, -1);
        }
      }
    }

    for (let i = 0, len = 2 + questDifficulties[r]; i < len; i++)
    {
      objective.push(rand(1, 6));
    }

    const tooltip = [
      questName(questType, penaltyResource),
      "",
      "Success",
      ...rewardDesc,
      "",
      "Failure",
      ...penaltyDesc];

    Quests[questIdx[r]] = {
      _tooltip: tooltip,
      _dice: [],
      _questType: questType,
      _objective: objective,
      _reward: reward,
      _penalty: penalty,
      _penaltyResource: penaltyResource
    }
  }
}

function questName(questType: QuestType, penaltyResource: ResourceTypes): string
{
  if (questType === QuestType.Hull)
  {
    if (penaltyResource === ResourceTypes.Hull) return "Structural Damage";
    else if (penaltyResource === ResourceTypes.Power) return "Core Containment";
    else if (penaltyResource === ResourceTypes.Oxygen) return "Hull Breach";
    return "Hull Maintenance";
  }
  else if (questType === QuestType.Power)
  {
    if (penaltyResource === ResourceTypes.Hull) return "Power to the Shields!";
    else if (penaltyResource === ResourceTypes.Power) return "Life Support Failure";
    else if (penaltyResource === ResourceTypes.Oxygen) return "Core Malfunction";
    return "Solar Cell Maintenance";
  }
  else if (questType === QuestType.Oxygen)
  {
    if (penaltyResource === ResourceTypes.Hull) return "Pressure Equalization";
    else if (penaltyResource === ResourceTypes.Power) return "Ventilation Upkeep";
    else if (penaltyResource === ResourceTypes.Oxygen) return "Repair CO2 Scrubbers";
    return "Tend to the Arboretum";
  }
  else if (questType === QuestType.Peril)
  {
    return "Evasive Maneuvers";
  }
  else if (questType === QuestType.Progress)
  {
    return "Boost Distress Signal";
  }
  return "Contact Nearby Ship";

}

function nameGen(off: number = 0): string 
{
  let c = [];
  // @ts-ignore
  for (let b = 0; (+new Date + off) % 3 + 2 > b;)
  {
    c[++b] = String.fromCharCode(Math.random() * 25 | 0 + (b < 2 ? 65 : 97));
  }
  return c.join('');
}

export function newCrew(): void
{
  // @ts-ignore
  const monitized = document.monetization && document.monetization.state === 'started';
  CrewMembers[0] = {
    _name: monitized ? "Captain Coil" : nameGen(),
    _level: monitized ? 2 : 1,
    _exp: 0
  };
  CrewMembers[1] = {
    _name: nameGen(200),
    _level: 1,
    _exp: 0
  };
  CrewMembers[2] = {
    _name: nameGen(400),
    _level: 1,
    _exp: 0
  };
  CrewMembers[3] = {
    _name: nameGen(600),
    _level: 1,
    _exp: 0
  };
}
