import { readTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const trends = await readTrends();
    if (!trends) return Response.json({ configured: false });
    return Response.json({ configured: true, trends });
  } catch {
    return Response.json({ configured: false }, { status: 200 });
  }
}
