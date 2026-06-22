import { getTeam } from "@/lib/data/teams";
import { groupTable, remainingPairings } from "@/lib/engine/standings";
import { predictFixture } from "@/lib/engine/predict";
import { oddsFor } from "@/lib/forecast";
import { RESULTS } from "@/lib/data/results";

const ids = ["south-korea", "south-africa"];
for (const id of ids) {
  const t = getTeam(id);
  const o = oddsFor(id);
  console.log("\n==== " + t.name + " (" + t.code + ") ====");
  console.log(JSON.stringify({ team: t, odds: o }, null, 2));
}

console.log("\n==== GROUP A TABLE ====");
console.log(JSON.stringify(groupTable("A"), null, 2));

console.log("\n==== GROUP A RESULTS ====");
console.log(JSON.stringify(RESULTS.filter((r) => r.groupId === "A"), null, 2));

console.log("\n==== REMAINING A ====", JSON.stringify(remainingPairings("A")));

console.log("\n==== HEAD TO HEAD: KOR vs RSA ====");
const p = predictFixture("south-korea", "south-africa");
console.log(JSON.stringify({
  home: getTeam(p.homeId).code, away: getTeam(p.awayId).code,
  xgHome: p.xgHome.toFixed(2), xgAway: p.xgAway.toFixed(2),
  pHomeWin: (p.pHomeWin*100).toFixed(1), pDraw: (p.pDraw*100).toFixed(1), pAwayWin: (p.pAwayWin*100).toFixed(1),
  mostLikely: p.mostLikelyScore, pOver25: (p.pOver25*100).toFixed(0), pBtts: (p.pBtts*100).toFixed(0),
}, null, 2));
