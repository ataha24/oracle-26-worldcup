import { TEAMS } from "@/lib/data/teams";
import { groupOf } from "@/lib/data/groups";

// Pulls live & recent 2026 World Cup scores from ESPN's public (keyless)
// scoreboard API and maps them onto our team ids. No API key required.
// Endpoint: site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard

const BASE =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

export interface EspnGame {
  groupId: string;
  homeId: string;
  awayId: string;
  hg: number;
  ag: number;
  state: "pre" | "in" | "post";
  minute: number; // 0..90+ (90 when final)
  detail: string; // e.g. "FT", "62'", "HT"
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// base map from our own data (by name and 3-letter code) + ESPN-specific aliases
const NAME_TO_ID: Record<string, string> = {};
for (const t of TEAMS) {
  NAME_TO_ID[norm(t.name)] = t.id;
  NAME_TO_ID[norm(t.code)] = t.id;
}
Object.assign(NAME_TO_ID, {
  [norm("Turkey")]: "turkey",
  [norm("Czech Republic")]: "czech-republic",
  [norm("Bosnia and Herzegovina")]: "bosnia",
  [norm("Bosnia & Herzegovina")]: "bosnia",
  [norm("Ivory Coast")]: "ivory-coast",
  [norm("Cote d'Ivoire")]: "ivory-coast",
  [norm("Congo DR")]: "dr-congo",
  [norm("DR Congo")]: "dr-congo",
  [norm("Democratic Republic of the Congo")]: "dr-congo",
  [norm("Cabo Verde")]: "cape-verde",
  [norm("Korea Republic")]: "south-korea",
  [norm("USA")]: "usa",
  [norm("United States of America")]: "usa",
  [norm("IR Iran")]: "iran",
});

function resolveTeam(displayName: string, abbr?: string): string | null {
  return (
    NAME_TO_ID[norm(displayName)] ??
    (abbr ? NAME_TO_ID[norm(abbr)] : undefined) ??
    null
  );
}

function ymd(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0")
  );
}

interface EspnCompetitor {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string; name?: string; abbreviation?: string };
}

/** Fetch games across a small window of recent dates; dedupe by team pair. */
export async function fetchEspnGames(): Promise<EspnGame[]> {
  const now = new Date();
  const dates = [0, 1, 2, 3].map((back) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - back);
    return ymd(d);
  });

  const byPair = new Map<string, EspnGame>();
  const rank = { pre: 0, in: 1, post: 2 } as const;

  await Promise.all(
    dates.map(async (ds) => {
      try {
        const res = await fetch(`${BASE}?dates=${ds}`, {
          headers: { "User-Agent": "oracle26" },
          // never cache live data
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        for (const e of data.events ?? []) {
          const comp = e.competitions?.[0];
          if (!comp) continue;
          const st = comp.status?.type ?? {};
          const state: EspnGame["state"] =
            st.state === "in" ? "in" : st.state === "post" ? "post" : "pre";
          const cs: EspnCompetitor[] = comp.competitors ?? [];
          const home = cs.find((c) => c.homeAway === "home") ?? cs[0];
          const away = cs.find((c) => c.homeAway === "away") ?? cs[1];
          if (!home || !away) continue;
          const homeId = resolveTeam(home.team?.displayName ?? "", home.team?.abbreviation);
          const awayId = resolveTeam(away.team?.displayName ?? "", away.team?.abbreviation);
          if (!homeId || !awayId) continue;
          let groupId: string;
          try {
            groupId = groupOf(homeId).id;
          } catch {
            continue;
          }
          const clock: string = comp.status?.displayClock ?? "";
          const minMatch = clock.match(/\d+/);
          const minute =
            state === "post" ? 90 : minMatch ? Math.min(120, parseInt(minMatch[0], 10)) : 0;
          const game: EspnGame = {
            groupId,
            homeId,
            awayId,
            hg: parseInt(home.score ?? "0", 10) || 0,
            ag: parseInt(away.score ?? "0", 10) || 0,
            state,
            minute,
            detail: st.shortDetail ?? st.detail ?? "",
          };
          const key = [homeId, awayId].sort().join("|");
          const prev = byPair.get(key);
          if (!prev || rank[game.state] >= rank[prev.state]) byPair.set(key, game);
        }
      } catch {
        /* ignore a bad date fetch */
      }
    }),
  );

  return [...byPair.values()];
}
