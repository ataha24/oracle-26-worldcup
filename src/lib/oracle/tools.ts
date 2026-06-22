import { z } from "zod";
import { tool } from "ai";
import { TEAMS, getTeam } from "@/lib/data/teams";
import { GROUP_BY_ID } from "@/lib/data/groups";
import { RANKED_ODDS, oddsFor, ODDS_BY_TEAM } from "@/lib/forecast";
import { groupTable } from "@/lib/engine/standings";
import { predictFixture } from "@/lib/engine/predict";
import { findTeamId } from "./answer";

const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

function resolve(name: string): string {
  const id = findTeamId(name) ?? (ODDS_BY_TEAM[name] ? name : null);
  if (!id) throw new Error(`Unknown team "${name}"`);
  return id;
}

/** The engine tools the Oracle model may call. Every number is computed here. */
export const oracleTools = {
  titleOdds: tool({
    description:
      "Get the most likely World Cup champions with their probability of winning the title and reaching the final.",
    inputSchema: z.object({
      topN: z.number().int().min(1).max(48).default(8).describe("how many teams"),
    }),
    execute: async ({ topN }) =>
      RANKED_ODDS.slice(0, topN).map((o) => ({
        team: getTeam(o.teamId).name,
        group: o.groupId,
        winTitle: pc(o.pWinTitle),
        reachFinal: pc(o.pReachFinal),
        reachSemi: pc(o.pReachSF),
      })),
  }),

  teamOutlook: tool({
    description:
      "Get a single team's full forecast: ratings, group, and probabilities to advance, reach each knockout round, and win the title.",
    inputSchema: z.object({
      team: z.string().describe("team name, e.g. 'Brazil', 'USA', 'South Korea'"),
    }),
    execute: async ({ team }) => {
      const id = resolve(team);
      const t = getTeam(id);
      const o = oddsFor(id);
      const rank = RANKED_ODDS.findIndex((x) => x.teamId === id) + 1;
      return {
        team: t.name,
        group: o.groupId,
        elo: Math.round(t.elo),
        fifaRank: t.fifaRank,
        overallPick: rank,
        keyPlayers: t.stars,
        history: t.history,
        odds: {
          reachKnockouts: pc(o.pAdvance),
          winGroup: pc(o.pGroupWinner),
          reachQF: pc(o.pReachQF),
          reachSF: pc(o.pReachSF),
          reachFinal: pc(o.pReachFinal),
          winTitle: pc(o.pWinTitle),
        },
      };
    },
  }),

  predictMatchup: tool({
    description:
      "Predict a single match between two teams: win/draw/loss probabilities, expected goals, most likely score, and knockout advancement.",
    inputSchema: z.object({
      teamA: z.string(),
      teamB: z.string(),
    }),
    execute: async ({ teamA, teamB }) => {
      const aId = resolve(teamA);
      const bId = resolve(teamB);
      const p = predictFixture(aId, bId, { knockout: true });
      const flip = p.homeId !== aId;
      return {
        teamA: getTeam(aId).name,
        teamB: getTeam(bId).name,
        teamAwin: pc(flip ? p.pAwayWin : p.pHomeWin),
        draw: pc(p.pDraw),
        teamBwin: pc(flip ? p.pHomeWin : p.pAwayWin),
        expectedGoals: `${(flip ? p.xgAway : p.xgHome).toFixed(2)} - ${(flip ? p.xgHome : p.xgAway).toFixed(2)}`,
        mostLikelyScore: `${flip ? p.mostLikelyScore.away : p.mostLikelyScore.home}-${flip ? p.mostLikelyScore.home : p.mostLikelyScore.away}`,
        teamAadvancesKnockout: pc(flip ? 1 - p.pHomeAdvance : p.pHomeAdvance),
        over2_5goals: pc(p.pOver25),
        bothTeamsScore: pc(p.pBtts),
      };
    },
  }),

  groupStandings: tool({
    description:
      "Get the live table for one group (A–L) from real results, plus each team's probability to qualify for the knockouts.",
    inputSchema: z.object({
      group: z.string().describe("a single group letter A through L"),
    }),
    execute: async ({ group }) => {
      const g = group.trim().toUpperCase();
      if (!GROUP_BY_ID[g]) throw new Error(`No group "${group}"`);
      return groupTable(g).map((r) => ({
        team: getTeam(r.teamId).name,
        played: r.played,
        points: r.pts,
        goalDiff: r.gd,
        qualifyProbability: pc(oddsFor(r.teamId).pAdvance),
      }));
    },
  }),

  darkHorses: tool({
    description:
      "List the best dark horses — teams ranked outside the world's top 15 most likely to reach the quarter-finals.",
    inputSchema: z.object({}),
    execute: async () =>
      RANKED_ODDS.filter((o) => getTeam(o.teamId).fifaRank > 15)
        .sort((a, b) => b.pReachQF - a.pReachQF)
        .slice(0, 6)
        .map((o) => ({ team: getTeam(o.teamId).name, reachQF: pc(o.pReachQF) })),
  }),
};

/** Comma-separated list of valid team names, for the system prompt. */
export const TEAM_NAME_LIST = TEAMS.map((t) => t.name).join(", ");
