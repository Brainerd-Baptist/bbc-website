/**
 * lib/live-schedule.ts
 *
 * Single source of truth for "is a Sunday service live right now" — pure
 * Eastern-time clock math, zero dependencies, safe to import from both
 * server components (app/live/page.tsx) and "use client" components
 * (LivePlayer, Navbar, LiveBanner). No network calls, no Sanity/YouTube
 * data — this only ever answers "what time is it in Chattanooga."
 *
 * Previously this lived only inside components/live/LivePlayer.tsx, which
 * meant the live player knew when a service was live but nothing else on
 * the site (homepage, nav) could ask the same question — see
 * claude/sunday-morning-live-pipeline-audit-2026-10-03.md. Extracted here
 * 2026-10-03 so the homepage banner and nav badge can light up on the exact
 * same clock the player itself uses, instead of drifting out of sync with
 * a second copy of this logic.
 */

export type LiveState = "pre" | "live" | "post" | "off";

export interface ServiceWindow {
  label: string;
  startH: number; startM: number;
  endH:   number; endM:   number;
}

export const SERVICES: ServiceWindow[] = [
  { label: "8:30 AM Service",  startH: 8,  startM: 30, endH: 9,  endM: 45 },
  { label: "11:00 AM Service", startH: 11, startM: 0,  endH: 12, endM: 15 },
];

export const PRE_MINUTES  = 20;
export const POST_MINUTES = 45;

export interface LiveStateInfo {
  state:        LiveState;
  service:      ServiceWindow | null;
  minutesUntil: number;
}

export function getEasternState(now: Date): LiveStateInfo {
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et    = new Date(etStr);
  const dow   = et.getDay();
  const total = et.getHours() * 60 + et.getMinutes();

  if (dow !== 0) return { state: "off", service: null, minutesUntil: 0 };

  for (const svc of SERVICES) {
    const start = svc.startH * 60 + svc.startM;
    const end   = svc.endH   * 60 + svc.endM;
    if (total >= start && total < end)
      return { state: "live", service: svc, minutesUntil: 0 };
    if (total >= start - PRE_MINUTES && total < start)
      return { state: "pre",  service: svc, minutesUntil: start - total };
    if (total >= end && total < end + POST_MINUTES)
      return { state: "post", service: svc, minutesUntil: 0 };
  }
  return { state: "off", service: null, minutesUntil: 0 };
}

/**
 * Today's calendar date in US Eastern time, as "YYYY-MM-DD" — used to key
 * live-only note drafts and the live-page data overlay to the REAL
 * calendar date, independent of whatever stale sermon getLatestSermon()
 * may have resolved (always last week's, during the live window — see the
 * audit doc above). en-CA locale formats as YYYY-MM-DD directly.
 */
export function getEasternDateString(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}
