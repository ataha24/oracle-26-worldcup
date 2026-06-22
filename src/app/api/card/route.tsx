import { ImageResponse } from "next/og";
import { TEAM_BY_ID } from "@/lib/data/teams";
import { PERSONA } from "@/lib/match/persona";
import type { Axis } from "@/lib/match/vibes";

export const runtime = "nodejs";

const ACCENT: Record<Axis, string> = {
  glory: "#f5c542",
  firepower: "#fb5d7a",
  grit: "#22d3ee",
  fairytale: "#10d989",
  heartbreak: "#a78bfa",
};

// Dynamic social share card: /api/card?team=curacao&persona=fairytale&pct=97
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const team = TEAM_BY_ID[sp.get("team") ?? ""] ?? TEAM_BY_ID["argentina"];
  const pKey = (sp.get("persona") as Axis) ?? "glory";
  const persona = PERSONA[pKey] ?? PERSONA.glory;
  const pct = Math.max(1, Math.min(99, parseInt(sp.get("pct") ?? "90", 10) || 90));
  const accent = ACCENT[pKey] ?? "#10d989";

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
          <div style={{ display: "flex", fontSize: "22px", color: "#8a94ad", letterSpacing: "0.15em" }}>
            WORLD CUP 2026
          </div>
        </div>

        {/* body */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: "26px", color: accent, fontWeight: 700, letterSpacing: "0.18em" }}>
            MY FOOTBALL SOULMATE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "30px", marginTop: "6px" }}>
            <div style={{ display: "flex", fontSize: "150px", lineHeight: "1" }}>{team.flag}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: "84px", fontWeight: 800, lineHeight: "1" }}>
                {team.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginTop: "10px" }}>
                <span style={{ fontSize: "72px", fontWeight: 800, color: accent }}>{pct}%</span>
                <span style={{ fontSize: "30px", color: "#8a94ad" }}>match</span>
              </div>
            </div>
          </div>

          {/* persona pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "34px",
              padding: "16px 26px",
              borderRadius: "9999px",
              border: `2px solid ${accent}66`,
              backgroundColor: `${accent}1a`,
              alignSelf: "flex-start",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            <span>{persona.emoji}</span>
            <span>I&apos;m {persona.name}</span>
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "26px", color: "#8a94ad" }}>
          <span>Find your team →</span>
          <span style={{ color: "#eef1f7" }}>oracle-26-worldcup.vercel.app/soulmate</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, emoji: "twemoji" },
  );
}
