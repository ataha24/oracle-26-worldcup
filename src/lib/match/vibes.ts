import { TEAMS, getTeam } from "@/lib/data/teams";
import { RESULTS } from "@/lib/data/results";
import { oddsFor } from "@/lib/forecast";
import { remainingPairings } from "@/lib/engine/standings";
import { groupOf } from "@/lib/data/groups";
import CAL from "./calibration.json";

// Five personality axes, every one computed from real data. Two representations:
//   • TEAM_VIBES — min-max 0..1, for DISPLAY (the result bars)
//   • TEAM_Z     — z-scored (mean 0, std 1), for MATCHING
// Matching = weighted projection of your trait-weights onto each team's z-vector,
// plus a per-team calibration bias (fit offline so the field stays well spread —
// no defaulting to a handful of "central" teams). See scripts/calibrate-match.ts.

export const AXES = ["glory", "firepower", "grit", "fairytale", "heartbreak"] as const;
export type Axis = (typeof AXES)[number];
export type Vibe = Record<Axis, number>;

function bestResultScore(best: string): number {
  if (/runner/i.test(best)) return 1;
  if (/fourth/i.test(best)) return 0.8;
  if (/third/i.test(best)) return 0.7;
  if (/quarter/i.test(best)) return 0.45;
  if (/round of 16/i.test(best)) return 0.3;
  return 0.1;
}

// per-team goals from completed results
const gf: Record<string, number> = {};
const ga: Record<string, number> = {};
const gp: Record<string, number> = {};
for (const t of TEAMS) {
  gf[t.id] = 0; ga[t.id] = 0; gp[t.id] = 0;
}
for (const m of RESULTS) {
  gf[m.home] += m.hg; ga[m.home] += m.ag; gp[m.home]++;
  gf[m.away] += m.ag; ga[m.away] += m.hg; gp[m.away]++;
}

const RAW: Record<string, Vibe> = Object.fromEntries(
  TEAMS.map((t) => {
    const o = oddsFor(t.id);
    const games = Math.max(1, gp[t.id]);
    const gfpg = gf[t.id] / games;
    const gapg = ga[t.id] / games;
    const debut = t.history.appearances === 0 ? 1 : 0;
    return [
      t.id,
      {
        // glory: pedigree & expectation
        glory: 0.6 * t.elo + 0.4 * 2000 * Math.sqrt(o.pWinTitle),
        // firepower: goals they're putting up right now
        firepower: gfpg,
        // grit: stinginess (fewer goals conceded)
        grit: -gapg,
        // fairytale: underdog/debutant still believing (alive despite low rank)
        fairytale: (0.7 * t.fifaRank + 18 * debut) * (0.35 + 0.65 * o.pAdvance),
        // heartbreak: rich history, never (recently) crowned, famous near-misses
        heartbreak:
          t.history.appearances +
          (t.history.titles === 0 ? 9 : 0) +
          8 * bestResultScore(t.history.bestResult) +
          (t.history.lastTitle && 2026 - t.history.lastTitle > 40 ? 8 : 0),
      },
    ];
  }),
);

// ---- normalization stats per axis ----
function stats(vals: number[]) {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((s, x) => s + (x - mean) ** 2, 0) / vals.length) || 1;
  return { lo, span: hi - lo || 1, mean, sd };
}
const STAT = Object.fromEntries(
  AXES.map((k) => [k, stats(TEAMS.map((t) => RAW[t.id][k]))]),
) as Record<Axis, ReturnType<typeof stats>>;

/** display vector (0..1) */
export const TEAM_VIBES: Record<string, Vibe> = Object.fromEntries(
  TEAMS.map((t) => [
    t.id,
    Object.fromEntries(
      AXES.map((k) => [k, (RAW[t.id][k] - STAT[k].lo) / STAT[k].span]),
    ) as Vibe,
  ]),
);

/** z-scored vector (mean 0, std 1) — the matching space */
export const TEAM_Z: Record<string, Vibe> = Object.fromEntries(
  TEAMS.map((t) => [
    t.id,
    Object.fromEntries(
      AXES.map((k) => [k, (RAW[t.id][k] - STAT[k].mean) / STAT[k].sd]),
    ) as Vibe,
  ]),
);

