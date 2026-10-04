"use client";

/**
 * LiveBanner — thin, always-above-the-fold strip linking to /live.
 *
 * Mounted during the regular Sunday live window (pre/live/post) — see the
 * audit at claude/sunday-morning-live-pipeline-audit-2026-10-03.md: before
 * this existed, the homepage had no link to /live at all outside one plain
 * text item buried in the nav drawer. Runs on the exact same Eastern-time
 * clock as the live page itself (lib/live-schedule.ts), so it mounts for
 * roughly 3.5 hours a week and renders nothing the rest of the time —
 * not a distraction during the week by construction, not by styling.
 *
 * Also lights up for a special, non-Sunday livestream (a Christmas Eve
 * service, a conference, etc. — asked about 2026-10-04), via the same
 * YouTube-backed check LivePlayer and the nav badge use — see
 * lib/youtube-live.ts and lib/use-special-live.ts.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEasternState, type LiveState } from "@/lib/live-schedule";
import { useSpecialLiveCheck } from "@/lib/use-special-live";

export default function LiveBanner() {
  const [state, setState] = useState<LiveState>("off");

  useEffect(() => {
    const tick = () => setState(getEasternState(new Date()).state);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const specialLive = useSpecialLiveCheck(state === "off");
  const effectiveState: LiveState = state === "off" && specialLive ? "live" : state;

  if (effectiveState === "off") return null;

  const copy =
    effectiveState === "live" ? "We're live right now" :
    effectiveState === "pre"  ? "Service starts soon — join us live" :
    "Service just ended — the replay is on its way";

  return (
    <Link
      href="/live"
      className="flex items-center justify-center gap-2.5 w-full py-2.5 text-xs font-semibold tracking-widest uppercase text-accent-fg bg-accent transition-opacity hover:opacity-90"
    >
      {effectiveState !== "post" && <span className="w-1.5 h-1.5 rounded-full bg-accent-fg animate-pulse" />}
      {copy}
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h8M8 4l3 3-3 3" />
      </svg>
    </Link>
  );
}
