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
export function parseYoutubeSermonTitle(rawTitle: string): {
  title: string;
  passage: string;
  speaker: string;
} {
  let rest = rawTitle.trim();
  let speaker = "";

  const pipeIdx = rest.lastIndexOf("|");
  if (pipeIdx !== -1) {
    speaker = rest.slice(pipeIdx + 1).trim();
    rest = rest.slice(0, pipeIdx).trim();
  }

  let passage = "";
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

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${YOUTUBE_SERMONS_PLAYLIST_ID}&maxResults=${limit}&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 21600 } });
  if (!res.ok) return [];

  const data = await res.json();
  const items: Array<{ snippet: Record<string, unknown> }> = data.items ?? [];

  return items
    .map(({ snippet }) => {
      const videoId = (snippet.resourceId as { videoId?: string } | undefined)?.videoId;
      if (!videoId) return null;
      const { title, passage, speaker } = parseYoutubeSermonTitle(snippet.title as string);
      return {
        videoId,
        rawTitle: snippet.title as string,
        title,
        passage,
        speaker,
        publishedAt: snippet.publishedAt as string,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: snippet.channelTitle as string,
        description: (snippet.description as string) ?? "",
      } satisfies YouTubeSermon;
    })
    .filter((s): s is YouTubeSermon => s !== null);
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

/** "PT1H2M10S" → 62 (rounds to the nearest minute). Returns null if unparseable. */
function isoDurationToMinutes(iso: string): number | null {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const hours = parseInt(m[1] ?? "0", 10);
  const mins = parseInt(m[2] ?? "0", 10);
  const secs = parseInt(m[3] ?? "0", 10);
  return Math.round(hours * 60 + mins + secs / 60);
}
