import { TEAMS, getTeam, effectiveElo } from "@/lib/data/teams";
import { GROUPS, GROUP_BY_ID } from "@/lib/data/groups";
import { RANKED_ODDS, oddsFor } from "@/lib/forecast";
import { groupTable } from "@/lib/engine/standings";
import { predictFixture } from "@/lib/engine/predict";
import { pct } from "@/lib/format";

export interface AnswerRow {
  teamId?: string;
  label: string;
  value: string;
  bar?: number; // 0..1 for a bar
  color?: string;
}

export interface OracleAnswer {
  headline: string;
  body?: string;
  rows?: AnswerRow[];
  note?: string;
}

// ---------- entity detection ----------

const ALIASES: Record<string, string> = {
  usa: "usa", "united states": "usa", america: "usa", "the states": "usa",
  korea: "south-korea", "south korea": "south-korea",
  holland: "netherlands", dutch: "netherlands",
  "the three lions": "england", english: "england",
  albiceleste: "argentina", "la albiceleste": "argentina",
  selecao: "brazil", "seleção": "brazil", samba: "brazil",
  "les bleus": "france", french: "france",
  "la roja": "spain", spanish: "spain",
  ivory: "ivory-coast", "ivory coast": "ivory-coast", "cote d'ivoire": "ivory-coast",
  "cape verde": "cape-verde", "south africa": "south-africa",
  "dr congo": "dr-congo", congo: "dr-congo", "czech": "czech-republic", czechia: "czech-republic",
  bosnia: "bosnia", "new zealand": "new-zealand", "saudi": "saudi-arabia",
};

function detectTeams(q: string): string[] {
  const lc = ` ${q.toLowerCase()} `;
  const found = new Set<string>();
  // aliases first (multi-word)
  for (const [alias, id] of Object.entries(ALIASES)) {
    if (lc.includes(` ${alias} `) || lc.includes(`${alias} `)) found.add(id);
  }
  for (const t of TEAMS) {
    const name = t.name.toLowerCase();
    if (lc.includes(name)) found.add(t.id);
    // 3-letter code as a standalone word
    if (new RegExp(`\\b${t.code.toLowerCase()}\\b`).test(lc)) found.add(t.id);
  }
  // preserve question order roughly
  return [...found];
}

/** Resolve a free-text team reference (name, code, alias) to a team id. */
export function findTeamId(q: string): string | null {
  const ids = detectTeams(q);
  return ids[0] ?? null;
}

function detectGroup(q: string): string | null {
  const m = q.toLowerCase().match(/group\s+([a-l])\b/);
  return m ? m[1].toUpperCase() : null;
}

function has(q: string, ...words: string[]): boolean {
  const lc = q.toLowerCase();
  return words.some((w) => lc.includes(w));
}

// ---------- answer builders ----------

function titleBoard(n = 8): OracleAnswer {
  const top = RANKED_ODDS.slice(0, n);
  const max = top[0].pWinTitle;
  return {
    headline: `${getTeam(top[0].teamId).flag} ${getTeam(top[0].teamId).name} are the most likely champions`,
    body: `Across 50,000 simulated tournaments from the current live state, here are the favourites to lift the trophy:`,
    rows: top.map((o, i) => ({
      teamId: o.teamId,
      label: getTeam(o.teamId).name,
      value: pct(o.pWinTitle, 1),
      bar: o.pWinTitle / max,
      color: i === 0 ? "var(--color-gold)" : i < 3 ? "var(--color-emerald)" : "var(--color-cyan)",
    })),
  };
}

function teamSummary(id: string): OracleAnswer {
  const t = getTeam(id);
  const o = oddsFor(id);
  const rank = RANKED_ODDS.findIndex((x) => x.teamId === id) + 1;
  return {
    headline: `${t.flag} ${t.name} — ${pct(o.pWinTitle, 1)} to win the World Cup`,
    body: `${t.blurb} They are the #${rank} pick overall (${Math.round(t.elo)} Elo, FIFA #${t.fifaRank}, Group ${o.groupId}).`,
    rows: [
      { label: "Reach knockouts", value: pct(o.pAdvance), bar: o.pAdvance, color: "var(--color-cyan)" },
      { label: "Win their group", value: pct(o.pGroupWinner), bar: o.pGroupWinner, color: "var(--color-cyan)" },
      { label: "Reach quarter-finals", value: pct(o.pReachQF), bar: o.pReachQF, color: "var(--color-emerald)" },
      { label: "Reach semi-finals", value: pct(o.pReachSF), bar: o.pReachSF, color: "var(--color-emerald)" },
      { label: "Reach the final", value: pct(o.pReachFinal, 1), bar: o.pReachFinal, color: "var(--color-gold)" },
      { label: "Win it all", value: pct(o.pWinTitle, 1), bar: o.pWinTitle, color: "var(--color-gold)" },
    ],
    note: `Key men: ${t.stars.slice(0, 3).join(", ")}.`,
  };
}

