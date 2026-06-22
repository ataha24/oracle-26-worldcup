// Social-share copy for ORACLE '26's "Fan ID" personality feature.
// Pure, side-effect-free string builders used by the native share sheet,
// clipboard, and the link-unfurl (OpenGraph) preview. No React, no imports.
//
// The caller appends the URL after shareMessage() — do NOT include it here.

/** Format a rarity percentage (already an integer, min 1) as a punchy phrase. */
function rarityPhrase(rarity: number): string {
  return rarity <= 1 ? "only 1% of fans are this" : `only ${rarity}% of fans are this`;
}

/**
 * The text dropped into the native share sheet / clipboard.
 * One great line (≤180 chars): hook → identity → "what's yours?" invite.
 * Reads naturally in iMessage. URL is appended by the caller.
 */
export function shareMessage(p: {
  personaName: string;
  personaEmoji: string;
  tierName: string;
  tierEmoji: string;
  rarity: number;
  teamName: string;
  teamFlag: string;
}): string {
  return (
    `📋 My World Cup Fan Report: ${p.tierEmoji} ${p.tierName} — ${p.personaEmoji} ${p.personaName} ` +
    `(${rarityPhrase(p.rarity)}). Spirit team: ${p.teamFlag} ${p.teamName}. What's YOURS? 👇`
  );
}

/**
 * The link-unfurl preview TITLE (≤70 chars). Punchy, curiosity-first.
 */
export function ogTitle(p: {
  personaName: string;
  personaEmoji: string;
  tierName: string;
  tierEmoji: string;
}): string {
  return `📋 My Fan Report: ${p.tierEmoji} ${p.tierName} ${p.personaEmoji} ${p.personaName}`;
}

/**
 * The link-unfurl preview DESCRIPTION (≤140 chars). Reinforce + invite.
 */
export function ogDescription(p: { rarity: number; teamName: string }): string {
  return (
    `${p.rarity <= 1 ? "Only 1%" : `Only ${p.rarity}%`} of fans match this. ` +
    `My spirit team: ${p.teamName}. Reveal YOUR World Cup Fan ID — 6 questions, 20 seconds. 👇`
  );
}

/**
 * Generic one-liners (no fields) that can rotate as share taglines.
 */
export const SHARE_TAGLINES: string[] = [
  "Find your World Cup soulmate in 20 seconds 👇",
  "6 questions. 1 spirit team. Who's YOUR World Cup match? 👇",
  "I got my Fan ID. Bet you can't guess yours 👇",
];
