import { fetchEspnGames } from "@/lib/live/espn";
import { simulate } from "@/lib/engine/simulate";
import { liveOutcome } from "@/lib/engine/match";
import { getTeam } from "@/lib/data/teams";
import {
  RESULTS,
  pairKey,
  type PlayedMatch,
  type LiveMatch,
} from "@/lib/data/results";
import { ODDS_BY_TEAM } from "@/lib/forecast";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ITER = 15000; // quick live re-sim (vs 50k for the committed baseline)

export async function GET() {
  let games;
  try {
    games = await fetchEspnGames();
  } catch (err) {
    return Response.json(
      { ok: false, error: `live feed unavailable: ${err instanceof Error ? err.message : err}` },
      { status: 502 },
    );
  }

  // Merge ESPN finals into our committed results; collect in-progress games.
  const results: PlayedMatch[] = [...RESULTS];
  const seen = new Set(results.map((m) => pairKey(m.home, m.away)));
  const live: LiveMatch[] = [];
  const liveGames = [];
  const justFinished = [];

  for (const g of games) {
    const key = pairKey(g.homeId, g.awayId);
    if (g.state === "post") {
      if (!seen.has(key)) {
        results.push({ groupId: g.groupId, home: g.homeId, away: g.awayId, hg: g.hg, ag: g.ag, date: "live" });
        seen.add(key);
      }
      justFinished.push(gameView(g));
    } else if (g.state === "in" && !seen.has(key)) {
      live.push({ groupId: g.groupId, home: g.homeId, away: g.awayId, hg: g.hg, ag: g.ag, minute: g.minute });
      const h = getTeam(g.homeId);
      const a = getTeam(g.awayId);
      const o = liveOutcome(h, a, { hg: g.hg, ag: g.ag, minute: g.minute }, { neutral: !(h.host || a.host) });
      liveGames.push({ ...gameView(g), eventId: g.eventId, wdl: { h: o.pHomeWin, d: o.pDraw, a: o.pAwayWin } });
    }
  }

  const sim = simulate(ITER, 73104, { results, live });

  const title = sim.odds.slice(0, 14).map((o) => {
    const base = ODDS_BY_TEAM[o.teamId]?.pWinTitle ?? o.pWinTitle;
    const t = getTeam(o.teamId);
    return {
      teamId: o.teamId,
      name: t.name,
      flag: t.flag,
      group: o.groupId,
      pWinTitle: o.pWinTitle,
      pAdvance: o.pAdvance,
      delta: o.pWinTitle - base,
    };
  });

  return Response.json({
    ok: true,
    source: "ESPN",
    updatedAt: new Date().toISOString(),
    iterations: ITER,
    liveGames,
    justFinished,
    title,
  });
}

function gameView(g: { homeId: string; awayId: string; hg: number; ag: number; minute: number; detail: string; groupId: string }) {
  const h = getTeam(g.homeId);
  const a = getTeam(g.awayId);
  return {
    groupId: g.groupId,
    home: h.name, homeFlag: h.flag,
    away: a.name, awayFlag: a.flag,
    hg: g.hg, ag: g.ag, minute: g.minute, detail: g.detail,
  };
}
