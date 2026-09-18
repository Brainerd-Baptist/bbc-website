// ── YouTube Data API v3 helpers ──────────────────────────────────────────────
// Requires YOUTUBE_API_KEY in your environment variables.
// Free quota: 10,000 units/day. This fetch costs ~3 units per page load
// (cached by Next.js, so realistically ~3 units per deploy).

export interface YouTubeSermon {
  videoId: string;
  title: string;
  publishedAt: string; // ISO 8601
  thumbnail: string;   // maxresdefault URL
  channelTitle: string;
  description: string;
}

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_HANDLE = "brainerdbaptist"; // @brainerdbaptist

/**
 * Fetches the uploads playlist ID for the BBC YouTube channel.
 * Cached indefinitely — the playlist ID never changes.
 */
async function getUploadsPlaylistId(): Promise<string | null> {
  if (!API_KEY) return null;

  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${API_KEY}`;
  const res = await fetch(url, {
    next: { revalidate: 86400 }, // cache 24h — playlist ID never changes
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

/**
 * Returns the latest video from the BBC uploads playlist.
 * Revalidates every 6 hours so the sermon card stays current without hammering the API.
 */
export async function getLatestSermon(): Promise<YouTubeSermon | null> {
  if (!API_KEY) return null;

  const playlistId = await getUploadsPlaylistId();
  if (!playlistId) return null;

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${API_KEY}`;
  const res = await fetch(url, {
    next: { revalidate: 21600 }, // cache 6h
  });

  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items?.[0]?.snippet;
  if (!item) return null;

  const videoId = item.resourceId?.videoId;
  if (!videoId) return null;

  return {
    videoId,
    title: item.title,
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
