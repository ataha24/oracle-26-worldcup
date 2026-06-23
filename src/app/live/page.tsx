"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RANKED_ODDS } from "@/lib/forecast";
import { getTeam } from "@/lib/data/teams";
import { pct } from "@/lib/format";
import { SectionTitle } from "@/components/bits";
import { MatchBreakdown } from "@/components/MatchBreakdown";

interface LiveGame {
  groupId: string;
  home: string; homeFlag: string; away: string; awayFlag: string;
  hg: number; ag: number; minute: number; detail: string;
  eventId?: string;
  wdl?: { h: number; d: number; a: number };
}
interface TitleRow {
  teamId: string; name: string; flag: string; group: string;
  pWinTitle: number; pAdvance: number; delta: number;
}
interface RefreshData {
  ok: boolean; source: string; updatedAt: string; iterations: number;
  liveGames: LiveGame[]; justFinished: LiveGame[]; title: TitleRow[];
  error?: string;
}

const BASELINE: TitleRow[] = RANKED_ODDS.slice(0, 14).map((o) => {
  const t = getTeam(o.teamId);
  return { teamId: o.teamId, name: t.name, flag: t.flag, group: o.groupId,
    pWinTitle: o.pWinTitle, pAdvance: o.pAdvance, delta: 0 };
});

export default function LivePage() {
  const [data, setData] = useState<RefreshData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/refresh", { cache: "no-store" });
      const d: RefreshData = await res.json();
      if (!d.ok) throw new Error(d.error || "refresh failed");
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "could not reach the live feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auto) {
      timer.current = setInterval(refresh, 60000);
      refresh();
    } else if (timer.current) {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [auto, refresh]);

  const title = data?.title ?? BASELINE;
  const maxTitle = title[0]?.pWinTitle ?? 1;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="Special feature · live"
        title="🔴 Live Forecast"
        desc="Pull current scores straight from ESPN's live feed and re-run the Monte-Carlo engine on the spot. In-progress games are continued from their live score; the title odds update instantly."
      />

      {/* control bar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={refresh}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-emerald text-black font-bold text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          {loading ? "Pulling live data & simulating…" : "Pull live data & re-simulate"}
        </button>

        <label className="flex items-center gap-2 text-sm text-mute cursor-pointer select-none">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="accent-emerald w-4 h-4"
          />
          Auto-refresh every 60s
        </label>

        <div className="ml-auto text-xs text-mute tabular text-right">
          {data ? (
            <>
              <div>
                Updated {new Date(data.updatedAt).toLocaleTimeString()} · source {data.source}
              </div>
              <div>{data.iterations.toLocaleString()} live simulations</div>
            </>
          ) : (
            <div>Showing the {RANKED_ODDS.length}-team baseline (50k sims). Hit refresh for live.</div>
          )}
        </div>
      </div>

      {err && (
        <div className="card p-4 mt-4 border-rose/40 text-sm">
          <b className="text-rose">Live feed error:</b> {err}
          <div className="text-mute mt-1">
            The committed baseline forecast is still shown below. The live feed (ESPN) may be
            unreachable from this environment, or there may be no matches today.
          </div>
        </div>
      )}

      {/* in-progress games */}
      {data && data.liveGames.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rose mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose animate-pulse" /> In progress
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.liveGames.map((g, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{g.homeFlag} {g.home}</span>
                  <span className="tabular text-lg">{g.hg}–{g.ag}</span>
                  <span>{g.away} {g.awayFlag}</span>
                </div>
                <div className="text-[11px] text-rose font-bold text-center my-1.5">
                  ● LIVE {g.detail || `${g.minute}'`} · Group {g.groupId}
                </div>
                {g.wdl && (
                  <div className="flex h-4 rounded overflow-hidden text-[9px] font-bold text-black tabular">
                    <span className="flex items-center justify-center" style={{ width: `${g.wdl.h * 100}%`, background: "var(--color-emerald)" }}>{g.wdl.h > 0.16 ? Math.round(g.wdl.h * 100) : ""}</span>
                    <span className="flex items-center justify-center bg-white/15 text-white" style={{ width: `${g.wdl.d * 100}%` }}>{g.wdl.d > 0.16 ? Math.round(g.wdl.d * 100) : ""}</span>
                    <span className="flex items-center justify-center" style={{ width: `${g.wdl.a * 100}%`, background: "var(--color-cyan)" }}>{g.wdl.a > 0.16 ? Math.round(g.wdl.a * 100) : ""}</span>
                  </div>
                )}
                {g.eventId && (
                  <>
                    <button
                      onClick={() => setExpanded((m) => ({ ...m, [g.eventId!]: !m[g.eventId!] }))}
                      className="mt-2.5 w-full text-[11px] text-emerald font-semibold hover:brightness-110 transition"
                    >
                      {expanded[g.eventId] ? "Hide full match stats ▴" : "Show full match stats ▾"}
                    </button>
                    {expanded[g.eventId] && (
                      <MatchBreakdown eventId={g.eventId} homeFlag={g.homeFlag} awayFlag={g.awayFlag} />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data && data.liveGames.length === 0 && !err && (
        <p className="text-sm text-mute mt-5">
          No matches in progress right now — the board below reflects the latest completed results.
        </p>
      )}

      {/* title board */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald">
            {data ? "Live title odds" : "Title odds (baseline)"}
          </h3>
          {data && <span className="text-xs text-mute">▲▼ change vs the committed 50k forecast</span>}
        </div>
        <div className="card divide-y divide-line/70">
          {title.map((o, i) => (
            <div key={o.teamId} className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-5 text-sm text-mute tabular text-right">{i + 1}</div>
              <span className="text-xl">{o.flag}</span>
              <div className="w-36 sm:w-44">
                <div className="font-semibold text-sm leading-tight">{o.name}</div>
                <div className="text-[11px] text-mute">Grp {o.group}</div>
              </div>
              <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(o.pWinTitle / maxTitle) * 100}%`, background: i === 0 ? "var(--color-gold)" : i < 3 ? "var(--color-emerald)" : "var(--color-cyan)" }} />
              </div>
              <Delta delta={o.delta} />
              <div className="w-14 text-right text-sm font-bold tabular">{pct(o.pWinTitle, 1)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* recent finals */}
      {data && data.justFinished.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-mute mb-2">Recently finished</h3>
          <div className="flex flex-wrap gap-2">
            {data.justFinished.map((g, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full border border-line tabular">
                {g.homeFlag} {g.home} <b>{g.hg}–{g.ag}</b> {g.away} {g.awayFlag}
              </span>
            ))}
          </div>
        </section>
      )}

      <p className="text-[11px] text-mute mt-8">
        Live scores via ESPN&apos;s public scoreboard API. Each refresh runs {(15000).toLocaleString()} fresh
        tournament simulations from the current state — completed games locked, in-progress games continued from
        their live score, everything else simulated.
      </p>
    </div>
  );
}

function Delta({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.001) return <div className="w-12 text-right text-[11px] text-mute tabular">—</div>;
  const up = delta > 0;
  return (
    <div className={`w-12 text-right text-[11px] font-bold tabular ${up ? "text-emerald" : "text-rose"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta * 100).toFixed(1)}
    </div>
  );
}
