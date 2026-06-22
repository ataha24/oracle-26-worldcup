"use client";

import { useMemo, useState } from "react";
import { getTeam } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { matchTeams, TEAM_VIBES, AXES, type Vibe, type Axis } from "@/lib/match/vibes";
import { pct } from "@/lib/format";
import { CONF_META } from "@/lib/format";

type W = Partial<Vibe>;
interface Q {
  q: string;
  options: { emoji: string; label: string; w: W }[];
}

const QUIZ: Q[] = [
  {
    q: "Pick your perfect vacation.",
    options: [
      { emoji: "🏝️", label: "Five-star resort, top-tier everything", w: { glory: 1 } },
      { emoji: "🎒", label: "Backpacking somewhere nobody's heard of", w: { fairytale: 1 } },
      { emoji: "🎢", label: "Theme park — ride everything twice", w: { firepower: 1 } },
      { emoji: "🏔️", label: "Remote cabin, just you vs. nature", w: { grit: 1 } },
    ],
  },
  {
    q: "It's movie night. You're putting on…",
    options: [
      { emoji: "🦸", label: "A blockbuster where the hero wins", w: { glory: 1 } },
      { emoji: "🐢", label: "An underdog sports movie (you'll cry)", w: { fairytale: 1 } },
      { emoji: "💥", label: "Nonstop action and explosions", w: { firepower: 1 } },
      { emoji: "🥀", label: "A devastating tragic romance", w: { heartbreak: 1 } },
    ],
  },
  {
    q: "Your role in the group chat is…",
    options: [
      { emoji: "👑", label: "The main character, obviously", w: { glory: 1 } },
      { emoji: "🌈", label: "The relentless optimist", w: { fairytale: 1 } },
      { emoji: "🎉", label: "The chaos starter", w: { firepower: 1 } },
      { emoji: "🫂", label: "The ride-or-die who never flakes", w: { grit: 1 } },
    ],
  },
  {
    q: "Be honest — your toxic trait is…",
    options: [
      { emoji: "😤", label: "“I have to win. At everything.”", w: { glory: 1 } },
      { emoji: "🥹", label: "“I fall for a lost cause every time.”", w: { fairytale: 1, heartbreak: 0.6 } },
      { emoji: "🙉", label: "“I'm allergic to anything boring.”", w: { firepower: 1 } },
      { emoji: "🧱", label: "“I never give up. Even when I should.”", w: { grit: 1 } },
    ],
  },
  {
    q: "You want this World Cup to make you feel…",
    options: [
      { emoji: "🥇", label: "Like a winner", w: { glory: 1 } },
      { emoji: "🎆", label: "Endlessly entertained", w: { firepower: 1 } },
      { emoji: "🫶", label: "Part of a fairytale", w: { fairytale: 1 } },
      { emoji: "😭", label: "Everything, all at once", w: { heartbreak: 1, firepower: 0.5 } },
    ],
  },
];

// Fun persona revealed before the team — based on your dominant trait.
const PERSONA: Record<Axis, { name: string; emoji: string; line: string }> = {
  glory: { name: "The Frontrunner", emoji: "👑", line: "You back winners — and you back them loud." },
  firepower: { name: "The Thrill-Seeker", emoji: "🎆", line: "Boring is the only thing you're scared of." },
  grit: { name: "The Ride-or-Die", emoji: "🛡️", line: "Loyal, stubborn, and proud of both." },
  fairytale: { name: "The Hopeless Romantic", emoji: "🌈", line: "You believe in magic and lost causes." },
  heartbreak: { name: "The Drama Magnet", emoji: "🎭", line: "You don't watch for fun. You watch to FEEL." },
};

