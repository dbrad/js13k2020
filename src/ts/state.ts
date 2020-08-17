import { v2 } from "./types";

// @ifdef DEBUG
export let DEBUG: boolean = false;
export function toggleDEBUG(): void
{
  DEBUG = !DEBUG;
}
// @endif

export const Input = {
  Pointer: [0, 0] as v2,
  MouseDown: false,
  Hot: 0,
  Active: 0
}