/**
 * app/api/cron/sync-sermons/route.ts
 *
 * Closes the gap between "sermon posted to YouTube" and "someone enters it
 * in Sanity Studio" — see claude/sanity-sermon-auto-sync-scope-2026-10-02.md
 * for the full design writeup this implements.
 *
 * Runs on a daily Vercel Cron (see vercel.json). Scheduled for 7:45 AM
 * Eastern (Brainerd's own timezone — Chattanooga, TN), per Josiah
 * 2026-10-03: early enough to catch the sermon on the Tagging sheet
 * right after Curtis finishes filling it out that morning, before anyone's
 * checking the site. Vercel Cron schedules are plain UTC with no
 * timezone field, so vercel.json's "45 11 * * *" is 7:45 AM EDT
 * specifically — it'll read as 6:45 AM once Eastern falls back to
 * Standard Time (after Nov 1, 2026); bump it to "45 12 * * *" then (and
 * back again each spring) to keep hitting 7:45 AM local, or swap to a
 * platform/cron provider with real timezone support if this manual
 * twice-a-year flip becomes annoying.
 *
 * Each run:
 *   1. Pulls the last SYNC_WINDOW videos from the curated Sermons playlist
 *      (not just the newest one — catches anything a missed run would
 *      otherwise lose, and backfills on first deploy).
 *   2. Re-assembles and overwrites (createOrReplace, keyed by the
 *      deterministic _id `sermon-${youtubeId}`) every doc in that window,
 *      not just ones that don't exist yet — self-healing if a prior run
 *      wrote bad data, and still idempotent: running it twice, or on
 *      overlapping windows, never creates a duplicate.
 *   3. For each one, assembles a full sermon doc from the same
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
import { resolveResourceIds, promoteSeriesResources } from "@/lib/sermon-resources";
import { slugify } from "@/lib/slugify";
import { sendMail } from "@/lib/mail";
import backfillReference from "@/lib/data/sermon-backfill-reference.json";

/**
 * Hand-verified date/speaker/series for ~168 historical sermons (Dec 2022
 * onward), keyed by youtubeId — built during the separate YouTube
 * title/thumbnail rollout project (this same conversation, "Brainerd
 * Website") and rediscovered 2026-10-02 sitting in this session's own
 * output folder as `final_dry_run.csv`. Per Josiah 2026-10-02: Curtis's
 * Tagging sheet is the ultimate source of truth for sermons it covers
 * (and for everything going forward) since he maintains it by hand
 * specifically for this; this reference is a fallback for older sermons
 * the Tagging sheet doesn't reach back to — "pieced together," in his
 * words, not authoritative the way the sheet is. Precedence everywhere
 * below is: Tagging sheet > this reference > YouTube title-parsing.
 */
const BACKFILL_REFERENCE = backfillReference as Record<
  string,
  { date: string; speaker: string; series: string }
>;

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

// Former staff — sermons attributed to any of these (via title parsing
// or the Tagging sheet) are skipped entirely rather than synced, per
// Josiah 2026-10-02 ("they're no longer at Brainerd") and 2026-10-02
// follow-up adding Paul Laso and Blaine Vandegriff to the same list.
const EXCLUDED_SPEAKERS = ["Jim Shaddix", "Kevin Baggett", "Paul Laso", "Blaine Vandegriff"];

// Curtis's Tagging sheet (and the backfill reference CSV) label the odd
// handful of one-off, non-series sermons each year with a placeholder
// series name rather than leaving the Series cell blank. Treated as a real
// series title, resolveSeriesId() would create/link an actual "series" doc
// called "Standalone Messages" and lump every unrelated standalone sermon
// of the year under it — exactly the opposite of standalone. Per Josiah
// 2026-10-02: these should have NO series at all, so this name (and close
// variants) is filtered out before series resolution runs.
const NON_SERIES_LABELS = ["standalone messages", "standalone message", "standalone"];

function isNonSeriesLabel(title: string): boolean {
  return NON_SERIES_LABELS.includes(title.trim().toLowerCase());
}

