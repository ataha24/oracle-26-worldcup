import { ImageResponse } from "next/og";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA, IDENTITY, TRAIT_ADJ, rarityFor } from "@/lib/match/persona";
import type { Axis } from "@/lib/match/vibes";

export const runtime = "nodejs";

const ACCENT: Record<Axis, string> = {
  glory: "#f5c542",
  firepower: "#fb5d7a",
  grit: "#22d3ee",
  fairytale: "#10d989",
  heartbreak: "#a78bfa",
};

// Dynamic social share card: /api/card?team=curacao&persona=fairytale&t2=heartbreak&pct=97
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const team = TEAM_BY_ID[sp.get("team") ?? ""] ?? TEAM_BY_ID["argentina"];
  const pKey = (sp.get("persona") as Axis) ?? "glory";
  const t2 = (sp.get("t2") as Axis) ?? "firepower";
  const persona = PERSONA[pKey] ?? PERSONA.glory;
  const ident = IDENTITY[pKey] ?? IDENTITY.glory;
  const traits = [TRAIT_ADJ[pKey] ?? "Front-runner", TRAIT_ADJ[t2] ?? "Chaotic"];
  const pct = Math.max(1, Math.min(99, parseInt(sp.get("pct") ?? "90", 10) || 90));
  const accent = ACCENT[pKey] ?? "#10d989";
  const { rarity, tier } = rarityFor(pKey, t2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          color: "#eef1f7",
          fontFamily: "sans-serif",
          backgroundColor: "#05070d",
          backgroundImage: `radial-gradient(900px 500px at 85% -10%, ${accent}33, transparent 60%), radial-gradient(700px 500px at 0% 120%, ${accent}22, transparent 60%)`,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "30px", fontWeight: 800 }}>
            <span>🔮</span>
            <span style={{ color: "#b9f5dc" }}>ORACLE&apos;26</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: tier.color,
              padding: "8px 20px",
              borderRadius: "9999px",
              border: `2px solid ${tier.color}66`,
              backgroundColor: `${tier.color}1a`,
            }}
          >
            <span>{tier.emoji}</span>
            <span>{tier.name}</span>
          </div>
        </div>

        {/* body — Fan ID is the hero */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: "26px", color: accent, fontWeight: 700, letterSpacing: "0.18em" }}>
            MY FAN PERSONALITY
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "26px", marginTop: "8px" }}>
            <span style={{ fontSize: "110px", lineHeight: "1" }}>{persona.emoji}</span>
            <span style={{ display: "flex", fontSize: "92px", fontWeight: 800, lineHeight: "1", color: "#fff" }}>
              {persona.name}
            </span>
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#c7cede", marginTop: "18px", maxWidth: "980px" }}>
            {ident.desc}
          </div>

          {/* trait chips */}
          <div style={{ display: "flex", gap: "14px", marginTop: "22px" }}>
            {traits.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: "9999px",
                  border: `2px solid ${accent}66`,
                  backgroundColor: `${accent}1a`,
                  fontSize: "28px",
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* footer — spirit team + url */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "26px", color: "#8a94ad" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "12px", color: "#eef1f7" }}>
            <span style={{ fontSize: "40px" }}>{team.flag}</span>
            <span>Spirit team: {team.name} · only {rarity}% are this type</span>
          </span>
          <span>oracle-26-worldcup.vercel.app/soulmate</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, emoji: "twemoji" },
  );
}
