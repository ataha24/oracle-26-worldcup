import { getTeam } from "@/lib/data/teams";
import { GROUPS } from "@/lib/data/groups";
import { groupTable } from "@/lib/engine/standings";
import { predictMatch } from "@/lib/engine/match";
import { simulate } from "@/lib/engine/simulate";

console.log("=== LIVE GROUP TABLES (from real results) ===");
for (const g of GROUPS) {
  const t = groupTable(g.id);
  console.log(
    `Group ${g.id}: ` +
      t
        .map((r) => `${getTeam(r.teamId).code} ${r.pts}pt(${r.gf}:${r.ga})`)
        .join("  "),
  );
}

console.log("\n=== MATCH: Spain vs Saudi Arabia (upcoming) ===");
const m = predictMatch(getTeam("spain"), getTeam("saudi-arabia"), { neutral: true });
console.log(
  `xG ${m.xgHome.toFixed(2)}-${m.xgAway.toFixed(2)} | W ${(m.pHomeWin * 100).toFixed(1)}% D ${(m.pDraw * 100).toFixed(1)}% L ${(m.pAwayWin * 100).toFixed(1)}% | sum ${(m.pHomeWin + m.pDraw + m.pAwayWin).toFixed(3)}`,
);

console.log("\n=== SIMULATION (10000 iters, from live state) ===");
const t0 = Date.now();
const res = simulate(10000);
console.log(`ran in ${Date.now() - t0}ms`);
console.log("title sum (≈1):", res.odds.reduce((a, o) => a + o.pWinTitle, 0).toFixed(4));
console.log("advance sum (≈32):", res.odds.reduce((a, o) => a + o.pAdvance, 0).toFixed(2));
console.log("\nTop 16 title contenders:");
for (const o of res.odds.slice(0, 16)) {
  console.log(
    `${getTeam(o.teamId).name.padEnd(20)} grp ${o.groupId}  win ${(o.pWinTitle * 100).toFixed(1).padStart(5)}%  ` +
      `final ${(o.pReachFinal * 100).toFixed(1).padStart(5)}%  R16 ${(o.pReachR16 * 100).toFixed(0).padStart(3)}%  adv ${(o.pAdvance * 100).toFixed(0).padStart(3)}%`,
  );
}
