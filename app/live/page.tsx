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
import LivePlayer from "@/components/live/LivePlayer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Watch Live — Brainerd Baptist Church",
  description:
    "Watch Brainerd Baptist Church live every Sunday at 8:30 AM and 11:00 AM ET. Catch the latest sermon or join us for our next service.",
  openGraph: {
    title: "Watch Live — Brainerd Baptist Church",
    description: "Live worship every Sunday morning at 8:30 AM and 11:00 AM ET.",
  },
};

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ fileId?: string }>;
}) {
  const { fileId } = await searchParams;
  const sermon = await getLatestSermon(fileId);
  return <LivePlayer sermon={sermon} />;
}
