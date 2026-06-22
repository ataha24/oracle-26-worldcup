import { AXES, type Axis, type Vibe } from "./vibes";
import CAL from "./calibration.json";

// REAL rarity: the share of every possible quiz outcome (all 4096 enumerated
// paths) that lands on each "type" (primary+secondary trait). Computed offline
// in scripts/calibrate-match.ts — this is grounded data, not a made-up formula.
const TYPE_SHARES: Record<string, number> = (CAL as { typeShares?: Record<string, number> }).typeShares ?? {};

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
  rarity: number; // REAL % of possible fans who share your type
  tier: Tier;
}

// Collectible-card rarity tiers, keyed off the REAL frequency of your type.
export interface Tier {
  name: "LEGENDARY" | "EPIC" | "RARE" | "COMMON";
  emoji: string;
  color: string; // hex (used by both UI and the OG card)
  tagline: string;
}

export function tierForShare(share: number): Tier {
  if (share <= 0.02)
    return { name: "LEGENDARY", emoji: "🌟", color: "#f5c542", tagline: "practically one of one" };
  if (share <= 0.045)
    return { name: "EPIC", emoji: "💎", color: "#a78bfa", tagline: "a genuinely rare pull" };
  if (share <= 0.085)
    return { name: "RARE", emoji: "🔷", color: "#22d3ee", tagline: "not many think like you" };
  return { name: "COMMON", emoji: "🟢", color: "#10d989", tagline: "you're in great company" };
}

export function typeKeyOf(v: Vibe): { key: Axis; secondKey: Axis; typeKey: string } {
  const sorted = [...AXES].sort((a, b) => v[b] - v[a]);
  return { key: sorted[0], secondKey: sorted[1], typeKey: `${sorted[0]}+${sorted[1]}` };
}

/** rarity + tier for a (primary, secondary) type — shared by quiz, card & share page */
export function rarityFor(key: Axis, secondKey: Axis) {
  const share = TYPE_SHARES[`${key}+${secondKey}`] ?? 0.05;
  return { rarity: Math.max(1, Math.round(share * 100)), tier: tierForShare(share) };
}

export function fanIdentity(v: Vibe): FanIdentity {
  const { key, secondKey } = typeKeyOf(v);
  const { rarity, tier } = rarityFor(key, secondKey);
  return {
    key,
    secondKey,
    ...PERSONA[key],
    ...IDENTITY[key],
    traits: [TRAIT_ADJ[key], TRAIT_ADJ[secondKey]],
    rarity,
    tier,
  };
}
