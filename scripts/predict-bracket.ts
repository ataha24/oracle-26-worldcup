// CLI dump of the deterministic bracket projection (the same data the /bracket
// page renders). Run with: npm run bracket
import { getTeam } from "@/lib/data/teams";
import { projectBracket, type Round } from "@/lib/engine/bracket-projection";

const nf = (id: string) => { const t = getTeam(id); return `${t.flag} ${t.name}`; };
const ROUND_NAME: Record<Round, string> = {
  R32: "ROUND OF 32", R16: "ROUND OF 16", QF: "QUARTER-FINALS", SF: "SEMI-FINALS", F: "FINAL",
};

const p = projectBracket();

console.log("PROJECTED FINAL GROUP TABLES (remaining games = model's most-likely score)\n");
for (const g of p.groups) {
  const line = g.rows
    .map((r, i) => `${i + 1}. ${getTeam(r.teamId).name} ${r.pts}pts (${r.gf}-${r.ga})`)
    .join("   ");
  console.log(`Group ${g.groupId}:  ${line}`);
}

console.log(
  `\nBEST 8 THIRDS: ${p.bestThirds.map((t) => `${getTeam(t.teamId).name} (${t.groupId})`).join(", ")}`,
);

let round = "";
for (const tie of p.ties) {
  if (tie.round !== round) { round = tie.round; console.log(`\n=== ${ROUND_NAME[tie.round]} ===`); }
  const tag = tie.pens ? `  (${getTeam(tie.winnerId).name} adv. on pens)` : "";
  const star = (id: string) => (id === tie.winnerId ? "✅" : "  ");
  console.log(
    `M${tie.match}: ${star(tie.aId)}${nf(tie.aId).padEnd(20)} ${tie.ga}-${tie.gb} ${nf(tie.bId).padEnd(20)}${star(tie.bId)}${tag}`,
  );
}

console.log(`\n🏆 PREDICTED CHAMPION: ${nf(p.championId)}`);
