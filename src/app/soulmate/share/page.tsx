import type { Metadata } from "next";
import Link from "next/link";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA, rarityFor } from "@/lib/match/persona";
import { AXES, type Axis, type Vibe } from "@/lib/match/vibes";
import { FanReport, decodeVibe } from "@/components/FanReport";
import { ogTitle, ogDescription } from "@/lib/data/shareCopy";

type SP = Promise<{ team?: string; persona?: string; t2?: string; pct?: string; v?: string }>;

function vibeFromKeys(pKey: Axis, t2: Axis): Vibe {
  const v = Object.fromEntries(AXES.map((k) => [k, 0])) as Vibe;
  v[pKey] = 1;
  v[t2] = Math.max(v[t2], 0.6);
  return v;
}

function parse(sp: { team?: string; persona?: string; t2?: string; pct?: string; v?: string }) {
  const team = TEAM_BY_ID[sp.team ?? ""] ?? TEAM_BY_ID["argentina"];
  const pKey = (sp.persona as Axis) ?? "glory";
  const t2 = (sp.t2 as Axis) ?? "firepower";
  const persona = PERSONA[pKey] ?? PERSONA.glory;
  const pct = Math.max(1, Math.min(99, parseInt(sp.pct ?? "90", 10) || 90));
  const { rarity, tier } = rarityFor(pKey, t2);
  const userVibe = decodeVibe(sp.v) ?? vibeFromKeys(pKey, t2);
  const cardUrl = `/api/card?team=${team.id}&persona=${pKey}&t2=${t2}&pct=${pct}${sp.v ? `&v=${sp.v}` : ""}`;
  return { team, persona, rarity, tier, userVibe, cardUrl };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { team, persona, rarity, tier, cardUrl } = parse(await searchParams);
  const title = ogTitle({
    personaName: persona.name,
    personaEmoji: persona.emoji,
    tierName: tier.name,
    tierEmoji: tier.emoji,
  });
  const description = ogDescription({ rarity, teamName: team.name });
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: cardUrl, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [cardUrl] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SP }) {
  const { userVibe, cardUrl } = parse(await searchParams);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="text-center mb-6">
        <div className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald mb-1">
          Someone&apos;s World Cup Fan ID
        </div>
        <p className="text-mute text-sm">Here&apos;s their full report — scroll on, then claim your own.</p>
      </div>

      {/* THE FULL REPORT */}
      <FanReport userVibe={userVibe} />

      {/* claim-your-own CTA */}
      <div className="card p-6 mt-6 text-center" style={{ boxShadow: "0 0 50px -20px var(--color-emerald)" }}>
        <div className="text-2xl font-extrabold mb-1">What&apos;s YOUR Fan ID?</div>
        <p className="text-mute text-sm mb-4">6 questions. 20 seconds. Find the team you were born to root for.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/soulmate"
            className="px-7 py-3 rounded-2xl bg-emerald text-black font-bold hover:brightness-110 transition shadow-[0_0_40px_-10px_var(--color-emerald)]"
          >
            Reveal my Fan ID →
          </Link>
          <a
            href={cardUrl}
            download="my-fan-id.png"
            className="px-7 py-3 rounded-2xl border border-line font-semibold hover:text-white hover:border-white/30 transition"
          >
            ⬇ Download the card
          </a>
        </div>
        <p className="text-xs text-mute mt-4">
          Powered by <span className="wordmark font-bold">ORACLE&apos;26</span> ·{" "}
          <a href="/how-it-works" className="hover:text-emerald underline underline-offset-2">how it works</a>
        </p>
      </div>
    </div>
  );
}
