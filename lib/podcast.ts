// lib/podcast.ts
// Fetches the Brainerd Baptist Libsyn RSS feed and returns a map of
// YYYYMMDD → MP3 URL so sermon pages can auto-populate their audio player.

const RSS_URL = "https://brainerdbaptistchurch.libsyn.com/rss";

let _cache: { map: Record<string, string>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

/**
 * Returns { "20260913": "https://traffic.libsyn.com/..." } for every episode
 * in the podcast feed. Result is in-process cached for 24 h; Next.js fetch
 * cache handles the network layer (revalidate: 86400).
 */
export async function getPodcastAudioMap(): Promise<Record<string, string>> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.map;
  }

  try {
    const res = await fetch(RSS_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return {};

    const xml = await res.text();
    const map: Record<string, string> = {};

    // Each <item> has one <enclosure url="https://traffic.libsyn.com/secure/.../YYYYMMDD_...mp3" />
    // Pull the date straight from the filename — more reliable than parsing pubDate.
    const re = /<enclosure[^>]+url="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      const url = m[1];
      const dateM = url.match(/\/(\d{8})_/);
      if (dateM) map[dateM[1]] = url;
    }

    _cache = { map, fetchedAt: Date.now() };
    return map;
  } catch {
    return {};
  }
}

/**
 * Convert a YYYY-MM-DD date string (as stored in sermon data) to the
 * YYYYMMDD key used by the podcast map.
 */
export function dateToKey(date: string): string {
  return date.replace(/-/g, "");
}
