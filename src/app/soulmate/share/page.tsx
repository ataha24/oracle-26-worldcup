import type { Metadata } from "next";
import Link from "next/link";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA, IDENTITY, TRAIT_ADJ, rarityFor } from "@/lib/match/persona";
import type { Axis } from "@/lib/match/vibes";

type SP = Promise<{ team?: string; persona?: string; t2?: string; pct?: string }>;

function parse(sp: { team?: string; persona?: string; t2?: string; pct?: string }) {
  const team = TEAM_BY_ID[sp.team ?? ""] ?? TEAM_BY_ID["argentina"];
  const pKey = (sp.persona as Axis) ?? "glory";
  const t2 = (sp.t2 as Axis) ?? "firepower";
  const persona = PERSONA[pKey] ?? PERSONA.glory;
  const ident = IDENTITY[pKey] ?? IDENTITY.glory;
  const traits = [TRAIT_ADJ[pKey] ?? "Front-runner", TRAIT_ADJ[t2] ?? "Chaotic"];
  const pct = Math.max(1, Math.min(99, parseInt(sp.pct ?? "90", 10) || 90));
  const { rarity, tier } = rarityFor(pKey, t2);
  const cardUrl = `/api/card?team=${team.id}&persona=${pKey}&t2=${t2}&pct=${pct}`;
  return { team, persona, ident, traits, rarity, tier, pct, cardUrl };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { team, persona, rarity, tier, cardUrl } = parse(await searchParams);
  const title = `${tier.emoji} ${tier.name} — ${persona.emoji} ${persona.name}`;
  const description = `Only ${rarity}% of fans are this type. Spirit team: ${team.name}. What's your World Cup Fan Personality? Find out with ORACLE '26.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cardUrl, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cardUrl] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SP }) {
  const { team, persona, ident, traits, rarity, tier, cardUrl } = parse(await searchParams);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 text-center">
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black tracking-widest mb-3"
        style={{ color: tier.color, background: `${tier.color}1a`, border: `1.5px solid ${tier.color}66` }}
      >
        {tier.emoji} {tier.name}
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
        {persona.emoji} {persona.name}
      </h1>
      <p className="text-mute mb-1">{ident.desc}</p>
      <p className="text-sm text-mute mb-6">
        {traits.join(" · ")} · only {rarity}% are this type · spirit team {team.flag} {team.name}
      </p>

      {/* the card image itself */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardUrl}
        alt={`${persona.name} matched with ${team.name}`}
        width={1200}
        height={630}
        className="w-full rounded-2xl border border-line shadow-[0_0_60px_-20px_var(--color-emerald)]"
      />

      <div className="flex flex-wrap gap-3 justify-center mt-7">
        <Link
          href="/soulmate"
          className="px-7 py-3 rounded-2xl bg-emerald text-black font-bold hover:brightness-110 transition shadow-[0_0_40px_-10px_var(--color-emerald)]"
        >
          Reveal MY Fan ID →
        </Link>
        <a
          href={cardUrl}
          download="my-fan-id.png"
          className="px-7 py-3 rounded-2xl border border-line font-semibold hover:text-white hover:border-white/30 transition"
        >
          Download this card
        </a>
      </div>

      <p className="text-xs text-mute mt-6">
        Powered by <span className="wordmark font-bold">ORACLE&apos;26</span> — a 50,000-simulation
        World Cup 2026 forecast engine.
      </p>
    </div>
  );
}