const BIAS: Record<string, number> = (CAL as { biases: Record<string, number> }).biases ?? {};

// ---- shape vectors: each team's z-profile centered across its OWN 5 axes ----
// Matching is the correlation between your preference SHAPE and a team's trait
// SHAPE (which axes it's relatively strong/weak on) — magnitude-invariant, so
// it rewards a distinctive pattern match, not raw all-round dominance. This
// alone spreads the field far better; calibration only fine-tunes the tail.
function centerAcrossAxes(v: Vibe): { shape: Vibe; norm: number } {
  const mean = AXES.reduce((s, k) => s + v[k], 0) / AXES.length;
  const shape = Object.fromEntries(AXES.map((k) => [k, v[k] - mean])) as Vibe;
  const norm = Math.sqrt(AXES.reduce((s, k) => s + shape[k] ** 2, 0));
  return { shape, norm };
}

const TEAM_SHAPE: Record<string, { shape: Vibe; norm: number }> = Object.fromEntries(
  TEAMS.map((t) => [t.id, centerAcrossAxes(TEAM_Z[t.id])]),
);

/** correlation of your preference-shape with a team's trait-shape (−1..1), no bias */
export function affinity(weights: Vibe, teamId: string): number {
  const u = centerAcrossAxes(weights);
  if (u.norm < 1e-9) return 0;
  const t = TEAM_SHAPE[teamId];
  let dot = 0;
  for (const k of AXES) dot += u.shape[k] * t.shape[k];
  return dot / (u.norm * t.norm || 1);
}

/** full score = affinity + calibration bias */
export function scoreTeam(weights: Vibe, teamId: string): number {
  return affinity(weights, teamId) + (BIAS[teamId] ?? 0);
}

/** rank all teams for a (possibly partial) weight vector — used by the live field + reveal */
export function rankTeams(weights: Vibe): { teamId: string; score: number }[] {
  return TEAMS.map((t) => ({ teamId: t.id, score: scoreTeam(weights, t.id) })).sort(
    (a, b) => b.score - a.score,
  );
}

export interface MatchResult {
  teamId: string;
  score: number;
  pctMatch: number; // friendly, monotonic with rank
  topAxes: Axis[];
  reasons: string[];
  nextOpponentId: string | null;
}

const AXIS_REASON: Record<Axis, (teamName: string) => string> = {
  glory: (n) => `${n} are built to win — pedigree, depth and a genuine shot at the trophy.`,
  firepower: (n) => `${n} are putting goals on the board. If you came to watch the net bulge, this is your team.`,
  grit: (n) => `${n} defend like their lives depend on it — every clean sheet is a small victory.`,
  fairytale: (n) => `${n} are the ultimate underdog story, gatecrashing the big stage and loving every second.`,
  heartbreak: (n) => `${n} will break your heart in the most beautiful way — glory always feels one game away.`,
};

export function matchTeams(weights: Vibe, topN = 3): MatchResult[] {
  const ranked = rankTeams(weights);
  const smax = ranked[0].score;
  const smin = ranked[ranked.length - 1].score;
  const span = smax - smin || 1;

  return ranked.slice(0, topN).map(({ teamId, score }) => {
    const vibe = TEAM_VIBES[teamId];
    const topAxes = [...AXES].sort((a, b) => vibe[b] - vibe[a]).slice(0, 2);
    const team = getTeam(teamId);
    const reasons = topAxes.map((ax) => AXIS_REASON[ax](team.name));
    let nextOpponentId: string | null = null;
    try {
      const rem = remainingPairings(groupOf(teamId).id);
      const pair = rem.find((p) => p.includes(teamId));
      if (pair) nextOpponentId = pair[0] === teamId ? pair[1] : pair[0];
    } catch {
      /* no group / done */
    }
    return {
      teamId,
      score,
      pctMatch: Math.max(60, Math.min(99, Math.round(70 + 29 * ((score - smin) / span)))),
      topAxes,
      reasons,
      nextOpponentId,
    };
  });
}
