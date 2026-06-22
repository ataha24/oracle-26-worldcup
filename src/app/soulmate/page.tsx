"use client";

import { useMemo, useState } from "react";
import { getTeam } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { matchTeams, TEAM_VIBES, AXES, type Vibe, type Axis } from "@/lib/match/vibes";
import { fanIdentity } from "@/lib/match/persona";
import { pct } from "@/lib/format";
import { CONF_META } from "@/lib/format";

type W = Partial<Vibe>;
interface Statement {
  text: string;
  emoji: string;
  w: W; // which trait(s) this hot-take loads onto
}

// Rate each "hot take" 0–5. Intensity shapes your vector — lean hard or stay cool.
const STATEMENTS: Statement[] = [
  { emoji: "👑", text: "I back the favourite. Winners win — simple as that.", w: { glory: 1 } },
  { emoji: "🐣", text: "Underdogs and Cinderella runs make me genuinely emotional.", w: { fairytale: 1 } },
  { emoji: "🎆", text: "No goals, no fun. Give me chaos, comebacks and shootouts.", w: { firepower: 1 } },
  { emoji: "🧱", text: "A scrappy, ugly 1–0 grind is secretly beautiful to me.", w: { grit: 1 } },
  { emoji: "🥀", text: "I always fall for the team destined to break my heart.", w: { heartbreak: 1 } },
  { emoji: "🎢", text: "I watch sport to FEEL something — not to relax.", w: { heartbreak: 0.6, firepower: 0.6 } },
];

const SCALE = ["Not me", "", "", "", "", "SO me 🔥"];


const AXIS_LABEL: Record<Axis, string> = {
  glory: "Glory", firepower: "Firepower", grit: "Grit", fairytale: "Fairytale", heartbreak: "Heartbreak",
};
const AXIS_COLOR: Record<Axis, string> = {
  glory: "var(--color-gold)", firepower: "var(--color-rose)", grit: "var(--color-cyan)",
  fairytale: "var(--color-emerald)", heartbreak: "var(--color-violet)",
};

type Phase = "intro" | "quiz" | "reading" | "result";

export default function SoulmatePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [ratings, setRatings] = useState<(number | null)[]>(
    Array(STATEMENTS.length).fill(null),
  );

  const userVibe = useMemo<Vibe>(() => {
    const sum: Vibe = { glory: 0, firepower: 0, grit: 0, fairytale: 0, heartbreak: 0 };
    STATEMENTS.forEach((s, i) => {
      const r = (ratings[i] ?? 0) / 5; // 0..1 intensity
      for (const k of AXES) sum[k] += (s.w[k] ?? 0) * r;
    });
    const max = Math.max(...AXES.map((k) => sum[k]), 0);
    if (max === 0) return { glory: 0.5, firepower: 0.5, grit: 0.5, fairytale: 0.5, heartbreak: 0.5 };
    return Object.fromEntries(AXES.map((k) => [k, sum[k] / max])) as Vibe;
  }, [ratings]);

  const matches = useMemo(() => (phase === "result" ? matchTeams(userVibe, 3) : []), [phase, userVibe]);

  function setRating(i: number, n: number) {
    setRatings((r) => {
      const c = [...r];
      c[i] = n;
      return c;
    });
  }
  function submit() {
    setPhase("reading");
    setTimeout(() => setPhase("result"), 1900);
  }
  function restart() {
    setRatings(Array(STATEMENTS.length).fill(null));
    setPhase("intro");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 min-h-[80vh] flex flex-col justify-center">
      {phase === "intro" && <Intro onStart={() => setPhase("quiz")} />}

      {phase === "quiz" && (
        <SliderQuiz ratings={ratings} onRate={setRating} onSubmit={submit} />
      )}

      {phase === "reading" && <Reading />}

      {phase === "result" && matches.length > 0 && (
        <Result matches={matches} userVibe={userVibe} onRestart={restart} />
      )}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center rise">
      <div className="text-6xl mb-4">🔮💘</div>
      <div className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-2">
        The Oracle&apos;s Matchmaker
      </div>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
        What&apos;s Your <span className="wordmark">Fan Personality?</span>
      </h1>
      <p className="text-mute max-w-xl mx-auto mt-5">
        Rate 6 hot takes and the Oracle reveals your{" "}
        <span className="text-white">Fan ID</span> — your type, your superpower, your fatal flaw,
        and the World Cup team you were born to root for. Then flex it on your group chat.
      </p>
      <button
        onClick={onStart}
        className="mt-8 px-8 py-3.5 rounded-2xl bg-emerald text-black font-bold text-lg hover:brightness-110 transition shadow-[0_0_40px_-8px_var(--color-emerald)]"
      >
        Reveal my Fan ID →
      </button>
      <p className="text-xs text-mute mt-4">
        Takes 20 seconds ·{" "}
        <a href="/how-it-works" className="hover:text-emerald transition underline underline-offset-2">
          how it works
        </a>
      </p>
    </div>
  );
}

