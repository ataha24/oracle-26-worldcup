import type { TeamLore } from "./types";
import { PART1 } from "./part1";
import { PART2 } from "./part2";
import { PART3 } from "./part3";
import { PART4 } from "./part4";

export type { TeamLore } from "./types";

export const TEAM_LORE: TeamLore[] = [...PART1, ...PART2, ...PART3, ...PART4];

export const LORE_BY_ID: Record<string, TeamLore> = Object.fromEntries(
  TEAM_LORE.map((l) => [l.id, l]),
);

export function getLore(id: string): TeamLore | undefined {
  return LORE_BY_ID[id];
}
