"use client";

import { useMemo, useState } from "react";
import { getTeam, TEAMS } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { matchTeams, rankTeams, TEAM_VIBES, AXES, type Vibe, type Axis } from "@/lib/match/vibes";
import { fanIdentity } from "@/lib/match/persona";
import { QUESTIONS, leanFromAnswers, type Option } from "@/lib/match/quiz";
import { pct } from "@/lib/format";
import { CONF_META } from "@/lib/format";

const AXIS_LABEL: Record<Axis, string> = {
  glory: "Glory", firepower: "Firepower", grit: "Grit", fairytale: "Fairytale", heartbreak: "Heartbreak",
};
const AXIS_COLOR: Record<Axis, string> = {
  glory: "var(--color-gold)", firepower: "var(--color-rose)", grit: "var(--color-cyan)",
  fairytale: "var(--color-emerald)", heartbreak: "var(--color-violet)",
};

// how many flags remain "in contention" after each answer — the field narrows
const FIELD_AT = [48, 32, 20, 12, 6, 3, 1];

type Phase = "intro" | "quiz" | "reading" | "result";

export default function SoulmatePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<(Option | null)[]>(
    Array(QUESTIONS.length).fill(null),
  );

  const step = answers.findIndex((a) => a === null) === -1
    ? QUESTIONS.length
    : answers.findIndex((a) => a === null);

  const userVibe = useMemo<Vibe>(() => leanFromAnswers(answers), [answers]);
  const matches = useMemo(() => (phase === "result" ? matchTeams(userVibe, 3) : []), [phase, userVibe]);

  function answer(i: number, opt: Option) {
    const next = [...answers];
    next[i] = opt;
    setAnswers(next);
    if (next.every((a) => a !== null)) {
      setPhase("reading");
      setTimeout(() => setPhase("result"), 2100);
    }
  }
  function restart() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setPhase("intro");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 min-h-[80vh] flex flex-col justify-center">
      {phase === "intro" && <Intro onStart={() => setPhase("quiz")} />}

      {phase === "quiz" && step < QUESTIONS.length && (
        <QuestionCard
          key={step}
          step={step}
          answers={answers}
          userVibe={userVibe}
          onAnswer={(opt) => answer(step, opt)}
        />
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
        Answer 6 quick questions and watch the field of 48 narrow to your team. The Oracle
        reveals your <span className="text-white">Fan ID</span> — your type, your superpower,
        your fatal flaw, and the World Cup team you were born to root for. Then flex it on the
        group chat.
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

function QuestionCard({
  step,
  answers,
  userVibe,
  onAnswer,
}: {
  step: number;
  answers: (Option | null)[];
  userVibe: Vibe;
  onAnswer: (opt: Option) => void;
}) {
  const q = QUESTIONS[step];
  const answeredCount = answers.filter((a) => a !== null).length;
  // field BEFORE this answer (based on answers so far)
  const fieldSize = FIELD_AT[Math.min(answeredCount, FIELD_AT.length - 1)];

  return (
    <div className="rise">
      {/* progress */}
      <div className="flex items-center gap-1.5 mb-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i < step ? "var(--color-emerald)" : i === step ? "rgba(16,217,137,.45)" : "var(--color-line)" }}
          />
        ))}
      </div>

      {/* the narrowing field */}
      <FieldStrip userVibe={userVibe} size={fieldSize} hasAnswers={answeredCount > 0} />

      <div className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald mt-6 mb-1">
        {q.probes} · Q{step + 1} of {QUESTIONS.length}
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">{q.q}</h2>
      <p className="text-mute text-sm mb-5">🔍 {q.why}</p>

      <div className="grid gap-3">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => onAnswer(o)}
            className="card p-4 text-left flex items-center gap-4 hover:border-emerald/50 hover:bg-white/[0.03] transition group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{o.emoji}</span>
            <span className="font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** the live field of flags, narrowing toward your team as you answer */
function FieldStrip({ userVibe, size, hasAnswers }: { userVibe: Vibe; size: number; hasAnswers: boolean }) {
  const ranked = useMemo(() => {
    if (!hasAnswers) return TEAMS.map((t) => t.id); // full field, undifferentiated
    return rankTeams(userVibe).map((r) => r.teamId);
  }, [userVibe, hasAnswers]);
  const shown = ranked.slice(0, size);

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-mute">
          {hasAnswers ? "Your field is narrowing" : "The field — all 48 teams"}
        </span>
        <span className="text-xs font-bold tabular text-emerald">{size} left</span>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center min-h-[2rem]">
        {shown.map((id, i) => (
          <span
            key={id}
            className="text-xl transition-all"
            style={{
              opacity: hasAnswers ? Math.max(0.45, 1 - i / (size * 1.6)) : 0.85,
              transform: hasAnswers && i === 0 ? "scale(1.35)" : "none",
            }}
            title={getTeam(id).name}
          >
            {getTeam(id).flag}
          </span>
        ))}
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
    const text = `${me.tier.emoji} ${me.tier.name} Fan ID: ${me.emoji} ${me.name} — only ${me.rarity}% are this type. Spirit team: ${team.flag} ${team.name}. What's yours?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My World Cup Fan ID", text, url });
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
        {/* rarity tier — collectible-card style badge */}
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
          <IdBox
            label={`${me.tier.emoji} Rarity`}
            value={`Only ${me.rarity}% are ${me.name.replace("The ", "")}s — ${me.tier.tagline}`}
          />
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
