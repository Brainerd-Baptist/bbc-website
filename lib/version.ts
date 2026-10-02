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
 *   - BUILD_TIME — the instant this build ran, computed once in
 *     next.config.ts and baked in via Next's `env` key. Originally this was
 *     a commit counter (git rev-list --count HEAD) so it would visibly
 *     climb by 1 every push, unlike an opaque commit SHA — but the first
 *     real deploy showed "build 10" instead of ~416, because Vercel's build
 *     containers use a shallow git clone that doesn't have the full history
 *     to count. A timestamp sidesteps that: no git call, always accurate,
 *     and it answers "is this the build I just pushed" even more directly
 *     than a counter would.
 *   - the commit SHA (VERCEL_GIT_COMMIT_SHA) — set automatically by every
 *     Vercel build, as long as the project has "Automatically expose System
 *     Environment Variables" turned on (Settings → Environment Variables;
 *     this was OFF here until 2026-10-02, which is why an earlier version
 *     of this marker showed "dev (local)" in production).
 *
 * APP_MILESTONE below is the one manual piece left: bump it only for a big
 * "this is a meaningfully different site than before" moment (a redesign
 * phase landing, a new major section shipping) — not for every commit.
 * It's a loose human label; the build time and commit SHA are what
 * actually answer "is this the latest deploy."
 */

export const APP_MILESTONE = "0.4";

export function getBuildInfo() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
  const dirty = !process.env.VERCEL_GIT_COMMIT_SHA; // local/dev build

  let built = "unknown time";
  if (process.env.BUILD_TIME) {
    built = new Date(process.env.BUILD_TIME).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
  }

  return {
    sha,
    dirty,
    built,
    label: `v${APP_MILESTONE} · built ${built} ET · ${sha}${dirty ? " (local)" : ""}`,
  };
}
