import { RANKED_ODDS } from "@/lib/forecast";
import { getTeam } from "@/lib/data/teams";
import { pct, heat } from "@/lib/format";
import { Flag, SectionTitle } from "@/components/bits";
import { BracketTree } from "@/components/BracketTree";
import { projectBracket } from "@/lib/engine/bracket-projection";
import type { TeamTournamentOdds } from "@/lib/types";

export const metadata = { title: "Predicted Bracket — ORACLE '26" };

const COLS: { key: keyof TeamTournamentOdds; label: string }[] = [
  { key: "pAdvance", label: "R32" },
  { key: "pReachR16", label: "R16" },
  { key: "pReachQF", label: "QF" },
  { key: "pReachSF", label: "Semi" },
  { key: "pReachFinal", label: "Final" },
  { key: "pWinTitle", label: "🏆" },
];

export default function BracketPage() {
  const rows = RANKED_ODDS; // already sorted by title prob
  const projection = projectBracket();

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="Predicted bracket"
        title="How the knockouts play out"
        desc="The model's single most-likely run of the tournament — projected group finishes feed the official 2026 bracket, then every tie from the Round of 32 to the final is played out with a predicted score."
      />

      <BracketTree projection={projection} />

      <div className="border-t border-line/60 mt-10 pt-10" />

      <SectionTitle
        kicker="Knockout forecast"
        title="The road to MetLife"
        desc="Every team's probability of surviving each knockout round across 50,000 simulated tournaments. Because the bracket is a fixed tree, a team's path — not just its strength — shapes these numbers."
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-[11px] text-mute uppercase tracking-wide">
              <th className="text-left font-medium py-3 pl-4 sticky left-0 bg-card">Team</th>
              <th className="font-medium px-1 w-12">Grp</th>
              {COLS.map((c) => (
                <th key={c.key} className="font-medium px-1 w-[14%]">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => {
              const t = getTeam(o.teamId);
              return (
                <tr
                  key={o.teamId}
                  className="border-t border-line/50 hover:bg-white/[0.02]"
                >
                  <td className="py-2 pl-4 sticky left-0 bg-card">
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-[11px] text-mute tabular text-right">
                        {i + 1}
                      </span>
                      <Flag flag={t.flag} size="text-base" />
                      <span className="font-medium truncate max-w-[8rem]">{t.name}</span>
                    </span>
                  </td>
                  <td className="text-center text-mute text-xs">{o.groupId}</td>
                  {COLS.map((c) => {
                    const v = o[c.key] as number;
                    return (
                      <td key={c.key} className="px-1 py-1">
                        <div
                          className="rounded-md py-1 text-center text-xs font-semibold tabular"
                          style={{
                            background: v > 0.002 ? heat(v) : "transparent",
                            color: v > 0.5 ? "#05070d" : v > 0.002 ? "#05070d" : "var(--color-mute)",
                          }}
                        >
                          {v > 0.0005 ? pct(v, v < 0.1 ? 1 : 0) : "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Legend />
        <div className="card p-4 sm:col-span-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald mb-2">
            How to read it
          </div>
          <p className="text-sm text-mute">
            Each cell is the share of {(50000).toLocaleString()} simulated tournaments in which
            that team is still alive at that stage. Watch how favorites in a stacked half of the
            draw (Group H&apos;s runner-up faces Group J&apos;s winner, for instance) can carry
            high title odds yet a relatively modest chance of clearing the Round of 32 — the
            bracket is unforgiving.
          </p>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-2">
        Likelihood
      </div>
      <div className="h-3 rounded-full overflow-hidden flex">
        {[0.05, 0.25, 0.5, 0.75, 0.95].map((v) => (
          <div key={v} className="flex-1" style={{ background: heat(v) }} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-mute mt-1">
        <span>long shot</span>
        <span>near certain</span>
      </div>
    </div>
  );
}
