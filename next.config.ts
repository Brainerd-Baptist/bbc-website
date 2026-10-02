import type { NextConfig } from "next";
import { execSync } from "node:child_process";

// Footer build counter (lib/version.ts) — total commit count on this branch
// at build time. Computed here, once, at build, rather than per-request:
// it's baked into the bundle as a plain string via the `env` key below, so
// every page render just reads a constant instead of shelling out to git.
// Climbs by exactly 1 every commit, so "did my latest push actually land"
// is a glance, not a guess — unlike a commit SHA, which changes every time
// but doesn't visibly go UP. Falls back to "0" if git isn't available for
// some reason (never seen that happen in a Vercel build, but this must
// never fail the build either way).
let buildNumber = "0";
try {
  buildNumber = execSync("git rev-list --count HEAD").toString().trim();
} catch {
  // leave as "0" — footer marker still shows the commit SHA either way
}

const nextConfig: NextConfig = {
  env: {
    BUILD_NUMBER: buildNumber,
  },

  // @react-pdf/renderer has Node.js-only deps (canvas, fontkit, etc.) that
  // Turbopack can't bundle. Tell Next.js to require() it at runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],

  // Allow YouTube thumbnails and Sanity CDN images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
