import { TEAMS } from "@/lib/data/teams";
import { groupOf } from "@/lib/data/groups";

// Pulls live & recent 2026 World Cup scores from ESPN's public (keyless)
// scoreboard API and maps them onto our team ids. No API key required.
// Endpoint: site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard

const BASE =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const SUMMARY =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary";

export interface EspnGame {
  eventId: string; // ESPN event id, used to pull the detailed box score
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
            eventId: e.id ? String(e.id) : "",
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

// ---- Detailed per-match box score (the "full match stats" breakdown) ----

export interface MatchStatRow {
  key: string;
  label: string;
  home: string; // ESPN display value, e.g. "66%"
  away: string;
  homeNum: number; // numeric, for the comparison bar
  awayNum: number;
  bar?: boolean; // share-of-total stats (possession) render as a split bar
}

export interface MatchTimelineEvent {
  clock: string; // e.g. "17'"
  type: string; // "Goal", "Yellow Card", "Red Card", ...
  side: "home" | "away" | null;
  text: string;
  isGoal: boolean;
}

export interface MatchStats {
  eventId: string;
  state: "pre" | "in" | "post";
  status: string; // e.g. "62'", "HT", "FT"
  home: { name: string; abbr: string; score: number };
  away: { name: string; abbr: string; score: number };
  stats: MatchStatRow[];
  events: MatchTimelineEvent[];
}

interface EspnStat {
  name?: string;
  displayValue?: string;
}
interface EspnBoxTeam {
  homeAway?: string;
  team?: { id?: string; displayName?: string; abbreviation?: string };
  statistics?: EspnStat[];
}
interface EspnKeyEvent {
  clock?: { displayValue?: string };
  type?: { text?: string };
  team?: { id?: string };
  text?: string;
  scoringPlay?: boolean;
}

// Curated, fan-readable subset of ESPN's ~30 raw stats, in display order.
const CURATED_STATS: { name: string; label: string; bar?: boolean }[] = [
  { name: "possessionPct", label: "Possession", bar: true },
  { name: "totalShots", label: "Shots" },
  { name: "shotsOnTarget", label: "Shots on target" },
  { name: "wonCorners", label: "Corners" },
  { name: "saves", label: "Saves" },
  { name: "foulsCommitted", label: "Fouls" },
  { name: "offsides", label: "Offsides" },
  { name: "yellowCards", label: "Yellow cards" },
  { name: "redCards", label: "Red cards" },
];

function statMap(t: EspnBoxTeam): Record<string, string> {
  const m: Record<string, string> = {};
  for (const s of t.statistics ?? []) if (s.name) m[s.name] = s.displayValue ?? "";
  return m;
}

const toNum = (v: string | undefined): number => {
  const n = parseFloat(v ?? "");
  return Number.isFinite(n) ? n : 0;
};

/** Fetch and normalise the detailed box score for one ESPN event id. */
export async function fetchMatchStats(eventId: string): Promise<MatchStats | null> {
  const res = await fetch(`${SUMMARY}?event=${encodeURIComponent(eventId)}`, {
    headers: { "User-Agent": "oracle26" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();

  const teams: EspnBoxTeam[] = data.boxscore?.teams ?? [];
  const homeT = teams.find((t) => t.homeAway === "home") ?? teams[0];
  const awayT = teams.find((t) => t.homeAway === "away") ?? teams[1];
  if (!homeT || !awayT) return null;

  const hm = statMap(homeT);
  const am = statMap(awayT);

  const stats: MatchStatRow[] = CURATED_STATS.filter(
    (c) => c.name in hm || c.name in am,
  ).map((c) => ({
    key: c.name,
    label: c.label,
    home: hm[c.name] ?? "0",
    away: am[c.name] ?? "0",
    homeNum: toNum(hm[c.name]),
    awayNum: toNum(am[c.name]),
    bar: c.bar,
  }));

  // Pass volume + a self-computed accuracy % (ESPN's passPct is a 0–1 fraction).
  if ("totalPasses" in hm || "totalPasses" in am) {
    const hAcc = toNum(hm.totalPasses) > 0 ? Math.round((toNum(hm.accuratePasses) / toNum(hm.totalPasses)) * 100) : 0;
    const aAcc = toNum(am.totalPasses) > 0 ? Math.round((toNum(am.accuratePasses) / toNum(am.totalPasses)) * 100) : 0;
    stats.push(
      { key: "totalPasses", label: "Passes", home: hm.totalPasses ?? "0", away: am.totalPasses ?? "0", homeNum: toNum(hm.totalPasses), awayNum: toNum(am.totalPasses) },
      { key: "passAccuracy", label: "Pass accuracy", home: `${hAcc}%`, away: `${aAcc}%`, homeNum: hAcc, awayNum: aAcc },
    );
  }

  const homeId = homeT.team?.id;
  const awayId = awayT.team?.id;
  const events: MatchTimelineEvent[] = (data.keyEvents ?? [])
    .map((e: EspnKeyEvent): MatchTimelineEvent => {
      const type = e.type?.text ?? "";
      const tid = e.team?.id;
      return {
        clock: e.clock?.displayValue ?? "",
        type,
        side: tid && tid === homeId ? "home" : tid && tid === awayId ? "away" : null,
        text: e.text ?? "",
        isGoal: Boolean(e.scoringPlay) || type.startsWith("Goal"),
      };
    })
    .filter((e: MatchTimelineEvent) => e.isGoal || /card/i.test(e.type));

  const hdr = data.header?.competitions?.[0];
  const st = hdr?.status?.type ?? {};
  const state: MatchStats["state"] = st.state === "in" ? "in" : st.state === "post" ? "post" : "pre";
  const comps: { homeAway?: string; score?: string }[] = hdr?.competitors ?? [];
  const score = (side: string) => toNum(comps.find((c) => c.homeAway === side)?.score);

  return {
    eventId,
    state,
    status: st.shortDetail ?? st.detail ?? "",
    home: { name: homeT.team?.displayName ?? "", abbr: homeT.team?.abbreviation ?? "", score: score("home") },
    away: { name: awayT.team?.displayName ?? "", abbr: awayT.team?.abbreviation ?? "", score: score("away") },
    stats,
    events,
  };
}
