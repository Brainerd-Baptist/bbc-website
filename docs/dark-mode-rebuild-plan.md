# Light/Dark Mode Rebuild — Scope & Phased Plan

**Date:** 2026-09-21
**Status:** Scoped, not started. No code changed yet.
**Standard:** Gold standard, no workarounds. Where more work now prevents problems later, do the work now.

---

## 1. What is actually wrong

The theme *switch* works. The theme *consumption* does not exist. Everything below was verified
against the repo and, where it concerns Tailwind class generation, against the installed Tailwind v4
engine directly — not inferred.

### 1.1 The plumbing is correct and should be kept

`components/ThemeProvider.tsx` is already right: `attribute="class"`, `defaultTheme="system"`,
`enableSystem`, `disableTransitionOnChange`. `app/layout.tsx` already has `suppressHydrationWarning`.
`app/globals.css` already declares `@variant dark (&:where(.dark, .dark *))`, and the engine confirms
`dark:bg-[#0d1525]` compiles. `next-themes` injects its blocking anti-flash script.

So `.dark` lands on `<html>` correctly. Nothing consumes it.

### 1.2 Adoption census (87 files under `app/` + `components/`)

| Verdict | Files |
|---|---|
| Unthemed (no `dark:`, has hardcoded color) | **68** |
| Partially themed | **4** — `home/SermonBand`, `home/ServiceInfo`, `home/ThisWeek`, `globals.css` |
| Fully themed | **0** |
| Structural / no color at all | 15 |

**1,383 raw color literals** — 1,023 hex + 360 `rgb()`/`rgba()` occurrences, spread across 1,107
distinct lines. Brand navy `#00205b` appears 455 times, brand cyan `#00abc9` 294 times. Each one is a
separate place a theme cannot reach.

### 1.3 The mechanism behind "some pages don't change at all"

**25 of 31 routes are wrapped in `min-h-screen bg-white`.** `.dark body { background: #0d1525 }` themes
the body, then a hardcoded white container paints over the whole viewport, and the navy text inside
stays navy. Those pages are structurally incapable of responding to the theme. This is the single
highest-leverage fix in the entire plan.

### 1.4 Live defects that exist *today*, independent of dark mode

These are current bugs in light mode. They must be fixed before migration, or we migrate bugs.

**(a) `tailwind.config.ts` is dead code.** Tailwind v4 does not auto-load a JS config; it requires an
explicit `@config` directive, and `globals.css` has none. There is also no `@theme` block. Verified by
compiling `globals.css` through the installed engine: `bg-gold`, `text-gold`, `bg-gold-light`,
`text-gold-light`, `border-gold`, `text-navy`, `bg-bbc-navy`, `text-bbc-blue`, `bg-gradient-blue` all
emit **zero CSS**. Arbitrary values (`bg-[#00205B]`) and `dark:` do work.

→ **23 live class usages render nothing at all**, across `app/give`, `app/life-groups`,
`app/ministries`, `app/wednesday`, and `components/connect/ConnectSidebar`.

**(b) 45 leading-zero opacity modifiers silently emit nothing.** Verified per-candidate with a fresh
compiler instance: `bg-white/08` → nothing, `bg-white/8` → 253 bytes. `hover:bg-[#00205B]/06` →
nothing, `/6` → 148 bytes. `border-[#00205B]/08` → nothing, `/10` → 101 bytes.

→ 45 occurrences across 20 files. Every subtle border and hover tint written this way is simply absent.
Worst: `app/bx` (7), `components/nav/Navbar` (7), `app/community` (5), `app/visit` (3).

**(c) The navigation is invisible on load on roughly ten routes.** Until `scrollY > 48` the navbar is
`bg-transparent` with `logo-white.png` and `bg-white` hamburger bars. On the 25 `bg-white` routes whose
first section is a plain `pt-32` header with no dark hero — `/give`, `/connect` and all six
`/connect/*` subpages via `ConnectSubpageHeader`, `/life-groups`, `/ministries`, `/wednesday` — that is
**white logo and white hamburger on a white background.** Routes with a dark hero (`/`, `/sermons`,
`/visit`) are fine, which is exactly why the behaviour reads as inconsistent rather than broken.