function SliderQuiz({
  ratings,
  onRate,
  onSubmit,
}: {
  ratings: (number | null)[];
  onRate: (i: number, n: number) => void;
  onSubmit: () => void;
}) {
  const answered = ratings.filter((r) => r !== null).length;
  const done = answered === STATEMENTS.length;

  return (
    <div className="rise">
      <div className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald mb-1">
        Rate the hot takes
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">How much is this you?</h2>
      <p className="text-mute text-sm mb-6">
        0 = not me at all, 5 = that&apos;s literally me. Lean as hard as you like.
      </p>

      <div className="space-y-3">
        {STATEMENTS.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl leading-none">{s.emoji}</span>
              <span className="font-medium">{s.text}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-mute w-12 shrink-0">{SCALE[0]}</span>
              <div className="flex-1 flex justify-between gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((n) => {
                  const sel = ratings[i];
                  const on = sel !== null && n <= sel;
                  return (
                    <button
                      key={n}
                      onClick={() => onRate(i, n)}
                      aria-label={`${s.text} — ${n}`}
                      className="flex-1 h-8 rounded-lg transition-all"
                      style={{
                        background: on ? "var(--color-emerald)" : "rgba(255,255,255,0.06)",
                        boxShadow: sel === n ? "0 0 14px var(--color-emerald)" : "none",
                        transform: sel === n ? "scaleY(1.25)" : "none",
                      }}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-mute w-14 shrink-0 text-right">{SCALE[5]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button
          onClick={onSubmit}
          disabled={!done}
          className="w-full py-3.5 rounded-2xl bg-emerald text-black font-bold text-lg transition disabled:opacity-40 enabled:hover:brightness-110 enabled:shadow-[0_0_40px_-8px_var(--color-emerald)]"
        >
          {done ? "Reveal my soulmate →" : `Rate all 6 to continue (${answered}/${STATEMENTS.length})`}
        </button>
      </div>
    </div>
  );
}

function Reading() {
  return (
    <div className="text-center">
      <div className="text-7xl mb-6 animate-pulse">🔮</div>
      <h2 className="text-2xl font-extrabold">Reading your footballing aura…</h2>
      <p className="text-mute mt-2">Consulting 50,000 simulated tournaments and the stars.</p>
      <div className="flex justify-center gap-1.5 mt-6">
        {[0, 1, 2].map((d) => (
          <span key={d} className="w-2 h-2 rounded-full bg-emerald animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />
        ))}
      </div>
    </div>
  );
}

function Result({
  matches,
  userVibe,
  onRestart,
}: {
  matches: ReturnType<typeof matchTeams>;
  userVibe: Vibe;
  onRestart: () => void;
}) {
  const top = matches[0];
  const team = getTeam(top.teamId);
  const o = oddsFor(top.teamId);
  const conf = CONF_META[team.confederation];
  const vibe = TEAM_VIBES[top.teamId];
  const me = fanIdentity(userVibe);
  const params = `team=${top.teamId}&persona=${me.key}&t2=${me.secondKey}&pct=${top.pctMatch}`;
  const cardUrl = `/api/card?${params}`;
  const shareUrl = `/soulmate/share?${params}`;

  async function share() {
    const url = typeof window !== "undefined" ? window.location.origin + shareUrl : shareUrl;
    const text = `🔮 My Fan ID: ${me.emoji} ${me.name} (${me.traits.join(" · ")}). Spirit team: ${team.flag} ${team.name}. What's yours?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My World Cup Soulmate", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert("Link copied — go paste it and brag.");
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <div className="rise">
      {/* confetti */}
      <div className="relative h-0">
        {["🎉", "⚽", "✨", "🎊", "🏆", "💚", "✨", "⚽"].map((e, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${8 + i * 11}%`,
              animation: `rise 1.2s ease-out ${i * 0.05}s both`,
              opacity: 0.9,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      {/* FAN ID — the hero */}
      <div className="text-center mb-2 text-xs font-semibold tracking-[0.25em] uppercase text-emerald">
        Your Fan ID
      </div>
      <div
        className="card p-7 text-center relative overflow-hidden"
        style={{ boxShadow: "0 0 60px -18px var(--color-emerald)" }}
      >
        <div className="text-7xl mb-1 leading-none">{me.emoji}</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{me.name}</h1>
        <p className="text-mute mt-2 max-w-md mx-auto">{me.desc}</p>

        {/* trait chips */}
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

        {/* superpower / flaw / rarity */}
        <div className="grid grid-cols-3 gap-2 mt-5 text-left">
          <IdBox label="💪 Superpower" value={me.superpower} />
          <IdBox label="🩹 Fatal flaw" value={me.flaw} />
          <IdBox label="🦄 Rarity" value={`~${me.rarity}% of fans`} />
        </div>
      </div>

      {/* SPIRIT TEAM — the fun detail */}
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

      {/* why */}
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

      {/* compatibility breakdown */}
      <div className="card p-5 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-3">
          Their personality (and how it matched yours)
        </div>
        <div className="space-y-2">
          {AXES.map((ax) => (
            <div key={ax} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0">{AXIS_LABEL[ax]}</span>
              <div className="flex-1 h-2.5 rounded-full bg-white/6 overflow-hidden relative">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${vibe[ax] * 100}%`, background: AXIS_COLOR[ax] }}
                />
                {/* your preference marker */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/70"
                  style={{ left: `${userVibe[ax] * 100}%` }}
                  title="your taste"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-mute mt-2">Bars = the team&apos;s traits · white tick = your taste.</div>
      </div>

      {/* backups */}
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

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button onClick={share} className="px-5 py-2.5 rounded-xl bg-emerald text-black font-bold text-sm hover:brightness-110 transition">
          Share my Fan ID
        </button>
        <a
          href={cardUrl}
          download={`my-fan-id-${me.key}.png`}
          className="px-5 py-2.5 rounded-xl border border-emerald/40 text-emerald font-semibold text-sm hover:bg-emerald/10 transition"
        >
          ⬇ Download my card
        </a>
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl border border-line text-sm hover:text-white hover:border-white/30 transition">
          Take it again
        </button>
      </div>

      <div className="text-center mt-4">
        <a href="/how-it-works" className="text-xs text-mute hover:text-emerald transition">
          🤓 Wait, how did you match me? See the math →
        </a>
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
