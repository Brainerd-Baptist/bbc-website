/**
 * lib/sermon-resources.ts
 *
 * Turns the hyperlink URLs read out of the Tagging sheet's Resources column
 * (lib/sermon-tagging.ts) into Sanity `resource` documents and wires them
 * onto the sermon (and, after 3+ consecutive weeks, the series) that
 * mentioned them. Used by app/api/cron/sync-sermons/route.ts.
 *
 * See claude/sermon-resource-catalog-scope-2026-10-03.md for the full
 * design this implements — in particular:
 *   - Curtis owns data entry entirely via the Tagging sheet; this module
 *     never asks him to re-enter anything already in a hyperlink there.
 *   - A resource is identified by URL, not by title — the same link
 *     mentioned in two different weeks must resolve to the same doc.
 *   - Auto-categorization is a best-effort guess from the domain, always
 *     flagged `needsReview: true` so a wrong guess surfaces in Studio
 *     rather than quietly shipping — nothing here should require Curtis to
 *     stop and classify anything up front.
 *   - "This resource applies to the whole series" is decided automatically
 *     going forward: a resource mentioned in 3+ CONSECUTIVE weeks of the
 *     same series is promoted from every one of those sermons onto the
 *     series document instead, and removed from the individual sermons (so
 *     it reads once, at the series level, rather than three-plus times).
 */

import { createHash } from "node:crypto";
import { sanityWriteClient } from "./sanity-write";
import type { ResourceLink } from "./sermon-tagging";
import { fetchResourceMeta } from "./resource-enrich";

export type ResourceType = "book" | "article" | "ministry" | "video" | "podcast" | "prayer" | "other";

/** Domain → type heuristic. Checked against the URL's hostname (with any
 * "www." stripped), longest/most-specific match first. Always a guess —
 * every resource created through this path gets `needsReview: true`
 * regardless of how confident the match looks, per the scope doc. */
const DOMAIN_TYPE_RULES: { test: (host: string) => boolean; type: ResourceType }[] = [
  { test: (h) => h.includes("amazon."), type: "book" },
  { test: (h) => h === "a.co", type: "book" },
  { test: (h) => h.includes("goodreads.com"), type: "book" },
  { test: (h) => h.includes("open.spotify.com") && false, type: "podcast" }, // spotify covered below (music vs podcast can't be told from host alone)
  { test: (h) => h.includes("podcasts.apple.com"), type: "podcast" },
  { test: (h) => h.includes("spotify.com"), type: "podcast" },
  { test: (h) => h.includes("youtube.com") || h.includes("youtu.be"), type: "video" },
  { test: (h) => h.includes("vimeo.com"), type: "video" },
  { test: (h) => h.includes("desiringgod.org"), type: "article" },
  { test: (h) => h.includes("thegospelcoalition.org"), type: "article" },
  { test: (h) => h.includes("ligonier.org"), type: "article" },
  { test: (h) => h.includes("9marks.org"), type: "article" },
  { test: (h) => h.includes("gotquestions.org"), type: "article" },
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function guessType(url: string): ResourceType {
  const host = hostnameOf(url);
  if (!host) return "other";
  const match = DOMAIN_TYPE_RULES.find((rule) => rule.test(host));
  return match?.type ?? "other";
}

/** A human-readable fallback title for a resource whose title we have no
 * other way to know — Curtis links over whatever text he wrote ("his new
 * book"), which Sheets' grid-data response doesn't expose as plain text
 * here, so the link target is the only thing we can reliably show until a
 * staff member fills in a real title in Studio. Kept short and honest
 * rather than guessed. */
function fallbackTitle(url: string): string {
  const host = hostnameOf(url);
  return host ? `Resource from ${host}` : "Resource (needs a title)";
}

/**
 * Finds-or-creates a Sanity `resource` document for each link, returning
 * their _ids in the same order (deduped — a URL repeated within the same
 * array collapses to one id). Never throws: Sanity errors are logged and
 * that URL is skipped, since one bad resource link shouldn't block an
 * otherwise-good sermon sync.
 *
 * Accepts either a plain URL (legacy callers) or a { url, text } link —
 * `text` is the actual words Curtis hyperlinked in the sheet ("His New
 * Book"), used as the title instead of the `fallbackTitle()` placeholder
 * whenever it's a real title and not just the bare URL repeated as the
 * link's visible text.
 */
export async function resolveResourceIds(links: (string | ResourceLink)[]): Promise<string[]> {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const raw of links) {
    const { url: rawUrl, text } = typeof raw === "string" ? { url: raw, text: undefined } : raw;
    const url = rawUrl.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);

    try {
      const existingId = await sanityWriteClient.fetch<string | null>(
        `*[_type == "resource" && url == $url][0]._id`,
        { url },
      );
      if (existingId) {
        ids.push(existingId);
        continue;
      }

      const linkedTitle = text?.trim();
      // A linked title is only useful if it's not just the URL itself (a
      // bare-link cell has its "text" equal to the URL — see
      // extractResourceLinks's fallback-to-hyperlink path).
      const title = linkedTitle && linkedTitle !== url ? linkedTitle : fallbackTitle(url);

      // Hashed (not a truncated base64 encoding of the URL) — two URLs sharing a
      // long common prefix (e.g. two crossway.org/books/ links, or two
      // logos.com/product/ links) used to collapse onto the same truncated id
      // and silently collide (createIfNotExists would then no-op for every
      // URL after the first, merging what should be distinct resources).
      // Found + fixed 2026-10-03 during the /areyouin backfill migration —
      // see claude/sermon-resource-catalog-scope-2026-10-03.md.
      const id = `resource-${createHash("sha256").update(url).digest("hex").slice(0, 40)}`;
      // Best-effort author + description from the link's own page (4s cap,
      // never throws) so the new card isn't empty. Written only into fields
      // a human hasn't filled; the resource stays needsReview regardless.
      const meta = await fetchResourceMeta(url);
      await sanityWriteClient.createIfNotExists({
        _id: id,
        _type: "resource",
        title,
        type: guessType(url),
        url,
        status: "active",
        needsReview: true,
        ...(meta.creator ? { creator: meta.creator } : {}),
        ...(meta.summary ? { autoSummary: meta.summary } : {}),
        enrichedAt: new Date().toISOString(),
      });
      ids.push(id);
    } catch (err) {
      console.error(`[sermon-resources] failed to resolve resource for ${url}:`, err);
    }
  }

  return ids;
}

