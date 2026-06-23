"use client";

import { useEffect, useState } from "react";

interface StatRow {
  key: string; label: string;
  home: string; away: string; homeNum: number; awayNum: number; bar?: boolean;
}
interface Evt {
  clock: string; type: string; side: "home" | "away" | null; text: string; isGoal: boolean;
}
interface Stats {
  ok: boolean; status: string;
  home: { name: string; abbr: string; score: number };
  away: { name: string; abbr: string; score: number };
  stats: StatRow[]; events: Evt[]; error?: string;
}

/** On-demand detailed box score for one in-progress match (ESPN summary). */
export function MatchBreakdown({
  eventId, homeFlag, awayFlag,
}: { eventId: string; homeFlag: string; awayFlag: string }) {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/match-stats?event=${eventId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Stats) => {
        if (!alive) return;
        if (!d.ok) throw new Error(d.error || "no stats");
        setData(d);
      })
      .catch((e) => alive && setErr(e instanceof Error ? e.message : "stats unavailable"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [eventId]);

  if (loading)
    return <div className="text-[11px] text-mute mt-3 animate-pulse">Loading match stats…</div>;
  if (err) return <div className="text-[11px] text-mute mt-3">Stats unavailable: {err}</div>;
  if (!data || data.stats.length === 0)
    return <div className="text-[11px] text-mute mt-3">No detailed stats published yet.</div>;

  return (
    <div className="mt-3 pt-3 border-t border-line/70">
      <div className="space-y-2">
        {data.stats.map((s) => <StatBar key={s.key} s={s} />)}
      </div>

      {data.events.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-widest text-mute mb-1.5">Timeline</div>
          <ul className="space-y-1">
            {data.events.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] leading-snug">
                <span className="w-7 shrink-0 text-right tabular text-mute">{e.clock}</span>
                <span className="shrink-0">
                  {e.isGoal ? "⚽" : /red/i.test(e.type) ? "🟥" : /yellow/i.test(e.type) ? "🟨" : "•"}
                </span>
                <span className="shrink-0">{e.side === "home" ? homeFlag : e.side === "away" ? awayFlag : ""}</span>
                <span className="text-mute">{e.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatBar({ s }: { s: StatRow }) {
  const tot = s.homeNum + s.awayNum;
  const hShare = tot > 0 ? (s.homeNum / tot) * 100 : 50;
  const hLead = s.homeNum > s.awayNum;
  const aLead = s.awayNum > s.homeNum;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-0.5">
        <span className={hLead ? "tabular font-bold" : "tabular text-mute"}>{s.home}</span>
        <span className="text-mute uppercase tracking-wide text-[10px]">{s.label}</span>
        <span className={aLead ? "tabular font-bold" : "tabular text-mute"}>{s.away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/6">
        <div style={{ width: `${hShare}%`, background: "var(--color-emerald)" }} />
        <div style={{ width: `${100 - hShare}%`, background: "var(--color-cyan)" }} />
      </div>
    </div>
  );
}
