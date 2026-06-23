"use client";

import { useEffect, useRef, useState } from "react";
import type { Trends } from "@/lib/trends";

// Records this result (once) and shows privacy-friendly aggregate trends across
// everyone who's taken the quiz. Renders nothing until a datastore is configured.
export function FanTrends({
  teamId,
  persona,
  tier,
}: {
  teamId: string;
  persona: string;
  tier: string;
}) {
  const [trends, setTrends] = useState<Trends | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    (async () => {
      try {
        await fetch("/api/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId, persona, tier }),
        });
        const res = await fetch("/api/trends", { cache: "no-store" });
        const data = await res.json();
        if (data.configured && data.trends?.total > 0) setTrends(data.trends);
      } catch {
        /* trends are optional — ignore */
      }
    })();
  }, [teamId, persona, tier]);

  if (!trends) return null;

  const topTeam = trends.teams[0];
  const maxTeam = topTeam?.count || 1;
  const topPersona = trends.personas[0];

  return (
    <div className="card p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-cyan">
          📊 Fan ID trends
        </div>
        <div className="text-xs text-mute tabular">
          {trends.total.toLocaleString()} fans matched
        </div>
      </div>

      {/* most common spirit teams */}
      <div className="text-[10px] text-mute uppercase tracking-wide mb-2">
        Most common spirit teams
      </div>
      <div className="space-y-1.5">
        {trends.teams.slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm">
            <span className="text-base">{t.flag}</span>
            <span className="w-28 truncate">{t.name}</span>
            <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan"
                style={{ width: `${(t.count / maxTeam) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right tabular text-mute">{Math.round(t.pct * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="text-[10px] text-mute uppercase tracking-wide mb-1">
            Most common personality
          </div>
          <div className="font-semibold text-sm">
            {topPersona?.emoji} {topPersona?.name}{" "}
            <span className="text-mute font-normal">({Math.round((topPersona?.pct ?? 0) * 100)}%)</span>
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3">
          <div className="text-[10px] text-mute uppercase tracking-wide mb-1">Rarest pulls so far</div>
          <div className="text-sm">
            {trends.rarest.slice(0, 3).map((t) => t.flag).join(" ")}{" "}
            <span className="text-mute text-xs">
              {trends.rarest[0]?.name} & co.
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-mute mt-3">
        Anonymous, aggregate only — we count teams &amp; types, never who you are.
      </div>
    </div>
  );
}
