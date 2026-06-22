import { writeFileSync } from "node:fs";
import { TEAMS, getTeam } from "@/lib/data/teams";
import { affinity, TEAM_Z, AXES, type Vibe } from "@/lib/match/vibes";
import { QUESTIONS, leanFromAnswers, type Option } from "@/lib/match/quiz";

// Calibrate per-team biases so the matcher does NOT default to a handful of
// "central" teams. We enumerate EVERY possible quiz path (the complete answer
// population — more rigorous than sampling a billion), then use iterative
// proportional fitting to nudge per-team offsets toward a balanced field.

const ids = TEAMS.map((t) => t.id);
const N = ids.length;

// ---- enumerate all answer paths ----
const paths: Option[][] = [[]];
for (const q of QUESTIONS) {
  const next: Option[][] = [];
  for (const p of paths) for (const o of q.options) next.push([...p, o]);
  paths.length = 0;
  paths.push(...next);
}
const P = paths.length;
console.log(`Quiz answer space: ${QUESTIONS.length} questions → ${P} distinct paths (exact).`);

// precompute affinity[path][team]  (correlation; bias added later)
const leans: Vibe[] = paths.map((p) => leanFromAnswers(p));
const sim = new Float64Array(P * N);
for (let pi = 0; pi < P; pi++) {
  const w = leans[pi];
  for (let ti = 0; ti < N; ti++) sim[pi * N + ti] = affinity(w, ids[ti]);
}

function distribution(bias: Float64Array) {
  const counts = new Float64Array(N);
  for (let pi = 0; pi < P; pi++) {
    let best = -Infinity, bi = 0;
    const off = pi * N;
    for (let ti = 0; ti < N; ti++) {
      const v = sim[off + ti] + bias[ti];
      if (v > best) { best = v; bi = ti; }
    }
    counts[bi]++;
  }
  return counts;
}

function report(label: string, bias: Float64Array) {
  const counts = distribution(bias);
  const shares = Array.from(counts, (c, i) => ({ id: ids[i], share: c / P }));
  shares.sort((a, b) => b.share - a.share);
  const nonzero = shares.filter((s) => s.share > 0).length;
  const top = shares[0], bottom = shares[shares.length - 1];
  const gini = giniCoeff(shares.map((s) => s.share));
  console.log(`\n[${label}] teams reachable: ${nonzero}/${N} · top ${getTeam(top.id).code} ${(top.share*100).toFixed(1)}% · floor ${(bottom.share*100).toFixed(2)}% · Gini ${gini.toFixed(3)}`);
  console.log("  most-matched:", shares.slice(0, 6).map((s) => `${getTeam(s.id).code} ${(s.share*100).toFixed(1)}%`).join("  "));
  return shares;
}

function giniCoeff(xs: number[]): number {
  const a = [...xs].sort((x, y) => x - y);
  const n = a.length;
  let cum = 0;
  for (let i = 0; i < n; i++) cum += (i + 1) * a[i];
  const sum = a.reduce((s, x) => s + x, 0) || 1;
  return (2 * cum) / (n * sum) - (n + 1) / n;
}

// ---- baseline (no calibration) ----
const zeroBias = new Float64Array(N);
report("BEFORE", zeroBias);

// ---- iterative proportional fitting ----
// affinity ∈ [-1,1]; keep biases SMALL so a clear match still wins on merit.
const bias = new Float64Array(N);
const target = 1 / N;
const LR = 0.04;
const ITERS = 400;
const CLAMP = 0.25; // hard ceiling on |bias| — protects accuracy
for (let it = 0; it < ITERS; it++) {
  const counts = distribution(bias);
  for (let ti = 0; ti < N; ti++) {
    const share = counts[ti] / P;
    bias[ti] += LR * (target - share); // additive toward balance
    bias[ti] = Math.max(-CLAMP, Math.min(CLAMP, bias[ti]));
  }
}
const finalShares = report("AFTER", bias);