**(d) No `color-scheme` declaration anywhere.** Native form controls, scrollbars, date pickers and
spellcheck underlines stay in light mode on a dark page. The site has five substantial forms
(`ConnectForm`, `SimpleContactForm`, `KidsRegistrationForm`, `ClearstreamForm`, `NotesEditor`), so this
is very likely a direct contributor to the reported white-on-white text.

**(e) No `themeColor`.** Mobile browser chrome and the iOS status-bar area stay white in dark mode.

### 1.5 Accessibility failures in the current brand palette

Computed WCAG 2.1 relative-luminance ratios over the colors already in use. These are not
dark-mode-specific — several fail in light mode today, on every page.

| Pairing | Where | Ratio | Required | Verdict |
|---|---|---|---|---|
| `#fff` on `#00abc9` | `.btn-primary`, every primary CTA, "Plan a Visit" | **2.74** | 4.5 | **FAIL** |
| `#00abc9` as text on white | `.eyebrow` — every eyebrow label sitewide | **2.74** | 4.5 | **FAIL** |
| `rgba(0,32,91,.45)` on white | `.eyebrow-muted`, `text-[#00205B]/40` | **2.81** | 4.5 | **FAIL** |
| `rgba(0,32,91,.60)` on white | body muted text, `/55`–`/60` patterns | 4.39 | 4.5 | marginal fail |
| `#00205B` on white | body text | 15.47 | 4.5 | AAA ✓ |
| Light `raised` vs `surface` | both `#ffffff` | **1.00** | — | cards have no surface separation |

Solved replacements, each verified against the *worst* surface in its family (Primer's rule — validate
against `bgColor-muted`, not just `default`):

| Token | Value | Verified |
|---|---|---|
| `--accent-solid` (fill carrying white text) | `#008299` | `#fff` → 4.51 AA |
| `--accent-text` (cyan as text on light) | `#007b91` | 4.95 on `#fff`, 4.57 on `#f4f6f9` |
| `--fg-muted` light | `#5c7096` | 4.60 on `#f4f6f9` |
| `--fg-subtle` light (large text only) | `#7d8dab` | 3.09 — never for body copy |
| `--fg-muted` dark | `rgba(200,212,232,.60)` | 4.60 on worst dark surface `#1b2738` |
| `--border-input` light | ≥ 48% navy → `#8594b0` | 3.06 — meets SC 1.4.11 |
| `--border-input` dark | ≥ 34% white → `#656c76` | 3.09 |

Note the brand is **not** being abandoned: `#00abc9` on navy `#00205B` is 5.65 (AA), so cyan stays
fully intact as a fill behind navy text and as a dark-mode text color (6.66 on `#0d1525`). Only two
specific uses change — cyan carrying *white* text, and cyan *as text on white*.

### 1.6 Structural problems to correct while rebuilding

- **`--bbc-navy` is remapped in `.dark` to `#c8d4e8`**, a light tint. A brand-named token that inverts.
  Currently 7 consumers and zero background usages, so not yet a live bug — but the moment anyone
  writes `background: var(--bbc-navy)` they get a light background in dark mode. Radix warns against
  exactly this; names must describe *role*, not brand.
- **`--gray-50`, `--gray-100`, `--gray-200` are remapped** to near-black values in dark mode. The names
  lie about their contents.
- **Navbar themes itself in JavaScript**: 25 `isDark` branches driving inline styles, class strings, an
  SVG `stroke`, and two `Image` `src` swaps. On the server `resolvedTheme` is undefined, so SSR always
  renders the light branch and flips after hydration. It cannot SSR, it always flashes, and it is the
  reason the navbar and the page can disagree.
- **`globals.css` dark block has coverage holes**: `.glass-light`, `.glass-dark`, `.glass-dark-deep`,
  `.eyebrow-white`, `.btn-primary`, `.btn-outline-white`, `.text-gradient*`, `.orb-*`, `.glow-*`,
  `.blue-divider`, `.gold-divider` have no dark treatment.

---

## 2. The architecture we are building toward

Six systems were studied — Radix Colors, shadcn/ui, GitHub Primer, Material 3, Apple HIG, Vercel
Geist — plus Atlassian for elevation. They disagree on naming and converge completely on four ideas.
Those four, not any one system's specifics, are what we copy.

