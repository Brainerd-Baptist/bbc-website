import type { NextConfig } from "next";

// Footer build marker (lib/version.ts) — when this build actually happened,
// baked in once at build time via the `env` key below so every page render
// just reads a constant.
//
// First attempt here was `git rev-list --count HEAD` (a commit counter) —
// reverted after the first real deploy showed "build 10" instead of ~416:
// Vercel does a SHALLOW git clone for its build containers, so the full
// history isn't actually there to count. A build timestamp sidesteps that
// entirely (no git call needed) and arguably answers the actual question —
// "is this the build I just pushed" — more directly than a counter would:
// it's always true to the instant, never dependent on how much history
// Vercel happened to check out.
const BUILD_TIME = new Date().toISOString();

const nextConfig: NextConfig = {
  env: {
    BUILD_TIME,
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
