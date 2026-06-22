import { SectionTitle } from "@/components/bits";
import type { Axis } from "@/lib/match/vibes";

export const metadata = { title: "How the matching works — ORACLE '26" };

const AXIS_COLOR: Record<Axis, string> = {
  glory: "var(--color-gold)",
  firepower: "var(--color-rose)",
  grit: "var(--color-cyan)",
  fairytale: "var(--color-emerald)",
  heartbreak: "var(--color-violet)",
};

const CODE_BG = "rgba(255,255,255,0.04)";

/** monospace formula / code block */
function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="font-mono text-[12.5px] sm:text-sm leading-relaxed rounded-xl px-4 py-3 my-3 overflow-x-auto border border-line text-white/90"
      style={{ backgroundColor: CODE_BG }}
    >
      {children}
    </pre>
  );
}

/** inline code chip */
function C({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <code
      className="font-mono text-[0.85em] px-1.5 py-0.5 rounded-md border border-line"
      style={{ backgroundColor: CODE_BG, color: color ?? "var(--color-cyan)" }}
    >
      {children}
    </code>
  );
}

function AxisCard({
  axis,
  emoji,
  title,
  tagline,
  formula,
  children,
}: {
  axis: Axis;
  emoji: string;
  title: string;
  tagline: string;
  formula: React.ReactNode;
  children: React.ReactNode;
}) {
  const color = AXIS_COLOR[axis];
  return (
    <div className="card p-5" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl leading-none">{emoji}</span>
        <h3 className="text-xl font-extrabold tracking-tight" style={{ color }}>
          {title}
        </h3>
      </div>
      <p className="text-mute text-sm mt-1">{tagline}</p>
      <Code>{formula}</Code>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* hero */}
      <header className="rise text-center mb-12">
        <div className="text-6xl mb-4">🔮📐</div>
        <div className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-2">
          Under the hood
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
          How we turn <span className="wordmark">vibes</span> into vectors
        </h1>
        <p className="text-mute max-w-xl mx-auto mt-5">
          The{" "}
          <a href="/soulmate" className="text-white underline decoration-emerald/50 underline-offset-4">
            Soulmate matcher
          </a>{" "}
          looks like a fun personality quiz. Secretly, it&apos;s a little linear algebra in a
          trench coat. Here&apos;s exactly what happens to your six taps — formulas and all.
        </p>
      </header>

      {/* 1. big idea */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="The big idea"
          title="Every team is a point in 5D space"
          desc="So are you. We just find whoever you're standing closest to."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            We describe all 48 World Cup teams along five &ldquo;personality&rdquo; axes:{" "}
            <span style={{ color: AXIS_COLOR.glory }}>glory</span>,{" "}
            <span style={{ color: AXIS_COLOR.firepower }}>firepower</span>,{" "}
            <span style={{ color: AXIS_COLOR.grit }}>grit</span>,{" "}
            <span style={{ color: AXIS_COLOR.fairytale }}>fairytale</span> and{" "}
            <span style={{ color: AXIS_COLOR.heartbreak }}>heartbreak</span>. Five numbers per team
            means every team is a single point — a <em>vector</em> — floating in a 5-dimensional
            space.
          </p>
          <p>
            Your quiz answers become a vector in that <em>same</em> space. Then we ask one question:
            whose trait <em>shape</em> looks most like yours — which team is relatively strong and
            weak on the same axes you are? We measure that with a{" "}
            <span className="text-cyan">correlation of shapes</span>, add a tiny per-team{" "}
            <span className="text-emerald">calibration bias</span> (so the field stays balanced),
            and the top score is your soulmate.
          </p>
          <Code>
{`vibe : Team   → (glory, firepower, grit, fairytale, heartbreak)
you  : Quiz   → (glory, firepower, grit, fairytale, heartbreak)
match = argmax  ( affinity(you, team)  +  calibrationBias(team) )`}
          </Code>
          <p className="text-mute">
            The fun part: none of these numbers are made up. Every axis is computed from real
            tournament data — Elo, title odds, actual goals scored, FIFA rankings, World Cup
            history. Let&apos;s open each one up.
          </p>
        </div>
      </section>

      {/* 2. the five axes */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="The five axes"
          title="What each number actually measures"
          desc="Every axis is a tiny formula fed by live data. Here's the real math, straight from the source."
        />
        <div className="grid gap-4">
          <AxisCard
            axis="glory"
            emoji="👑"
            title="Glory"
            tagline="Pedigree & expectation — the heavyweights."
            formula={`glory = 0.6 · elo  +  0.4 · 2000 · √(pWinTitle)`}
          >
            A blend of raw strength (a team&apos;s <C>elo</C> rating) and genuine trophy
            expectation. We take the square root of <C>pWinTitle</C> (their simulated probability of
            actually lifting the cup) so that even modest favorites register, then scale it to sit
            alongside Elo. France and Argentina live near the top of this axis.
          </AxisCard>

          <AxisCard
            axis="firepower"
            emoji="💥"
            title="Firepower"
            tagline="Goals they're putting on the board, right now."
            formula={`firepower = goalsFor / gamesPlayed     (from completed results)`}
          >
            Pure goals-scored-per-game, tallied from matches that have actually been played. No
            projections, no vibes — if the net keeps bulging, the number goes up. Goal-lovers tend
            to land on free-scoring sides like Norway.
          </AxisCard>

          <AxisCard
            axis="grit"
            emoji="🛡️"
            title="Grit"
            tagline="Defensive stubbornness — every clean sheet is a win."
            formula={`grit = − (goalsAgainst / gamesPlayed)`}
          >
            The <em>negative</em> of goals conceded per game. Concede less, score higher on grit. We
            flip the sign so that &ldquo;more grit&rdquo; always points the same direction as every
            other axis (bigger = more of the trait), which keeps the geometry honest.
          </AxisCard>

          <AxisCard
            axis="fairytale"
            emoji="🌈"
            title="Fairytale"
            tagline="The underdog who's still, somehow, alive."
            formula={`fairytale = (0.7 · fifaRank + 18 · debutant) · (0.35 + 0.65 · pAdvance)`}
          >
            A high <C>fifaRank</C> number means a <em>low-ranked</em> team — exactly the underdog we
            want — and first-timers get an <C>+18</C> debutant bonus. But a fairytale only counts if
            you&apos;re still in it, so we multiply by how alive a team is (<C>pAdvance</C>, their
            chance of reaching the knockouts). A long-shot that&apos;s already out fades; one still
            believing glows. Debutants like Curaçao and Uzbekistan top this axis.
          </AxisCard>

          <AxisCard
            axis="heartbreak"
            emoji="🎭"
            title="Heartbreak"
            tagline="Glorious history, no recent crown, famous near-misses."
            formula={`heartbreak = appearances
           + (titles === 0       ? 9 : 0)   // never won it
           + 8 · bestResultScore            // how close they came
           + (yearsSinceTitle > 40 ? 8 : 0) // a long, aching drought`}
          >
            The drama axis. We reward a long World Cup pedigree (<C>appearances</C>), then pile on
            for the pain: a big bonus for never winning, a weighted score for how agonizingly close
            they got (a runner-up scores higher than a Round-of-16 exit), and an extra hit for
            title droughts over 40 years. This is the home of beautiful, recurring tragedy.
          </AxisCard>
        </div>
      </section>

      {/* 3. normalization */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Step 1 · Fairness"
          title="Two ways to normalize"
          desc="Raw axes live on wildly different scales. We make two copies of every team: one for the pretty bars, one for the actual matching."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Glory can be in the thousands (Elo), firepower is a handful of goals, heartbreak is a
            small tally. If we compared those raw, glory would drown everything out. So we rescale —
            but we keep <em>two</em> different normalized copies of each team, for two different jobs.
          </p>
          <p>
            <strong className="text-white">For the display bars</strong> we use a{" "}
            <span className="text-cyan">percentile rank</span>: on each axis we ask &ldquo;what
            fraction of the 48 teams does this one beat?&rdquo; That gives a tidy 0-to-1 bar that
            reflects where a team <em>stands in the field</em> — and, unlike raw min-max, one freak
            outlier (a 7–1 thumping) can&apos;t stretch the scale and crush everyone else.
          </p>
          <Code>
{`displayBar(team, axis) = (# of teams ranked below it) / 47     // 0…1, for the UI

0.0  → lowest team on that axis
1.0  → highest team on that axis`}
          </Code>
          <p className="text-mute">
            The same idea decides a team&apos;s <strong className="text-white">defining traits</strong> —
            the two it&apos;s most <em>distinctive</em> on (highest z-score), which power the
            &ldquo;why this is your team&rdquo; lines. That&apos;s why Brazil reads as{" "}
            <span style={{ color: AXIS_COLOR.glory }}>glory</span>, not{" "}
            <span style={{ color: AXIS_COLOR.grit }}>grit</span>: lots of teams concede few goals
            early on, so a tidy defence isn&apos;t <em>distinctive</em> — pedigree is.
          </p>
          <p>
            <strong className="text-white">For the actual matching</strong> we use{" "}
            <span className="text-cyan">z-scores</span> (standardization). For each axis we compute
            the <C>mean</C> and <C>standardDeviation</C> across all 48 teams, then express every
            team as &ldquo;how many standard deviations above or below average&rdquo; it is:
          </p>
          <Code>
{`z(x) = (x − mean) / standardDeviation     // the matching space

mean, standardDeviation computed across all 48 teams, per axis
result: each axis now has mean 0 and std 1`}
          </Code>
          <p className="text-mute">
            Why standardize instead of min-max for matching? Min-max is hostage to its two extremes —
            one freak outlier at the top stretches the whole scale and crushes everyone else into a
            narrow band. Z-scores center every axis at <C color="var(--color-emerald)">0</C> with a
            spread of <C color="var(--color-emerald)">1</C>, so each of the five traits carries{" "}
            <em>exactly equal weight</em> and a single wild team can&apos;t bully the geometry. Every
            personality trait gets a fair, equal-footing vote.
          </p>
        </div>
      </section>

      {/* 4. your vector */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Step 2 · You"
          title="Turning your taps into a vector"
          desc="Each answer nudges one or two axes. Add them up, scale by the biggest, done."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Every quiz option carries little weights. &ldquo;I have to win. At everything.&rdquo;
            adds to <span style={{ color: AXIS_COLOR.glory }}>glory</span>; &ldquo;I fall for a lost
            cause every time&rdquo; adds to <span style={{ color: AXIS_COLOR.fairytale }}>fairytale</span>{" "}
            (and a little <span style={{ color: AXIS_COLOR.heartbreak }}>heartbreak</span>). We sum
            those weights across all six questions — and since the match (next step) only cares about
            the <em>shape</em> of your vector, not its size, that running total is all we need:
          </p>
          <Code>
{`you = Σ answer weights, per axis

// e.g. an underdog-leaning run might produce
you = (glory 0.0, firepower 0.0, grit 0.0, fairytale 1.7, heartbreak 0.6)`}
          </Code>
          <p className="text-mute">
            Now you and every team are described the exact same way: five numbers, same scale, same
            space. They&apos;re ready to compare.
          </p>
        </div>
      </section>

      {/* 5. cosine */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Step 3 · The match"
          title="Correlation of shapes"
          desc="We don't match on who's good. We match on the pattern — which traits a team is relatively strong and weak on, compared to its own average."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Here&apos;s the key move, and it&apos;s subtler than plain cosine. Before comparing, we{" "}
            <strong className="text-white">center</strong> both vectors across their <em>own</em>{" "}
            five axes — subtract the average of the five values from each one. That strips away the
            overall &ldquo;how much&rdquo; and leaves only the <em>shape</em>: which axes stick out
            above this team&apos;s personal average, and which sag below it.
          </p>
          <Code>
{`center(v) = v − mean(v's own 5 axes)     // what makes this profile distinctive

affinity(you, team) = cos( center(you), center(teamZ) )
                    ∈ [−1, 1]`}
          </Code>
          <p>
            Taking the cosine of two <em>centered</em> vectors is exactly the{" "}
            <span className="text-cyan">Pearson correlation</span> of their five values. So{" "}
            <C>affinity</C> answers: &ldquo;do you and this team rise and fall on the same axes?&rdquo;
            A score of <C color="var(--color-emerald)">+1</C> means your shapes are a perfect match,{" "}
            <C>0</C> means unrelated, and <C>−1</C> means you&apos;re mirror opposites.
          </p>
          <p>
            Why this beats plain cosine on the raw vectors: it&apos;s <em>magnitude-invariant</em> in
            a deeper way. A blunt cosine quietly rewards teams that are high on everything, so it
            funnels half the planet toward a handful of glittering all-rounders. Centering kills
            that. A team that&apos;s merely &ldquo;good at all five&rdquo; has a <em>flat</em> shape
            (nothing sticks out) and can&apos;t correlate strongly with anyone&apos;s distinctive
            lean. So a quirky, lopsided you gets matched to a quirky, lopsided <em>them</em> — the
            field stays interesting instead of collapsing onto the favorites. In code that&apos;s{" "}
            <C>affinity(weights, teamId)</C>.
          </p>
          <p>
            Last touch — the <strong className="text-white">match %</strong>. We map the raw
            correlation (which in practice runs ~0.45 up to ~1.0) onto a friendlier scale. Note this
            is the <em>actual strength of fit</em>, not your rank — so it genuinely{" "}
            <strong className="text-white">varies</strong>:
          </p>
          <Code>
{`t        = clamp( (affinity − 0.45) / 0.55, 0, 1 )
pctMatch = clamp( round(62 + 36 · t^1.5), 58, 99 )`}
          </Code>
          <p className="text-mute">
            Answer with a clear, consistent personality and you&apos;ll correlate hard with one team
            → a match in the 90s. Spread your taps across every trait and no single team fits as
            cleanly → a more honest 60s–70s. Over all 4096 possible quizzes the top match spans{" "}
            <C color="var(--color-emerald)">62–98%</C> (median ~85) — so &ldquo;99%&rdquo; means
            something again, instead of being everyone&apos;s default.
          </p>
        </div>
      </section>

      {/* 5b. calibration */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Step 4 · Balance"
          title="Calibration: keeping the field honest"
          desc="The coolest part. After affinity, we add a tiny per-team nudge — fit offline — so the matcher never defaults to the same few darlings."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Correlation-of-shapes already spreads the field well. But some shapes are just more{" "}
            <em>magnetic</em> than others — a couple of teams sit near the center of where real quiz
            answers land and would quietly hoover up more than their fair share. So each team carries
            a small <span className="text-emerald">calibration bias</span>, and we pick the winner by
            argmax of <C>affinity + bias</C>:
          </p>
          <Code>{`soulmate = argmax over teams of  ( affinity(you, team) + bias[team] )`}</Code>
          <p>
            The biases are fit <strong className="text-white">offline</strong>, once, against the{" "}
            <em>complete</em> population of possible quizzes. The quiz is{" "}
            <C>6 questions × 4 options</C>, so there are exactly{" "}
            <C color="var(--color-gold)">4 = 4096</C> distinct answer paths. Rather than randomly
            sampling a billion fans and hoping for coverage, we just{" "}
            <strong className="text-white">enumerate every single path</strong> — the whole universe,
            no sampling error at all.
          </p>
          <p>
            Then we run <span className="text-cyan">iterative proportional fitting</span> (IPF): walk
            over all 4096 paths, see which teams win too often or too rarely, and nudge each
            team&apos;s bias toward an even share (target = <C>1/48</C>). Repeat until it settles.
            Crucially, biases are <strong className="text-white">hard-clamped to ±0.25</strong> — a
            gentle thumb on the scale, never a shove. If your shape genuinely loves one team, that
            team still wins on merit; calibration only smooths the long tail.
          </p>
          <Code>
{`for many iterations:
  for each of the 4096 quiz paths:  tally the winner
  share[team]  = wins[team] / 4096
  bias[team]  += step · (1/48 − share[team])     // nudge toward even
  bias[team]   = clamp(bias[team], −0.25, +0.25)  // never a shove`}
          </Code>
          <p>
            Did it work? We measure spread with the{" "}
            <span className="text-cyan">Gini coefficient</span> — <C>0</C> means a perfectly even
            field (every team wins an equal slice), <C>1</C> means one team hogs everything. The real
            numbers from the calibration we just ran:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 var(--color-mute)` }}>
              <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-2">
                Before calibration
              </div>
              <p className="text-sm leading-relaxed text-mute">
                Already decent, thanks to shape-correlation: top team{" "}
                <C color="var(--color-rose)">~10.5%</C> of all paths, Gini{" "}
                <C color="var(--color-rose)">0.44</C>, and all{" "}
                <C color="var(--color-emerald)">48 / 48</C> teams reachable.
              </p>
            </div>
            <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 var(--color-emerald)` }}>
              <div className="text-[11px] font-bold uppercase tracking-widest text-emerald mb-2">
                After calibration
              </div>
              <p className="text-sm leading-relaxed">
                Top team drops to <C color="var(--color-emerald)">~5.9%</C>, Gini falls to{" "}
                <C color="var(--color-emerald)">~0.17</C>, and a separate{" "}
                <C>1,000,000</C>-random-fan simulation also reaches all{" "}
                <C color="var(--color-emerald)">48 / 48</C> teams (top side ~4%).
              </p>
            </div>
          </div>
          <p className="text-mute">
            All of this lives in <C>scripts/calibrate-match.ts</C> and gets regenerated whenever the
            underlying data changes — so the field stays balanced as results roll in.
          </p>
        </div>
      </section>

      {/* 5c. rarity tiers */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Step 5 · Rarity"
          title="Your Fan ID's rarity tier — also real"
          desc="The 'only X% of fans are this type' on your card isn't invented. It's counted."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Your <strong className="text-white">type</strong> is your spirit team&apos;s two defining
            traits (the same pair that names your persona, so they always agree) — e.g.{" "}
            <C>fairytale + firepower</C>. Because we already enumerate the entire <C>4096</C>-path
            universe for calibration, we can just <strong className="text-white">count</strong> how
            often each type comes up across everyone&apos;s matches. No guessing — true population shares.
          </p>
          <Code>
{`for each of the 4096 quiz paths:
  team = your match     // argmax(affinity + bias)
  type = team's two most distinctive traits
  count[type] += 1
share[type] = count[type] / 4096      // the real rarity`}
          </Code>
          <p>
            Across the 17 possible types the shares run from{" "}
            <C color="var(--color-gold)">2.0%</C> (grit + glory — the rarest wiring) up to{" "}
            <C>13.0%</C> (firepower + grit — the crowd favourite). We bucket that share into a
            collectible-card tier:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { e: "🌟", n: "LEGENDARY", c: "var(--color-gold)", t: "≤ 2%" },
              { e: "💎", n: "EPIC", c: "var(--color-violet)", t: "≤ 4.5%" },
              { e: "🔷", n: "RARE", c: "var(--color-cyan)", t: "≤ 8.5%" },
              { e: "🟢", n: "COMMON", c: "var(--color-emerald)", t: "> 8.5%" },
            ].map((tier) => (
              <div key={tier.n} className="card p-3 text-center" style={{ boxShadow: `inset 0 3px 0 ${tier.c}` }}>
                <div className="text-2xl">{tier.e}</div>
                <div className="text-xs font-black tracking-widest mt-1" style={{ color: tier.c }}>
                  {tier.n}
                </div>
                <div className="text-[11px] text-mute mt-0.5 font-mono">{tier.t}</div>
              </div>
            ))}
          </div>
          <p className="text-mute">
            So a 🌟 LEGENDARY badge genuinely means fewer than 1 in 50 possible fans share your exact
            wiring. The flex is earned.
          </p>
        </div>
      </section>

      {/* 6. worked intuition */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Putting it together"
          title="A quick gut-check"
          desc="Crank a single trait to the max and the matcher lands exactly where you'd hope. These five are verified against the live engine."
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.glory}` }}>
            <div className="text-2xl">👑</div>
            <div className="font-bold mt-1">Pure glory</div>
            <p className="text-mute text-sm mt-1">
              Five-star everything, main-character syndrome, must-win → maxed{" "}
              <span style={{ color: AXIS_COLOR.glory }}>glory</span> parks you next to{" "}
              <span className="text-white">Argentina</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.fairytale}` }}>
            <div className="text-2xl">🌈</div>
            <div className="font-bold mt-1">Pure fairytale</div>
            <p className="text-mute text-sm mt-1">
              Backpacking trips, optimist energy, lost causes → a hard{" "}
              <span style={{ color: AXIS_COLOR.fairytale }}>fairytale</span> lean lands you beside
              debutant <span className="text-white">Curaçao</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.grit}` }}>
            <div className="text-2xl">🛡️</div>
            <div className="font-bold mt-1">Pure grit</div>
            <p className="text-mute text-sm mt-1">
              Stubborn, defiant, &ldquo;they shall not pass&rdquo; → maxed{" "}
              <span style={{ color: AXIS_COLOR.grit }}>grit</span> matches you with{" "}
              <span className="text-white">Iran</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.firepower}` }}>
            <div className="text-2xl">💥</div>
            <div className="font-bold mt-1">Pure firepower</div>
            <p className="text-mute text-sm mt-1">
              Theme parks, explosions, &ldquo;allergic to boring&rdquo; → high{" "}
              <span style={{ color: AXIS_COLOR.firepower }}>firepower</span> steers you toward
              free-scoring <span className="text-white">Norway</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.heartbreak}` }}>
            <div className="text-2xl">🎭</div>
            <div className="font-bold mt-1">Pure heartbreak</div>
            <p className="text-mute text-sm mt-1">
              Beautiful tragedy, glory always one game away → maxed{" "}
              <span style={{ color: AXIS_COLOR.heartbreak }}>heartbreak</span> pairs you with{" "}
              <span className="text-white">Czechia</span>.
            </p>
          </div>
        </div>
      </section>

      {/* 7. caveat */}
      <section className="rise">
        <div className="card p-5" style={{ boxShadow: `inset 3px 0 0 var(--color-mute)` }}>
          <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-2">
            One honest disclaimer
          </div>
          <p className="text-sm leading-relaxed text-mute">
            This is a <span className="text-white">fun model, not science</span>. The five axes and
            their weights are hand-picked to be entertaining, not peer-reviewed — there&apos;s no
            ground truth for what makes a team your &ldquo;soulmate.&rdquo; The data underneath is
            real, the shape-correlation and calibration are genuinely how we pick, but the meaning we
            hang on it is pure good-natured fortune-telling. Take your match, adopt your team, and
            enjoy the tournament. 🔮
          </p>
        </div>
      </section>
    </div>
  );
}
