import { recordResult } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { teamId, persona, tier } = await req.json();
    const ok = await recordResult(String(teamId), String(persona), String(tier));
    return Response.json({ ok });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
