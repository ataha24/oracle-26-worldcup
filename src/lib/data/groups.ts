import type { Group } from "@/lib/types";

// The OFFICIAL 2026 World Cup groups from the Final Draw (Washington D.C.,
// 5 December 2025). Order within each group is the seeded position 1–4
// (hosts were pre-assigned: Mexico A1, Canada B1, United States D1).
// Source: FIFA / Wikipedia "2026 FIFA World Cup draw".

export const GROUPS: Group[] = [
  { id: "A", teamIds: ["mexico", "south-africa", "south-korea", "czech-republic"] },
  { id: "B", teamIds: ["canada", "bosnia", "qatar", "switzerland"] },
  { id: "C", teamIds: ["brazil", "morocco", "haiti", "scotland"] },
  { id: "D", teamIds: ["usa", "paraguay", "australia", "turkey"] },
  { id: "E", teamIds: ["germany", "curacao", "ivory-coast", "ecuador"] },
  { id: "F", teamIds: ["netherlands", "japan", "sweden", "tunisia"] },
  { id: "G", teamIds: ["belgium", "egypt", "iran", "new-zealand"] },
  { id: "H", teamIds: ["spain", "cape-verde", "saudi-arabia", "uruguay"] },
  { id: "I", teamIds: ["france", "senegal", "iraq", "norway"] },
  { id: "J", teamIds: ["argentina", "algeria", "austria", "jordan"] },
  { id: "K", teamIds: ["portugal", "dr-congo", "uzbekistan", "colombia"] },
  { id: "L", teamIds: ["england", "croatia", "ghana", "panama"] },
];

export const GROUP_BY_ID: Record<string, Group> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
);

export function groupOf(teamId: string): Group {
  const g = GROUPS.find((gr) => gr.teamIds.includes(teamId));
  if (!g) throw new Error(`No group for ${teamId}`);
  return g;
}