**1. Roles, not values, and never per-component.** Radix explicitly warns off `CardBg`-style names
because variables need reuse. Name by function within a surface family. Radix's 12 steps, Geist's
100–1000 bands and Primer's 0–6/7–8/9–10 banding are three encodings of one contract: page surfaces →
component fills and their interaction states → borders and their states → solid brand fills → text.

**2. Every surface carries its foreground.** shadcn's `-foreground`, M3's `on-*`, Primer's
`fgColor-onEmphasis`. If a token can be a background it has a paired content token, and using one
without the other is the bug. **Our white-on-white is structurally this**: `.dark body` and `.glass`
got themed; the foregrounds inside them did not.

**3. Elevation is surfaces, not shadows.** Atlassian states it outright: shadows are harder to see in
dark mode, so dark elevations rely on different surface colors. A shadow darkens its backdrop; on a
near-black backdrop there is almost no luminance left to remove, so depth has to move to the only
channel with range left — *lighter* surfaces plus a load-bearing border. Apple ships a parallel
"elevated" value set for this; M3 replaced opacity overlays with named `surfaceContainer*` tones.
Four levels minimum, each a theme-dependent `(surface, border, shadow)` triple.

**4. The mechanism is CSS, in one direction.** One class on `<html>`, one block of variable overrides,
and no JavaScript anywhere in the color path. The Navbar's `isDark` ternaries are the specific thing to
delete.

### 2.1 Token layer

Three tiers, per Primer: **primitive → semantic → (no component tier)**. Components consume semantic
tokens only. Exactly one file is allowed to contain a raw color value.

```
Surfaces      --surface-sunken   --surface   --surface-raised   --surface-overlay
Foregrounds   --fg   --fg-muted   --fg-subtle   --fg-on-accent
Accent        --accent-solid   --accent-solid-hover   --accent-text   --accent-bg
Borders       --border   --border-strong   --border-input   --focus-ring
Feedback      --danger/-fg   --success/-fg   --warning/-fg
Media         --scrim   --media-bg
```

Surfaced through Tailwind with `@theme inline` so `.dark` overrides propagate at runtime — the `inline`
keyword is what makes this work; without it the light value is baked in.

Light-mode values are chosen so the site is **pixel-identical to today** except the §1.5
accessibility corrections. Dark mode gets its own hand-tuned set: `#0a1020` sunken, `#0d1525` canvas,
`#162030` raised, `#1b2738` overlay — surfaces step *lighter* with elevation, never pure black
(we lose the downward range needed for `sunken`, OLED smears against bright content, and WCAG ratio
math is least trustworthy in the near-black region).

---

## 3. Phased plan

Seven phases. Every phase has multiple checkpoints; a phase is not done until all of its checkpoints
pass. Checkpoint types used throughout:

- **CP-static** — a script or engine probe proves it, not an opinion
- **CP-build** — `tsc --noEmit` clean, `eslint --max-warnings=0` clean, Vercel deploy READY
- **CP-visual** — screenshots of the affected routes in **both** themes, reviewed side by side
- **CP-a11y** — contrast matrix recomputed / `axe` run per theme
- **CP-ratchet** — the violation counter went *down* and never up

---

### Phase 0 — Repair live defects (before any theming work)

Fixes bugs that exist today. Delivers visible improvement immediately and means we never migrate
broken code.

1. Port the useful parts of `tailwind.config.ts` into an `@theme` block, then **delete the file** so it
   cannot mislead anyone again. Fix the 23 dead class usages.
2. Fix all 45 leading-zero opacity modifiers (`/06` → `/6`, `/08` → `/8`).
3. Fix the invisible navigation. Real fix, not a patch: the navbar needs a defined surface of its own
   rather than depending on whatever happens to be behind it. Per Apple, a translucent sticky bar is a
   *material*, and its foreground must be defined relative to that material — not to the page.
4. Capture a full light-mode visual baseline of all 31 routes first, so every later phase can prove it
   changed nothing it did not intend to.

**Checkpoints**
- CP-static — engine probe: zero class usages in the tree emit no CSS
- CP-static — `grep` for leading-zero opacity modifiers returns 0
- CP-visual — nav logo and hamburger legible on all 31 routes at `scrollY = 0`
- CP-visual — baseline captured and committed for all 31 routes
- CP-build — type, lint, deploy green

---

