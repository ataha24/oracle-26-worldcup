import { AXES, type Axis, type Vibe } from "./vibes";

// Your "fan personality" — the real prize of the quiz. Derived from your
// dominant trait, with a secondary trait for flavour, plus a superpower, a
// fatal flaw and a rarity score. Built to be screenshot-and-share worthy.

export const PERSONA: Record<Axis, { name: string; emoji: string; line: string }> = {
  glory: { name: "The Frontrunner", emoji: "👑", line: "You back winners — and you back them loud." },
  firepower: { name: "The Thrill-Seeker", emoji: "🎆", line: "Boring is the only thing you're scared of." },
  grit: { name: "The Ride-or-Die", emoji: "🛡️", line: "Loyal, stubborn, and proud of both." },
  fairytale: { name: "The Hopeless Romantic", emoji: "🌈", line: "You believe in magic and lost causes." },
  heartbreak: { name: "The Drama Magnet", emoji: "🎭", line: "You don't watch for fun. You watch to FEEL." },
};

// short adjective for the trait chips
export const TRAIT_ADJ: Record<Axis, string> = {
  glory: "Front-runner",
  firepower: "Chaotic",
  grit: "Loyal",
  fairytale: "Dreamer",
  heartbreak: "Romantic",
};

export const IDENTITY: Record<Axis, { desc: string; superpower: string; flaw: string }> = {
  glory: {
    desc: "You came to win. Second place is just first loser.",
    superpower: "Backing winners before it's cool",
    flaw: "Zero patience for a rebuild",
  },
  firepower: {
    desc: "You're here for goals, chaos and absolute scenes.",
    superpower: "Turning any match into an event",
    flaw: "You'd trade a clean sheet for a 4–3, every time",
  },
  grit: {
    desc: "Loyal to the last whistle — you live for a backs-to-the-wall scrap.",
    superpower: "Never, ever leaving early",
    flaw: "Stubborn to a fault",
  },
  fairytale: {
    desc: "You believe in magic, miracles and beautiful lost causes.",
    superpower: "Spotting the next Cinderella first",
    flaw: "Your heart writes cheques the table can't cash",
  },
  heartbreak: {
    desc: "You don't watch for fun — you watch to FEEL.",
    superpower: "Finding the beauty in the suffering",
    flaw: "You fall for the teams built to hurt you",
  },
};

export function personaKey(v: Vibe): Axis {
  return [...AXES].sort((a, b) => v[b] - v[a])[0];
}

export function personaFor(v: Vibe) {
  const key = personaKey(v);
  return { key, ...PERSONA[key] };
}

export interface FanIdentity {
  key: Axis;
  secondKey: Axis;
  name: string;
  emoji: string;
  line: string;
  desc: string;
  superpower: string;
  flaw: string;
  traits: string[]; // [primary adj, secondary adj]
  rarity: number; // playful "% of fans like you"
}

export function fanIdentity(v: Vibe): FanIdentity {
  const sorted = [...AXES].sort((a, b) => v[b] - v[a]);
  const key = sorted[0];
  const secondKey = sorted[1];
  const mean = AXES.reduce((s, k) => s + v[k], 0) / AXES.length;
  // the more lopsided your wiring, the rarer (and more special) you are
  const rarity = Math.max(4, Math.min(30, Math.round(30 - (v[key] - mean) * 42)));
  return {
    key,
    secondKey,
    ...PERSONA[key],
    ...IDENTITY[key],
    traits: [TRAIT_ADJ[key], TRAIT_ADJ[secondKey]],
    rarity,
  };
}
