/**
 * Daily fill-in of missing creator / description on auto-created resources.
 *
 * Picks resources still `needsReview` that have never been tried
 * (`enrichedAt` unset) and are missing a creator or description, looks each
 * URL up once (lib/resource-enrich.ts), and writes ONLY into empty fields.
 * `enrichedAt` is stamped either way so a site that gives us nothing isn't
 * retried forever. Small batch per run to stay inside the function budget.
 *
 * Auth: same CRON_SECRET bearer check as sync-sermons.
 */

import { NextRequest, NextResponse } from "next/server";
import { sanityWriteClient, hasSanityWriteToken } from "@/lib/sanity-write";
import { fetchResourceMeta } from "@/lib/resource-enrich";

export const maxDuration = 60;

const BATCH = 12;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasSanityWriteToken()) return NextResponse.json({ error: "SANITY_API_TOKEN not configured" }, { status: 500 });

  const docs = await sanityWriteClient.fetch<{ _id: string; url: string; creator?: string; autoSummary?: string }[]>(
    `*[_type == "resource" && needsReview == true && !defined(enrichedAt) && (!defined(creator) || !defined(autoSummary))][0...$n]{ _id, url, creator, autoSummary }`,
    { n: BATCH },
  );

  const results: { id: string; filled: string[] }[] = [];
  for (const d of docs) {
    const meta = await fetchResourceMeta(d.url);
    const set: Record<string, string> = { enrichedAt: new Date().toISOString() };
    const filled: string[] = [];
    if (!d.creator && meta.creator) { set.creator = meta.creator; filled.push("creator"); }
    if (!d.autoSummary && meta.summary) { set.autoSummary = meta.summary; filled.push("autoSummary"); }
    try {
      await sanityWriteClient.patch(d._id).set(set).commit();
    } catch (err) {
      console.error(`[enrich-resources] patch failed for ${d._id}:`, err);
      continue;
    }
    results.push({ id: d._id, filled });
  }

  console.log(`[enrich-resources] processed ${results.length}/${docs.length}: ${JSON.stringify(results)}`);
  return NextResponse.json({ processed: results.length, results });
}
