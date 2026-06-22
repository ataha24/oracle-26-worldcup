import type { Metadata } from "next";
import Link from "next/link";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA } from "@/lib/match/persona";
import type { Axis } from "@/lib/match/vibes";

type SP = Promise<{ team?: string; persona?: string; pct?: string }>;

function parse(sp: { team?: string; persona?: string; pct?: string }) {
  const team = TEAM_BY_ID[sp.team ?? ""] ?? TEAM_BY_ID["argentina"];
  const pKey = (sp.persona as Axis) ?? "glory";
  const persona = PERSONA[pKey] ?? PERSONA.glory;
  const pct = Math.max(1, Math.min(99, parseInt(sp.pct ?? "90", 10) || 90));
  const cardUrl = `/api/card?team=${team.id}&persona=${pKey}&pct=${pct}`;
  return { team, persona, pct, cardUrl };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { team, persona, pct, cardUrl } = parse(await searchParams);
  const title = `${persona.emoji} I'm ${persona.name} — my World Cup soulmate is ${team.name}`;
  const description = `${pct}% match. Find your own 2026 World Cup team with the ORACLE '26 Matchmaker.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cardUrl, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cardUrl] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SP }) {
  const { team, persona, pct, cardUrl } = parse(await searchParams);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12 text-center">
      <div className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-2">
        Someone found their team
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1">
        {persona.emoji} {persona.name} ↔ {team.flag} {team.name}
      </h1>
      <p className="text-mute mb-6">{pct}% soulmate match</p>

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
          Find MY team →
        </Link>
        <a
          href={cardUrl}
          download={`my-world-cup-soulmate-${team.id}.png`}
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
