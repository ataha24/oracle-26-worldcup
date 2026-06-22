// Rich, crafted narrative for each team — powers the "window into who you are"
// moment in the Soulmate result. Every field is short, punchy and human.

export interface TeamLore {
  id: string; // must match a team id in src/lib/data/teams.ts
  /** the team's soul in one vivid line — who they ARE, beyond results */
  soul: string;
  /** what watching them actually FEELS like (sensory, specific, fun) */
  watching: string;
  /** the payoff — "loving this team says THIS about you" (2nd person, warm + honest) */
  saysAboutYou: string;
  /** one real, iconic moment or cultural truth that grounds the myth */
  legend: string;
  /** 3 short vibe tags, Title Case, no punctuation (e.g. "Joyful Chaos") */
  vibes: [string, string, string];
}
