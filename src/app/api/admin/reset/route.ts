import { resetTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

// Temporary, lightly-guarded reset for the aggregate counters. Removed after use.
export async function POST(req: Request) {
  if (new URL(req.url).searchParams.get("confirm") !== "reset-oracle-26") {
    return Response.json({ ok: false }, { status: 403 });
  }
  return Response.json({ ok: await resetTrends() });
}
