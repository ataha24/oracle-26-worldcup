import { Redis } from "@upstash/redis";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA } from "@/lib/match/persona";
import { AXES, type Axis } from "@/lib/match/vibes";

// Privacy-friendly AGGREGATE trends — just counters, no personal data, no raw
// responses. Writes to Upstash Redis if configured (Vercel Marketplace adds the
// env vars); otherwise every function safely no-ops so the app still works.

const KEY = {
  total: "fanid:total",
  teams: "fanid:teams",
  persona: "fanid:persona",
  tier: "fanid:tier",
};

const TIERS = ["LEGENDARY", "EPIC", "RARE", "COMMON"];

// Find a credential by env-var-name SUFFIX, so it works no matter what prefix the
// Vercel/Upstash integration applied (e.g. UPSTASH_REDIS_REST_KV_REST_API_URL).
function pickEnv(...patterns: RegExp[]): string | undefined {
  for (const [k, v] of Object.entries(process.env)) {
    if (v && patterns.some((rx) => rx.test(k))) return v;
  }
  return undefined;
}

let cached: Redis | null | undefined;
function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const url = pickEnv(/(^|_)UPSTASH_REDIS_REST_URL$/, /(^|_)KV_REST_API_URL$/);
  // read-write token only — the regex deliberately excludes *_READ_ONLY_TOKEN
  const token = pickEnv(/(^|_)UPSTASH_REDIS_REST_TOKEN$/, /(^|_)KV_REST_API_TOKEN$/);
  cached = url && token ? new Redis({ url, token }) : null;
  return cached;
}

export function trendsConfigured(): boolean {
  return getRedis() !== null;
}

/** record one completed quiz (validated; aggregate counters only) */
export async function recordResult(teamId: string, persona: string, tier: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  if (!TEAM_BY_ID[teamId] || !AXES.includes(persona as Axis) || !TIERS.includes(tier)) return false;
  await Promise.all([
    r.incr(KEY.total),
    r.hincrby(KEY.teams, teamId, 1),
    r.hincrby(KEY.persona, persona, 1),
    r.hincrby(KEY.tier, tier, 1),
  ]);
  return true;
}

export interface Trends {
  total: number;
  teams: { id: string; name: string; flag: string; count: number; pct: number }[];
  rarest: { id: string; name: string; flag: string; count: number }[];
  personas: { key: Axis; name: string; emoji: string; count: number; pct: number }[];
  tiers: { name: string; count: number }[];
}

const num = (v: unknown) => (typeof v === "number" ? v : parseInt(String(v ?? 0), 10) || 0);

export async function readTrends(): Promise<Trends | null> {
  const r = getRedis();
  if (!r) return null;
  const [totalRaw, teamsH, personaH, tierH] = await Promise.all([
    r.get<number>(KEY.total),
    r.hgetall<Record<string, number>>(KEY.teams),
    r.hgetall<Record<string, number>>(KEY.persona),
    r.hgetall<Record<string, number>>(KEY.tier),
  ]);
  const total = num(totalRaw);

  const teams = Object.entries(teamsH ?? {})
    .map(([id, c]) => ({
      id,
      name: TEAM_BY_ID[id]?.name ?? id,
      flag: TEAM_BY_ID[id]?.flag ?? "🏳️",
      count: num(c),
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const personas = AXES.map((k) => ({
    key: k,
    name: PERSONA[k].name,
    emoji: PERSONA[k].emoji,
    count: num((personaH ?? {})[k]),
  }))
    .map((p) => ({ ...p, pct: total ? p.count / total : 0 }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    teams: teams.slice(0, 8).map((t) => ({ ...t, pct: total ? t.count / total : 0 })),
    rarest: [...teams].reverse().slice(0, 5),
    personas,
    tiers: TIERS.map((name) => ({ name, count: num((tierH ?? {})[name]) })),
  };
}
