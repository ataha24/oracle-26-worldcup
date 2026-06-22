import type { SimulationResult, TeamTournamentOdds } from "@/lib/types";
import raw from "@/lib/data/forecast.json";

export interface Forecast extends SimulationResult {
  matchesPlayed: number;
  dataThrough: string;
}

export const FORECAST = raw as unknown as Forecast;

export const ODDS_BY_TEAM: Record<string, TeamTournamentOdds> =
  Object.fromEntries(FORECAST.odds.map((o) => [o.teamId, o]));

export function oddsFor(teamId: string): TeamTournamentOdds {
  return ODDS_BY_TEAM[teamId];
}

/** odds sorted by title probability, descending */
export const RANKED_ODDS = FORECAST.odds;