function matchup(aId: string, bId: string): OracleAnswer {
  const a = getTeam(aId);
  const b = getTeam(bId);
  const p = predictFixture(aId, bId, { knockout: true });
  const flip = p.homeId !== aId;
  const pA = flip ? p.pAwayWin : p.pHomeWin;
  const pB = flip ? p.pHomeWin : p.pAwayWin;
  const xgA = flip ? p.xgAway : p.xgHome;
  const xgB = flip ? p.xgHome : p.xgAway;
  const adv = flip ? 1 - p.pHomeAdvance : p.pHomeAdvance;
  const fav = pA > pB ? a : b;
  return {
    headline: `${a.flag} ${a.name} vs ${b.name} ${b.flag} — ${fav.name} favoured`,
    body: `On a neutral pitch the model expects ${a.name} ${xgA.toFixed(2)} – ${xgB.toFixed(2)} ${b.name} on expected goals. Most likely score: ${flip ? p.mostLikelyScore.away : p.mostLikelyScore.home}–${flip ? p.mostLikelyScore.home : p.mostLikelyScore.away}.`,
    rows: [
      { teamId: a.id, label: `${a.name} win`, value: pct(pA, 1), bar: pA, color: "var(--color-emerald)" },
      { label: "Draw", value: pct(p.pDraw, 1), bar: p.pDraw, color: "#586079" },
      { teamId: b.id, label: `${b.name} win`, value: pct(pB, 1), bar: pB, color: "var(--color-cyan)" },
    ],
    note: `Knockout (incl. ET & pens): ${a.name} advance ${pct(adv)}. Over 2.5 goals ${pct(p.pOver25)} · both score ${pct(p.pBtts)}.`,
  };
}

function groupAnswer(gid: string): OracleAnswer {
  const table = groupTable(gid);
  const teams = GROUP_BY_ID[gid].teamIds;
  return {
    headline: `Group ${gid} — live standings & qualification odds`,
    body: `Top two advance automatically, with a shot at one of the eight best third-place spots. Avg squad rating ${Math.round(teams.reduce((s, id) => s + getTeam(id).elo, 0) / teams.length)} Elo.`,
    rows: table.map((r) => {
      const o = oddsFor(r.teamId);
      return {
        teamId: r.teamId,
        label: `${getTeam(r.teamId).name} · ${r.pts}pt`,
        value: pct(o.pAdvance),
        bar: o.pAdvance,
        color: o.pAdvance > 0.5 ? "var(--color-emerald)" : "var(--color-cyan)",
      };
    }),
    note: "Qualify% shown on the right.",
  };
}

function darkHorses(): OracleAnswer {
  const horses = RANKED_ODDS.filter((o) => getTeam(o.teamId).fifaRank > 15)
    .sort((a, b) => b.pReachQF - a.pReachQF)
    .slice(0, 6);
  const max = horses[0].pReachQF;
  return {
    headline: "The dark horses to watch",
    body: "Teams outside the world's top 15 with the best chance of crashing the quarter-finals:",
    rows: horses.map((o) => ({
      teamId: o.teamId,
      label: getTeam(o.teamId).name,
      value: `QF ${pct(o.pReachQF)}`,
      bar: o.pReachQF / max,
      color: "var(--color-violet)",
    })),
  };
}

function scorers(): OracleAnswer {
  // No per-player model — answer honestly, surface the most potent attacks.
  const attack = [...TEAMS]
    .sort((a, b) => effectiveElo(b) - effectiveElo(a))
    .slice(0, 6);
  return {
    headline: "Golden Boot — the engine's honest take",
    body: "ORACLE models teams, not individual players, so it can't price a Golden Boot directly. But the most prolific attacks belong to the deepest-running sides — and their star strikers are the natural favourites:",
    rows: attack.map((t) => ({
      teamId: t.id,
      label: `${t.name} — ${t.stars[0]}`,
      value: `${pct(oddsFor(t.id).pReachSF)} to reach SF`,
      bar: oddsFor(t.id).pReachSF,
      color: "var(--color-gold)",
    })),
    note: "More games played = more chances to score, so deep runs drive the race.",
  };
}

export function answer(question: string): OracleAnswer {
  const q = question.trim();
  if (!q) return titleBoard();

  const teams = detectTeams(q);
  const group = detectGroup(q);

  // two teams → matchup
  if (teams.length >= 2 && (has(q, "vs", "versus", "v ", "against", "beat", "win", "play", "or ") || true)) {
    if (teams.length >= 2) return matchup(teams[0], teams[1]);
  }

  if (has(q, "golden boot", "top scorer", "goals", "scorer")) return scorers();
  if (has(q, "dark horse", "underdog", "surprise", "sleeper", "upset")) return darkHorses();

  if (group && teams.length === 0) return groupAnswer(group);

  if (teams.length === 1) {
    if (group) return groupAnswer(group);
    return teamSummary(teams[0]);
  }

  if (has(q, "host")) {
    const hostIds = TEAMS.filter((t) => t.host).map((t) => t.id);
    const a = teamSummary(hostIds[0]);
    a.headline = "The hosts — USA, Mexico & Canada";
    a.body = "Home advantage is baked into the engine for all three co-hosts. Their outlooks:";
    a.rows = hostIds.map((id) => ({
      teamId: id,
      label: getTeam(id).name,
      value: pct(oddsFor(id).pAdvance),
      bar: oddsFor(id).pAdvance,
      color: "var(--color-emerald)",
    }));
    a.note = "Reach-knockouts probability shown.";
    return a;
  }

  if (has(q, "win", "champion", "favourite", "favorite", "trophy", "lift", "best team", "who will")) {
    return titleBoard();
  }

  // fallback
  const fb = titleBoard(6);
  fb.note =
    "Tip: ask about a team, a matchup (e.g. ‘Brazil vs Spain’), a group (‘Group I’), dark horses, or who will win.";
  return fb;
}
