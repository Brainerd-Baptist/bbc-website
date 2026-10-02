// ── YouTube Data API v3 helpers ──────────────────────────────────────────────
// Requires YOUTUBE_API_KEY in your environment variables.
// Free quota: 10,000 units/day. This fetch costs ~1 unit per page load
// (cached by Next.js, so realistically ~1 unit per deploy).
//
// This reads the curated "Sermons" playlist — same ID as the RSS feed in
// lib/sermon.ts (YOUTUBE_SERMONS_PLAYLIST_ID) — NOT the channel's general
// uploads feed, which also contains clips/announcements/etc.

import { YOUTUBE_SERMONS_PLAYLIST_ID } from "./sermon";

export interface YouTubeSermon {
  videoId: string;
  /** Full, unparsed YouTube video title. */
  rawTitle: string;
  /** Cleaned sermon title with the trailing "(Passage) | Speaker" stripped. */
  title: string;
  /** Scripture passage parsed out of the title's parenthetical, if present. */
  passage: string;
  /** Speaker parsed out of the title's "| Name" suffix, if present. */
  speaker: string;
  publishedAt: string; // ISO 8601
  thumbnail: string;   // maxresdefault URL
  channelTitle: string;
  description: string;
}

const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Parses BBC's YouTube sermon-title convention:
 *   "Caring for Your Conscience, Part 1: A Good Clear Conscience (Selected Scriptures) | Curtis Hill"
 * into { title, passage, speaker }. Falls back gracefully — a video title
 * missing the " | Speaker" suffix or the "(Passage)" parenthetical just
 * yields an empty speaker/passage rather than throwing.
 */
/** A passage reference has a number in it (chapter/verse); no speaker's
 * name does. Crude but effective — see parseYoutubeSermonTitle below. */
function looksLikePassageSegment(value: string): boolean {
  return /\d/.test(value.trim());
}

export function parseYoutubeSermonTitle(rawTitle: string): {
  title: string;
  passage: string;
  speaker: string;
} {
  let rest = rawTitle.trim();
  let speaker = "";
  let passage = "";

  // Most titles follow "Title (Passage) | Speaker" — one pipe, speaker
  // last. But some 2022-era guest-speaker uploads instead use
  // "Month D, YYYY |  Speaker | Passage" — TWO pipes, passage last
  // instead of speaker. Found 2026-10-02: taking "whatever's after the
  // last pipe" as the speaker on one of these put a passage reference
  // ("1 Peter 1:5-11") straight into the speaker field. Detect that
  // 3-segment shape specifically — if the last segment looks like a
  // passage and the one before it doesn't, that middle segment is the
  // speaker, not the last one.
  const segments = rest.split("|").map((s) => s.trim());
  if (
    segments.length === 3 &&
    looksLikePassageSegment(segments[2]) &&
    !looksLikePassageSegment(segments[1])
  ) {
    speaker = segments[1];
    passage = segments[2];
    rest = segments[0];
    return { title: rest, passage, speaker };
  }

  const pipeIdx = rest.lastIndexOf("|");
  if (pipeIdx !== -1) {
    speaker = rest.slice(pipeIdx + 1).trim();
    rest = rest.slice(0, pipeIdx).trim();
  }

  const parenMatch = rest.match(/\(([^()]+)\)\s*$/);
  if (parenMatch) {
    passage = parenMatch[1].trim();
    rest = rest.slice(0, parenMatch.index).trim();
  }

  return { title: rest, passage, speaker };
}

/**
 * Returns the most recent video from the curated Sermons playlist.
 * Revalidates every 6 hours so the sermon card stays current without hammering the API.
 */
export async function getLatestSermon(): Promise<YouTubeSermon | null> {
  if (!API_KEY) return null;

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_SERMONS_PLAYLIST_ID}&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url, {
    next: { revalidate: 21600 }, // cache 6h
  });

  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0]?.snippet;
  if (!item) return null;

  const videoId = item.resourceId?.videoId;
  if (!videoId) return null;

  const { title, passage, speaker } = parseYoutubeSermonTitle(item.title);

  return {
    videoId,
    rawTitle: item.title,
    title,
    passage,
    speaker,
    publishedAt: item.publishedAt,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    channelTitle: item.channelTitle,
    description: item.description,
  };
}

/**
 * Formats an ISO 8601 date as "Month D, YYYY" — e.g. "September 14, 2026".
 */
export function formatSermonDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

/**
 * Returns the most recent `limit` videos from the curated Sermons playlist,
 * newest first — unlike getLatestSermon() above (which only ever fetches
 * the single latest one). Used by the sermon auto-sync cron so a single
 * missed run doesn't permanently lose a sermon: each run re-checks the last
 * several weeks' worth of uploads against what's already in Sanity, not
 * just whatever's newest right now.
 */
