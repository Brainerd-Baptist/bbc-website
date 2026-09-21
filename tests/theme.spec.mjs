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
          const lin = (c) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          const lum = ([r, g, b]) =>
            0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          const parse = (v) => {
            const m = String(v).match(/[\d.]+/g);
            return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
          };
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
              const c = parse(cs.backgroundColor);
              const alpha = Number(
                (String(cs.backgroundColor).match(/[\d.]+/g) ?? [])[3] ?? 1,
              );
              if (c && alpha > 0.5) return c;
              n = n.parentElement;
            }
            const c = parse(getComputedStyle(document.body).backgroundColor);
            return c;
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
            if (cs.webkitTextFillColor === "transparent") continue; // gradient text
            const fg = parse(cs.color);
            const bg = backdrop(el);
            if (!fg || !bg) continue;
            const c = ratio(fg, bg);
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
