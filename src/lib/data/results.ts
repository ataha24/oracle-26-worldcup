// Completed 2026 World Cup group-stage results (final scores), through the
// matches played up to 2026-06-20. The engine treats these as fixed and
// simulates everything still to be played. Add new rows here as matches finish.
// Sources: ESPN / FIFA match schedule & results.

export interface PlayedMatch {
  groupId: string;
  home: string; // team id
  away: string; // team id
  hg: number; // home goals
  ag: number; // away goals
  date: string; // ISO date
}

export const RESULTS: PlayedMatch[] = [
  // ---- Group A ----
  { groupId: "A", home: "mexico", away: "south-africa", hg: 2, ag: 0, date: "2026-06-11" },
  { groupId: "A", home: "south-korea", away: "czech-republic", hg: 2, ag: 1, date: "2026-06-11" },
  { groupId: "A", home: "czech-republic", away: "south-africa", hg: 1, ag: 1, date: "2026-06-18" },
  { groupId: "A", home: "mexico", away: "south-korea", hg: 1, ag: 0, date: "2026-06-18" },

  // ---- Group B ----
  { groupId: "B", home: "canada", away: "bosnia", hg: 1, ag: 1, date: "2026-06-12" },
  { groupId: "B", home: "qatar", away: "switzerland", hg: 1, ag: 1, date: "2026-06-13" },
  { groupId: "B", home: "switzerland", away: "bosnia", hg: 4, ag: 1, date: "2026-06-18" },
  { groupId: "B", home: "canada", away: "qatar", hg: 6, ag: 0, date: "2026-06-18" },

  // ---- Group C ----
  { groupId: "C", home: "brazil", away: "morocco", hg: 1, ag: 1, date: "2026-06-13" },
  { groupId: "C", home: "haiti", away: "scotland", hg: 0, ag: 1, date: "2026-06-13" },
  { groupId: "C", home: "scotland", away: "morocco", hg: 0, ag: 1, date: "2026-06-19" },
  { groupId: "C", home: "brazil", away: "haiti", hg: 3, ag: 0, date: "2026-06-19" },

  // ---- Group D ----
  { groupId: "D", home: "usa", away: "paraguay", hg: 4, ag: 1, date: "2026-06-12" },
  { groupId: "D", home: "australia", away: "turkey", hg: 2, ag: 0, date: "2026-06-13" },
  { groupId: "D", home: "usa", away: "australia", hg: 2, ag: 0, date: "2026-06-19" },
  { groupId: "D", home: "turkey", away: "paraguay", hg: 0, ag: 1, date: "2026-06-19" },

  // ---- Group E ----
  { groupId: "E", home: "germany", away: "curacao", hg: 7, ag: 1, date: "2026-06-14" },
  { groupId: "E", home: "ivory-coast", away: "ecuador", hg: 1, ag: 0, date: "2026-06-14" },
  { groupId: "E", home: "germany", away: "ivory-coast", hg: 2, ag: 1, date: "2026-06-20" },
  { groupId: "E", home: "ecuador", away: "curacao", hg: 0, ag: 0, date: "2026-06-20" },

  // ---- Group F ----
  { groupId: "F", home: "netherlands", away: "japan", hg: 2, ag: 2, date: "2026-06-14" },
  { groupId: "F", home: "sweden", away: "tunisia", hg: 5, ag: 1, date: "2026-06-14" },
  { groupId: "F", home: "netherlands", away: "sweden", hg: 5, ag: 1, date: "2026-06-20" },
  { groupId: "F", home: "japan", away: "tunisia", hg: 4, ag: 0, date: "2026-06-20" },

  // ---- Group G (one round played) ----
  { groupId: "G", home: "belgium", away: "egypt", hg: 1, ag: 1, date: "2026-06-15" },
  { groupId: "G", home: "iran", away: "new-zealand", hg: 2, ag: 2, date: "2026-06-15" },

  // ---- Group H (one round played) ----
  { groupId: "H", home: "spain", away: "cape-verde", hg: 0, ag: 0, date: "2026-06-15" },
  { groupId: "H", home: "saudi-arabia", away: "uruguay", hg: 1, ag: 1, date: "2026-06-15" },

  // ---- Group I (one round played) ----
  { groupId: "I", home: "france", away: "senegal", hg: 3, ag: 1, date: "2026-06-16" },
  { groupId: "I", home: "iraq", away: "norway", hg: 1, ag: 4, date: "2026-06-16" },

  // ---- Group J (one round played) ----
  { groupId: "J", home: "argentina", away: "algeria", hg: 3, ag: 0, date: "2026-06-16" },
  { groupId: "J", home: "austria", away: "jordan", hg: 3, ag: 1, date: "2026-06-16" },

  // ---- Group K (one round played) ----
  { groupId: "K", home: "portugal", away: "dr-congo", hg: 1, ag: 1, date: "2026-06-17" },
  { groupId: "K", home: "uzbekistan", away: "colombia", hg: 1, ag: 3, date: "2026-06-17" },

  // ---- Group L (one round played) ----
  { groupId: "L", home: "england", away: "croatia", hg: 4, ag: 2, date: "2026-06-17" },
  { groupId: "L", home: "ghana", away: "panama", hg: 1, ag: 0, date: "2026-06-17" },
];

/** key for an unordered pair of teams */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** map of played pairings -> {hg, ag} oriented as stored (home/away) */
export const PLAYED_BY_PAIR: Record<string, PlayedMatch> = Object.fromEntries(
  RESULTS.map((m) => [pairKey(m.home, m.away), m]),
);

export const LAST_UPDATED = "2026-06-20";