export async function getRecentSermons(limit = 15): Promise<YouTubeSermon[]> {
  if (!API_KEY) return [];

  const results: YouTubeSermon[] = [];
  let pageToken = "";

  // playlistItems caps maxResults at 50 per call — paginate for anything
  // bigger (a full-history backfill request, say) rather than silently
  // truncating at page one.
  while (results.length < limit) {
    const pageSize = Math.min(50, limit - results.length);
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_SERMONS_PLAYLIST_ID}` +
      `&maxResults=${pageSize}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) break;

    const data = await res.json();
    const items: Array<{ snippet: Record<string, unknown> }> = data.items ?? [];

    for (const { snippet } of items) {
      const videoId = (snippet.resourceId as { videoId?: string } | undefined)?.videoId;
      if (!videoId) continue;
      const { title, passage, speaker } = parseYoutubeSermonTitle(snippet.title as string);
      results.push({
        videoId,
        rawTitle: snippet.title as string,
        title,
        passage,
        speaker,
        publishedAt: snippet.publishedAt as string,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: snippet.channelTitle as string,
        description: (snippet.description as string) ?? "",
      });
    }

    pageToken = data.nextPageToken ?? "";
    if (!pageToken || items.length === 0) break;
  }

  return results;
}

/**
 * Looks up each video's duration via the Data API's contentDetails, in one
 * batched call. Returns { videoId: "42 min" }, rounding to the nearest
 * minute (good enough for display — matches the schema's own example,
 * '"42 min"'). Skips anything the API doesn't return cleanly rather than
 * throwing — duration is a nice-to-have on a synced sermon, not a blocker.
 */
export async function getVideoDurations(videoIds: string[]): Promise<Record<string, string>> {
  if (!API_KEY || videoIds.length === 0) return {};

  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 21600 } });
  if (!res.ok) return {};

  const data = await res.json();
  const items: Array<{ id: string; contentDetails?: { duration?: string } }> = data.items ?? [];

  const out: Record<string, string> = {};
  for (const item of items) {
    const iso = item.contentDetails?.duration;
    if (!iso) continue;
    const minutes = isoDurationToMinutes(iso);
    if (minutes !== null) out[item.id] = `${minutes} min`;
  }
  return out;
}

/**
 * Each video's own upload timestamp (videos.snippet.publishedAt) — NOT the
 * same as playlistItems.snippet.publishedAt (the playlist-add date, see
 * resolveSermonDate() above). Used as the fallback preach-date source when
 * a title has no embedded date string. Batched into one call alongside
 * duration where possible is a nice-to-have, kept separate here for
 * clarity and because callers already have getVideoDurations wired in.
 */
export async function getVideoUploadDates(videoIds: string[]): Promise<Record<string, string>> {
  if (!API_KEY || videoIds.length === 0) return {};

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds.join(",")}&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 21600 } });
  if (!res.ok) return {};

  const data = await res.json();
  const items: Array<{ id: string; snippet?: { publishedAt?: string } }> = data.items ?? [];

  const out: Record<string, string> = {};
  for (const item of items) {
    if (item.snippet?.publishedAt) out[item.id] = item.snippet.publishedAt;
  }
  return out;
}

/** "PT1H2M10S" → 62 (rounds to the nearest minute). Returns null if unparseable. */
function isoDurationToMinutes(iso: string): number | null {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const hours = parseInt(m[1] ?? "0", 10);
  const mins = parseInt(m[2] ?? "0", 10);
  const secs = parseInt(m[3] ?? "0", 10);
  return Math.round(hours * 60 + mins + secs / 60);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Pulls an explicit calendar date out of a raw YouTube title, e.g.
 * "June 12, 2022 | Kevin Baggett" → "2022-06-12". Older-era sermon videos
 * were titled with the preach date directly (no separate sermon title),
 * which turns out to be the ONLY reliable source for when they were
 * actually preached — see resolveSermonDate() below for why.
 */
export function extractDateFromTitle(rawTitle: string): string | null {
  const re = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/;
  const m = rawTitle.match(re);
  if (!m) return null;
  const monthIdx = MONTHS.indexOf(m[1]);
  if (monthIdx === -1) return null;
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (!day || !year) return null;
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Sunday on or before the given "YYYY-MM-DD" date, as "YYYY-MM-DD". */
function priorSunday(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  const dow = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

/**
 * Resolves the actual date a sermon was PREACHED, as distinct from either
 * of the two dates YouTube can hand us — both of which are unreliable on
 * their own:
 *   - playlistItems' publishedAt is when the video was ADDED to the
 *     curated Sermons playlist, not when it was uploaded or preached. For
 *     the historical back-catalog (bulk-added to the playlist in one
 *     batch long after the fact), every video in that batch reports the
 *     SAME add-date — discovered 2026-10-02 when a 200-sermon backfill
 *     put ~210 different sermons on the identical date.
 *   - the video's own upload date (videos.snippet.publishedAt) is closer
 *     but still not the preach date: sermons are typically uploaded a few
 *     days later, Mon/Tue/Wed following the Sunday they were preached.
 * Precedence: a date string embedded in the title itself (the
 * "Month D, YYYY | Speaker" convention used for older videos) is the most
 * trustworthy source where present. Otherwise, fall back to the nearest
 * Sunday on or before the upload date.
 */
export function resolveSermonDate(rawTitle: string, uploadedAtIso: string): string {
  const titleDate = extractDateFromTitle(rawTitle);
  if (titleDate) return titleDate;
  return priorSunday(uploadedAtIso.slice(0, 10));
}
