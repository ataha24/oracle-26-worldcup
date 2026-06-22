"use client";

import { useState, useMemo } from "react";
import { TEAMS } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { pct, CONF_META } from "@/lib/format";
import { ConfBadge, SectionTitle } from "@/components/bits";
import type { Confederation } from "@/lib/types";

type SortKey = "title" | "elo" | "rank";

export default function TeamsPage() {
  const [conf, setConf] = useState<Confederation | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("title");

  const teams = useMemo(() => {
    const filtered = TEAMS.filter((t) => conf === "ALL" || t.confederation === conf);
    return filtered.sort((a, b) => {
      if (sort === "elo") return b.elo - a.elo;
      if (sort === "rank") return a.fifaRank - b.fifaRank;
      return oddsFor(b.id).pWinTitle - oddsFor(a.id).pWinTitle;
    });
  }, [conf, sort]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="The field"
        title="All 48 teams"
        desc="Every nation in the 2026 World Cup, with squad ratings, history and live title odds. Filter by confederation, sort by what matters to you."
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Chip active={conf === "ALL"} onClick={() => setConf("ALL")}>
          All ({TEAMS.length})
        </Chip>
        {(Object.keys(CONF_META) as Confederation[]).map((c) => (
          <Chip key={c} active={conf === c} onClick={() => setConf(c)} color={CONF_META[c].color}>
            {CONF_META[c].label}
          </Chip>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-mute">
          <span>Sort:</span>
          {(["title", "elo", "rank"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2.5 py-1 rounded-md ${
                sort === s ? "bg-white/10 text-white" : "hover:text-white"
              }`}
            >
              {s === "title" ? "Title odds" : s === "elo" ? "Rating" : "FIFA rank"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t, i) => {
          const o = oddsFor(t.id);
          return (
            <div
              key={t.id}
              className="card p-4 hover:border-white/20 transition-colors rise"
              style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{t.flag}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{t.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ConfBadge team={t} />
                    <span className="text-[11px] text-mute">FIFA #{t.fifaRank}</span>
                    <span className="text-[11px] text-mute tabular">{Math.round(t.elo)} Elo</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black tabular text-gold">
                    {pct(o.pWinTitle, 1)}
                  </div>
                  <div className="text-[10px] text-mute">to win</div>
                </div>
              </div>

              <p className="text-xs text-mute mt-3 leading-relaxed">{t.blurb}</p>

              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <Mini label="Advance" value={pct(o.pAdvance)} />
                <Mini label="Quarters" value={pct(o.pReachQF)} />
                <Mini label="Final" value={pct(o.pReachFinal, 1)} />
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {t.stars.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-mute">
                    {s}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-mute mt-3 pt-3 border-t border-line/50 flex justify-between">
                <span>
                  {t.history.titles > 0
                    ? `🏆 ${t.history.titles}× champions`
                    : t.history.bestResult}
                </span>
                <span>{t.history.appearances} WCs</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "text-white" : "text-mute hover:text-white"
      }`}
      style={active ? { background: color ? `${color}22` : "rgba(255,255,255,0.1)" } : undefined}
    >
      {children}
    </button>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-lg py-1.5">
      <div className="text-sm font-bold tabular">{value}</div>
      <div className="text-[10px] text-mute">{label}</div>
    </div>
  );
}
