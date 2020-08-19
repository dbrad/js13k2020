export const enum Easing
{
  None,
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
      return linear(t);
    case Easing.None:
    default:
      return 1;
  }
}

export type InterpolationData =
  {
    _startTime: number,
    _duration: number,
    _origin: number[],
    _target: number[],
    _easing: Easing,
    _callback: (...args: any[]) => void | null
  }

type InterpolationResult =
  {
    _values: number[],
    _done: boolean
  }

export function createInterpolationData(
  duration: number,
  origin: number[],
  destination: number[],
  easing: Easing = Easing.Linear,
  callback: (...args: any[]) => void | null = null): InterpolationData
{
  return {
    _startTime: -1,
    _duration: duration,
    _origin: [...origin],
    _target: [...destination],
    _easing: easing,
    _callback: callback
  };
}

export function interp(now: number, iData: InterpolationData): InterpolationResult
{
  if (iData._startTime === -1)
  {
    iData._startTime = now;
  }
  let elapsed = now - iData._startTime;
  if (elapsed >= iData._duration)
  {
    if (iData._callback)
    {
      iData._callback();
    }
    return { _values: iData._target, _done: true };
  }

  let p = ease(elapsed / iData._duration, iData._easing);

  let values: number[] = [];
  for (let i = 0, len = iData._origin.length; i < len; i++)
  {
    values[i] = iData._origin[i] + Math.round(iData._target[i] - iData._origin[i]) * p;
  }
  return { _values: values, _done: false };
}