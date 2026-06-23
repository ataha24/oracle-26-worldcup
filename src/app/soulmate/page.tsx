"use client";

import { useEffect, useMemo, useState } from "react";
import { getTeam, TEAMS } from "@/lib/data/teams";
import { matchTeams, rankTeams, AXES, type Axis, type Vibe } from "@/lib/match/vibes";
import { fanIdentityFromAxes } from "@/lib/match/persona";
import { QUESTIONS, leanFromAnswers, type Option } from "@/lib/match/quiz";
import { FanReport, encodeVibe, AXIS_COLOR, AXIS_LABEL } from "@/components/FanReport";
import { FanTrends } from "@/components/FanTrends";
import { ShareBar } from "@/components/ShareBar";
import { shareMessage } from "@/lib/data/shareCopy";

// short, fun reaction shown the instant you pick — by the option's dominant trait
const REACTION: Record<Axis, string> = {
  glory: "👑 Big-time energy.",
  firepower: "🎆 You live for chaos.",
  grit: "🛡️ Respect the grind.",
  fairytale: "🌈 A romantic — noted.",
  heartbreak: "🎭 Here to FEEL it all.",
};
function dominantAxis(o: Option): Axis {
  return (Object.entries(o.w).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as Axis) ?? "glory";
}

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

  // social proof: how many fans have found their team (live, if storage is on)
  const [count, setCount] = useState(0);
  useEffect(() => {
    fetch("/api/trends", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d?.configured && d.trends?.total) setCount(d.trends.total); })
      .catch(() => {});
  }, []);

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
      {phase === "intro" && <Intro onStart={() => setPhase("quiz")} count={count} />}

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

function Intro({ onStart, count }: { onStart: () => void; count: number }) {
  return (
    <div className="text-center rise">
      {count > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald/30 bg-emerald/10 text-emerald text-xs font-semibold mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
          {count.toLocaleString()} fans have found their team
        </div>
      )}
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
        your fatal flaw, and the World Cup team you were born to root for.
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
  const fieldSize = FIELD_AT[Math.min(answeredCount, FIELD_AT.length - 1)];
  const [picked, setPicked] = useState<number | null>(null);

  // preview the vibe INCLUDING a hovered/picked option so the meter reacts live
  const previewVibe = useMemo(() => {
    if (picked === null) return userVibe;
    const v = { ...userVibe };
    const w = q.options[picked].w;
    for (const k of AXES) v[k] += w[k] ?? 0;
    return v;
  }, [picked, userVibe, q]);

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => onAnswer(q.options[i]), 750); // beat for the reaction
  }

  return (
    <div className="rise">
      {/* progress */}
      <div className="flex items-center gap-1.5 mb-4">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i < step || (i === step && picked !== null) ? "var(--color-emerald)" : i === step ? "rgba(16,217,137,.45)" : "var(--color-line)" }}
          />
        ))}
      </div>

      {/* live: narrowing field + your forming personality */}
      <div className="grid sm:grid-cols-2 gap-3">
        <FieldStrip userVibe={previewVibe} size={picked !== null ? FIELD_AT[Math.min(answeredCount + 1, FIELD_AT.length - 1)] : fieldSize} hasAnswers={answeredCount > 0 || picked !== null} />
        <TraitMeter userVibe={previewVibe} live={picked !== null} />
      </div>

      <div className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald mt-6 mb-1">
        {q.probes} · Q{step + 1} of {QUESTIONS.length}
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">{q.q}</h2>
      <p className="text-mute text-sm mb-5">🔍 {q.why}</p>

      <div className="grid gap-3 relative">
        {q.options.map((o, i) => {
          const isPicked = picked === i;
          const dimmed = picked !== null && !isPicked;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className="card p-4 text-left flex items-center gap-4 transition group enabled:hover:border-emerald/50 enabled:hover:bg-white/[0.03]"
              style={{
                borderColor: isPicked ? "var(--color-emerald)" : undefined,
                background: isPicked ? "rgba(16,217,137,.10)" : undefined,
                opacity: dimmed ? 0.4 : 1,
                transform: isPicked ? "scale(1.02)" : "none",
              }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{o.emoji}</span>
              <span className="font-medium flex-1">{o.label}</span>
              {isPicked && (
                <span className="text-xs font-bold text-emerald whitespace-nowrap rise">
                  {REACTION[dominantAxis(o)]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** live 5-axis "personality forming" meter */
function TraitMeter({ userVibe, live }: { userVibe: Vibe; live: boolean }) {
  const max = Math.max(...AXES.map((k) => userVibe[k]), 1e-9);
  const any = AXES.some((k) => userVibe[k] > 0);
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-mute">Your personality, forming</span>
        {live && <span className="text-[10px] font-bold text-emerald">＋</span>}
      </div>
      <div className="space-y-1.5">
        {AXES.map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span className="text-[10px] w-16 shrink-0 text-mute">{AXIS_LABEL[k]}</span>
            <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${any ? (userVibe[k] / max) * 100 : 0}%`, background: AXIS_COLOR[k] }}
              />
            </div>
          </div>
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
  const me = fanIdentityFromAxes(top.topAxes[0], top.topAxes[1]);
  const params = `team=${top.teamId}&persona=${me.key}&t2=${me.secondKey}&pct=${top.pctMatch}&v=${encodeVibe(userVibe)}`;
  const cardUrl = `/api/card?${params}`;
  const shareUrl = `/soulmate/share?${params}`;
  const shareText = shareMessage({
    personaName: me.name,
    personaEmoji: me.emoji,
    tierName: me.tier.name,
    tierEmoji: me.tier.emoji,
    rarity: me.rarity,
    teamName: team.name,
    teamFlag: team.flag,
  });

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

      <FanReport userVibe={userVibe} />

      <FanTrends teamId={top.teamId} persona={me.key} tier={me.tier.name} />

      <ShareBar path={shareUrl} text={shareText} cardUrl={cardUrl} storyUrl={`${cardUrl}&format=story`} />

      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl border border-line text-sm hover:text-white hover:border-white/30 transition">
          Take it again
        </button>
        <a href="/how-it-works" className="px-5 py-2.5 rounded-xl border border-line text-sm text-mute hover:text-emerald hover:border-emerald/40 transition">
          🤓 See the math
        </a>
      </div>
    </div>
  );
}