function personaFor(v: Vibe) {
  const top = [...AXES].sort((a, b) => v[b] - v[a])[0];
  return PERSONA[top];
}

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<W[]>([]);

  const userVibe = useMemo<Vibe>(() => {
    const sum: Vibe = { glory: 0, firepower: 0, grit: 0, fairytale: 0, heartbreak: 0 };
    for (const a of answers) for (const k of AXES) sum[k] += a[k] ?? 0;
    const max = Math.max(...AXES.map((k) => sum[k]), 1);
    return Object.fromEntries(AXES.map((k) => [k, sum[k] / max])) as Vibe;
  }, [answers]);

  const matches = useMemo(() => (phase === "result" ? matchTeams(userVibe, 3) : []), [phase, userVibe]);

  function choose(w: W) {
    const next = [...answers, w];
    setAnswers(next);
    if (step + 1 < QUIZ.length) {
      setStep(step + 1);
    } else {
      setPhase("reading");
      setTimeout(() => setPhase("result"), 1900);
    }
  }
  function restart() {
    setAnswers([]); setStep(0); setPhase("intro");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 min-h-[80vh] flex flex-col justify-center">
      {phase === "intro" && <Intro onStart={() => setPhase("quiz")} />}

      {phase === "quiz" && (
        <Quiz q={QUIZ[step]} step={step} total={QUIZ.length} onChoose={choose} />
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
        Find Your World Cup <span className="wordmark">Soulmate</span>
      </h1>
      <p className="text-mute max-w-xl mx-auto mt-5">
        Don&apos;t know a thing about soccer? Perfect. Answer 5 questions about{" "}
        <span className="text-white">you</span> — not the sport — and the Oracle will match you
        with the team you were destined to love, backed by real tournament data.
      </p>
      <button
        onClick={onStart}
        className="mt-8 px-8 py-3.5 rounded-2xl bg-emerald text-black font-bold text-lg hover:brightness-110 transition shadow-[0_0_40px_-8px_var(--color-emerald)]"
      >
        Find my team →
      </button>
      <p className="text-xs text-mute mt-4">Takes 20 seconds · no knowledge required</p>
    </div>
  );
}

function Quiz({ q, step, total, onChoose }: { q: Q; step: number; total: number; onChoose: (w: W) => void }) {
  return (
    <div key={step} className="rise">
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{ background: i <= step ? "var(--color-emerald)" : "var(--color-line)" }}
          />
        ))}
      </div>
      <div className="text-xs text-mute mb-2">Question {step + 1} of {total}</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6">{q.q}</h2>
      <div className="grid gap-3">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => onChoose(o.w)}
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
  const persona = personaFor(userVibe);

  async function share() {
    const text = `🔮 I'm ${persona.emoji} ${persona.name} — and my 2026 World Cup soulmate is ${team.flag} ${team.name} (${top.pctMatch}% match)! Find yours at ORACLE '26.`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied your result — go paste it and brag.");
    } catch {
      /* ignore */
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

      {/* persona banner */}
      <div className="text-center mb-4">
        <div className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-1">
          Your football personality
        </div>
        <div className="text-3xl sm:text-4xl font-black tracking-tight">
          {persona.emoji} You&apos;re {persona.name}
        </div>
        <p className="text-mute mt-1">{persona.line}</p>
        <div className="text-sm text-mute mt-3">…so your soulmate had to be ↓</div>
      </div>

      {/* hero card */}
      <div
        className="card p-7 text-center relative overflow-hidden"
        style={{ boxShadow: "0 0 60px -18px var(--color-emerald)" }}
      >
        <div className="text-8xl mb-2 leading-none glow-emerald">{team.flag}</div>
        <h1 className="text-4xl font-black tracking-tight">{team.name}</h1>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-sm">
          <span style={{ color: conf.color }}>{conf.label}</span>
          <span className="text-mute">· Group {o.groupId}</span>
        </div>

        <div className="my-5">
          <div className="text-6xl font-black wordmark">{top.pctMatch}%</div>
          <div className="text-xs text-mute uppercase tracking-widest">soulmate match</div>
        </div>

        <p className="text-mute italic max-w-md mx-auto">“{team.blurb}”</p>
      </div>

      {/* why */}
      <div className="card p-5 mt-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-emerald mb-2">
          Why you two belong together
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

      {/* the goods */}
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <Mini label="⭐ Watch for" value={team.stars[0]} />
        <Mini label="📊 To reach knockouts" value={pct(o.pAdvance)} />
        <Mini
          label="🗓️ Next up"
          value={top.nextOpponentId ? `vs ${getTeam(top.nextOpponentId).name}` : "Knockouts await"}
        />
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

      <div className="flex gap-3 mt-6 justify-center">
        <button onClick={share} className="px-5 py-2.5 rounded-xl bg-emerald text-black font-bold text-sm hover:brightness-110 transition">
          Share my soulmate
        </button>
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl border border-line text-sm hover:text-white hover:border-white/30 transition">
          Take it again
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="text-[10px] text-mute uppercase tracking-wide">{label}</div>
      <div className="font-bold text-sm mt-0.5">{value}</div>
    </div>
  );
}
