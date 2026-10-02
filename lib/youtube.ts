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
