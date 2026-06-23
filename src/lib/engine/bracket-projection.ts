// Deterministic "chalk" bracket projection from the committed live state.
// Projects remaining group matches with their most-likely scoreline, finalises
// the 12 group tables, seeds the Round of 32 via the official bracket wiring,
// then resolves every knockout tie with a predicted score. Winners are decided
// by the engine's advancement probability, so a modal draw still resolves to a
// single side (via extra time / penalties). Pure + server-safe (no randomness).
import { getTeam } from "@/lib/data/teams";
import { GROUPS } from "@/lib/data/groups";
import { groupTable, remainingPairings, sortRows, type TableRow } from "@/lib/engine/standings";
import { predictFixture } from "@/lib/engine/predict";
import { BRACKET, THIRD_SLOTS, type Slot } from "@/lib/data/bracket";
import type { MatchPrediction } from "@/lib/types";

export type Round = "R32" | "R16" | "QF" | "SF" | "F";

export interface ProjectedTie {
  match: number;
  round: Round;
  aId: string;
  bId: string;
  ga: number;
  gb: number;
  winnerId: string;
  pens: boolean; // modal draw → resolved on extra time / penalties
}

export interface ProjectedGroupRow {
  teamId: string;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
}

export interface BracketProjection {
  groups: { groupId: string; rows: ProjectedGroupRow[] }[];
  bestThirds: { teamId: string; groupId: string }[];
  ties: ProjectedTie[];
  championId: string;
}

/** map a prediction's modal score back onto the (a, b) order we asked about */
function scoreAB(p: MatchPrediction, a: string): [number, number] {
  const { home, away } = p.mostLikelyScore;
  return p.homeId === a ? [home, away] : [away, home];
}
/** prob that team `a` advances (handles internal home/away swap) */
function advAB(p: MatchPrediction, a: string): number {
  return p.homeId === a ? p.pHomeAdvance : 1 - p.pHomeAdvance;
}

export function projectBracket(): BracketProjection {
  // ---- 1. project each group's final table ----
  const winners: Record<string, string> = {};
  const runners: Record<string, string> = {};
  const thirds: { teamId: string; groupId: string; row: TableRow }[] = [];
  const groups: BracketProjection["groups"] = [];

  for (const g of GROUPS) {
    const rows: Record<string, TableRow> = Object.fromEntries(
      groupTable(g.id).map((r) => [r.teamId, { ...r }]),
    );
    for (const [a, b] of remainingPairings(g.id)) {
      const [ga, gb] = scoreAB(predictFixture(a, b), a);
      const A = rows[a], B = rows[b];
      A.gf += ga; A.ga += gb; B.gf += gb; B.ga += ga;
      if (ga > gb) A.pts += 3;
      else if (gb > ga) B.pts += 3;
      else { A.pts++; B.pts++; }
    }
    const table = Object.values(rows);
    for (const r of table) r.gd = r.gf - r.ga;
    table.sort(sortRows);
    winners[g.id] = table[0].teamId;
    runners[g.id] = table[1].teamId;
    thirds.push({ teamId: table[2].teamId, groupId: g.id, row: table[2] });
    groups.push({
      groupId: g.id,
      rows: table.map((r) => ({ teamId: r.teamId, pts: r.pts, gf: r.gf, ga: r.ga, gd: r.gd })),
    });
  }

  // ---- 2. eight best third-placed teams (FIFA tiebreak: pts, gd, gf) ----
  const bestThirds = thirds
    .slice()
    .sort(
      (x, y) =>
        y.row.pts - x.row.pts || y.row.gd - x.row.gd || y.row.gf - x.row.gf ||
        x.teamId.localeCompare(y.teamId),
    )
    .slice(0, 8);

  // ---- 3. allocate the 8 thirds to their slots (deterministic, best-ranked first) ----
  const thirdAssign: Record<number, string> = {};
  const used = new Set<number>();
  const place = (si: number): boolean => {
    if (si === THIRD_SLOTS.length) return true;
    for (let i = 0; i < bestThirds.length; i++) {
      if (used.has(i) || !THIRD_SLOTS[si].allowed.includes(bestThirds[i].groupId)) continue;
      used.add(i); thirdAssign[THIRD_SLOTS[si].match] = bestThirds[i].teamId;
      if (place(si + 1)) return true;
      used.delete(i); delete thirdAssign[THIRD_SLOTS[si].match];
    }
    return false;
  };
  place(0);

  // ---- 4. resolve the bracket tie by tie ----
  const matchWinner: Record<number, string> = {};
  const resolve = (slot: Slot, match: number): string => {
    switch (slot.kind) {
      case "winner": return winners[slot.group];
      case "runner": return runners[slot.group];
      case "third": return thirdAssign[match];
      case "matchWinner": return matchWinner[slot.match];
    }
  };

  const ties: ProjectedTie[] = BRACKET.map((tie) => {
    const aId = resolve(tie.home, tie.match);
    const bId = resolve(tie.away, tie.match);
    const p = predictFixture(aId, bId, { knockout: true });
    const [ga, gb] = scoreAB(p, aId);
    const winnerId = advAB(p, aId) >= 0.5 ? aId : bId;
    matchWinner[tie.match] = winnerId;
    return { match: tie.match, round: tie.round, aId, bId, ga, gb, winnerId, pens: ga === gb };
  });

  return {
    groups,
    bestThirds: bestThirds.map((t) => ({ teamId: t.teamId, groupId: t.groupId })),
    ties,
    championId: matchWinner[104],
  };
}

/** Round columns in vertical "bracket order" (DFS from the final), for layout. */
export function bracketColumns(ties: ProjectedTie[]): Record<Round, ProjectedTie[]> {
  const byMatch = Object.fromEntries(ties.map((t) => [t.match, t]));
  const wiring = Object.fromEntries(BRACKET.map((t) => [t.match, t]));
  const cols: Record<Round, ProjectedTie[]> = { R32: [], R16: [], QF: [], SF: [], F: [] };
  const visit = (m: number) => {
    const tie = byMatch[m];
    if (!tie) return;
    cols[tie.round].push(tie);
    const w = wiring[m];
    for (const slot of [w.home, w.away]) if (slot.kind === "matchWinner") visit(slot.match);
  };
  visit(104);
  return cols;
}

// Convenience for a quick textual dump (used by scripts/predict-bracket.ts).
export function describeChampion(p: BracketProjection): string {
  const t = getTeam(p.championId);
  return `${t.flag} ${t.name}`;
}
