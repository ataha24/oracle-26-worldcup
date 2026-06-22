import type { Vibe } from "./vibes";

// Single source of truth for the quiz — used by the page (UX) AND the
// calibration script (so biases are fit against the exact answer space).
// One question at a time; each option loads weights onto the 5 trait axes.

export interface Option {
  emoji: string;
  label: string;
  w: Partial<Vibe>;
}
export interface Question {
  /** short kicker shown above the question */
  probes: string;
  /** the question itself */
  q: string;
  /** one-liner: WHY we're asking (builds trust + feels smart) */
  why: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    probes: "Your energy",
    q: "Pick your perfect Saturday.",
    why: "How you spend free time mirrors the football you'll fall for.",
    options: [
      { emoji: "🏝️", label: "Five-star everything. Only the best.", w: { glory: 1 } },
      { emoji: "🎉", label: "A festival — loud, packed, electric.", w: { firepower: 1 } },
      { emoji: "🥾", label: "A brutal hike. Earn the view.", w: { grit: 1 } },
      { emoji: "🎒", label: "No plan. Chase wherever the day goes.", w: { fairytale: 1 } },
    ],
  },
  {
    probes: "Your heart",
    q: "It's movie night. You're crying at…",
    why: "What moves you is exactly what'll move you at a match.",
    options: [
      { emoji: "🦸", label: "The hero winning it all (again).", w: { glory: 1 } },
      { emoji: "🐢", label: "The underdog who shouldn't even be here.", w: { fairytale: 1 } },
      { emoji: "💥", label: "Honestly? The explosions. So cool.", w: { firepower: 1 } },
      { emoji: "🥀", label: "The beautiful, devastating tragedy.", w: { heartbreak: 1 } },
    ],
  },
  {
    probes: "Your role",
    q: "In your friend group, you're the…",
    why: "Your social role predicts the kind of team you ride for.",
    options: [
      { emoji: "👑", label: "Main character. It's just facts.", w: { glory: 1 } },
      { emoji: "🫂", label: "Ride-or-die who never, ever flakes.", w: { grit: 1 } },
      { emoji: "🌈", label: "Relentless optimist. It'll work out!", w: { fairytale: 1 } },
      { emoji: "🎢", label: "Chaos gremlin. Things happen near me.", w: { firepower: 1 } },
    ],
  },
  {
    probes: "Your why",
    q: "You want sport to make you feel…",
    why: "This is the core: the emotion you're actually chasing.",
    options: [
      { emoji: "🥇", label: "Like a winner. Nothing else counts.", w: { glory: 1 } },
      { emoji: "🎆", label: "Entertained — every single minute.", w: { firepower: 1 } },
      { emoji: "🫶", label: "Like I'm part of a fairytale.", w: { fairytale: 1 } },
      { emoji: "😭", label: "Everything, all at once. Wreck me.", w: { heartbreak: 1, firepower: 0.4 } },
    ],
  },
  {
    probes: "Your flaw",
    q: "Be honest — your toxic trait is…",
    why: "Your flaws say more about your fandom than your strengths.",
    options: [
      { emoji: "😤", label: "“I have to win. At literally everything.”", w: { glory: 1 } },
      { emoji: "🥹", label: "“I fall for lost causes every time.”", w: { fairytale: 0.7, heartbreak: 0.7 } },
      { emoji: "🙉", label: "“I'm allergic to anything boring.”", w: { firepower: 1 } },
      { emoji: "🧱", label: "“I never give up. Even when I should.”", w: { grit: 1 } },
    ],
  },
  {
    probes: "Your gut",
    q: "Final gut-check: a good game is…",
    why: "Your ideal 90 minutes pins down your last trait.",
    options: [
      { emoji: "🧊", label: "A cool, ruthless, total demolition.", w: { glory: 0.7, grit: 0.5 } },
      { emoji: "🎇", label: "A wild 4–3 that makes no sense.", w: { firepower: 1 } },
      { emoji: "🛡️", label: "A nervy 1–0 you defend with your life.", w: { grit: 1 } },
      { emoji: "💔", label: "A last-minute winner… for the other team.", w: { heartbreak: 1 } },
    ],
  },
];

/** sum option weights into a per-axis lean vector (raw, unnormalized) */
export function leanFromAnswers(answers: (Option | null)[]): Vibe {
  const v: Vibe = { glory: 0, firepower: 0, grit: 0, fairytale: 0, heartbreak: 0 };
  for (const a of answers) {
    if (!a) continue;
    v.glory += a.w.glory ?? 0;
    v.firepower += a.w.firepower ?? 0;
    v.grit += a.w.grit ?? 0;
    v.fairytale += a.w.fairytale ?? 0;
    v.heartbreak += a.w.heartbreak ?? 0;
  }
  return v;
}
