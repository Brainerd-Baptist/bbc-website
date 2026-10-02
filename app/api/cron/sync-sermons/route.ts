/**
 * app/api/cron/sync-sermons/route.ts
 *
 * Closes the gap between "sermon posted to YouTube" and "someone enters it
 * in Sanity Studio" — see claude/sanity-sermon-auto-sync-scope-2026-10-02.md
 * for the full design writeup this implements.
 *
 * Runs on a daily Vercel Cron (see vercel.json). Each run:
 *   1. Pulls the last SYNC_WINDOW videos from the curated Sermons playlist
 *      (not just the newest one — catches anything a missed run would
 *      otherwise lose, and backfills on first deploy).
 *   2. Checks which of those don't have a Sanity `sermon` doc yet
 *      (deterministic _id: `sermon-${youtubeId}`, so this is naturally
 *      idempotent — running it twice, or on overlapping windows, never
 *      creates a duplicate).
 *   3. For each missing one, assembles a full sermon doc from the same
 *      sources the live site already reads (Tagging sheet, Drive outline,
 *      Libsyn audio feed, YouTube duration) and publishes it directly —
 *      fully automatic, no draft/review step, per Josiah's "as much
 *      automation as possible" direction.
 *   4. Emails a one-line summary of what was added, so an unattended
 *      process still has someone keeping an eye on it.
 *
 * Auth: Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on
 * its own cron invocations when CRON_SECRET is set as an env var — this
 * route requires that header to match, so it can't be triggered by anyone
 * who finds the URL. CRON_SECRET has to be set in Vercel the same way
 * SANITY_API_TOKEN was (Settings → Environment Variables); until it is,
 * this route refuses every request rather than running unprotected.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getRecentSermons,
  getVideoDurations,
  getVideoUploadDates,
  parseYoutubeSermonTitle,
  resolveSermonDate,
} from "@/lib/youtube";
import { getTaggingRowByDate } from "@/lib/sermon-tagging";
import { getSermonNotesByDate } from "@/lib/sermon";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";
import { sanityWriteClient, hasSanityWriteToken } from "@/lib/sanity-write";
import { slugify } from "@/lib/slugify";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// How many recent playlist entries to re-check every run. 15 covers a
// backfill gap of several months of weekly sermons on first deploy, and
// costs nothing extra on later runs since each candidate is a cheap
// existence check before any real work happens.
const SYNC_WINDOW = 15;

// Where the "added a sermon" notification goes. No explicit answer was
// given on this when the feature was scoped, so this defaults to Josiah's
// own address — change here (or move to an env var) if that should go
// somewhere else, e.g. a shared staff inbox.
const NOTIFY_EMAIL = "jking@brainerdbaptist.org";

// Former staff — sermons attributed to either of these (via title parsing
// or the Tagging sheet) are skipped entirely rather than synced, per
// Josiah 2026-10-02: "they're no longer at Brainerd."
const EXCLUDED_SPEAKERS = ["Jim Shaddix", "Kevin Baggett"];

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Flat outline lines → Sanity Portable Text blocks (plain "normal" style —
 * structured vs. scripture-journey distinction isn't preserved, but the
 * content is; anyone can re-style a line in Studio in seconds). */
function toPortableText(lines: string[]) {
  return lines.map((line) => ({
    _type: "block" as const,
    _key: randomKey(),
    style: "normal" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: randomKey(), text: line, marks: [] }],
  }));
}

