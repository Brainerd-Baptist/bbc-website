import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow YouTube thumbnails and Sanity CDN images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
