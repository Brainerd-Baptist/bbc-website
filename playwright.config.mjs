import { defineConfig, devices } from "@playwright/test";

/**
 * Point BASE_URL at whatever you want to sweep — a Vercel deployment, a
 * preview URL, or a local `npm start`. Defaults to local.
 *
 * Note the deliberate absence of a `webServer` block: `next/font/google`
 * needs network at build time, so a sandbox without egress to Google Fonts
 * cannot build the site and would produce baselines with the wrong font
 * metrics. Running against a real deployment avoids that entirely.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: {
    // Fonts and image decoding make a byte-exact match unrealistic; 1% of
    // pixels is tight enough to catch a colour or layout regression.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // Pinned so baselines are comparable between machines.
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
