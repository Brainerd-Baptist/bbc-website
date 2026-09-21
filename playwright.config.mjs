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
  /**
   * 60s, not the 30s default. Each test does real work — a 25-press keyboard
   * focus sweep, an axe pass and a live theme toggle — and a runner is slower
   * than a laptop. The first CI run hit the 30s limit, but that was the
   * networkidle hang rather than genuine slowness; this is headroom.
   */
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  expect: {
    // Fonts and image decoding make a byte-exact match unrealistic; 1% of
    // pixels is tight enough to catch a colour or layout regression.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // TEMPORARY local override: this sandbox has chromium 1194 but not the
    // headless-shell build Playwright 1243 wants. Reverted before commit.
    /**
     * No video. The first CI run produced a 336 MB report artifact, slow to
     * upload and slower to download when you actually need it. A failure
     * screenshot plus the retry trace is enough to diagnose from.
     */
    video: "off",
    // Pinned so baselines are comparable between machines.
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