// A resource must show up in this many consecutive sermons of the same
// series before it's promoted to the series level. Per Josiah 2026-10-03:
// auto-detect and apply this going forward (the backfill pass is handled
// separately, by hand, per claude/sermon-resource-catalog-scope-2026-10-03.md).
const SERIES_PROMOTION_THRESHOLD = 3;

interface SeriesSermonRow {
  _id: string;
  date: string;
  resourceIds: string[];
}

/**
 * Looks at every sermon in a series, oldest → newest, and promotes any
 * resource that appears in the trailing N (SERIES_PROMOTION_THRESHOLD)
 * consecutive sermons — "consecutive" meaning back-to-back entries in this
 * series' own sermon list, not back-to-back calendar weeks (a series can
 * skip a week for a guest speaker without breaking the streak). A promoted
 * resource is added to the series' resourcesMentioned (addToSet — no
 * duplicates) and removed from each of those sermons' own
 * resourcesMentioned, so the front end shows it once, at the series level,
 * per the dedupe behavior in app/sermons/[slug]/page.tsx.
 *
 * Safe to call repeatedly (e.g. once per sync run after every sermon in
 * the series has been written) — already-promoted resources are already
 * gone from the per-sermon arrays, so they simply won't be found there
 * again on a later run.
 */
export async function promoteSeriesResources(seriesId: string): Promise<void> {
  if (!seriesId) return;

  try {
    const sermons = await sanityWriteClient.fetch<SeriesSermonRow[]>(
      `*[_type == "sermon" && series._ref == $seriesId] | order(date asc) {
        _id, date, "resourceIds": resourcesMentioned[]._ref
      }`,
      { seriesId },
    );
    if (sermons.length < SERIES_PROMOTION_THRESHOLD) return;

    // Count the longest CURRENT streak of consecutive sermons (by series
    // order) each resource id appears in, ending at the most recent sermon
    // that has it — a resource that appeared weeks 2-4 of a 6-week series
    // and then stopped shouldn't keep getting promoted forever, but one
    // still running should promote as soon as it crosses the threshold.
    const streakFor = new Map<string, number>();
    for (const sermon of sermons) {
      const presentIds = new Set(sermon.resourceIds ?? []);
      // Reset every tracked id's streak that ISN'T present this week, then
      // bump every id that IS present.
      for (const id of [...streakFor.keys()]) {
        if (!presentIds.has(id)) streakFor.set(id, 0);
      }
      for (const id of presentIds) {
        streakFor.set(id, (streakFor.get(id) ?? 0) + 1);
      }
    }

    const toPromote = [...streakFor.entries()]
      .filter(([, streak]) => streak >= SERIES_PROMOTION_THRESHOLD)
      .map(([id]) => id);
    if (toPromote.length === 0) return;

    const tx = sanityWriteClient.transaction();
    tx.patch(seriesId, (p) =>
      p.setIfMissing({ resourcesMentioned: [] }).insert("after", "resourcesMentioned[-1]",
        toPromote.map((id) => ({ _type: "reference", _ref: id, _key: `promoted-${id}` })),
      ),
    );
    // Remove each promoted id from every sermon that currently has it —
    // unset by matching reference value, per sermon.
    for (const sermon of sermons) {
      const idsToRemove = (sermon.resourceIds ?? []).filter((id) => toPromote.includes(id));
      if (idsToRemove.length === 0) continue;
      // Matched by reference value (`_ref==`), not array index — index-based
      // unset paths are unsafe here since removing more than one item from
      // the same array in one patch would shift later indices mid-apply.
      tx.patch(sermon._id, (p) =>
        p.unset(idsToRemove.map((id) => `resourcesMentioned[_ref=="${id}"]`)),
      );
    }
    await tx.commit();

    console.log(
      `[sermon-resources] promoted ${toPromote.length} resource(s) to series ${seriesId} ` +
        `(appeared in ${SERIES_PROMOTION_THRESHOLD}+ consecutive sermons)`,
    );
  } catch (err) {
    console.error(`[sermon-resources] series promotion failed for ${seriesId}:`, err);
  }
}
