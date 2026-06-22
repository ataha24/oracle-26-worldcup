import type { MatchPrediction, Team } from "@/lib/types";
import { effectiveElo } from "@/lib/data/teams";

// ----------------------------------------------------------------------------
// The model
// ----------------------------------------------------------------------------
// 1. Elo determines win expectancy and goal supremacy.
// 2. Supremacy + an average goal environment give each side an expected-goals
//    rate (lambda).
// 3. A Poisson grid over both lambdas yields every scoreline probability, from
//    which win/draw/loss, BTTS, over/under, clean sheets, etc. are derived.
// This is the same family of models used by professional football modellers.

const HOME_ADV_ELO = 65; // applied to a host playing in their own country
const AVG_MATCH_GOALS = 2.65; // World Cup baseline total goals
const GOALS_PER_ELO = 1 / 155; // ~155 Elo gap ≈ one goal of supremacy
const MAX_GOALS = 9; // grid dimension

function poissonPmf(k: number, lambda: number): number {
  // e^-λ λ^k / k!
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

export interface MatchContext {
  /** team playing at home / with crowd advantage (host nations) */
  homeAdvantage?: boolean;
  /** neutral-venue knockout: no home edge */
  neutral?: boolean;
}

export function expectedGoals(
  home: Team,
  away: Team,
  ctx: MatchContext = {},
): { xgHome: number; xgAway: number } {
  let eloH = effectiveElo(home);
  let eloA = effectiveElo(away);
  if (ctx.homeAdvantage && !ctx.neutral) eloH += HOME_ADV_ELO;

  const supremacy = (eloH - eloA) * GOALS_PER_ELO; // expected goal difference
  // split the average goal environment around the supremacy
  const base = AVG_MATCH_GOALS / 2;
  let xgHome = base + supremacy / 2;
  let xgAway = base - supremacy / 2;
  // mild compression so blowouts stay realistic; floor keeps Poisson valid
  xgHome = Math.max(0.18, xgHome);
  xgAway = Math.max(0.18, xgAway);
  return { xgHome, xgAway };
}

export function predictMatch(
  home: Team,
  away: Team,
  ctx: MatchContext = {},
): MatchPrediction {
  const { xgHome, xgAway } = expectedGoals(home, away, ctx);

  const homePmf = Array.from({ length: MAX_GOALS + 1 }, (_, k) =>
    poissonPmf(k, xgHome),
  );
  const awayPmf = Array.from({ length: MAX_GOALS + 1 }, (_, k) =>
    poissonPmf(k, xgAway),
  );

  const grid: number[][] = [];
  let pHomeWin = 0,
    pDraw = 0,
    pAwayWin = 0,
    pOver25 = 0,
    pBtts = 0;
  let mostLikely = { home: 0, away: 0, p: 0 };

  for (let h = 0; h <= MAX_GOALS; h++) {
    grid[h] = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = homePmf[h] * awayPmf[a];
      grid[h][a] = p;
      if (h > a) pHomeWin += p;
      else if (h === a) pDraw += p;
      else pAwayWin += p;
      if (h + a > 2.5) pOver25 += p;
      if (h > 0 && a > 0) pBtts += p;
      if (p > mostLikely.p) mostLikely = { home: h, away: a, p };
    }
  }

  const pCleanSheetHome = awayPmf[0]; // away scores 0
  const pCleanSheetAway = homePmf[0];

  // knockout advancement: 90' result, else extra-time + penalties
  const pHomeAdvance = knockoutAdvance(
    home,
    away,
    pHomeWin,
    pDraw,
    pAwayWin,
    ctx,
  );

  return {
    homeId: home.id,
    awayId: away.id,
    xgHome,
    xgAway,
    pHomeWin,
    pDraw,
    pAwayWin,
    scoreGrid: grid,
    mostLikelyScore: mostLikely,
    pOver25,
    pBtts,
    pCleanSheetHome,
    pCleanSheetAway,
    pHomeAdvance,
  };
}

function knockoutAdvance(
  home: Team,
  away: Team,
  pHomeWin: number,
  pDraw: number,
  pAwayWin: number,
  ctx: MatchContext,
): number {
  // If drawn after 90', extra time slightly favours the stronger side; a
  // remaining tie goes to penalties (near coin-flip, mild Elo lean).
  let eloH = effectiveElo(home);
  let eloA = effectiveElo(away);
  if (ctx.homeAdvantage && !ctx.neutral) eloH += HOME_ADV_ELO;
  const etHomeShare = 0.5 + (eloH - eloA) / 2600; // extra-time edge
  const penHomeShare = 0.5 + (eloH - eloA) / 5000; // shootout lean
  const drawResolvedHome =
    pDraw * (0.62 * clamp01(etHomeShare) + 0.38 * clamp01(penHomeShare));
  return pHomeWin + drawResolvedHome;
}

function clamp01(x: number): number {
  return Math.max(0.02, Math.min(0.98, x));
}

// ----------------------------------------------------------------------------
// Live (in-progress) matches
// ----------------------------------------------------------------------------
// Continue a match from its current score: only the goals expected in the
// REMAINING minutes are modelled, then added to what's already on the board.

export interface LiveState {
  hg: number;
  ag: number;
  minute: number;
}

/** expected goals for the rest of the match, given the minute played */
export function remainingXg(
  home: Team,
  away: Team,
  minute: number,
  ctx: MatchContext = {},
): { xgHome: number; xgAway: number } {
  const full = expectedGoals(home, away, ctx);
  const frac = Math.max(0, Math.min(1, (90 - minute) / 90));
  return { xgHome: full.xgHome * frac, xgAway: full.xgAway * frac };
}

/** W/D/L for a live match from its current score (home/away orientation) */
export function liveOutcome(
  home: Team,
  away: Team,
  state: LiveState,
  ctx: MatchContext = {},
): { pHomeWin: number; pDraw: number; pAwayWin: number } {
  const { xgHome, xgAway } = remainingXg(home, away, state.minute, ctx);
  const N = 7;
  const hp = Array.from({ length: N + 1 }, (_, k) => poissonPmfLocal(k, xgHome));
  const ap = Array.from({ length: N + 1 }, (_, k) => poissonPmfLocal(k, xgAway));
  let pHomeWin = 0, pDraw = 0, pAwayWin = 0;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = hp[i] * ap[j];
      const fh = state.hg + i;
      const fa = state.ag + j;
      if (fh > fa) pHomeWin += p;
      else if (fh === fa) pDraw += p;
      else pAwayWin += p;
    }
  }
  return { pHomeWin, pDraw, pAwayWin };
}

function poissonPmfLocal(k: number, lambda: number): number {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}
