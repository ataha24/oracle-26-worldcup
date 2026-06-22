import Link from "next/link";
import { FORECAST, RANKED_ODDS } from "@/lib/forecast";
import { getTeam, TEAMS, effectiveElo } from "@/lib/data/teams";
import { GROUPS } from "@/lib/data/groups";
import { pct, americanOdds, CONF_META } from "@/lib/format";
import { Flag, Stat, SectionTitle } from "@/components/bits";

export default function Home() {
  const podium = RANKED_ODDS.slice(0, 3);
  const board = RANKED_ODDS.slice(0, 16);

  // ----- insights -----
  const groupOfDeath = [...GROUPS]
    .map((g) => ({
      g,
      avg: g.teamIds.reduce((a, id) => a + getTeam(id).elo, 0) / 4,
    }))
    .sort((a, b) => b.avg - a.avg)[0];

  const darkHorses = RANKED_ODDS.filter((o) => getTeam(o.teamId).fifaRank > 15)
    .sort((a, b) => b.pReachQF - a.pReachQF)
    .slice(0, 4);

  const lockIn = [...RANKED_ODDS].sort((a, b) => b.pAdvance - a.pAdvance)[0];
  const topElo = [...TEAMS].sort((a, b) => effectiveElo(b) - effectiveElo(a))[0];

  return (
    <div className="max-w-6xl mx-auto px-5">
      {/* ---------------- HERO ---------------- */}
      <section className="pt-12 pb-8 text-center rise">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line text-xs text-mute mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" /> Live forecast ·
          Canada · Mexico · USA 2026
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">
          <span className="wordmark">THE ORACLE</span>
          <span className="block text-2xl sm:text-3xl font-bold text-mute mt-3 tracking-tight">
            World Cup 2026, simulated {FORECAST.iterations.toLocaleString()} times.
          </span>
        </h1>
        <p className="text-mute max-w-2xl mx-auto mt-5">
          Real results are locked in. Every match still to be played is simulated tens of
          thousands of times with an Elo → Poisson → Monte-Carlo engine to answer one
          question: <span className="text-white font-semibold">who lifts the trophy?</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 text-left">
          <Stat label="Matches played" value={FORECAST.matchesPlayed} accent="text-cyan" />
          <Stat label="Simulations" value={`${(FORECAST.iterations / 1000).toFixed(0)}k`} accent="text-emerald" />
          <Stat label="Teams alive" value={48} accent="text-gold" />
          <Stat
            label="Favorite"
            value={
              <span className="flex items-center gap-1.5">
                <Flag flag={getTeam(podium[0].teamId).flag} size="text-xl" />
                {pct(podium[0].pWinTitle, 1)}
              </span>
            }
          />
        </div>
      </section>

      {/* ---------------- PODIUM ---------------- */}
      <section className="py-8">
        <SectionTitle
          kicker="Title race"
          title="The three most likely champions"
          desc="Probability of winning the 2026 World Cup, across every simulated tournament from the current live state."
        />
        <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
          {[podium[1], podium[0], podium[2]].map((o, i) => {
            const place = i === 1 ? 1 : i === 0 ? 2 : 3;
            const t = getTeam(o.teamId);
            const h = place === 1 ? "h-44 sm:h-56" : place === 2 ? "h-36 sm:h-44" : "h-28 sm:h-36";
            const ring =
              place === 1
                ? "border-gold/50 shadow-[0_0_50px_-12px_var(--color-gold)]"
                : "border-line";
            return (
              <div
                key={o.teamId}
                className="flex flex-col items-center rise"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="text-5xl sm:text-6xl mb-2">{t.flag}</div>
                <div className="font-bold text-center leading-tight">{t.name}</div>
                <div className="text-xs text-mute mb-2">Group {o.groupId}</div>
                <div
                  className={`card ${ring} w-full ${h} flex flex-col items-center justify-center relative overflow-hidden`}
                >
                  {place === 1 && <div className="absolute top-2 text-2xl glow-gold">👑</div>}
                  <div
                    className={`text-3xl sm:text-4xl font-black tabular ${
                      place === 1 ? "text-gold glow-gold" : "text-white"
                    }`}
                  >
                    {pct(o.pWinTitle, 1)}
                  </div>
                  <div className="text-xs text-mute mt-1">to win it all</div>
                  <div className="text-[11px] text-mute mt-2 tabular">
                    {americanOdds(o.pWinTitle)}
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold tabular text-mute">#{place}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- TITLE BOARD ---------------- */}
      <section className="py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionTitle kicker="The board" title="Title odds — top 16" />
          <div className="card divide-y divide-line/70">
            {board.map((o, i) => {
              const t = getTeam(o.teamId);
              const max = board[0].pWinTitle;
              return (
                <div key={o.teamId} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-5 text-sm text-mute tabular text-right">{i + 1}</div>
                  <Flag flag={t.flag} size="text-xl" />
                  <div className="w-36 sm:w-44">
                    <div className="font-semibold text-sm leading-tight">{t.name}</div>
                    <div className="text-[11px] text-mute">Grp {o.groupId}</div>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(o.pWinTitle / max) * 100}%`,
                        background:
                          i === 0
                            ? "var(--color-gold)"
                            : i < 3
                              ? "var(--color-emerald)"
                              : "var(--color-cyan)",
                      }}
                    />
                  </div>
                  <div className="w-14 text-right text-sm font-bold tabular">
                    {pct(o.pWinTitle, 1)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-mute mt-3">
            Showing 16 of 48. The full field — including every long shot — is on the{" "}
            <Link href="/teams" className="text-emerald hover:underline">
              Teams
            </Link>{" "}
            page.
          </p>
        </div>

        {/* insights */}
        <div className="space-y-4">
          <SectionTitle kicker="Read the board" title="What the model sees" />

          <InsightCard
            tag="Group of death"
            accent="var(--color-rose)"
            title={`Group ${groupOfDeath.g.id}`}
            body={
              <div className="flex flex-wrap gap-1.5 mt-1">
                {groupOfDeath.g.teamIds.map((id) => (
                  <span key={id} className="text-xs px-2 py-0.5 rounded-md bg-white/6">
                    {getTeam(id).flag} {getTeam(id).name}
                  </span>
                ))}
              </div>
            }
            footer={`Avg Elo ${Math.round(groupOfDeath.avg)} — the toughest quartet in the draw.`}
          />

          <InsightCard
            tag="Surest thing"
            accent="var(--color-emerald)"
            title={`${getTeam(lockIn.teamId).flag} ${getTeam(lockIn.teamId).name}`}
            body={
              <p className="text-sm text-mute mt-1">
                Reaches the knockouts in{" "}
                <span className="text-white font-semibold">{pct(lockIn.pAdvance, 1)}</span> of
                simulations — the safest passage out of the group stage.
              </p>
            }
          />

          <InsightCard
            tag="Dark horses"
            accent="var(--color-violet)"
            title="Beyond the usual suspects"
            body={
              <div className="space-y-1.5 mt-2">
                {darkHorses.map((o) => (
                  <div key={o.teamId} className="flex items-center justify-between text-sm">
                    <span>
                      {getTeam(o.teamId).flag} {getTeam(o.teamId).name}
                    </span>
                    <span className="text-mute tabular">QF {pct(o.pReachQF)}</span>
                  </div>
                ))}
              </div>
            }
            footer="Outside the world's top 15, most likely to crash the quarter-finals."
          />

          <InsightCard
            tag="Strongest squad"
            accent="var(--color-gold)"
            title={`${topElo.flag} ${topElo.name}`}
            body={
              <p className="text-sm text-mute mt-1">
                Highest effective rating in the field at{" "}
                <span className="text-white font-semibold tabular">
                  {Math.round(effectiveElo(topElo))} Elo
                </span>
                .
              </p>
            }
          />
        </div>
      </section>

      {/* ---------------- CTA STRIP ---------------- */}
      <section className="py-10">
        <div className="grid sm:grid-cols-3 gap-4">
          <CtaCard
            href="/predictor"
            emoji="⚔️"
            title="Head-to-head predictor"
            desc="Pit any two of the 48 against each other for a full scoreline breakdown."
          />
          <CtaCard
            href="/bracket"
            emoji="🏆"
            title="Road to the final"
            desc="Every team's odds to survive each knockout round, on the real bracket."
          />
          <CtaCard
            href="/oracle"
            emoji="🔮"
            title="Ask the Oracle"
            desc="Pose any World Cup question in plain English and let the engine answer."
          />
        </div>
      </section>

      <p className="text-center text-xs text-mute pb-8">
        Confederations:{" "}
        {Object.values(CONF_META).map((m, i) => (
          <span key={m.label}>
            {i > 0 && " · "}
            <span style={{ color: m.color }}>{m.label}</span>
          </span>
        ))}
      </p>
    </div>
  );
}

function InsightCard({
  tag,
  accent,
  title,
  body,
  footer,
}: {
  tag: string;
  accent: string;
  title: string;
  body: React.ReactNode;
  footer?: string;
}) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
      <div
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: accent }}
      >
        {tag}
      </div>
      <div className="font-bold">{title}</div>
      {body}
      {footer && <div className="text-[11px] text-mute mt-2">{footer}</div>}
    </div>
  );
}

function CtaCard({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card p-5 hover:border-emerald/40 transition-colors group">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="font-bold group-hover:text-emerald transition-colors">{title}</div>
      <p className="text-sm text-mute mt-1">{desc}</p>
      <div className="text-emerald text-sm mt-3 font-medium">Open →</div>
    </Link>
  );
}
