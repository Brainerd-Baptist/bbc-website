// Brainerd Mail calls this the moment the missions team saves a change, so the live map updates in
// seconds instead of waiting out the cache. Set the same secret in both places:
//   Brainerd Mail:  WEBSITE_REVALIDATE_URL = https://www.brainerdbaptist.org/api/revalidate/missions
//                   WEBSITE_REVALIDATE_SECRET = <secret>
//   This site:      MISSIONS_REVALIDATE_SECRET = <the same secret>
// It only expires cached data; it never changes any, so the worst a stray call can do is one extra fetch.
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { MISSIONS_TAG } from "@/lib/missions/feed";

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function POST(req: Request) {
  const secret = process.env.MISSIONS_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Not configured" }, { status: 503 });
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!timingSafeEqual(digest(given), digest(secret))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // expire: 0 means the very next visitor waits for fresh data instead of being shown the old map first.
  revalidateTag(MISSIONS_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