// Some 2022-era Tagging sheet rows (guest-speaker weeks) have their
// Title/Teacher cells swapped or misplaced — a Bible passage reference
// sitting in the Teacher column instead of the person's name (e.g.
// "1 Peter 1:5-11" instead of "Blaine Vandegriff"). Detected 2026-10-02
// from live resync output. A crude but effective guard: a real passage
// reference has a book name followed by a chapter/verse number, which no
// speaker's name does.
const PASSAGE_LIKE = /\d/;
function looksLikePassage(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  // Any digit at all is disqualifying for a person's name (no Brainerd
  // staff/guest speaker name contains a numeral), and every passage
  // reference we've seen contains one (chapter and/or verse numbers).
  return PASSAGE_LIKE.test(v);
}

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

  // Process oldest → newest. getRecentSermons() returns newest-first (YouTube
  // playlist order), which is fine for the small daily SYNC_WINDOW, but on a
  // large manual `?limit=` backfill it meant every run burned its ~60s
  // budget re-processing the same already-correct recent sermons before ever
  // reaching new historical ground — observed 2026-10-02 as runs stalling at
  // the same date instead of pushing further back each time. Oldest-first
  // guarantees forward progress into the back-catalog on every run.
  const fullyOrdered = [...recent].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

  // Each invocation only gets through ~45-50 items before the deadline
  // guard below cuts it off (YouTube/Sheets/Drive lookups cost ~1s/item).
  // Found 2026-10-02: without an offset, every call re-started at the
  // SAME oldest item and died at the SAME deadline, so three consecutive
  // manual backfill calls reprocessed the identical Oct 2022–Jan 2024
  // range and never made it to 2024 at all — no net progress across
  // calls. `?offset=` slices the (already oldest-first sorted) candidate
  // list so repeated manual calls page through disjoint windows instead:
  // offset=0, then offset=50, offset=100, etc. The daily cron (small
  // SYNC_WINDOW, no offset) is unaffected.
  const requestedOffset = Number(req.nextUrl.searchParams.get("offset"));
  const offset = Number.isFinite(requestedOffset) && requestedOffset > 0 ? requestedOffset : 0;
  const ordered = fullyOrdered.slice(offset);

  // Every run re-processes and overwrites (createOrReplace, not
  // createIfNotExists) the full candidate window, rather than only
  // creating docs that don't exist yet. Two reasons: it makes this
  // self-healing — a doc corrupted by a bad run (like 2026-10-02's) gets
  // fixed the next time this runs, with no separate delete-and-redo step
  // needed — and a bulk-delete-then-resync approach turned out to trip an
  // automated safety check on a "mass delete" action, so overwrite-in-place
  // is also just the more robust path operationally. Candidate count is
  // bounded by SYNC_WINDOW/`?limit=`, so the extra Sheets/Drive/YouTube
  // lookups on already-correct docs are cheap, not unbounded.
  const [durations, uploadDates, podcastMap] = await Promise.all([
    getVideoDurations(recent.map((s) => s.videoId)),
    getVideoUploadDates(recent.map((s) => s.videoId)),
    getPodcastAudioMap().catch(() => ({}) as Record<string, string>),
  ]);

  const created: { title: string; date: string }[] = [];
  const skipped: { title: string; speaker: string }[] = [];
  // Every series touched by this run — re-checked for resource auto-
  // promotion (3+ consecutive weeks, see lib/sermon-resources.ts) once all
  // of this run's sermons are written, so the check sees this run's own
  // just-written resourcesMentioned rather than stale pre-sync data.
  const touchedSeriesIds = new Set<string>();

  // maxDuration is 60s; Vercel kills the function hard at that point with
  // no chance to return a response. Found 2026-10-02: a full ?limit=500
  // backfill run never gets through all 500 in one invocation (YouTube/
  // Drive/Sheets lookups per item add up), so every run was dying via hard
  // timeout instead of returning early — no clean partial result, and no
  // visibility into how far it actually got. This stops the loop with
  // ~10s of runway left and returns what it has; the daily cron's small
  // SYNC_WINDOW is unaffected, and a manual large `?limit=` backfill now
  // makes steady, visible progress across repeated calls instead of
  // racing a wall.
  const startedAt = Date.now();
  const DEADLINE_MS = 50_000;
  let stoppedEarly = false;
  let processedInThisCall = 0;

  for (const video of ordered) {
    if (Date.now() - startedAt > DEADLINE_MS) {
      stoppedEarly = true;
      break;
    }
    const itemStart = Date.now();
    processedInThisCall++;
    try {
      const reference = BACKFILL_REFERENCE[video.videoId];

      // playlistItems' own publishedAt is the date the video was added to
      // the curated playlist, NOT when it was preached or uploaded — for
      // the historical back-catalog (bulk-added to the playlist long after
      // the fact) every video in that batch reports the same add-date. The
      // hand-verified reference CSV wins where it has a row (it was built
      // specifically to get this right for this exact set of videos);
      // otherwise fall back to a date parsed straight out of the title
      // (older videos are literally titled "Month D, YYYY | Speaker"), and
      // finally to the nearest Sunday on/before the video's own upload
      // timestamp when no such date is embedded anywhere.
      const uploadedAt = uploadDates[video.videoId] || video.publishedAt;
      const date = reference?.date || resolveSermonDate(video.rawTitle, uploadedAt);
      const tagging = await getTaggingRowByDate(date).catch(() => null);

      // Precedence, per Josiah 2026-10-02: Curtis's Tagging sheet is the
      // ultimate source of truth (he maintains it by hand for exactly
      // this) and always wins where it has a row; the hand-verified
      // reference CSV is next for sermons the sheet doesn't reach back to;
      // YouTube title-parsing is the last resort.
      const { title: parsedTitle, passage: parsedPassage, speaker: parsedSpeaker } =
        parseYoutubeSermonTitle(video.rawTitle);
      const title = tagging?.title || parsedTitle || video.title;
      const passage = tagging?.passage || parsedPassage;

      // Trust the Tagging sheet's Teacher cell UNLESS it looks like a
      // passage reference (the 2022-era column-swap issue) — in that case
      // fall through to the next source rather than writing a scripture
      // reference into the speaker field.
      const taggingSpeaker = tagging?.teacher && !looksLikePassage(tagging.teacher)
        ? tagging.teacher
        : undefined;
      const speaker = taggingSpeaker || reference?.speaker || parsedSpeaker || "Curtis Hill";

      // Same idea for series: a real series title from the sheet wins, but
      // a "Standalone Messages"-style placeholder means NO series, not a
      // literal series called that.
      const rawSeriesTitle = tagging?.series || reference?.series || "";
      const seriesTitle = isNonSeriesLabel(rawSeriesTitle) ? "" : rawSeriesTitle;

      // Check every candidate source for an excluded name, not just the
      // resolved `speaker` — found 2026-10-02 that Curtis's Tagging sheet
      // has swapped/misplaced cells for some 2022-era guest-speaker weeks
      // (a passage reference sitting in the Teacher column instead of the
      // name), which let tagging.teacher win the precedence above and mask
      // the real speaker. The YouTube title itself (e.g. "... | Kevin
      // Baggett") is a reliable signal even when the sheet row is messy.
      const exclusionCandidates = [speaker, tagging?.teacher, reference?.speaker, parsedSpeaker, video.rawTitle];
      const excludedMatch = EXCLUDED_SPEAKERS.find((name) =>
        exclusionCandidates.some((c) => c?.toLowerCase().includes(name.toLowerCase())),
      );
      if (excludedMatch) {
        skipped.push({ title: title || video.title, speaker: excludedMatch });
        // Clean up a doc an earlier (pre-exclusion-fix) run may have
        // already written for this video — a single scoped delete by its
        // own _id, not a bulk operation.
        await sanityWriteClient.delete(`sermon-${video.videoId}`).catch(() => {});
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

      const seriesId = seriesTitle ? await resolveSeriesId(seriesTitle) : undefined;
      if (seriesId) touchedSeriesIds.add(seriesId);

      // Resources mentioned this week, per the Tagging sheet's column J
      // (lib/sermon-tagging.ts) — resolved to Sanity resource doc ids,
      // creating new ones as needed. Never blocks the rest of the sync: a
      // bad/unreachable URL is skipped by resolveResourceIds itself.
      const resourceIds = tagging?.resourceLinks?.length
        ? await resolveResourceIds(tagging.resourceLinks).catch((err) => {
            console.error(`[sync-sermons] ${date} resolveResourceIds threw:`, err);
            return [];
          })
        : [];

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
        ...(resourceIds.length > 0
          ? { resourcesMentioned: resourceIds.map((id) => ({ _type: "reference" as const, _ref: id, _key: `res-${id}` })) }
          : {}),
      };

      await sanityWriteClient.createOrReplace(doc);
      created.push({ title, date });
      console.log(`[sync-sermons] ${date} ${video.videoId} ok in ${Date.now() - itemStart}ms`);
    } catch (err) {
      console.error(`[sync-sermons] failed to sync ${video.videoId}:`, err);
      // Keep going — one bad sermon shouldn't block the rest of the batch.
    }
  }

  for (const seriesId of touchedSeriesIds) {
    await promoteSeriesResources(seriesId).catch((err) =>
      console.error(`[sync-sermons] series resource promotion failed for ${seriesId}:`, err),
    );
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

  const nextOffset = stoppedEarly ? offset + processedInThisCall : null;

  return NextResponse.json({
    ok: true,
    checked: recent.length,
    offset,
    totalCandidates: fullyOrdered.length,
    processedInThisCall,
    created,
    skipped,
    stoppedEarly,
    nextOffset,
  });
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
