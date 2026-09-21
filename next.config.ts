import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer has Node.js-only deps (canvas, fontkit, etc.) that
  // Turbopack can't bundle. Tell Next.js to require() it at runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],

  // Allow YouTube thumbnails and Sanity CDN images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
