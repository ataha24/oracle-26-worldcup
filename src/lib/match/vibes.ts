import { TEAMS, getTeam } from "@/lib/data/teams";
import { RESULTS } from "@/lib/data/results";
import { oddsFor } from "@/lib/forecast";
import { remainingPairings } from "@/lib/engine/standings";
import { groupOf } from "@/lib/data/groups";

// Five personality axes, every one computed from real data. A team's vibe
// vector and a quiz-taker's answer vector live in the same space; the closest
// team (by cosine similarity) is your "soulmate".

export const AXES = ["glory", "firepower", "grit", "fairytale", "heartbreak"] as const;
export type Axis = (typeof AXES)[number];
export type Vibe = Record<Axis, number>;

function minmax(vals: number[]): (x: number) => number {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const span = hi - lo || 1;
  return (x) => (x - lo) / span;
}

interface Raw {
  teamId: string;
  glory: number;
  firepower: number;
  grit: number;
  fairytale: number;
  heartbreak: number;
}

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

const raw: Raw[] = TEAMS.map((t) => {
  const o = oddsFor(t.id);
  const games = Math.max(1, gp[t.id]);
  const gfpg = gf[t.id] / games;
  const gapg = ga[t.id] / games;
  const debut = t.history.appearances === 0 ? 1 : 0;

  return {
    teamId: t.id,
    // glory: pedigree & expectation
    glory: 0.6 * t.elo + 0.4 * 2000 * Math.sqrt(o.pWinTitle),
    // firepower: goals they're putting up right now
    firepower: gfpg,
    // grit: stinginess + low-scoring resilience (fewer goals conceded)
    grit: -gapg,
    // fairytale: underdog/debutant still believing (alive despite low rank)
    fairytale: (0.7 * t.fifaRank + 18 * debut) * (0.35 + 0.65 * o.pAdvance),
    // heartbreak: rich history, never (recently) crowned, famous near-misses
    heartbreak:
      t.history.appearances +
      (t.history.titles === 0 ? 9 : 0) +
      8 * bestResultScore(t.history.bestResult) +
      (t.history.lastTitle && 2026 - t.history.lastTitle > 40 ? 8 : 0),
  };
});

const norm: Record<Axis, (x: number) => number> = {
  glory: minmax(raw.map((r) => r.glory)),
  firepower: minmax(raw.map((r) => r.firepower)),
  grit: minmax(raw.map((r) => r.grit)),
  fairytale: minmax(raw.map((r) => r.fairytale)),
  heartbreak: minmax(raw.map((r) => r.heartbreak)),
};

export const TEAM_VIBES: Record<string, Vibe> = Object.fromEntries(
  raw.map((r) => [
    r.teamId,
    {
      glory: norm.glory(r.glory),
      firepower: norm.firepower(r.firepower),
      grit: norm.grit(r.grit),
      fairytale: norm.fairytale(r.fairytale),
      heartbreak: norm.heartbreak(r.heartbreak),
    },
  ]),
);

function cosine(a: Vibe, b: Vibe): number {
  let dot = 0, na = 0, nb = 0;
  for (const k of AXES) {
    dot += a[k] * b[k];
    na += a[k] * a[k];
    nb += b[k] * b[k];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export interface MatchResult {
  teamId: string;
  score: number; // 0..1 similarity
  pctMatch: number; // friendly 70..99
  topAxes: Axis[]; // the team's defining traits
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

export function matchTeams(user: Vibe, topN = 3): MatchResult[] {
  const scored = TEAMS.map((t) => ({ teamId: t.id, score: cosine(user, TEAM_VIBES[t.id]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored.map(({ teamId, score }) => {
    const vibe = TEAM_VIBES[teamId];
    const topAxes = [...AXES].sort((a, b) => vibe[b] - vibe[a]).slice(0, 2);
    const team = getTeam(teamId);
    const reasons = topAxes.map((ax) => AXIS_REASON[ax](team.name));
    // next group opponent (if any group games remain)
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
      pctMatch: Math.round(70 + score * 29),
      topAxes,
      reasons,
      nextOpponentId,
    };
  });
}
