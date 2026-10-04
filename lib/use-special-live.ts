"use client";

import { useEffect, useState } from "react";

/**
 * Polls /api/live-status's YouTube-backed check for a special, non-Sunday
 * livestream (see lib/youtube-live.ts). Only pass enabled=true when the
 * LOCAL Eastern-clock schedule (lib/live-schedule.ts) already says "off" —
 * during a normal Sunday window that schedule is instant and authoritative
 * on its own, so there's no reason to also hit the network; this hook
 * returns false without polling until the caller flips enabled on.
 *
 * Safe to mount in several components at once (LivePlayer, LiveBanner,
 * Navbar): the underlying API route caches the real YouTube call for
 * several minutes, so polling it from multiple places at once doesn't
 * multiply actual YouTube API usage.
 */
export function useSpecialLiveCheck(enabled: boolean, intervalMs = 60_000): boolean {
  const [specialLive, setSpecialLive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSpecialLive(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch("/api/live-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSpecialLive(Boolean(data.special));
      } catch {
        // Network hiccup — keep the previous value rather than flashing "off".
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled, intervalMs]);

  return specialLive;
}
