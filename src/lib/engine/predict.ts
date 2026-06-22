import { getTeam } from "@/lib/data/teams";
import { predictMatch, type MatchContext } from "./match";
import type { MatchPrediction } from "@/lib/types";

/**
 * Predict a fixture between two team ids. A host nation is treated as the home
 * side; otherwise the match is neutral. Works on both server and client.
 */
export function predictFixture(
  aId: string,
  bId: string,
  opts: { knockout?: boolean } = {},
): MatchPrediction {
  const a = getTeam(aId);
  const b = getTeam(bId);
  const ctx: MatchContext = {};
  let home = a;
  let away = b;
  if (a.host && !b.host) {
    home = a; away = b; ctx.homeAdvantage = true;
  } else if (b.host && !a.host) {
    home = b; away = a; ctx.homeAdvantage = true;
  } else {
    ctx.neutral = true;
  }
  return predictMatch(home, away, ctx);
}
