import { fetchMatchStats } from "@/lib/live/espn";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// On-demand detailed box score for a single in-progress match. Kept separate
// from /api/refresh so the heavy per-match summary is only pulled when a fan
// actually expands a game, not on every 60s live refresh.
export async function GET(req: Request) {
  const event = new URL(req.url).searchParams.get("event");
  if (!event) {
    return Response.json({ ok: false, error: "missing event id" }, { status: 400 });
  }
  try {
    const stats = await fetchMatchStats(event);
    if (!stats) {
      return Response.json(
        { ok: false, error: "no stats available for this match yet" },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, ...stats });
  } catch (err) {
    return Response.json(
      { ok: false, error: `stats unavailable: ${err instanceof Error ? err.message : err}` },
      { status: 502 },
    );
  }
}
