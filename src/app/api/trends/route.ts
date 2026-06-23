import { readTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trends = await readTrends();
    if (!trends) return Response.json({ configured: false });
    return Response.json({ configured: true, trends });
  } catch (err) {
    return Response.json(
      { configured: false, error: err instanceof Error ? err.message : "read failed" },
      { status: 200 },
    );
  }
}
