/**
 * lib/version.ts
 *
 * Footer build marker — so Josiah can tell at a glance whether the page
 * he's looking at is actually the deploy he thinks it is.
 *
 * Why this isn't hand-maintained semver: package.json's "version" field
 * was set to 0.3.0 once, early on, and never touched again across 380+
 * commits since — hand-bumping a version number is the first discipline
 * to slip under real deploy pressure, and a stale version number is worse
 * than none (it actively lies about what's live). So this is fully
 * automatic instead, from two sources that both update themselves with
 * zero manual action:
 *
 *   - BUILD_NUMBER — the repo's total commit count, computed once at build
 *     time (next.config.ts, baked in via the `env` key). This is the part
 *     that actually climbs by exactly 1 every push — a real, visibly
 *     increasing number, unlike a commit SHA (which changes every commit
 *     too, but as an opaque hex string that doesn't look like it's "going
 *     up").
 *   - the commit SHA itself (VERCEL_GIT_COMMIT_SHA, set automatically by
 *     every Vercel build) — kept alongside the number as the precise,
 *     unambiguous identifier for exactly which commit is live.
 *
 * APP_MILESTONE below is the one manual piece left: bump it only for a big
 * "this is a meaningfully different site than before" moment (a redesign
 * phase landing, a new major section shipping) — not for every commit.
 * It's a loose human label; BUILD_NUMBER and the commit SHA are what
 * actually answer "is this the latest deploy."
 */

export const APP_MILESTONE = "0.4";

export function getBuildInfo() {
  const number = process.env.BUILD_NUMBER || "0";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
  const dirty = !process.env.VERCEL_GIT_COMMIT_SHA; // local/dev build
  return {
    number,
    sha,
    dirty,
    label: `v${APP_MILESTONE} · build ${number} · ${sha}${dirty ? " (local)" : ""}`,
  };
}
