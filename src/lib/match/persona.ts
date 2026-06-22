import { AXES, type Axis, type Vibe } from "./vibes";

// Fun personality archetype, derived from a quiz-taker's dominant trait.
export const PERSONA: Record<Axis, { name: string; emoji: string; line: string }> = {
  glory: { name: "The Frontrunner", emoji: "👑", line: "You back winners — and you back them loud." },
  firepower: { name: "The Thrill-Seeker", emoji: "🎆", line: "Boring is the only thing you're scared of." },
  grit: { name: "The Ride-or-Die", emoji: "🛡️", line: "Loyal, stubborn, and proud of both." },
  fairytale: { name: "The Hopeless Romantic", emoji: "🌈", line: "You believe in magic and lost causes." },
  heartbreak: { name: "The Drama Magnet", emoji: "🎭", line: "You don't watch for fun. You watch to FEEL." },
};

export function personaKey(v: Vibe): Axis {
  return [...AXES].sort((a, b) => v[b] - v[a])[0];
}

export function personaFor(v: Vibe) {
  const key = personaKey(v);
  return { key, ...PERSONA[key] };
}
