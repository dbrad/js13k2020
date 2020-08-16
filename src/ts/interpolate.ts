export const enum Easing
{
  Linear,
  EaseInBack,
  EaseInOutBack,
  EaseOutQuad,
  Bounce,
};


function linear(t: number): number
{
  return t;
};

function easeInBack(t: number): number
{
  const s: number = 1.70158;
  return (t) * t * ((s + 1) * t - s);
};

function bounce(t: number): number
{
  if (t < (1 / 2.75))
  {
    return (7.5625 * t * t);
  } else if (t < (2 / 2.75))
  {
    return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
  } else if (t < (2.5 / 2.75))
  {
    return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
  } else
  {
    return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
  }
};

function easeInOutBack(t: number)
{
  let s: number = 1.70158;
  t /= 0.5;
  if (t < 1) { return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)); }
  return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
};

function easeOutQuad(t: number)
{
  return t * (2 - t);
};

function ease(t: number, fn: Easing = Easing.Linear): number
{
  switch (fn)
  {
    case Easing.EaseOutQuad:
      return easeOutQuad(t);
    case Easing.EaseInBack:
      return easeInBack(t);
    case Easing.EaseInOutBack:
      return easeInOutBack(t);
    case Easing.Bounce:
      return bounce(t);
    case Easing.Linear:
    default:
      return linear(t);
  }
}

type InterpolationData =
  {
    _startTime: number,
    _duration: number,
    _origin: number,
    _target: number,
    _easing: Easing
  }

type InterpolationResult =
  {
    _value: number,
    _done: boolean
  }

export function createInterpolationData(startTime: number, duration: number, origin: number, destination: number, easing: Easing = Easing.Linear): InterpolationData
{
  return { _startTime: startTime, _duration: duration, _origin: origin, _target: destination, _easing: easing };
}

export function interp(now: number, i: InterpolationData): InterpolationResult
{
  let elapsed = now - i._startTime;
  if (elapsed >= i._duration)
  {
    return { _value: i._target, _done: true };
  }
  let p = ease(elapsed / i._duration, i._easing);
  let val = i._origin + Math.round(i._target - i._origin) * p;
  return { _value: val, _done: (val === i._target) };
}