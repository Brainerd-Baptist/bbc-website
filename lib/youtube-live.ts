/**
 * lib/youtube-live.ts
 *
 * Checks whether BBC's YouTube channel is ACTUALLY broadcasting live right
 * now, via the YouTube Data API's search endpoint (eventType=live). This is
 * the piece lib/live-schedule.ts's getEasternState() deliberately does NOT
 * do — that function is pure Sunday-schedule clock math with zero network
 * calls, by design (see its doc comment), so the two regular Sunday
 * services detect "live" instantly and for free, with no API dependency.
 *
 * This file exists for the other case: a special, non-Sunday livestream (a
 * Christmas Eve service, a conference, etc. — asked about 2026-10-04) that
 * getEasternState() can never recognize, because it isn't one of the two
 * fixed weekly windows. app/api/live-status/route.ts calls isChannelLive()
 * below ONLY when the schedule says "off" — never during a normal Sunday
 * window — so this never runs during the two services that already work
 * perfectly without it.
 *
 * search.list with eventType=live costs 100 quota units per call (the free
 * daily quota is 10,000 units/day) — far more expensive than the ~1-unit
 * calls in lib/youtube.ts. The `next.revalidate` cache below keeps this to
 * at most one real API call per cache window no matter how many visitors
 * or polling components ask — Next's fetch cache is shared across
 * requests, not per-visitor, so traffic doesn't multiply the cost.
 */

import { YOUTUBE_CHANNEL_ID } from "./sermon-shared";

const API_KEY = process.env.YOUTUBE_API_KEY;

// 5 minutes: quick enough that a special event is picked up shortly after
// going live, long enough that even continuous round-the-clock polling
// stays a small fraction of the daily quota — and this only ever runs
// outside the two Sunday windows in the first place (see doc comment
// above), which is already the lighter-traffic part of the week.
const REVALIDATE_SECONDS = 300;

/**
 * Returns true if the channel has a broadcast live RIGHT NOW. Fails safe to
 * false on any error (missing key, quota exceeded, network hiccup) — same
 * pattern as lib/youtube.ts's getLatestSermon(), so a YouTube API hiccup
 * never breaks the page, it just quietly falls back to "not live."
 */
export async function isChannelLive(): Promise<boolean> {
  if (!API_KEY) return false;

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet` +
    `&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.items) && data.items.length > 0;
  } catch {
    return false;
  }
}
