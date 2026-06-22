import { GROUP_BY_ID } from "@/lib/data/groups";
import { RESULTS, PLAYED_BY_PAIR, pairKey } from "@/lib/data/results";

export interface TableRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

/** all 6 unordered pairings of a group (round-robin schedule) */
export function groupPairings(groupId: string): [string, string][] {
  const ids = GROUP_BY_ID[groupId].teamIds;
  const pairs: [string, string][] = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
  return pairs;
}

export function remainingPairings(groupId: string): [string, string][] {
  return groupPairings(groupId).filter(
    ([a, b]) => !PLAYED_BY_PAIR[pairKey(a, b)],
  );
}

/** current live table for a group, computed from completed results only */
export function groupTable(groupId: string): TableRow[] {
  const ids = GROUP_BY_ID[groupId].teamIds;
  const rows: Record<string, TableRow> = Object.fromEntries(
    ids.map((id) => [
      id,
      { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    ]),
  );

  for (const m of RESULTS) {
    if (m.groupId !== groupId) continue;
    const h = rows[m.home];
    const a = rows[m.away];
    h.played++; a.played++;
    h.gf += m.hg; h.ga += m.ag;
    a.gf += m.ag; a.ga += m.hg;
    if (m.hg > m.ag) { h.won++; a.lost++; h.pts += 3; }
    else if (m.hg < m.ag) { a.won++; h.lost++; a.pts += 3; }
    else { h.drawn++; a.drawn++; h.pts++; a.pts++; }
  }
  for (const r of Object.values(rows)) r.gd = r.gf - r.ga;

  return Object.values(rows).sort(sortRows);
}

export function sortRows(a: TableRow, b: TableRow): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.teamId.localeCompare(b.teamId);
}

export const TOTAL_MATCHES_PLAYED = RESULTS.length;