### Phase 1 — Token foundation (intended visual delta: zero in light mode)

Files: `app/globals.css`, `app/layout.tsx`, `components/ThemeProvider.tsx`, `app/template.tsx`,
`components/PageTransition.tsx`, `components/home/ScrollReveal.tsx` *(5 files + 1)*

1. Build the full token layer in `globals.css`: primitives, semantic aliases, `.dark` overrides,
   `@theme inline` export.
2. Retire the lying names — `--bbc-navy`, `--gray-*`, `--navy`, `--gold`, `--text-muted` — with
   temporary compatibility aliases pointing at the new tokens so nothing breaks mid-migration. The
   aliases are deleted in Phase 6.
3. Declare `color-scheme: light` / `.dark { color-scheme: dark }` — this alone fixes native controls,
   scrollbars and form fields.
4. Add the `viewport` export with per-theme `themeColor`.
5. Fill the `globals.css` dark coverage holes listed in §1.6.
6. Keep `disableTransitionOnChange`. No animated theme swap: next-themes' own answer is to suppress
   transitions during the change, a blanket `transition: background-color` is overridden by every
   element that declares its own transition (producing a half-fading page), and the alternative
   `@property`-based approach is a Phase 6 nice-to-have at most.

**Checkpoints**
- CP-a11y — every foreground × surface pairing recomputed; body ≥ 4.5, large ≥ 3, input borders ≥ 3
- CP-a11y — each pairing validated against the *worst* surface in its family, not just the primary
- CP-visual — light mode diffs to zero against the Phase 0 baseline on all 31 routes
- CP-static — `color-scheme` and `themeColor` present; native `<select>`/`<input>`/scrollbar verified dark
- CP-build — green

---

### Phase 2 — Enforcement rails, report-only

Installed *before* mass migration so migration cannot drift, but non-blocking so it cannot halt it.
This is the ratchet pattern used for large TypeScript-strictness migrations.

1. Stylelint: `color-no-hex`, `color-named: never`,
   `declaration-property-value-allowed-list` restricting color-bearing properties to `var(--…)`,
   `transparent`, `currentColor` — with a single `overrides` entry exempting the token file. That
   exemption is the important half: one sanctioned home for raw values, everything else locked.
2. ESLint: ban arbitrary color classes (`bg-[…]`, `text-[…]`, `border-[…]`) and flag hex/`rgb()`
   literals in inline `style` objects.
3. CI: a counter that records today's violation totals as the baseline and fails **only if a count
   increases**. Published per phase so progress is visible.

Deliberately deferred to Phase 6: clearing the default Tailwind palette (`--color-*: initial`). It
makes `bg-white` a build error, but applied now it would break all 68 unmigrated files at once.

**Verified limitation — do not rely on the palette clear alone.** Compiling a simulated post-lock
`globals.css` through the engine confirms `bg-white` and `text-gray-500` stop emitting, and
`bg-surface` / `dark:bg-surface` start working — **but `bg-[#00205B]` still compiles fine.** Clearing
the palette does not touch arbitrary values, and arbitrary hex classes are *the* dominant pattern here
(455 `#00205b` occurrences). So rail 2 (ESLint banning `bg-[…]`/`text-[…]`/`border-[…]`) is
**load-bearing, not belt-and-braces** — it is the only thing that closes this hole. A plan relying on
the palette clear as its primary guard would have shipped with a false sense of safety.

**Checkpoints**
- CP-static — a deliberately bad commit (raw hex, `bg-[#fff]`, inline hex style) is caught by each rail
- CP-static — the token file is correctly exempt and does not trip its own rules
- CP-ratchet — baseline recorded: 1,023 hex, 360 rgba, 25 `bg-white` shells, 45 bad opacity (now 0), 23 dead classes (now 0)
- CP-build — rails run in CI on every PR without failing the existing tree

---

### Phase 3 — Shared chrome and route shells (highest leverage)

Files: `components/nav/Navbar.tsx`, `components/footer/Footer.tsx`, `components/ConditionalLayout.tsx`,
`components/connect/ConnectSubpageHeader.tsx`, `components/connect/ConnectSidebar.tsx` *(5 files)*,
plus a mechanical sweep of the **25 `min-h-screen bg-white` route wrappers**.

One phase because these are what every page shares. Fixing them is the difference between "some pages
change" and "the site changes."

