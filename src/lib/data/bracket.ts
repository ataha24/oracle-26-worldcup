// The OFFICIAL 2026 World Cup knockout bracket wiring (matches 73–104).
// Each tie's participants are defined by group position or by the winner of a
// previous tie. Third-placed slots carry the set of groups they may draw from
// (FIFA allocates the 8 best third-placed teams into these by a published
// combination table; the engine reproduces a valid allocation by matching).
// Source: Wikipedia "2026 FIFA World Cup knockout stage".

export type Slot =
  | { kind: "winner"; group: string }
  | { kind: "runner"; group: string }
  | { kind: "third"; allowed: string[] }
  | { kind: "matchWinner"; match: number };

export interface KnockoutTie {
  match: number;
  round: "R32" | "R16" | "QF" | "SF" | "F";
  home: Slot;
  away: Slot;
}

const W = (group: string): Slot => ({ kind: "winner", group });
const R = (group: string): Slot => ({ kind: "runner", group });
const T = (allowed: string): Slot => ({ kind: "third", allowed: allowed.split("") });
const M = (match: number): Slot => ({ kind: "matchWinner", match });

export const BRACKET: KnockoutTie[] = [
  // ---- Round of 32 (matches 73–88) ----
  { match: 73, round: "R32", home: R("A"), away: R("B") },
  { match: 74, round: "R32", home: W("E"), away: T("ABCDF") },
  { match: 75, round: "R32", home: W("F"), away: R("C") },
  { match: 76, round: "R32", home: W("C"), away: R("F") },
  { match: 77, round: "R32", home: W("I"), away: T("CDFGH") },
  { match: 78, round: "R32", home: R("E"), away: R("I") },
  { match: 79, round: "R32", home: W("A"), away: T("CEFHI") },
  { match: 80, round: "R32", home: W("L"), away: T("EHIJK") },
  { match: 81, round: "R32", home: W("D"), away: T("BEFIJ") },
  { match: 82, round: "R32", home: W("G"), away: T("AEHIJ") },
  { match: 83, round: "R32", home: R("K"), away: R("L") },
  { match: 84, round: "R32", home: W("H"), away: R("J") },
  { match: 85, round: "R32", home: W("B"), away: T("EFGIJ") },
  { match: 86, round: "R32", home: W("J"), away: R("H") },
  { match: 87, round: "R32", home: W("K"), away: T("DEIJL") },
  { match: 88, round: "R32", home: R("D"), away: R("G") },

  // ---- Round of 16 (89–96) ----
  { match: 89, round: "R16", home: M(74), away: M(77) },
  { match: 90, round: "R16", home: M(73), away: M(75) },
  { match: 91, round: "R16", home: M(76), away: M(78) },
  { match: 92, round: "R16", home: M(79), away: M(80) },
  { match: 93, round: "R16", home: M(83), away: M(84) },
  { match: 94, round: "R16", home: M(81), away: M(82) },
  { match: 95, round: "R16", home: M(86), away: M(88) },
  { match: 96, round: "R16", home: M(85), away: M(87) },

  // ---- Quarter-finals (97–100) ----
  { match: 97, round: "QF", home: M(89), away: M(90) },
  { match: 98, round: "QF", home: M(93), away: M(94) },
  { match: 99, round: "QF", home: M(91), away: M(92) },
  { match: 100, round: "QF", home: M(95), away: M(96) },

  // ---- Semi-finals (101–102) ----
  { match: 101, round: "SF", home: M(97), away: M(98) },
  { match: 102, round: "SF", home: M(99), away: M(100) },

  // ---- Final (104) ----
  { match: 104, round: "F", home: M(101), away: M(102) },
];

/** the 8 third-placed slots, in bracket order, with their allowed groups */
export const THIRD_SLOTS: { match: number; allowed: string[] }[] = BRACKET.filter(
  (t) => t.away.kind === "third",
).map((t) => ({
  match: t.match,
  allowed: (t.away as { kind: "third"; allowed: string[] }).allowed,
}));
