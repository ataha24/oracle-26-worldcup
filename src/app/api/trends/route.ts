import { readTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Safe diagnostic: /api/trends?debug=1 reports WHICH redis env var NAMES are
  // present (booleans only — never values), to pinpoint a misconfiguration.
  if (new URL(req.url).searchParams.get("debug") === "1") {
    const present = (k: string) => Boolean(process.env[k]);
    return Response.json({
      detected: {
        UPSTASH_REDIS_REST_URL: present("UPSTASH_REDIS_REST_URL"),
        UPSTASH_REDIS_REST_TOKEN: present("UPSTASH_REDIS_REST_TOKEN"),
        KV_REST_API_URL: present("KV_REST_API_URL"),
        KV_REST_API_TOKEN: present("KV_REST_API_TOKEN"),
        REDIS_URL: present("REDIS_URL"),
        KV_URL: present("KV_URL"),
      },
      // any other env keys that look redis/kv/upstash related (names only)
      otherRedisKeys: Object.keys(process.env).filter(
        (k) => /redis|upstash|kv_/i.test(k) &&
          !["UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN","KV_REST_API_URL","KV_REST_API_TOKEN","REDIS_URL","KV_URL"].includes(k),
      ),
    });
  }

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
