import { CONF_META } from "@/lib/format";
import type { Team } from "@/lib/types";

export function Flag({ flag, size = "text-2xl" }: { flag: string; size?: string }) {
  return (
    <span className={`${size} leading-none`} aria-hidden>
      {flag}
    </span>
  );
}

export function ConfBadge({ team }: { team: Team }) {
  const m = CONF_META[team.confederation];
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
      style={{ color: m.color, background: `${m.color}1a` }}
    >
      {m.label}
    </span>
  );
}

/** horizontal probability bar with label */
export function ProbBar({
  value,
  label,
  color = "var(--color-emerald)",
  sub,
}: {
  value: number;
  label: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0 text-sm truncate">{label}</div>
      <div className="flex-1 h-2.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(value * 100, value > 0 ? 1.5 : 0)}%`,
            background: color,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />
      </div>
      <div className="w-16 shrink-0 text-right text-sm tabular font-semibold">
        {sub}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="card px-4 py-3">
      <div className="text-xs text-mute uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-extrabold tabular mt-0.5 ${accent}`}>{value}</div>
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  desc,
}: {
  kicker?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-5">
      {kicker && (
        <div className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald mb-1.5">
          {kicker}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h2>
      {desc && <p className="text-mute mt-1.5 max-w-2xl">{desc}</p>}
    </div>
  );
}
