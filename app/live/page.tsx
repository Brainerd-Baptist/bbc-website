/**
 * /live — Brainerd Baptist Live Stream page
 *
 * Server component shell: fetches the latest sermon data (ISR 1hr),
 * then renders the LivePlayer client component for time-based state detection.
 *
 * States (determined client-side in LivePlayer):
 *   live  — during Sunday services (8:30–9:45 AM or 11:00 AM–12:15 PM ET)
 *   pre   — 20 min before service (Starting soon…)
 *   post  — 45 min after service (Replay loading…)
 *   off   — all other times (latest sermon + service times)
 */

import type { Metadata } from "next";
import { getLatestSermon } from "@/lib/sermon";
import { getEasternState, getEasternDateString } from "@/lib/live-schedule";
import { getTodayLiveOverlay } from "@/lib/live-today";
import LivePlayer from "@/components/live/LivePlayer";

export const metadata: Metadata = {
  title: "Watch Live — Brainerd Baptist Church",
  description:
    "Watch Brainerd Baptist Church live every Sunday at 8:30 AM and 11:00 AM ET. Catch the latest sermon or join us for our next service.",
  openGraph: {
    title: "Watch Live — Brainerd Baptist Church",
    description: "Live worship every Sunday morning at 8:30 AM and 11:00 AM ET.",
  },
};

// Never cache this page at the CDN — fileId param must always reach the server
export const dynamic = "force-dynamic";

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ fileId?: string }>;
}) {
  const { fileId } = await searchParams;
  const sermon = await getLatestSermon(fileId);

  // During the live window (and only then), prefer TODAY's actual Tagging
  // sheet row over the stale getLatestSermon() result, which during this
  // window always resolves to last week's already-synced sermon — see
  // lib/live-today.ts's doc comment. Gated on the same Eastern-time clock
  // the player itself uses, so this never runs on a weekday page load and
  // automatically stops the moment the live window ends.
  const now = new Date();
  const { state } = getEasternState(now);
  const inLiveWindow = !fileId && (state === "pre" || state === "live" || state === "post");

  let liveSermon = sermon;
  let isStaleFallback = false;

  if (inLiveWindow) {
    const overlay = await getTodayLiveOverlay(getEasternDateString(now));
    if (overlay) {
      liveSermon = {
        ...sermon,
        title:   overlay.title,
        passage: overlay.passage,
        speaker: overlay.speaker,
        series:  overlay.series,
        part:    overlay.part,
        summary: overlay.summary,
        date:    overlay.date,
        outline: overlay.outline,
        outlineType: overlay.outlineType,
        // No synced video for today's sermon yet — keep whatever "watch
        // elsewhere" fallback getLatestSermon() already resolved (last
        // week's internal page or the channel), rather than claiming a
        // /sermons/[slug] page exists for a sermon not synced yet.
      };
    } else {
      // Curtis's row isn't in the Tagging sheet yet — fall back to the
      // existing (stale, last week's) sermon rather than showing nothing,
      // and tell the UI so it can say so honestly instead of presenting
      // last week's facts as if they were today's.
      isStaleFallback = true;
    }
  }

  return <LivePlayer sermon={liveSermon} isStaleFallback={isStaleFallback} />;
}
