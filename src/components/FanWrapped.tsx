"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { matchTeams, type Vibe, type Axis } from "@/lib/match/vibes";
import { fanIdentity } from "@/lib/match/persona";
import { getLore } from "@/lib/data/lore";
import { getTeam } from "@/lib/data/teams";
import { oddsFor } from "@/lib/forecast";
import { CONF_META, pct } from "@/lib/format";

// FanWrapped — a Spotify-Wrapped-style, tap-through story reveal of the user's
// Fan ID. Full-screen overlay, story progress bars, auto-advance, tap/keys to
// navigate. Every line is derived from the real vibe → persona → match data
// (no placeholders). Building to the spirit-team reveal, then the lore payoff.

const AXIS_LABEL: Record<Axis, string> = {
  glory: "Glory",
  firepower: "Firepower",
  grit: "Grit",
  fairytale: "Fairytale",
  heartbreak: "Heartbreak",
};

// A short, punchy headline per dominant trait for the "your trait" slide.
const AXIS_TAGLINE: Record<Axis, string> = {
  glory: "You were built to back winners.",
  firepower: "You live for goals and absolute chaos.",
  grit: "You ride or die, to the last whistle.",
  fairytale: "You believe in magic and lost causes.",
  heartbreak: "You don't watch for fun. You watch to FEEL.",
};

const SLIDE_MS = 4500;