async function resolveSeriesId(seriesTitle: string): Promise<string | undefined> {
  const title = seriesTitle.trim();
  if (!title) return undefined;

  const existing = await sanityWriteClient.fetch<string | null>(
    `*[_type == "series" && title == $title][0]._id`,
    { title },
  );
  if (existing) return existing;

  const id = `series-${slugify(title)}`;
  await sanityWriteClient.createIfNotExists({
    _id: id,
    _type: "series",
    title,
    slug: { _type: "slug", current: slugify(title) },
    active: true,
  });
  return id;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[sync-sermons] CRON_SECRET is not set — refusing to run unprotected");
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) return unauthorized();

  if (!hasSanityWriteToken()) {
    console.error("[sync-sermons] SANITY_API_TOKEN is not set — nothing to do");
    return NextResponse.json({ error: "SANITY_API_TOKEN not configured" }, { status: 500 });
  }

  // Vercel's own cron invocation never sends this — it always gets the
  // normal SYNC_WINDOW. This is for a manual, one-time catch-up run (e.g.
  // the first time this ever runs against a Sanity dataset with little or
  // nothing in it yet) without changing what the daily job checks forever
  // after. getRecentSermons() paginates past YouTube's 50-per-page cap on
  // its own, so this just bounds how large a single manual run can ask
  // for. Cap of 500: Curtis's preaching on this playlist goes back to
  // February 2022 (confirmed 2026-10-02 as the actual backfill target —
  // ~230 weekly sermons from then to now), so 200 wasn't enough; 500
  // leaves real headroom above that without asking for an unbounded
  // amount in one shot. Re-running with createIfNotExists is always safe.
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 500)
    : SYNC_WINDOW;

  const recent = await getRecentSermons(limit);
  if (recent.length === 0) {
    return NextResponse.json({ ok: true, checked: 0, created: [] });
  }

  const candidateIds = recent.map((s) => `sermon-${s.videoId}`);
  const existingIds = await sanityWriteClient.fetch<string[]>(
    `*[_type == "sermon" && _id in $ids]._id`,
    { ids: candidateIds },
  );
  const existingSet = new Set(existingIds);

  const missing = recent.filter((s) => !existingSet.has(`sermon-${s.videoId}`));
  if (missing.length === 0) {
    return NextResponse.json({ ok: true, checked: recent.length, created: [] });
  }

  const [durations, uploadDates, podcastMap] = await Promise.all([
    getVideoDurations(missing.map((s) => s.videoId)),
    getVideoUploadDates(missing.map((s) => s.videoId)),
    getPodcastAudioMap().catch(() => ({}) as Record<string, string>),
  ]);

  const created: { title: string; date: string }[] = [];
  const skipped: { title: string; speaker: string }[] = [];

  for (const video of missing) {
    try {
      // playlistItems' own publishedAt is the date the video was added to
      // the curated playlist, NOT when it was preached or uploaded — for
      // the historical back-catalog (bulk-added to the playlist long after
      // the fact) every video in that batch reports the same add-date.
      // resolveSermonDate() instead prefers a date parsed straight out of
      // the title (older videos are literally titled "Month D, YYYY |
      // Speaker"), falling back to the nearest Sunday on/before the
      // video's own upload timestamp when no such date is embedded.
      const uploadedAt = uploadDates[video.videoId] || video.publishedAt;
      const date = resolveSermonDate(video.rawTitle, uploadedAt);
      const tagging = await getTaggingRowByDate(date).catch(() => null);

      // Same precedence the live homepage card uses: Tagging sheet (Curtis's
      // hand-verified record) wins when it exists, YouTube title parsing
      // fills in the rest.
      const { title: parsedTitle, passage: parsedPassage, speaker: parsedSpeaker } =
        parseYoutubeSermonTitle(video.rawTitle);
      const title = tagging?.title || parsedTitle || video.title;
      const passage = tagging?.passage || parsedPassage;
      const speaker = tagging?.teacher || parsedSpeaker || "Curtis Hill";

      if (EXCLUDED_SPEAKERS.some((name) => speaker.toLowerCase().includes(name.toLowerCase()))) {
        skipped.push({ title: title || video.title, speaker });
        continue;
      }

      let outlineLines: string[] = [];
      try {
        const notes = await getSermonNotesByDate(date);
        if (notes) outlineLines = notes.outline;
      } catch {
        // No Drive doc for this date yet — fine, sync again tomorrow.
      }

      const key = dateToKey(date);
      const prevDate = new Date(`${date}T12:00:00Z`);
      prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      const prevKey = dateToKey(prevDate.toISOString().slice(0, 10));
      const audioUrl = podcastMap[key] || podcastMap[prevKey] || undefined;

      const seriesId = tagging?.series ? await resolveSeriesId(tagging.series) : undefined;

      const doc = {
        _id: `sermon-${video.videoId}`,
        _type: "sermon",
        title,
        slug: { _type: "slug", current: `${slugify(title)}-${date.replace(/-/g, "")}` },
        date,
        speaker,
        ...(seriesId ? { series: { _type: "reference", _ref: seriesId } } : {}),
        ...(passage ? { passage } : {}),
        youtubeId: video.videoId,
        ...(durations[video.videoId] ? { duration: durations[video.videoId] } : {}),
        ...(audioUrl ? { audioUrl } : {}),
        ...(tagging?.summary ? { description: tagging.summary.slice(0, 300) } : {}),
        ...(outlineLines.length > 0 ? { outline: toPortableText(outlineLines) } : {}),
      };

      await sanityWriteClient.createIfNotExists(doc);
      created.push({ title, date });
    } catch (err) {
      console.error(`[sync-sermons] failed to sync ${video.videoId}:`, err);
      // Keep going — one bad sermon shouldn't block the rest of the batch.
    }
  }

  if (created.length > 0) {
    const lines = created.map((c) => `• ${c.title} — ${c.date}`).join("\n");
    const skippedLines = skipped.length > 0
      ? `\n\nSkipped (former staff):\n${skipped.map((s) => `• ${s.title} — ${s.speaker}`).join("\n")}`
      : "";
    await sendMail({
      to: NOTIFY_EMAIL,
      subject: `Sermon sync: ${created.length} new sermon${created.length === 1 ? "" : "s"} added to Sanity`,
      text: `The sermon auto-sync added ${created.length} sermon${created.length === 1 ? "" : "s"} to Sanity:\n\n${lines}${skippedLines}\n\nWorth a quick glance in Sanity Studio to make sure titles/passages parsed cleanly — nothing's blocking on it, this is just a heads-up.`,
    }).catch((err) => console.error("[sync-sermons] notification email failed:", err));
  }

  return NextResponse.json({ ok: true, checked: recent.length, created, skipped });
}

// Manual trigger for testing — same auth, same logic.
export const POST = GET;

/**
 * One-time cleanup for the 2026-10-02 corrupted backfill: wipes every
 * synced sermon doc so a fresh GET/POST re-syncs them all with the fixed
 * date/speaker/exclusion logic above. Same bearer-secret auth as the sync
 * itself. Safe to leave in place afterward — running it again just means
 * "re-sync everything from scratch," which is always a safe no-duplicate
 * operation given createIfNotExists()'s deterministic _ids.
 */
export async function DELETE(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) return unauthorized();

  if (!hasSanityWriteToken()) {
    return NextResponse.json({ error: "SANITY_API_TOKEN not configured" }, { status: 500 });
  }

  const result = await sanityWriteClient.delete({ query: `*[_type == "sermon"]` });
  return NextResponse.json({ ok: true, deleted: result });
}
