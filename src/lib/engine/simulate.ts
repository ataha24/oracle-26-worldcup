import type { SimulationResult, Team, TeamTournamentOdds } from "@/lib/types";
import { TEAMS, getTeam } from "@/lib/data/teams";
import { GROUPS } from "@/lib/data/groups";
import { RESULTS, LIVE_BY_PAIR, pairKey } from "@/lib/data/results";
import { BRACKET } from "@/lib/data/bracket";
import { groupPairings } from "./standings";
import { expectedGoals, predictMatch } from "./match";

// Monte Carlo simulation of the REMAINDER of the live 2026 tournament:
//   - completed group results are fixed
//   - unplayed group matches are sampled (Poisson goals from Elo)
//   - top 2 of each group + 8 best third-placed teams reach the Round of 32
//   - the official bracket (matches 73–104) is resolved tie by tie
// Run thousands of times; tally how often each team reaches each stage.

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poissonSample(lambda: number, rnd: () => number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rnd();
  } while (p > L);
  return k - 1;
}

/** host-aware expected goals oriented to (a, b) */
function xgHostAware(a: Team, b: Team): { xgA: number; xgB: number } {
  if (a.host && !b.host) {
    const { xgHome, xgAway } = expectedGoals(a, b, { homeAdvantage: true });
    return { xgA: xgHome, xgB: xgAway };
  }
  if (b.host && !a.host) {
    const { xgHome, xgAway } = expectedGoals(b, a, { homeAdvantage: true });
    return { xgA: xgAway, xgB: xgHome };
  }
  const { xgHome, xgAway } = expectedGoals(a, b, { neutral: true });
  return { xgA: xgHome, xgB: xgAway };
}

function sampleScore(a: Team, b: Team, rnd: () => number): [number, number] {
  const { xgA, xgB } = xgHostAware(a, b);
  return [poissonSample(xgA, rnd), poissonSample(xgB, rnd)];
}

/** sample a still-to-finish pairing: continue a live match, else simulate fresh */
function samplePairing(aId: string, bId: string, rnd: () => number): [number, number] {
  const live = LIVE_BY_PAIR[pairKey(aId, bId)];
  const a = getTeam(aId);
  const b = getTeam(bId);
  if (!live) return sampleScore(a, b, rnd);
  const { xgA, xgB } = xgHostAware(a, b);
  const frac = Math.max(0, Math.min(1, (90 - live.minute) / 90));
  const curA = live.home === aId ? live.hg : live.ag;
  const curB = live.home === aId ? live.ag : live.hg;
  return [curA + poissonSample(xgA * frac, rnd), curB + poissonSample(xgB * frac, rnd)];
}

function knockoutWinner(a: Team, b: Team, rnd: () => number): Team {
  if (a.host && !b.host) {
    return rnd() < predictMatch(a, b, { homeAdvantage: true }).pHomeAdvance ? a : b;
  }
  if (b.host && !a.host) {
    return rnd() < predictMatch(b, a, { homeAdvantage: true }).pHomeAdvance ? b : a;
  }
  return rnd() < predictMatch(a, b, { neutral: true }).pHomeAdvance ? a : b;
}

interface Standing {
  teamId: string;
  pts: number;
  gf: number;
  ga: number;
  gd: number;
}

// ---- pre-compute, once, the played base for each group + remaining pairings ----
interface GroupPlan {
  groupId: string;
  base: Record<string, Standing>;
  remaining: [string, string][];
}

function buildGroupPlans(): GroupPlan[] {
  return GROUPS.map((g) => {
    const base: Record<string, Standing> = Object.fromEntries(
      g.teamIds.map((id) => [id, { teamId: id, pts: 0, gf: 0, ga: 0, gd: 0 }]),
    );
    const playedPairs = new Set<string>();
    for (const m of RESULTS) {
      if (m.groupId !== g.id) continue;
      const h = base[m.home];
      const a = base[m.away];
      h.gf += m.hg; h.ga += m.ag;
      a.gf += m.ag; a.ga += m.hg;
      if (m.hg > m.ag) h.pts += 3;
      else if (m.hg < m.ag) a.pts += 3;
      else { h.pts++; a.pts++; }
      playedPairs.add([m.home, m.away].sort().join("|"));
    }
    const remaining = groupPairings(g.id).filter(
      ([a, b]) => !playedPairs.has([a, b].sort().join("|")),
    );
    return { groupId: g.id, base, remaining };
  });
}

const GROUP_PLANS = buildGroupPlans();

function rank(rows: Standing[], rnd: () => number): Standing[] {
  return rows
    .slice()
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return rnd() - 0.5;
    });
}

/** assign the 8 best thirds to the 8 third-slots respecting allowed groups */
function matchThirds(
  thirds: { teamId: string; groupId: string }[],
  slots: { match: number; allowed: string[] }[],
  rnd: () => number,
): Record<number, string> {
  const order = thirds.map((_, i) => i).sort(() => rnd() - 0.5);
  const used = new Set<number>();
  const assign: Record<number, string> = {};
  function rec(si: number): boolean {
    if (si === slots.length) return true;
    for (const i of order) {
      if (used.has(i)) continue;
      if (!slots[si].allowed.includes(thirds[i].groupId)) continue;
      used.add(i);
      assign[slots[si].match] = thirds[i].teamId;
      if (rec(si + 1)) return true;
      used.delete(i);
      delete assign[slots[si].match];
    }
    return false;
  }
  if (!rec(0)) {
    // fallback (should not happen): assign in order
    slots.forEach((s, i) => (assign[s.match] = thirds[i]?.teamId));
  }
  return assign;
}

