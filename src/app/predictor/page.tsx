"use client";

import { useMemo, useState } from "react";
import { TEAMS, getTeam } from "@/lib/data/teams";
import { predictMatch, type MatchContext } from "@/lib/engine/match";
import { pct } from "@/lib/format";
import { Flag, SectionTitle } from "@/components/bits";

const SORTED = [...TEAMS].sort((a, b) => a.name.localeCompare(b.name));

export default function PredictorPage() {
  const [aId, setAId] = useState("argentina");
  const [bId, setBId] = useState("france");
  const [mode, setMode] = useState<"auto" | "knockout">("auto");

  const a = getTeam(aId);
  const b = getTeam(bId);

  const pred = useMemo(() => {
    const ctx: MatchContext = {};
    let home = a;
    let away = b;
    if (mode === "knockout") {
      ctx.neutral = true;
    } else if (a.host && !b.host) {
      ctx.homeAdvantage = true;
    } else if (b.host && !a.host) {
      home = b; away = a; ctx.homeAdvantage = true;
    } else {
      ctx.neutral = true;
    }
    const p = predictMatch(home, away, ctx);
    // normalize back to (a,b) orientation
    const flipped = home.id !== a.id;
    return { p, flipped };
  }, [a, b, mode]);

  const { p, flipped } = pred;
  const pAWin = flipped ? p.pAwayWin : p.pHomeWin;
  const pBWin = flipped ? p.pHomeWin : p.pAwayWin;
  const xgA = flipped ? p.xgAway : p.xgHome;
  const xgB = flipped ? p.xgHome : p.xgAway;
  const csA = flipped ? p.pCleanSheetAway : p.pCleanSheetHome;
  const csB = flipped ? p.pCleanSheetHome : p.pCleanSheetAway;
  const pAAdvance = flipped ? 1 - p.pHomeAdvance : p.pHomeAdvance;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="Head to head"
        title="The Predictor"
        desc="Pick any two of the 48 teams. The engine builds a full Poisson scoreline distribution from their ratings — win/draw/loss, expected goals, the most likely scores, and knockout survival."
      />

      {/* selectors */}
      <div className="card p-4 sm:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-5 items-center">
          <TeamPicker value={aId} onChange={setAId} accent="var(--color-emerald)" />
          <div className="text-center">
            <div className="text-2xl font-black text-mute">VS</div>
          </div>
          <TeamPicker value={bId} onChange={setBId} accent="var(--color-cyan)" align="right" />
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {(["auto", "knockout"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === m ? "bg-white/10 text-white" : "text-mute hover:text-white"
              }`}
            >
              {m === "auto" ? "Group stage (host edge applies)" : "Neutral / knockout"}
            </button>
          ))}
        </div>
      </div>

      {/* W/D/L bar */}
      <div className="card p-5 mt-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="flex items-center gap-2 font-semibold">
            <Flag flag={a.flag} size="text-xl" /> {a.name}
          </span>
          <span className="flex items-center gap-2 font-semibold">
            {b.name} <Flag flag={b.flag} size="text-xl" />
          </span>
        </div>
        <div className="flex h-10 rounded-lg overflow-hidden text-sm font-bold text-black tabular">
          <Seg w={pAWin} bg="var(--color-emerald)" label={pct(pAWin, 1)} />
          <Seg w={p.pDraw} bg="#586079" label={pct(p.pDraw, 1)} dark />
          <Seg w={pBWin} bg="var(--color-cyan)" label={pct(pBWin, 1)} />
        </div>
        <div className="flex justify-between text-[11px] text-mute mt-1.5">
          <span>{a.name} win</span>
          <span>Draw</span>
          <span>{b.name} win</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {/* key numbers */}
        <div className="card p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald mb-3">
            The numbers
          </div>
          <KV label="Expected goals" value={`${xgA.toFixed(2)} — ${xgB.toFixed(2)}`} />
          <KV
            label="Most likely score"
            value={`${flipped ? p.mostLikelyScore.away : p.mostLikelyScore.home}–${
              flipped ? p.mostLikelyScore.home : p.mostLikelyScore.away
            } (${pct(p.mostLikelyScore.p, 1)})`}
          />
          <KV label="Over 2.5 goals" value={pct(p.pOver25)} />
          <KV label="Both teams score" value={pct(p.pBtts)} />
          <KV label={`${a.name} clean sheet`} value={pct(csA)} />
          <KV label={`${b.name} clean sheet`} value={pct(csB)} />
          <div className="mt-3 pt-3 border-t border-line/60">
            <div className="text-[11px] text-mute mb-2">
              If this were a knockout tie (incl. extra time & penalties)
            </div>
            <div className="flex h-7 rounded-md overflow-hidden text-xs font-bold text-black tabular">
              <Seg w={pAAdvance} bg="var(--color-emerald)" label={`${a.code} ${pct(pAAdvance)}`} />
              <Seg w={1 - pAAdvance} bg="var(--color-cyan)" label={`${b.code} ${pct(1 - pAAdvance)}`} />
            </div>
          </div>
        </div>

        {/* scoreline grid */}
        <div className="card p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-3">
            Scoreline probabilities
          </div>
          <ScoreGrid p={p} flipped={flipped} aCode={a.code} bCode={b.code} />
        </div>
      </div>

      <p className="text-xs text-mute mt-5">
        Ratings: {a.name} {Math.round(a.elo)} Elo · {b.name} {Math.round(b.elo)} Elo. Host
        nations (USA, Mexico, Canada) carry a home-crowd edge in group-stage mode.
      </p>
    </div>
  );
}

function TeamPicker({
  value,
  onChange,
  accent,
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  accent: string;
  align?: "left" | "right";
}) {
  const t = getTeam(value);
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <div className={`text-5xl sm:text-6xl mb-2 ${align === "right" ? "" : ""}`}>{t.flag}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-2 border border-line rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-emerald/60"
        style={{ borderColor: `${accent}40` }}
      >
        {SORTED.map((tm) => (
          <option key={tm.id} value={tm.id}>
            {tm.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Seg({ w, bg, label, dark }: { w: number; bg: string; label: string; dark?: boolean }) {
  if (w <= 0) return null;
  return (
    <div
      className="flex items-center justify-center overflow-hidden whitespace-nowrap"
      style={{ width: `${w * 100}%`, background: bg, color: dark ? "#fff" : undefined }}
    >
      {w > 0.1 ? label : ""}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-line/40 last:border-0">
      <span className="text-sm text-mute">{label}</span>
      <span className="text-sm font-bold tabular">{value}</span>
    </div>
  );
}

function ScoreGrid({
  p,
  flipped,
  aCode,
  bCode,
}: {
  p: ReturnType<typeof predictMatch>;
  flipped: boolean;
  aCode: string;
  bCode: string;
}) {
  const N = 5;
  // grid[home][away]; map to (a,b) orientation
  const cell = (ag: number, bg: number) =>
    flipped ? p.scoreGrid[bg][ag] : p.scoreGrid[ag][bg];
  let max = 0;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) max = Math.max(max, cell(i, j));

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: `auto repeat(${N + 1}, 1fr)` }}>
        <div />
        {Array.from({ length: N + 1 }, (_, j) => (
          <div key={j} className="text-center text-[10px] text-mute pb-1">
            {j}
          </div>
        ))}
        {Array.from({ length: N + 1 }, (_, i) => (
          <Row key={i} i={i} N={N} cell={cell} max={max} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-mute mt-2">
        <span>↑ rows: {aCode} goals</span>
        <span>→ cols: {bCode} goals</span>
      </div>
    </div>
  );
}

function Row({
  i,
  N,
  cell,
  max,
}: {
  i: number;
  N: number;
  cell: (a: number, b: number) => number;
  max: number;
}) {
  return (
    <>
      <div className="text-center text-[10px] text-mute pr-1 flex items-center justify-center">
        {i}
      </div>
      {Array.from({ length: N + 1 }, (_, j) => {
        const v = cell(i, j);
        const t = max > 0 ? v / max : 0;
        return (
          <div
            key={j}
            className="aspect-square m-0.5 rounded flex items-center justify-center text-[9px] font-bold tabular"
            style={{
              background: `rgba(16, 217, 137, ${0.08 + t * 0.85})`,
              color: t > 0.5 ? "#05070d" : "var(--color-mute)",
            }}
            title={`${(v * 100).toFixed(1)}%`}
          >
            {v > 0.02 ? Math.round(v * 100) : ""}
          </div>
        );
      })}
    </>
  );
}
