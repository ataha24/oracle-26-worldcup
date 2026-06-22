import { getTeam } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { matchTeams, TEAM_RANK, AXES, type Vibe, type Axis } from "@/lib/match/vibes";
import { fanIdentity } from "@/lib/match/persona";
import { getLore } from "@/lib/data/lore";
import { CONF_META } from "@/lib/format";

// The full Fan-ID report body, shared by the quiz result AND the public share
// page so a shared link reveals the COMPLETE report — not just a card.
// Pure/presentational (no hooks) so it renders on server and client alike.

export const AXIS_LABEL: Record<Axis, string> = {
  glory: "Glory", firepower: "Firepower", grit: "Grit", fairytale: "Fairytale", heartbreak: "Heartbreak",
};
export const AXIS_COLOR: Record<Axis, string> = {
  glory: "var(--color-gold)", firepower: "var(--color-rose)", grit: "var(--color-cyan)",
  fairytale: "var(--color-emerald)", heartbreak: "var(--color-violet)",
};

/** encode a vibe for the share URL: normalized 0..100 ints joined by "-" */
export function encodeVibe(v: Vibe): string {
  const max = Math.max(...AXES.map((k) => v[k]), 1e-9);
  return AXES.map((k) => Math.round((v[k] / max) * 100)).join("-");
}
export function decodeVibe(s: string | undefined | null): Vibe | null {
  if (!s) return null;
  const parts = s.split("-").map((n) => parseInt(n, 10));
  if (parts.length !== AXES.length || parts.some((n) => Number.isNaN(n))) return null;
  return Object.fromEntries(AXES.map((k, i) => [k, Math.max(0, parts[i]) / 100])) as Vibe;
}

export function FanReport({ userVibe }: { userVibe: Vibe }) {
  const matches = matchTeams(userVibe, 3);
  const top = matches[0];
  const team = getTeam(top.teamId);
  const o = oddsFor(top.teamId);
  const conf = CONF_META[team.confederation];
  const vibe = TEAM_RANK[top.teamId];
  const me = fanIdentity(userVibe);
  const lore = getLore(top.teamId);
  const tasteMax = Math.max(...AXES.map((k) => userVibe[k]), 1e-9);

  return (
    <div>
      {/* FAN ID — the hero */}
      <div className="text-center mb-2 text-xs font-semibold tracking-[0.25em] uppercase text-emerald">
        Your Fan ID
      </div>
      <div
        className="card p-7 text-center relative overflow-hidden"
        style={{ boxShadow: "0 0 60px -18px var(--color-emerald)" }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black tracking-widest mb-3"
          style={{
            color: me.tier.color,
            background: `${me.tier.color}1a`,
            border: `1.5px solid ${me.tier.color}66`,
            boxShadow: me.tier.name === "LEGENDARY" ? `0 0 26px ${me.tier.color}88` : "none",
          }}
        >
          <span>{me.tier.emoji}</span>
          {me.tier.name}
        </div>

        <div className="text-7xl mb-1 leading-none">{me.emoji}</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{me.name}</h1>
        <p className="text-mute mt-2 max-w-md mx-auto">{me.desc}</p>

        <div className="flex justify-center gap-2 mt-4">
          {me.traits.map((t, i) => (
            <span
              key={i}
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${AXIS_COLOR[i === 0 ? me.key : me.secondKey]}22`, color: AXIS_COLOR[i === 0 ? me.key : me.secondKey] }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5 text-left">
          <IdBox label="💪 Superpower" value={me.superpower} />
          <IdBox label="🩹 Fatal flaw" value={me.flaw} />
          <IdBox
            label={`${me.tier.emoji} Rarity`}
            value={`Only ${me.rarity}% are ${me.name.replace("The ", "")}s — ${me.tier.tagline}`}
          />
        </div>
      </div>

      {/* SPIRIT TEAM */}
      <div className="card p-5 mt-4 flex items-center gap-4">
        <div className="text-5xl">{team.flag}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-mute uppercase tracking-widest">Your spirit team</div>
          <div className="font-extrabold text-xl leading-tight">{team.name}</div>
          <div className="text-xs text-mute">
            <span style={{ color: conf.color }}>{conf.label}</span> · Group {o.groupId} ·{" "}
            ⭐ {team.stars[0]} ·{" "}
            {top.nextOpponentId ? `next vs ${getTeam(top.nextOpponentId).name}` : "into the knockouts"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black wordmark">{top.pctMatch}%</div>
          <div className="text-[10px] text-mute uppercase tracking-widest">match</div>
        </div>
      </div>

      {/* WINDOW INTO YOU */}
      {lore && (
        <div className="card p-6 mt-4 relative overflow-hidden" style={{ boxShadow: `0 0 50px -22px ${conf.color}` }}>
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: conf.color }} />
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: conf.color }}>
            🪞 A window into you
          </div>
          <p className="text-lg sm:text-xl font-semibold leading-snug">{lore.saysAboutYou}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {lore.vibes.map((v) => (
              <span key={v} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${conf.color}1a`, color: conf.color }}>
                {v}
              </span>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-[10px] text-mute uppercase tracking-wide mb-1">{team.name}&apos;s soul</div>
              <p className="text-sm">{lore.soul}</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-[10px] text-mute uppercase tracking-wide mb-1">What watching them feels like</div>
              <p className="text-sm">{lore.watching}</p>
            </div>
          </div>
          <div className="text-xs text-mute mt-4 pt-4 border-t border-line/60">
            <span className="font-semibold text-white">The legend:</span> {lore.legend}
          </div>
        </div>
      )}

      {/* WHY */}
      <div className="card p-5 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald mb-2">
          Why {team.name} is your spirit team
        </div>
        <ul className="space-y-2">
          {top.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-emerald">♥</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PERSONALITY BREAKDOWN */}
      <div className="card p-5 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">
          Their personality (and how it matched yours)
        </div>
        <div className="space-y-2">
          {AXES.map((ax) => (
            <div key={ax} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0">{AXIS_LABEL[ax]}</span>
              <div className="flex-1 h-2.5 rounded-full bg-white/6 overflow-hidden relative">
                <div className="h-full rounded-full" style={{ width: `${vibe[ax] * 100}%`, background: AXIS_COLOR[ax] }} />
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70"
                  style={{ left: `${Math.min(98, (userVibe[ax] / tasteMax) * 100)}%` }}
                  title="your taste"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-mute mt-2">Bars = the team&apos;s traits · white tick = your taste.</div>
      </div>

      {/* BACKUPS */}
      <div className="mt-5">
        <div className="text-xs text-mute mb-2">Your backup crushes (if it doesn&apos;t work out):</div>
        <div className="flex gap-3">
          {matches.slice(1).map((m) => {
            const t = getTeam(m.teamId);
            return (
              <div key={m.teamId} className="card px-4 py-3 flex-1 text-center">
                <div className="text-3xl">{t.flag}</div>
                <div className="font-semibold text-sm mt-1">{t.name}</div>
                <div className="text-xs text-mute">{m.pctMatch}% match</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IdBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] rounded-xl p-3">
      <div className="text-[10px] text-mute uppercase tracking-wide">{label}</div>
      <div className="font-semibold text-xs mt-1 leading-snug">{value}</div>
    </div>
  );
}
