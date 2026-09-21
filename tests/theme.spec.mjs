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
import AxeBuilder from "@axe-core/playwright";
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
        // NOT networkidle. This site keeps a looping ambient video on the
        // homepage and /visit, a YouTube embed on /live, and a Cloudflare
        // Stream source elsewhere — so the network never goes quiet for the
        // 500ms `networkidle` requires, and it simply never fires. The first
        // CI run proved it: all 52 tests timed out identically at 30s on this
        // line, which is where the 29-minute run came from. Playwright's own
        // docs discourage networkidle for exactly this reason.
        //
        // Instead: load the document, then wait for the specific things the
        // assertions below actually depend on.
        await page.goto(path, { waitUntil: "domcontentloaded" });

        // Wait for the stylesheet to be LIVE, not merely for the document.
        // `domcontentloaded` fires before stylesheets are applied, and that
        // caught me out: three routes reported 137 elements at rgb(0,0,0) and
        // a 1.00:1 ratio, which is the signature of an unstyled page rather
        // than a contrast bug. `--fg` only resolves once tokens.css is in, so
        // it is an exact probe for "our CSS is applied".
        await page.waitForFunction(
          () => getComputedStyle(document.documentElement).getPropertyValue("--fg").trim().length > 0,
          undefined,
          { timeout: 15000 },
        );

        // next-themes applies the class on mount, so wait for it rather than
        // sleeping. This is also assertion 1's precondition.
        await page.waitForFunction(
          (t) => {
            const c = document.documentElement.className;
            return t === "dark" ? c.includes("dark") : c.includes("light") || !c.includes("dark");
          },
          theme,
          { timeout: 15000 },
        );

        // The navbar is what assertion 2 reads, and it sets data-chrome from a
        // scroll listener after hydration.
        await page.locator("nav.bbc-nav").waitFor({ state: "attached", timeout: 15000 });
        await page.waitForFunction(
          () => document.querySelector("nav.bbc-nav")?.getAttribute("data-chrome") !== null,
          undefined,
          { timeout: 15000 },
        );

        // Let fonts settle so contrast sampling reads final colours, and give
        // the reveal animations a beat to finish so nothing is mid-fade.
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        await page.waitForTimeout(400);

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

          /**
           * Walk up for the first ancestor that actually paints a background.
           *
           * Returns null — "can't judge" — whenever the thing behind the text
           * is artwork rather than a flat colour. Two ways that happens, and
           * BOTH are needed: a CSS background-image, and a real <img>/<video>
           * covering the element's box. Missing the second one made every hero
           * headline on / and /visit report exactly 1.00:1, because the walk
           * sailed past the hero video up to the white page and compared white
           * text against it. Eighteen phantom failures on the homepage alone.
           */
          const coveredByMedia = (el) => {
            const r = el.getBoundingClientRect();
            let n = el.parentElement;
            let hops = 0;
            while (n && n !== document.documentElement && hops++ < 8) {
              for (const m of n.querySelectorAll("img,video,canvas,svg[data-art]")) {
                const mr = m.getBoundingClientRect();
                if (
                  mr.width > 0 &&
                  mr.left <= r.left + 1 && mr.right >= r.right - 1 &&
                  mr.top <= r.top + 1 && mr.bottom >= r.bottom - 1
                ) return true;
              }
              n = n.parentElement;
            }
            return false;
          };

          const backdrop = (el) => {
            if (coveredByMedia(el)) return null;
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

        // 3. Every keyboard-reachable control paints a focus indicator.
        //
        //    This is WCAG 2.4.7 and it was failing sitewide: 209 interactive
        //    elements, 2 with any focus styling, and 11 files calling
        //    `outline-none` with nothing put back. A static lint cannot catch
        //    it — the class is real and compiles fine, it just erases the
        //    indicator — so the only honest check is to press Tab and look.
        //
        //    The Tab presses must come from the runner, not from in-page JS:
        //    a synthetic KeyboardEvent does not move focus at all, and the
        //    `el.focus()` workaround sets :focus-visible for text inputs but
        //    not dependably for buttons — so a bare button would pass a check
        //    built that way. Only real input is trustworthy here.
        const MAX_TABS = 25;
        const unringed = [];
        const seenKeys = new Set();
        await page.locator("body").click({ position: { x: 2, y: 2 } }).catch(() => {});
        for (let i = 0; i < MAX_TABS; i++) {
          await page.keyboard.press("Tab");
          const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body || el === document.documentElement) return null;
            const cs = getComputedStyle(el);
            const w = parseFloat(cs.outlineWidth) || 0;
            const hasOutline =
              w >= 1 &&
              cs.outlineStyle !== "none" &&
              !/transparent|rgba\(0,\s*0,\s*0,\s*0\)/.test(cs.outlineColor);
            // A ring drawn with box-shadow counts too: Tailwind's ring-* and
            // the Clearstream form, whose inputs cannot take an outline.
            const hasShadow = !!cs.boxShadow && cs.boxShadow !== "none";
            return {
              key:
                el.tagName +
                "|" +
                (typeof el.className === "string" ? el.className : "") +
                "|" +
                (el.textContent || "").trim().slice(0, 24),
              ok: hasOutline || hasShadow,
              optedOut: !!el.closest(".focus-ring-custom"),
              tag: el.tagName.toLowerCase(),
              label:
                el.getAttribute("aria-label") ||
                (el.textContent || "").trim().slice(0, 40) ||
                el.getAttribute("type") ||
                "?",
            };
          });
          if (!info) break;
          if (seenKeys.has(info.key)) break; // focus order wrapped
          seenKeys.add(info.key);
          if (!info.ok && !info.optedOut) unringed.push({ tag: info.tag, label: info.label });
        }
        expect(
          unringed,
          `controls with no visible focus indicator on ${path} (${theme})`,
        ).toEqual([]);

        // 4. axe: colour-contrast, on what the page actually paints.
        //
        //    This overlaps assertion 2 on purpose. Assertion 2 is a blunt
        //    "is it invisible" floor at 1.5:1 that we control; axe applies the
        //    real WCAG algorithm, including the cases our own probe declines to
        //    judge. Where they disagree, axe is right.
        //    Decorative ordinals are excluded, and the exclusion is itself
        //    guarded here. WCAG 1.4.3 exempts pure decoration, and these are:
        //    a faint oversized "01".."04" watermark beside a heading that
        //    already carries the meaning. Darkening them to 3:1 would not
        //    make the page more accessible, only make the ornament loud.
        //    But "it's decorative" is exactly the excuse that hides real
        //    failures, so the marker is not taken on trust.
        const decorative = await page.$$eval("[data-decorative]", (els) =>
          els.map((el) => ({
            html: el.outerHTML.slice(0, 80),
            hidden: el.getAttribute("aria-hidden") === "true",
            text: (el.textContent || "").trim(),
          })),
        );
        expect(
          decorative.filter((d) => !d.hidden || d.text.length > 3),
          `[data-decorative] on ${path} (${theme}) must be aria-hidden and hold ` +
            `at most 3 characters - it exempts an ornament, not content`,
        ).toEqual([]);

        const axe = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .exclude("[data-decorative]")
            .analyze();
        const contrastViolations = axe.violations.flatMap((v) =>
          v.nodes.map((n) => ({
            impact: v.impact,
            target: n.target.join(" "),
            summary: (n.failureSummary || "").split("\n").slice(1, 3).join(" ").trim(),
          })),
        );
        expect(
          contrastViolations,
          `axe colour-contrast violations on ${path} (${theme})`,
        ).toEqual([]);

        // 5. The theme survives being TOGGLED, not just preset.
        //
        //    Everything above loads with the theme already in localStorage.
        //    That is not how a visitor changes theme, and the gap was not
        //    hypothetical: two real defects lived in it — a wordmark that
        //    inherited the wrong colour, and identity CTAs that stuck at their
        //    pre-toggle ink because a transition held the old value. Both
        //    passed every static gate and every preset-theme render.
        const stuck = await page.evaluate(async (want) => {
          const html = document.documentElement;
          const sample = () =>
            [...document.querySelectorAll("a,button,p,h1,h2,h3,span")]
              .filter((e) => (e.textContent || "").trim() && e.children.length === 0)
              .slice(0, 60)
              .map((e) => getComputedStyle(e).color);
          const other = want === "dark" ? "light" : "dark";
          const before = sample();
          html.classList.remove(want);
          html.classList.add(other);
          await new Promise((r) => setTimeout(r, 700));
          const mid = sample();
          html.classList.remove(other);
          html.classList.add(want);
          await new Promise((r) => setTimeout(r, 700));
          const after = sample();
          // Anything that changed on the way out must change back on the way
          // in. A value that moved and then refused to return is stuck.
          let n = 0;
          for (let i = 0; i < before.length; i++) {
            if (before[i] !== mid[i] && after[i] !== before[i]) n++;
          }
          return n;
        }, theme);
        expect(stuck, `elements whose colour did not restore after a live theme toggle on ${path} (${theme})`).toBe(0);

        // 6. Pixel baseline — opt-in.
        //
        //    Gated on PIXEL_BASELINE because no baselines are committed yet:
        //    this sandbox cannot run `next build` (next/font cannot reach
        //    fonts.googleapis.com through the egress proxy), so the 60-odd
        //    reference images have to be generated on a runner. Until they
        //    are, the five assertions above still run and still block — they
        //    need no baseline, and they are the ones that catch real defects.
        //
        //    To create them: run the workflow's `baseline` job, download the
        //    artifact, commit tests/theme.spec.mjs-snapshots/, then set
        //    PIXEL_BASELINE=1 in the visual job.
        //    An `if`, not test.skip(): test.skip() inside a test body marks the
        //    WHOLE test skipped, including the five assertions that already
        //    passed above it. A fully green run reported "51 skipped, 0 passed",
        //    which in CI is indistinguishable from a suite that never ran.
        if (process.env.PIXEL_BASELINE) {
          await expect(page).toHaveScreenshot(
            `${theme}${path.replace(/\//g, "_") || "_root"}.png`,
            { fullPage: true, maxDiffPixelRatio: 0.01, animations: "disabled" },
          );
        }
      });
    }
  });
}