// ---- accuracy checks: do clear-cut users still get the obvious team? ----
function topFor(w: Partial<Vibe>): string {
  const full: Vibe = { glory: 0, firepower: 0, grit: 0, fairytale: 0, heartbreak: 0, ...w };
  let best = -Infinity, bid = ids[0];
  for (let ti = 0; ti < N; ti++) {
    const s = affinity(full, ids[ti]) + bias[ti];
    if (s > best) { best = s; bid = ids[ti]; }
  }
  return getTeam(bid).name;
}
console.log("\nAccuracy — strong single-trait leans still map sensibly:");
for (const ax of AXES) console.log(`  pure ${ax.padEnd(10)} → ${topFor({ [ax]: 3 } as Partial<Vibe>)}`);

// ---- generalization: 1,000,000 random continuous fans ----
let rng = 987654321 >>> 0;
const rnd = () => { rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5; rng >>>= 0; return rng / 4294967296; };
const M = 1_000_000;
const rc = new Float64Array(N);
for (let i = 0; i < M; i++) {
  const w = { glory: rnd(), firepower: rnd(), grit: rnd(), fairytale: rnd(), heartbreak: rnd() } as Vibe;
  let best = -Infinity, bi = 0;
  for (let ti = 0; ti < N; ti++) {
    const s = affinity(w, ids[ti]) + bias[ti];
    if (s > best) { best = s; bi = ti; }
  }
  rc[bi]++;
}
const rshares = Array.from(rc, (c, i) => ({ id: ids[i], share: c / M })).sort((a, b) => b.share - a.share);
console.log(`\n[1,000,000 random fans] reachable ${rshares.filter((s) => s.share > 0).length}/${N} · top ${getTeam(rshares[0].id).code} ${(rshares[0].share*100).toFixed(1)}% · Gini ${giniCoeff(rshares.map((s) => s.share)).toFixed(3)}`);

// ---- REAL rarity: distribution of "types" over the complete population of quiz
// paths. The type = your SPIRIT TEAM's two defining (most distinctive) traits —
// the exact same basis the result uses for your persona, so they always agree. ----
function teamTop2(teamId: string): string {
  const z = TEAM_Z[teamId];
  const s = [...AXES].sort((a, b) => z[b] - z[a]);
  return `${s[0]}+${s[1]}`;
}
const typeCount: Record<string, number> = {};
for (let pi = 0; pi < P; pi++) {
  let best = -Infinity, bi = 0;
  const off = pi * N;
  for (let ti = 0; ti < N; ti++) {
    const v = sim[off + ti] + bias[ti];
    if (v > best) { best = v; bi = ti; }
  }
  const key = teamTop2(ids[bi]);
  typeCount[key] = (typeCount[key] ?? 0) + 1;
}
const typeShares: Record<string, number> = {};
for (const [k, c] of Object.entries(typeCount)) typeShares[k] = Number((c / P).toFixed(4));
const sortedTypes = Object.entries(typeShares).sort((a, b) => a[1] - b[1]);
console.log(`\nFan-ID "types" (primary+secondary): ${sortedTypes.length} possible`);
console.log("  rarest:", sortedTypes.slice(0, 5).map(([k, s]) => `${k} ${(s * 100).toFixed(1)}%`).join("  "));
console.log("  commonest:", sortedTypes.slice(-5).map(([k, s]) => `${k} ${(s * 100).toFixed(1)}%`).join("  "));

// ---- write calibration ----
const biases: Record<string, number> = {};
ids.forEach((id, i) => (biases[id] = Number(bias[i].toFixed(4))));
writeFileSync(
  "src/lib/match/calibration.json",
  JSON.stringify(
    {
      biases,
      typeShares,
      meta: {
        calibrated: true,
        method: "IPF over exhaustive quiz enumeration",
        paths: P,
        iterations: ITERS,
        topShareAfter: Number((finalShares[0].share).toFixed(4)),
        generatedAt: new Date().toISOString(),
      },
    },
    null,
    2,
  ),
);
console.log("\n✓ wrote src/lib/match/calibration.json");
