import type { MetadataRoute } from "next";

/**
 * Web App Manifest — covers the Android/Chrome "Add to Home Screen" /
 * "Install app" case, the counterpart to layout.tsx's appleWebApp.title for
 * iOS. short_name is what actually shows under the home-screen icon on
 * Android when the full name doesn't fit; kept to two words, matching
 * "Brainerd Baptist" on iOS rather than the full "Brainerd Baptist
 * Church — Chattanooga, TN" page title that was getting truncated oddly
 * (reported 2026-10-04).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brainerd Baptist Church",
    short_name: "Brainerd Baptist",
    description: "A church family in Chattanooga, TN.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1525",
    theme_color: "#0d1525",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Separate maskable icon: the mark sits inside the central safe zone so
      // Android's circle/squircle masks don't clip its corners.
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
