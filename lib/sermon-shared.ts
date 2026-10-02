/**
 * lib/sermon-shared.ts
 *
 * Client-safe sermon constants/helpers — zero imports, so they're safe to
 * use from "use client" components (LivePlayer.tsx and friends).
 *
 * lib/sermon.ts imports lib/google-auth.ts (google-auth-library, which
 * needs Node's child_process) at module scope. That's fine for server-only
 * code, but importing ANY value — even just a constant or a pure date
 * formatter — from lib/sermon.ts into a client component drags that whole
 * chain into the browser bundle, and the build fails with
 * "Module not found: Can't resolve 'child_process'". This file exists so
 * client components never have to import a runtime value from lib/sermon.ts
 * at all; only `import type { SermonData } from "@/lib/sermon"` is safe
 * there, since type-only imports are erased before bundling.
 */

export const YOUTUBE_CHANNEL_ID = "UCEcu35yHidS8fQVwsoSP3zQ";

/** Format a "YYYY-MM-DD" date string for display, pinned to America/New_York
 * (Chattanooga) rather than whatever timezone happens to be evaluating it —
 * matches every other date/time calculation on the site. */
export function formatSermonDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
}
