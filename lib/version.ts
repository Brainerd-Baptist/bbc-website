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
 * automatic instead: every production build on Vercel sets
 * VERCEL_GIT_COMMIT_SHA and VERCEL_GIT_COMMIT_MESSAGE from the commit it's
 * building, with no action required on our part. That's always accurate,
 * by construction.
 *
 * APP_MILESTONE below is the one manual piece: bump it only for a big
 * "this is a meaningfully different site than before" moment (a redesign
 * phase landing, a new major section shipping) — not for every commit.
 * It's a loose human label, not a build identifier; the commit SHA is
 * what actually answers "is this the latest deploy."
 */

export const APP_MILESTONE = "0.4";

export function getBuildInfo() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev";
  const dirty = !process.env.VERCEL_GIT_COMMIT_SHA; // local/dev build
  return {
    sha,
    dirty,
    label: `v${APP_MILESTONE} · ${sha}${dirty ? " (local)" : ""}`,
  };
}
