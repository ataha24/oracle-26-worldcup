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
          trench coat. Here&apos;s exactly what happens to your five taps — formulas and all.
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
            which team&apos;s vector points in the most similar direction to yours? That nearest
            neighbor — measured by <span className="text-cyan">cosine similarity</span> — is your
            soulmate.
          </p>
          <Code>
{`vibe : Team   → (glory, firepower, grit, fairytale, heartbreak)
you  : Quiz   → (glory, firepower, grit, fairytale, heartbreak)
match = argmax  cosineSimilarity(you, vibe)`}
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
            to land on free-scoring sides like Germany.
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
          title="Min-max normalization"
          desc="Raw axes live on wildly different scales. We squash all of them into 0…1 so no single axis bullies the rest."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            Glory can be in the thousands (Elo), firepower is a handful of goals, heartbreak is a
            small tally. If we compared those raw, glory would drown everything out. So for each
            axis we find its min and max <em>across all 48 teams</em> and rescale every value into a
            tidy 0-to-1 range:
          </p>
          <Code>
{`normalized(x) = (x − min) / (max − min)

min  → 0.0   (the lowest team on that axis)
max  → 1.0   (the highest team on that axis)
everyone else lands somewhere in between`}
          </Code>
          <p className="text-mute">
            (If an axis is somehow flat, we divide by 1 instead of 0 — no exploding numbers.) After
            this, all five axes speak the same language, and a team&apos;s vibe is just five numbers
            between 0 and 1.
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
            those weights across all five questions, then divide by your largest component so your
            vector also lives in a friendly 0…1 range:
          </p>
          <Code>
{`sum   = Σ answer weights, per axis
you   = sum / max(sum)        // scaled by your strongest trait

// e.g. an underdog-leaning run might produce
you = (glory 0.0, firepower 0.0, grit 0.0, fairytale 1.0, heartbreak 0.6)`}
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
          title="Cosine similarity"
          desc="We compare the direction you lean, not how hard you lean. Then the closest team wins."
        />
        <div className="card p-5 space-y-3 text-sm leading-relaxed">
          <p>
            The headline formula. For your vector <C>A</C> and a team&apos;s vector <C>B</C>, cosine
            similarity is the dot product divided by the product of their lengths:
          </p>
          <Code>
{`              A · B            Σ Aᵢ Bᵢ
cos(θ) = ───────────── = ─────────────────────
            |A| · |B|     √(Σ Aᵢ²) · √(Σ Bᵢ²)

result ranges from 0 (nothing in common) to 1 (perfectly aligned)`}
          </Code>
          <p>
            The magic is in that division by lengths: it cancels out <em>magnitude</em> and keeps
            only <em>direction</em>. So we&apos;re asking &ldquo;how much do you lean each way?&rdquo;
            — not &ldquo;how intensely did you answer?&rdquo; Someone who&apos;s 100% fairytale and
            someone who&apos;s a calmer 60% fairytale point the same way, so they match the same
            dreamers. We score you against all 48 teams and the highest cosine wins:
          </p>
          <Code>
{`soulmate = argmax over teams of  cos(you, teamVibe)`}
          </Code>
          <p>
            Last touch — a raw cosine of <C>0.91</C> isn&apos;t very romantic to read. So we remap
            the score into a friendlier <span className="text-emerald">70–99%</span> band before
            showing it:
          </p>
          <Code>{`pctMatch = round(70 + score · 29)`}</Code>
          <p className="text-mute">
            Nobody&apos;s soulmate should feel like a 12% match. Everyone gets a little love.
          </p>
        </div>
      </section>

      {/* 6. worked intuition */}
      <section className="rise mb-12">
        <SectionTitle
          kicker="Putting it together"
          title="A quick gut-check"
          desc="Why the answers you'd expect produce the teams you'd expect."
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.fairytale}` }}>
            <div className="text-2xl">🌈</div>
            <div className="font-bold mt-1">Lean underdog</div>
            <p className="text-mute text-sm mt-1">
              Backpacking trips, optimist energy, lost causes → your vector points hard at{" "}
              <span style={{ color: AXIS_COLOR.fairytale }}>fairytale</span>, landing you beside
              debutants like <span className="text-white">Curaçao</span> or{" "}
              <span className="text-white">Uzbekistan</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.firepower}` }}>
            <div className="text-2xl">💥</div>
            <div className="font-bold mt-1">Lean chaos</div>
            <p className="text-mute text-sm mt-1">
              Theme parks, explosions, &ldquo;allergic to boring&rdquo; → high{" "}
              <span style={{ color: AXIS_COLOR.firepower }}>firepower</span>, steering you toward a
              free-scoring side like <span className="text-white">Germany</span>.
            </p>
          </div>
          <div className="card p-4" style={{ boxShadow: `inset 3px 0 0 ${AXIS_COLOR.glory}` }}>
            <div className="text-2xl">👑</div>
            <div className="font-bold mt-1">Lean winner</div>
            <p className="text-mute text-sm mt-1">
              Five-star everything, main-character syndrome, must-win → maxed{" "}
              <span style={{ color: AXIS_COLOR.glory }}>glory</span>, parking you next to{" "}
              <span className="text-white">France</span> or <span className="text-white">Argentina</span>.
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
            real, the cosine similarity is genuinely how we pick, but the meaning we hang on it is
            pure good-natured fortune-telling. Take your match, adopt your team, and enjoy the
            tournament. 🔮
          </p>
        </div>
      </section>
    </div>
  );
}
