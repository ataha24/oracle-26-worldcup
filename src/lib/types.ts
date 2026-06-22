// ORACLE '26 — core domain types

export type Confederation =
  | "UEFA"
  | "CONMEBOL"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export interface Team {
  id: string; // slug, e.g. "argentina"
  name: string;
  code: string; // 3-letter, e.g. ARG
  flag: string; // emoji
  confederation: Confederation;
  fifaRank: number;
  /** World Football Elo rating (approx., late-2025 form basis) */
  elo: number;
  host?: boolean;
  /** narrative blurb for the team profile */
  blurb: string;
  history: {
    appearances: number;
    titles: number;
    bestResult: string;
    lastTitle?: number;
  };
  stars: string[]; // key players
  /** 0..1 momentum modifier from recent form, applied as small elo nudge */
  formTrend: number; // -1 cold ... +1 hot
}

export interface Group {
  id: string; // "A".."L"
  teamIds: string[]; // 4 team ids
}

// ----- engine outputs -----

export interface MatchPrediction {
  homeId: string;
  awayId: string;
  /** expected goals */
  xgHome: number;
  xgAway: number;
  pHomeWin: number;
  pDraw: number;
  pAwayWin: number;
  /** [homeGoals][awayGoals] probability grid */
  scoreGrid: number[][];
  mostLikelyScore: { home: number; away: number; p: number };
  pOver25: number;
  pBtts: number; // both teams to score
  pCleanSheetHome: number;
  pCleanSheetAway: number;
  /** knockout: probability home advances (incl. ET + pens) */
  pHomeAdvance: number;
}

export interface TeamTournamentOdds {
  teamId: string;
  groupId: string;
  avgPoints: number;
  pGroupWinner: number;
  pAdvance: number; // top 2 or best-third → reach R32
  pReachR16: number;
  pReachQF: number;
  pReachSF: number;
  pReachFinal: number;
  pWinTitle: number;
}

export interface SimulationResult {
  iterations: number;
  odds: TeamTournamentOdds[];
  generatedAt: string;
}
