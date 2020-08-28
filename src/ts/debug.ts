export function assert(predicate: (() => boolean) | boolean, message: string): asserts predicate
{
  // @ifdef DEBUG
  if (typeof predicate === "function" ? !predicate() : !predicate)
  {
    throw new Error(message);
  }
  // @endif
}