1. **Rewrite the Navbar with zero JavaScript in the color path.** Delete all 25 `isDark` branches. The
   logo becomes either a `currentColor` SVG or a CSS-driven two-asset swap — never a JS `src` ternary,
   never a `filter`. `useTheme` survives only to drive the toggle button's own icon.
2. Footer, `ConditionalLayout`, `ConnectSubpageHeader`, `ConnectSidebar` → tokens.
3. Sweep `min-h-screen bg-white` → `min-h-screen bg-surface` across all 25 routes.

**Checkpoints**
- CP-static — zero `isDark`/`resolvedTheme` references remain in any color decision
- CP-static — zero `bg-white` remaining on a route wrapper
- CP-visual — **SSR proof**: first paint with JS disabled is correct in both themes, no flash on reload
- CP-visual — all 31 routes screenshotted in both themes; page background now responds everywhere
- CP-visual — drawer, backdrop, hamburger, close icon, footer verified in both themes
- CP-a11y — `axe` contrast pass on nav + footer in both themes
- CP-ratchet — count down
- CP-build — green

---

### Phase 4 — Component clusters

Five clusters, each independently shippable and independently verifiable. Cluster boundaries follow the
file mapping below; all 87 files are assigned to exactly one phase, verified by script — zero orphans.

| Cluster | Files | Contents |
|---|---|---|
| **4a — Home** | 10 | `Hero`, `SermonBand`, `ServiceInfo`, `ThisWeek`, `ConnectBand`, `MinistriesSection`, `StatsStrip`, `PhotoStrip`, `Countdown`, `app/page.tsx` |
| **4b — Sermons & media** | 24 | `SermonGrid`, `SermonPlayer`, `SermonTabPlayer`, `AudioPlayer`, `GlobalAudioPlayer`, `SermonNotes`, `NotesEditor`, `RelatedSermons`, `SpeakerCard`, `ContinueListeningShelf`, `ScriptureInline`, `GiveCTA`, `ShareButton`, `PlayerDebugOverlay`, `LivePlayer`, + `app/sermons/**`, `app/series/**`, `app/speakers/**`, `app/live/**` |
| **4c — Forms & Connect** | 16 | `ConnectForm`, `SimpleContactForm`, `KidsRegistrationForm`, `ClearstreamForm`, `AskConnectQuestion`, `ConnectTiles`, + `app/connect/**` |
| **4d — Content pages** | 14 | `about`, `beliefs`, `bx`, `community`, `give`, `life-groups`, `ministries`, `ministries/kids`, `ministries/students`, `staff`, `visit`, `wednesday`, `who-is-jesus` |
| **4e — Support & utility** | 13 | `beliefs/*`, `jesus/ThreeCircles`, `visit/*`, `ui/*`, `admin/analytics`, `opengraph-image`, `studio/*` |

`LivePlayer` (75 hex literals), `app/bx` (59), `ministries/kids` (55), `community` (44), `SermonGrid`
(42) and `ConnectForm` (40) are the heaviest single files and should each be treated as their own
review unit rather than batched.

**Checkpoints — applied to every cluster, not once at the end**
- CP-static — zero hex, zero `rgba()`, zero arbitrary color classes left in the cluster
- CP-visual — every route touched, both themes, against the Phase 0 baseline
- CP-visual — interaction states specifically: hover, focus-visible, active, disabled, error, loading, empty
- CP-a11y — `axe` contrast per route per theme, zero violations
- CP-a11y — forms: placeholder, label, helper text, error text, and input border all verified in both themes
- CP-ratchet — count down
- CP-build — green, deployed, checked live before the next cluster starts

---

### Phase 5 — Media, assets and third-party embeds

A token layer cannot fix these, they are the most visible to a Sunday visitor, and the reflexive fix is
actively wrong. Sara Soueidan's position: **do not dim.** `opacity: .5` or `filter: brightness(.75)`
reduces contrast and makes images *harder* to perceive, worst of all for images containing text; and
restoring full opacity on `:hover` never reaches keyboard or touch users.

1. **Logo and wordmark** — monochrome marks become inline SVG with `fill="currentColor"` and theme for
   free. Multi-color marks ship two files with a CSS-driven swap. Never filtered — filtering shifts
   brand hue.