const THIRD_SLOTS = BRACKET.filter((t) => t.away.kind === "third").map((t) => ({
  match: t.match,
  allowed: (t.away as { kind: "third"; allowed: string[] }).allowed,
}));

interface Tally {
  groupWinner: number;
  advance: number;
  r16: number;
  qf: number;
  sf: number;
  final: number;
  title: number;
  pointsSum: number;
}

export function simulate(iterations = 20000, seed = 73104): SimulationResult {
  const rnd = makeRng(seed);
  const tally: Record<string, Tally> = {};
  for (const t of TEAMS)
    tally[t.id] = {
      groupWinner: 0, advance: 0, r16: 0, qf: 0, sf: 0, final: 0, title: 0, pointsSum: 0,
    };

  for (let it = 0; it < iterations; it++) {
    const winners: Record<string, string> = {}; // group -> teamId
    const runners: Record<string, string> = {};
    const thirds: { teamId: string; groupId: string; s: Standing }[] = [];

    // ---- finish the group stage ----
    for (const plan of GROUP_PLANS) {
      const rows: Record<string, Standing> = {};
      for (const id of Object.keys(plan.base)) {
        const b = plan.base[id];
        rows[id] = { teamId: id, pts: b.pts, gf: b.gf, ga: b.ga, gd: 0 };
      }
      for (const [aId, bId] of plan.remaining) {
        const [ga, gb] = samplePairing(aId, bId, rnd);
        const A = rows[aId];
        const B = rows[bId];
        A.gf += ga; A.ga += gb;
        B.gf += gb; B.ga += ga;
        if (ga > gb) A.pts += 3;
        else if (gb > ga) B.pts += 3;
        else { A.pts++; B.pts++; }
      }
      const arr = Object.values(rows);
      for (const r of arr) r.gd = r.gf - r.ga;
      const ranked = rank(arr, rnd);
      for (const r of ranked) tally[r.teamId].pointsSum += r.pts;
      winners[plan.groupId] = ranked[0].teamId;
      runners[plan.groupId] = ranked[1].teamId;
      thirds.push({ teamId: ranked[2].teamId, groupId: plan.groupId, s: ranked[2] });
      tally[ranked[0].teamId].groupWinner++;
    }

    // ---- 8 best third-placed teams ----
    const bestThirds = thirds
      .slice()
      .sort((a, b) => {
        if (b.s.pts !== a.s.pts) return b.s.pts - a.s.pts;
        if (b.s.gd !== a.s.gd) return b.s.gd - a.s.gd;
        if (b.s.gf !== a.s.gf) return b.s.gf - a.s.gf;
        return rnd() - 0.5;
      })
      .slice(0, 8);

    for (const g of Object.values(winners)) tally[g].advance++;
    for (const g of Object.values(runners)) tally[g].advance++;
    for (const t of bestThirds) tally[t.teamId].advance++;

    const thirdAssign = matchThirds(
      bestThirds.map((t) => ({ teamId: t.teamId, groupId: t.groupId })),
      THIRD_SLOTS,
      rnd,
    );

    // ---- resolve the official bracket, tie by tie ----
    const matchWinner: Record<number, string> = {};
    const roundKey: Record<string, keyof Tally> = {
      R32: "r16", R16: "qf", QF: "sf", SF: "final", F: "title",
    };

    for (const tie of BRACKET) {
      const homeId = resolveSlot(tie.home, tie.match, winners, runners, thirdAssign, matchWinner);
      const awayId = resolveSlot(tie.away, tie.match, winners, runners, thirdAssign, matchWinner);
      const w = knockoutWinner(getTeam(homeId), getTeam(awayId), rnd);
      matchWinner[tie.match] = w.id;
      tally[w.id][roundKey[tie.round]]++;
    }
  }

  const odds: TeamTournamentOdds[] = TEAMS.map((t) => {
    const ta = tally[t.id];
    const g = GROUPS.find((gr) => gr.teamIds.includes(t.id))!;
    return {
      teamId: t.id,
      groupId: g.id,
      avgPoints: ta.pointsSum / iterations,
      pGroupWinner: ta.groupWinner / iterations,
      pAdvance: ta.advance / iterations,
      pReachR16: ta.r16 / iterations,
      pReachQF: ta.qf / iterations,
      pReachSF: ta.sf / iterations,
      pReachFinal: ta.final / iterations,
      pWinTitle: ta.title / iterations,
    };
  }).sort((a, b) => b.pWinTitle - a.pWinTitle);

  return { iterations, odds, generatedAt: new Date().toISOString() };
}

function resolveSlot(
  slot: import("@/lib/data/bracket").Slot,
  tieMatch: number,
  winners: Record<string, string>,
  runners: Record<string, string>,
  thirdAssign: Record<number, string>,
  matchWinner: Record<number, string>,
): string {
  switch (slot.kind) {
    case "winner": return winners[slot.group];
    case "runner": return runners[slot.group];
    case "third": return thirdAssign[tieMatch];
    case "matchWinner": return matchWinner[slot.match];
  }
}
