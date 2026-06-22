import { GROUPS } from "@/lib/data/groups";
import { getTeam } from "@/lib/data/teams";
import { groupTable, remainingPairings } from "@/lib/engine/standings";
import { predictFixture } from "@/lib/engine/predict";
import { oddsFor } from "@/lib/forecast";
import { pct, heat } from "@/lib/format";
import { Flag, SectionTitle } from "@/components/bits";

export const metadata = { title: "Groups — ORACLE '26" };

export default function GroupsPage() {
  const death = [...GROUPS]
    .map((g) => ({ id: g.id, avg: g.teamIds.reduce((a, id) => a + getTeam(id).elo, 0) }))
    .sort((a, b) => b.avg - a.avg)[0].id;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="Group stage"
        title="12 groups, live"
        desc="Real standings from completed matches, with each team's simulated probability to reach the Round of 32 and to win the group. Top 2 of every group advance, plus the 8 best third-placed teams."
      />

      <div className="grid md:grid-cols-2 gap-5">
        {GROUPS.map((g) => (
          <GroupCard key={g.id} groupId={g.id} isDeath={g.id === death} />
        ))}
      </div>

      <p className="text-xs text-mute mt-6">
        Qualify% = probability of reaching the knockout stage (top-2 or one of the 8 best
        third-placed teams). Cells are heat-shaded by likelihood.
      </p>
    </div>
  );
}

function GroupCard({ groupId, isDeath }: { groupId: string; isDeath: boolean }) {
  const table = groupTable(groupId);
  const remaining = remainingPairings(groupId);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-extrabold">
          Group {groupId}
          {isDeath && (
            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-rose align-middle">
              ☠ Group of death
            </span>
          )}
        </h3>
        <span className="text-[11px] text-mute">
          {3 - table[0].played} round{3 - table[0].played === 1 ? "" : "s"} to play
        </span>
      </div>

      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-mute uppercase tracking-wide">
              <th className="text-left font-medium pb-1.5 pl-1">Team</th>
              <th className="font-medium pb-1.5 w-7">Pl</th>
              <th className="font-medium pb-1.5 w-9">GD</th>
              <th className="font-medium pb-1.5 w-8">Pts</th>
              <th className="font-medium pb-1.5 w-16">Qualify</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r, i) => {
              const t = getTeam(r.teamId);
              const o = oddsFor(r.teamId);
              const top2 = i < 2;
              return (
                <tr key={r.teamId} className="border-t border-line/60">
                  <td className="py-1.5 pl-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-1 h-5 rounded-full ${top2 ? "bg-emerald" : "bg-white/10"}`}
                      />
                      <Flag flag={t.flag} size="text-base" />
                      <span className="font-medium truncate max-w-[7.5rem]">{t.name}</span>
                    </span>
                  </td>
                  <td className="text-center tabular text-mute">{r.played}</td>
                  <td className="text-center tabular">
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="text-center tabular font-bold">{r.pts}</td>
                  <td className="text-center">
                    <span
                      className="inline-block w-full rounded-md py-0.5 text-xs font-semibold tabular text-black/90"
                      style={{ background: heat(o.pAdvance), color: o.pAdvance > 0.55 ? "#05070d" : "#eef1f7" }}
                    >
                      {pct(o.pAdvance)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {remaining.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line/60">
          <div className="text-[11px] text-mute uppercase tracking-wide mb-2">
            Remaining fixtures — model call
          </div>
          <div className="space-y-1.5">
            {remaining.map(([a, b]) => {
              const p = predictFixture(a, b);
              const ta = getTeam(p.homeId);
              const tb = getTeam(p.awayId);
              return (
                <div key={`${a}-${b}`} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-right truncate">
                    {ta.name} {ta.flag}
                  </span>
                  <MiniWDL p={p} />
                  <span className="w-28 truncate">
                    {tb.flag} {tb.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniWDL({ p }: { p: ReturnType<typeof predictFixture> }) {
  return (
    <span className="flex-1 flex h-4 rounded overflow-hidden text-[9px] font-bold text-black/80 tabular">
      <span
        className="flex items-center justify-center"
        style={{ width: `${p.pHomeWin * 100}%`, background: "var(--color-emerald)" }}
        title="Home win"
      >
        {p.pHomeWin > 0.16 ? Math.round(p.pHomeWin * 100) : ""}
      </span>
      <span
        className="flex items-center justify-center bg-white/15 text-white"
        style={{ width: `${p.pDraw * 100}%` }}
        title="Draw"
      >
        {p.pDraw > 0.16 ? Math.round(p.pDraw * 100) : ""}
      </span>
      <span
        className="flex items-center justify-center"
        style={{ width: `${p.pAwayWin * 100}%`, background: "var(--color-cyan)" }}
        title="Away win"
      >
        {p.pAwayWin > 0.16 ? Math.round(p.pAwayWin * 100) : ""}
      </span>
    </span>
  );
}
