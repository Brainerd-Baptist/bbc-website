/**
 * lib/youtube-live.ts
 *
 * Checks whether BBC's YouTube channel is ACTUALLY broadcasting live right
 * now, via the YouTube Data API. This is the piece lib/live-schedule.ts's
 * getEasternState() deliberately does NOT do — that function is pure
 * Sunday-schedule clock math with zero network calls, by design (see its
 * doc comment), so the two regular Sunday services detect "live" instantly
 * and for free, with no API dependency.
 *
 * This file exists for the other case: a special, non-Sunday livestream (a
 * Christmas Eve service, a conference, etc. — asked about 2026-10-04) that
 * getEasternState() can never recognize, because it isn't one of the two
 * fixed weekly windows. app/api/live-status/route.ts calls isChannelLive()
 * below ONLY when the schedule says "off" — never during a normal Sunday
 * window — so this never runs during the two services that already work
 * perfectly without it.
 *
 * Two-step check (fixed 2026-10-04 — see below for why one step isn't
 * enough):
 *   1. search.list?eventType=live&type=video — cheap-ish (100 quota units)
 *      way to find candidate video IDs the channel has EVER marked live.
 *   2. videos.list?part=liveStreamingDetails&id=<ids> — ~1 quota unit per
 *      call — the authoritative check. A video only counts as live right
 *      now if liveStreamingDetails.actualStartTime is set AND
 *      actualEndTime is NOT set.
 *
 * Why step 2 is required: step 1 alone is NOT reliable. Confirmed live in
 * production 2026-10-04 — hours after the 11:00 AM Sunday service had
 * ended, search.list?eventType=live was STILL returning that morning's
 * finished service video with snippet.liveBroadcastContent: "live". This
 * is a known YouTube API quirk: the search index's cached
 * liveBroadcastContent field can lag well behind the real broadcast state.
 * videos.list's liveStreamingDetails.actualEndTime, by contrast, is set
 * the moment the broadcaster actually ends the stream, so it's the field
 * that's actually trustworthy for "is this truly live right now."
 *
 * The `next.revalidate` cache below keeps this to at most one pair of real
 * API calls per cache window no matter how many visitors or polling
 * components ask — Next's fetch cache is shared across requests, not
 * per-visitor, so traffic doesn't multiply the cost.
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

  try {
    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search?part=snippet` +
      `&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;

    const searchRes = await fetch(searchUrl, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!searchRes.ok) return false;
    const searchData = await searchRes.json();
    const videoIds: string[] = Array.isArray(searchData.items)
      ? searchData.items
          .map((item: any) => item.id?.videoId)
          .filter((id: unknown): id is string => typeof id === "string")
      : [];

    if (videoIds.length === 0) return false;

    // search.list's liveBroadcastContent can stay stale for hours after a
    // broadcast truly ends (see doc comment above) — confirm against
    // videos.list's liveStreamingDetails, which reflects the real,
    // up-to-the-minute broadcast state, before trusting any candidate.
    const videosUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails` +
      `&id=${videoIds.join(",")}&key=${API_KEY}`;

    const videosRes = await fetch(videosUrl, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!videosRes.ok) return false;
    const videosData = await videosRes.json();
    if (!Array.isArray(videosData.items)) return false;

    return videosData.items.some((item: any) => {
      const details = item.liveStreamingDetails;
      return !!details?.actualStartTime && !details?.actualEndTime;
    });
  } catch {
    return false;
  }
}