2. **Icons** — SVG + `currentColor`, universally.
3. **Photography** — designed to work in both where possible (cheapest, and Apple's first
   recommendation). Where a photo is genuinely too hot against a dark canvas, add a `--scrim` overlay
   between photo and page rather than reducing the photo's own contrast. This solves text-over-image
   legibility at the same time.
4. **Video posters and thumbnails** — highest-risk: bright frames with letterboxing. Each gets a border
   token, a slight scrim, and `--media-bg` on the video element so letterbox bars are not pure black
   against a not-pure-black page. Directly relevant to `SermonBand`, `SermonGrid`, `LivePlayer`,
   `VideoHero`.
5. **Third-party embeds** — YouTube, maps, Planning Center widgets and the Clearstream form will not
   theme. Wrap each in a `--surface` container with a border so the seam reads as intentional.
6. Known limitation to decide explicitly: `<picture media="(prefers-color-scheme: dark)">` reads the
   **OS** preference, not our `.dark` class. A visitor on a light OS who toggles the site dark gets the
   light asset. There is no HTML-level fix. Preference order: design-for-both → CSS-driven dual `<img>`
   → never a JS `src` swap on a hero.

**Checkpoints**
- CP-static — zero `filter: brightness` / `opacity` dimming used as a dark-mode strategy
- CP-visual — every image, poster, logo and embed audited in both themes
- CP-visual — letterboxing and embed seams inspected specifically
- CP-a11y — text-over-image contrast verified against the scrimmed composite, not the raw photo
- CP-build — green

---

### Phase 6 — Lock-in

Makes regression mechanically impossible rather than a matter of discipline.

1. **Clear the default Tailwind palette**: `@theme { --color-*: initial; }`. `bg-white`,
   `text-gray-500` and every other default utility stop existing — verified against the engine. Note
   this does **not** block arbitrary values; see the verified limitation in Phase 2.
2. Flip Stylelint, ESLint and the CI counter from report-only to **blocking at zero**. The ESLint
   arbitrary-value rule is the one that actually closes the `bg-[#hex]` hole and must be blocking.
3. Delete the Phase 1 compatibility aliases and `tailwind.config.ts`.
4. Add dual-theme visual regression to CI: Playwright `toHaveScreenshot` for all 31 routes × 2 themes.
   This is the only layer that catches the failure lint cannot see — a token that *is* used but mapped
   to the wrong value.
5. Add `@axe-core/playwright` contrast checks per route per theme, so a white-on-white regression fails
   the build instead of reaching a Sunday morning.

**Checkpoints**
- CP-static — `bg-white` is a build error; a deliberate violation fails CI
- CP-ratchet — all counters at zero; baseline file deleted
- CP-visual — 62 screenshots (31 routes × 2 themes) committed as the regression baseline
- CP-a11y — full-site axe pass, both themes, zero violations
- CP-build — green

---

## 4. Coverage guarantee

| Phase | Files |
|---|---|
| P1 — tokens | 5 |
| P3 — chrome | 5 |
| P4a — home | 10 |
| P4b — media | 24 |
| P4c — forms | 16 |
| P4d — content | 14 |
| P4e — support | 13 |
| **Total** | **87** |
| **Unassigned** | **0** |

Verified by script: every `.tsx` and `.css` file under `app/` and `components/` maps to exactly one
phase. Phases 0, 2, 5 and 6 are cross-cutting and touch files already counted above.

## 5. Open decisions for Josiah

1. **Primary button color.** White text on brand cyan is 2.74 and fails AA. Three options: darken the
   fill to `#008299` for white text (brand shifts slightly), keep `#00abc9` with navy text (5.65 AA,
   brand hue fully intact, different look), or keep cyan+white only for large text ≥24px and use the
   darkened fill elsewhere. This affects every CTA on the site.
2. **Eyebrow labels.** Cyan-on-white at 2.74 fails. Switching them to `#007b91` (4.95) is a visible but
   small change to a very frequently used element.
3. **Default theme.** Currently `system`. A first-time visitor on a dark-mode phone currently gets a
   half-broken dark site; after this work they get a correct one. Worth confirming `system` is still
   wanted versus defaulting to light.
4. **Sequencing.** Phase 0 delivers visible fixes within a day and is independently valuable. Confirm
   we start there.
