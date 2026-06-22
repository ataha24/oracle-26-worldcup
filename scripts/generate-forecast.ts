import { writeFileSync } from "node:fs";
import { simulate } from "@/lib/engine/simulate";
import { LAST_UPDATED, RESULTS } from "@/lib/data/results";

// Precompute the tournament forecast to JSON so pages load instantly and
// deterministically. Re-run after editing results: `npx tsx scripts/generate-forecast.ts`.

const ITER = 50000;
console.log(`Simulating ${ITER} tournaments from live state...`);
const t0 = Date.now();
const res = simulate(ITER);
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const payload = {
  ...res,
  matchesPlayed: RESULTS.length,
  dataThrough: LAST_UPDATED,
};

const out = "src/lib/data/forecast.json";
writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(`wrote ${out} (${res.odds.length} teams)`);
