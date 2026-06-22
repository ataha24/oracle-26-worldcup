# 🔮 ORACLE '26 — The World Cup 2026 Prediction Engine

A live, probabilistic forecast of the **2026 FIFA World Cup** (Canada · Mexico · USA).
Real results are locked in; every match still to be played is simulated **50,000 times**
to answer one question: _who lifts the trophy?_

This is not a hand-tuned bracket. It's a genuine simulation engine:

```
team ratings (Elo)  →  expected goals (Poisson)  →  full tournament (Monte Carlo)
```

## What's inside

| Page          | What it does |
| ------------- | ------------ |
| **Forecast**  | Title-race podium, top-16 odds board, model insights (group of death, dark horses, surest qualifier). |
| **Groups**    | All 12 live group tables from real results, each team's qualification probability, and model calls on every remaining fixture. |
| **Bracket**   | A heatmap of every team's odds to survive each knockout round — computed on the **official** 2026 bracket (matches 73–104), so paths matter, not just strength. |
| **Predictor** | Pick any two of the 48 teams for a full Poisson breakdown: win/draw/loss, expected goals, a scoreline-probability grid, BTTS, clean sheets, and knockout survival. |
| **Teams**     | All 48 nations with ratings, history, key players and live odds; filter by confederation. |
| **Oracle**    | Ask any World Cup question in plain English — answered instantly from the engine (no API key required). |

## The model

- **Elo → win expectancy & goal supremacy.** Each team carries a World-Football-Elo-style
  rating (`src/lib/data/teams.ts`). A rating gap maps to an expected goal difference, with a
  home-crowd edge for the three co-hosts.
- **Poisson scoreline distribution.** The supremacy and an average goal environment give each
  side an expected-goals rate; a Poisson grid yields every scoreline probability and everything
  derived from it (`src/lib/engine/match.ts`).
- **Monte Carlo tournament.** Completed results are fixed; unplayed group matches are sampled,
  the 8 best third-placed teams are slotted by FIFA's allocation rules, and the official bracket
  is resolved tie by tie — repeated 50,000 times (`src/lib/engine/simulate.ts`).

## Data & honesty

- **Groups, fixtures, and results** are real, sourced from FIFA / Wikipedia / ESPN, current
  through the date in `src/lib/data/results.ts` (`LAST_UPDATED`).
- **No live scores are fabricated.** When new matches finish, add them to `RESULTS` and
  regenerate the forecast.
- **Ratings are curated approximations** of pre-tournament strength — the engine's one
  modelling assumption, and the only thing you'd tune to disagree with it.

## Keeping it current

```bash
# 1. add finished matches to src/lib/data/results.ts (RESULTS) and bump LAST_UPDATED
# 2. regenerate the precomputed forecast:
npm run forecast
# 3. sanity-check the engine output:
npm run engine:test
```

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (fully static)
```

## Optional: natural-language Oracle via LLM

The Oracle runs entirely on the deterministic engine by default. To layer a full
natural-language model on top, set an `AI_GATEWAY_API_KEY` (or `ANTHROPIC_API_KEY`) and wire
the AI SDK to call the engine functions in `src/lib/oracle/answer.ts` as tools.

---

_Not affiliated with FIFA. A probabilistic toy built for the love of the game._
