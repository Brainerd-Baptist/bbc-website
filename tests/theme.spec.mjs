/**
 * tests/theme.spec.mjs
 *
 * Dual-theme visual + accessibility regression sweep.
 *
 * This is the layer lint cannot reach. `verify-classes` proves a class emits
 * CSS and `verify-contrast` proves the token values are sound, but neither can
 * see a token that IS used and is simply wrong for its surface — the failure
 * that produces white text on a white background. Only rendering both themes
 * and looking catches that.
 *
 * Three assertions per route per theme:
 *   1. the navbar paints with the expected chrome (the invisible-nav bug)
 *   2. no element renders text within 1.5:1 of the background behind it
 *      (the white-on-white bug), and
 *   3. the page matches its committed screenshot.
 *
 * Run against a deployment:
 *   BASE_URL=https://bbc-website-brainerdb.vercel.app npx playwright test
 * Or locally (needs network for next/font):
 *   npm run build && npm start &  npx playwright test
 *
 * First run writes baselines; commit them. Later runs diff against them.
 */

import { test, expect } from "@playwright/test";
import { ROUTES } from "../scripts/routes.mjs";

const THEMES = ["light", "dark"];

/** Force a theme before any script runs, the way next-themes reads it. */
async function presetTheme(page, theme) {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t);
    } catch {
      /* private mode — the class assertion below will catch a miss */
    }
  }, theme);
}

for (const theme of THEMES) {
  test.describe(`${theme} theme`, () => {
    for (const { path, navChrome } of ROUTES) {
      test(`${path}`, async ({ page }) => {
        await presetTheme(page, theme);
        await page.goto(path, { waitUntil: "networkidle" });

        // The theme actually applied.
        const htmlClass = await page.locator("html").getAttribute("class");
        if (theme === "dark") expect(htmlClass ?? "").toContain("dark");
        else expect(htmlClass ?? "").not.toContain("dark");

        // 1. Nav chrome is what this route expects, at scroll position zero.
        //    Guards the regression where the bar went transparent over a
        //    white page and the logo and hamburger vanished.
        const nav = page.locator("nav.bbc-nav");
        await expect(nav).toHaveAttribute("data-chrome", navChrome);

        // 2. No text sits on a near-identical background.
        const lowContrast = await page.evaluate(() => {
          /**
           * Resolve ANY CSS colour syntax to sRGB by letting the browser parse
           * it into a 1x1 canvas.
           *
           * Hand-parsing the string is a trap, and it bit this test once
           * already: Tailwind v4 emits opacity modifiers as `oklab(...)`, and
           * pulling "the first three numbers" out of `oklab(1 0 0 / 0.6)`
           * yields L/a/b read as R/G/B — so white-at-60% scored as near-black
           * and the footer produced 33 phantom failures. The canvas knows how
           * to parse oklab, oklch, colour-mix and anything else the browser
           * supports; we should not be reimplementing that.
           */
          const cv = document.createElement("canvas");
          cv.width = cv.height = 1;
          const cx = cv.getContext("2d", { willReadFrequently: true });
          const parseRGBA = (css) => {
            try {
              cx.clearRect(0, 0, 1, 1);
              cx.fillStyle = css;
              cx.fillRect(0, 0, 1, 1);
              const d = cx.getImageData(0, 0, 1, 1).data;
              return [d[0], d[1], d[2], d[3] / 255];
            } catch {
              return null;
            }
          };

          const lin = (c) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          const lum = ([r, g, b]) =>
            0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          /** Composite a translucent foreground over its backdrop. */
          const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]));
          const ratio = (a, b) => {
            const [x, y] = [lum(a), lum(b)];
            const [hi, lo] = x > y ? [x, y] : [y, x];
            return (hi + 0.05) / (lo + 0.05);
          };

          /** Walk up for the first ancestor that actually paints a background. */
          const backdrop = (el) => {
            let n = el;
            while (n && n !== document.documentElement) {
              const cs = getComputedStyle(n);
              if (cs.backgroundImage !== "none") return null; // can't judge over art
              const c = parseRGBA(cs.backgroundColor);
              if (c && c[3] > 0.5) return [c[0], c[1], c[2]];
              n = n.parentElement;
            }
            const c = parseRGBA(getComputedStyle(document.body).backgroundColor);
            return c ? [c[0], c[1], c[2]] : null;
          };

          const bad = [];
          for (const el of document.querySelectorAll("p,h1,h2,h3,h4,span,a,li,label,button")) {
            const text = el.textContent?.trim();
            if (!text) continue;
            // Only leaf-ish nodes, so we judge the element that owns the text.
            if (el.children.length > 0 && !Array.from(el.childNodes).some(
              (n) => n.nodeType === 3 && n.textContent.trim()
            )) continue;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            if (Number(cs.opacity) < 0.15) continue;
            // WCAG 1.4.11 exempts disabled/inactive controls from the contrast
            // floor, so flagging them would train people to ignore this test.
            if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
            if (el.closest("[disabled],[aria-disabled='true']")) continue;
            if (cs.webkitTextFillColor === "transparent") continue; // gradient text
            const fgRaw = parseRGBA(cs.color);
            const bg = backdrop(el);
            if (!fgRaw || !bg) continue;
            const c = ratio(over(fgRaw, bg), bg);
            // 1.5 is a deliberately loose floor: this catches "invisible",
            // not "slightly under AA". AA is enforced at the token level.
            if (c < 1.5) {
              bad.push({ text: text.slice(0, 60), ratio: Number(c.toFixed(2)), color: cs.color });
            }
          }
          return bad;
        });
        expect(lowContrast, `text with <1.5:1 contrast on ${path} (${theme})`).toEqual([]);

        // 3. Pixel baseline.
        await expect(page).toHaveScreenshot(
          `${theme}${path.replace(/\//g, "_") || "_root"}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.01, animations: "disabled" },
        );
      });
    }
  });
}
