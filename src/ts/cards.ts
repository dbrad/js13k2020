enum EventType
{
  Boon,
  Peril,
  Rescue
}

type EventCard = {
  _name: string,
  _type: EventType,
  _effect: string
}

type PlayerCard = {
  name: string,
}

const _FOOD = "Food";
const _OXYGEN = "O2";
const _WATER = "Water";
const _MATERIALS = "Materials";
const _HULL_BREACH = "Hull Breach";
const _BOOST_SIGNAL = "Boost Signal";

export const EventCards = new Map([
  [_FOOD, {
    _name: _FOOD,
    _type: EventType.Boon,
    _effect: "gain food"
  }],
  [_OXYGEN, {
    _name: _OXYGEN,
    _type: EventType.Boon,
    _effect: "gain o2"
  }],
  [_WATER, {
    _name: _WATER,
    _type: EventType.Boon,
    _effect: "gain water"
  }],
  [_MATERIALS, {
    _name: _MATERIALS,
    _type: EventType.Boon,
    _effect: "gain mat"
  }],
  [_HULL_BREACH, {
    _name: _HULL_BREACH,
    _type: EventType.Peril,
    _effect: "lose o2"
  }],
  [_BOOST_SIGNAL, {
    _name: _BOOST_SIGNAL,
    _type: EventType.Rescue,
    _effect: "boost"
  }],
]);