export function FanWrapped({ userVibe, onClose }: { userVibe: Vibe; onClose: () => void }) {
  // Derive everything once from the real engine.
  const data = useMemo(() => {
    const me = fanIdentity(userVibe);
    const matches = matchTeams(userVibe, 3);
    const top = matches[0];
    const team = getTeam(top.teamId);
    const lore = getLore(top.teamId);
    const o = oddsFor(top.teamId);
    const conf = CONF_META[team.confederation];
    return { me, top, team, lore, o, conf };
  }, [userVibe]);

  const { me, top, team, lore, o, conf } = data;
  const tier = me.tier.color;

  const slides = useMemo(
    () => [
      // 1 — Intro
      {
        bg: `radial-gradient(120% 120% at 50% 0%, ${conf.color}33, transparent 60%), linear-gradient(180deg, #0a0e18, #05070d)`,
        content: (
          <div className="rise text-center">
            <div className="text-sm font-semibold tracking-[0.3em] uppercase text-emerald glow-emerald">
              ORACLE &apos;26
            </div>
            <h1 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight leading-[1.05]">
              Your 2026
              <br />
              World Cup,
              <br />
              <span className="wordmark">Wrapped</span>
            </h1>
            <p className="text-mute mt-6 text-lg">Let&apos;s reveal your Fan ID…</p>
            <p className="text-mute/70 mt-10 text-xs tracking-widest uppercase">Tap to begin →</p>
          </div>
        ),
      },
      // 2 — Dominant trait
      {
        bg: `radial-gradient(120% 100% at 50% 100%, ${tier}44, transparent 65%), linear-gradient(180deg, #05070d, #0a0e18)`,
        content: (
          <div className="rise text-center">
            <div className="text-sm font-semibold tracking-[0.3em] uppercase text-mute">
              Your dominant trait
            </div>
            <div className="my-6 text-7xl">{me.emoji}</div>
            <h1
              className="text-6xl sm:text-7xl font-black tracking-tight"
              style={{ color: tier }}
            >
              {AXIS_LABEL[me.key]}
            </h1>
            <p className="mt-6 text-2xl font-semibold max-w-md mx-auto leading-snug">
              {AXIS_TAGLINE[me.key]}
            </p>
          </div>
        ),
      },
      // 3 — Rarity / tier
      {
        bg: `radial-gradient(130% 120% at 50% 0%, ${tier}55, transparent 60%), linear-gradient(180deg, #0a0e18, #05070d)`,
        content: (
          <div className="rise text-center">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-base font-black tracking-widest"
              style={{
                color: tier,
                background: `${tier}1a`,
                border: `1.5px solid ${tier}66`,
                boxShadow: me.tier.name === "LEGENDARY" ? `0 0 40px ${tier}aa` : "none",
              }}
            >
              <span>{me.tier.emoji}</span>
              {me.tier.name}
            </div>
            <h1
              className="mt-8 text-5xl sm:text-6xl font-black tracking-tight"
              style={{ textShadow: me.tier.name === "LEGENDARY" ? `0 0 30px ${tier}88` : "none" }}
            >
              You&apos;re {me.name}.
            </h1>
            <p className="mt-6 text-xl font-semibold max-w-md mx-auto leading-snug">
              Only <span style={{ color: tier }}>{me.rarity}%</span> of fans are{" "}
              {me.name.replace("The ", "")}s.
            </p>
            <p className="text-mute mt-3 text-sm uppercase tracking-widest">{me.tier.tagline}</p>
          </div>
        ),
      },
      // 4 — Superpower + flaw
      {
        bg: `linear-gradient(180deg, ${tier}22, transparent 55%), linear-gradient(180deg, #05070d, #0a0e18)`,
        content: (
          <div className="rise w-full max-w-md">
            <div className="text-center text-sm font-semibold tracking-[0.3em] uppercase text-mute mb-10">
              The fine print
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald">
                💪 Superpower
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black leading-tight">{me.superpower}</p>
            </div>
            <div className="mt-12">
              <div className="text-sm font-bold uppercase tracking-widest text-rose">
                🩹 Fatal flaw
              </div>
              <p className="mt-2 text-3xl sm:text-4xl font-black leading-tight">{me.flaw}</p>
            </div>
          </div>
        ),
      },
      // 5 — Build-up to the reveal
      {
        bg: `radial-gradient(100% 100% at 50% 50%, ${conf.color}1f, transparent 70%), linear-gradient(180deg, #05070d, #05070d)`,
        content: (
          <div className="rise text-center">
            <p className="text-2xl sm:text-3xl font-bold text-mute leading-snug max-w-md mx-auto">
              Out of <span className="text-white">48 nations</span>,
              <br />
              the Oracle found
              <br />
              your <span className="wordmark">one</span>…
            </p>
            <div className="mt-10 text-4xl tracking-[0.5em] animate-pulse">• • •</div>
          </div>
        ),
      },
      // 6 — THE REVEAL
      {
        bg: `radial-gradient(120% 120% at 50% 30%, ${conf.color}66, transparent 60%), linear-gradient(180deg, ${conf.color}22, #05070d)`,
        content: (
          <div className="rise text-center">
            <div className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ color: conf.color }}>
              Your spirit team
            </div>
            <div
              className="my-4 text-[7rem] sm:text-[9rem] leading-none"
              style={{ filter: `drop-shadow(0 0 40px ${conf.color}aa)` }}
            >
              {team.flag}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight">{team.name}</h1>
            <div
              className="mt-5 inline-block text-4xl font-black tabular px-6 py-2 rounded-full"
              style={{ color: conf.color, background: `${conf.color}1f`, border: `1.5px solid ${conf.color}55` }}
            >
              {top.pctMatch}% match
            </div>
            <p className="text-mute mt-5 text-sm">
              <span style={{ color: conf.color }}>{conf.label}</span> · {pct(o.pWinTitle, 1)} to lift
              the trophy
            </p>
          </div>
        ),
      },
      // 7 — Lore payoff + close
      {
        bg: `linear-gradient(180deg, ${conf.color}33, transparent 50%), linear-gradient(180deg, #0a0e18, #05070d)`,
        content: (
          <div className="rise text-center w-full max-w-lg">
            <div
              className="text-sm font-semibold tracking-[0.25em] uppercase mb-6"
              style={{ color: conf.color }}
            >
              🪞 What loving {team.name} says about you
            </div>
            <p className="text-3xl sm:text-4xl font-black leading-tight">
              {lore ? lore.saysAboutYou : me.desc}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="mt-12 text-base font-semibold text-emerald glow-emerald hover:underline pointer-events-auto"
            >
              Tap to see your full report →
            </button>
          </div>
        ),
      },
    ],
    [me, top, team, lore, o, conf, tier, onClose],
  );

  const [i, setI] = useState(0);
  const count = slides.length;

  const next = useCallback(() => {
    setI((prev) => {
      if (prev >= count - 1) {
        onClose();
        return prev;
      }
      return prev + 1;
    });
  }, [count, onClose]);

  const prev = useCallback(() => {
    setI((p) => Math.max(0, p - 1));
  }, []);

  // Auto-advance — resets whenever the active slide changes.
  useEffect(() => {
    const t = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, next]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  const slide = slides[i];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden text-white select-none"
      style={{ background: slide.bg }}
      role="dialog"
      aria-modal="true"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 px-3 pt-3">
        {slides.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white"
              style={
                idx < i
                  ? { width: "100%" }
                  : idx === i
                    ? { animation: `fanwrapped-fill ${SLIDE_MS}ms linear forwards` }
                    : { width: "0%" }
              }
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute top-7 right-4 z-20 text-2xl leading-none text-white/70 hover:text-white"
      >
        ✕
      </button>

      {/* Tap zones */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer focus:outline-none"
        tabIndex={-1}
      />
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer focus:outline-none"
        tabIndex={-1}
      />

      {/* Slide content — non-interactive so taps fall through to the nav zones;
          the only clickable child (final-slide button) opts back in via its own
          pointer-events and stopPropagation. */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none">
        <div key={i}>{slide.content}</div>
      </div>

      {/* Keyframes for the active progress bar fill */}
      <style>{`@keyframes fanwrapped-fill { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
