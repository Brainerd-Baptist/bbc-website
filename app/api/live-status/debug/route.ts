/**
 * TEMPORARY diagnostic route — added 2026-10-04 to investigate why
 * /api/live-status reported "special: true" Sunday evening, hours after
 * both regular services ended. Returns the raw YouTube search.list
 * response (titles/ids/liveBroadcastContent only, never the API key) so
 * we can see exactly what isChannelLive() is matching. Delete this file
 * once the cause is confirmed and fixed — it is not meant to ship long-term.
 */

import { NextResponse } from "next/server";
import { YOUTUBE_CHANNEL_ID } from "@/lib/sermon-shared";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "no API key configured" }, { status: 500 });
  }

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet` +
    `&channelId=${YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  const items = (data.items ?? []).map((item: any) => ({
    videoId: item.id?.videoId,
    title: item.snippet?.title,
    liveBroadcastContent: item.snippet?.liveBroadcastContent,
    publishedAt: item.snippet?.publishedAt,
    description: (item.snippet?.description ?? "").slice(0, 120),
  }));

  return NextResponse.json({ ok: res.ok, status: res.status, itemCount: items.length, items });
}
