import { getTeam } from "@/lib/data/teams";
import {
  bracketColumns,
  type BracketProjection,
  type ProjectedTie,
  type Round,
} from "@/lib/engine/bracket-projection";

const ROUND_LABEL: Record<Round, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  F: "Final",
};
const COLUMN_ORDER: Round[] = ["R32", "R16", "QF", "SF", "F"];

/** A single team row inside a tie card. */
function TeamLine({ teamId, goals, won }: { teamId: string; goals: number; won: boolean }) {
  const t = getTeam(teamId);
  return (
    <div className={`flex items-center gap-1.5 ${won ? "" : "opacity-55"}`}>
      <span className="text-sm leading-none">{t.flag}</span>
      <span className={`flex-1 truncate text-[12px] ${won ? "font-bold" : "font-medium"}`}>
        {t.name}
      </span>
      <span className="tabular text-[12px] font-bold w-3 text-right">{goals}</span>
    </div>
  );
}

function TieCard({ tie }: { tie: ProjectedTie }) {
  return (
    <div className="card px-2.5 py-1.5 w-[180px] shrink-0">
      <TeamLine teamId={tie.aId} goals={tie.ga} won={tie.winnerId === tie.aId} />
      <div className="h-px bg-line/60 my-1" />
      <TeamLine teamId={tie.bId} goals={tie.gb} won={tie.winnerId === tie.bId} />
      {tie.pens && (
        <div className="text-[9px] text-mute mt-0.5 text-center">
          {getTeam(tie.winnerId).name} adv. on pens
        </div>
      )}
    </div>
  );
}

export function BracketTree({ projection }: { projection: BracketProjection }) {
  const cols = bracketColumns(projection.ties);
  const champ = getTeam(projection.championId);

  return (
    <div>
      {/* champion banner */}
      <div className="card p-4 mb-5 flex items-center gap-3 border-gold/40 bg-gold/5">
        <span className="text-3xl">🏆</span>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-mute">Predicted champion</div>
          <div className="text-xl font-extrabold flex items-center gap-2">
            <span>{champ.flag}</span> {champ.name}
          </div>
        </div>
      </div>

      {/* horizontally scrollable bracket */}
      <div className="card p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {COLUMN_ORDER.map((round) => (
            <div key={round} className="flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald mb-2 text-center">
                {ROUND_LABEL[round]}
              </div>
              <div className="flex flex-col justify-around flex-1 gap-2">
                {cols[round].map((tie) => (
                  <TieCard key={tie.match} tie={tie} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-mute mt-3">
        The single most-likely path: remaining group games and every knockout tie are resolved at the
        model&apos;s modal scoreline, with the winner set by the engine&apos;s advancement probability
        (so level scores go to extra time / penalties). This is the &ldquo;if everything goes to
        seed&rdquo; skeleton — the probability view below shows how often each path actually holds.
      </p>
    </div>
  );
}
