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

## 5. Decisions

**Resolved 2026-09-21 (Josiah):**

1. **Primary button color → darken the fill to `#008299`.** Keeps white text, verified 4.51:1 (AA).
   The deeper cyan applies to *button fills only*; eyebrows, icons, dividers and accents keep the exact
   brand cyan `#00abc9`. Lands in Phase 1 with the rest of the token work so every CTA changes in one
   reviewable commit — deliberately **not** bundled into Phase 0.
   Note the site already contains the accessible inverse pattern: the `bg-brand-cyan text-brand-navy`
   buttons on `/give`, `/ministries`, `/wednesday`, `/life-groups` and `ConnectSidebar` are navy-on-cyan
   at 5.65:1 and need no change. Those were among the 23 classes emitting no CSS at all, so they had
   been rendering unstyled rather than wrong.
2. **Sequencing → start at Phase 0.** Done; see below.

**Still open:**

3. **Eyebrow labels.** Cyan-on-white at 2.74 fails AA. `#007b91` (4.95) fixes it but is a visible change
   to a very frequently used element. Decide during Phase 1.
4. **Default theme.** Currently `system`. A first-time visitor on a dark-mode phone gets a half-broken
   dark site today and a correct one after this work. Worth confirming `system` is still wanted.

---

## 6. Phase 0 — complete (commit `302c44c`)

All five checkpoints passed.

| Defect | Before | After |
|---|---|---|
| Dead `tailwind.config.ts` | 23 class usages emitting zero CSS | Palette ported to `@theme`, usages remapped to `brand-cyan`/`brand-navy`, config deleted |
| Leading-zero opacity | 45 modifiers emitting zero CSS across 20 files | 0 |
| Invisible navigation | Logo, toggle and hamburger white-on-white on ~10 routes | Declarative route treatment, CSS-driven, fails safe |

**Checkpoint results**

- **CP-static** — `scripts/verify-classes.mjs` compiles all 233 colour-utility candidates in the tree
  through the real Tailwind engine: every one emits CSS. The checker was itself verified by injecting a
  dead-config class, a leading-zero modifier and a nonexistent colour, confirming it reports all three
  and exits non-zero. Wired up as `npm run verify`.
- **CP-static** — grep for leading-zero opacity modifiers returns 0.
- **CP-visual** — the nav bug was confirmed in a real browser against production before the fix
  (logo and hamburger absent on `/give` and `/connect`, present on `/`), and the route classification was
  measured the same way rather than grepped.
- **CP-build** — `tsc --noEmit` clean; ESLint clean apart from the pre-existing `set-state-in-effect`
  pattern on an untouched `setMounted` line, which predates this work and does not block Vercel.
- **CP-visual (baseline)** — see the note below.

**Deviation from plan, recorded honestly:** the intended full 31-route light-mode screenshot baseline
was not captured as a committed artifact. This sandbox's egress denies both the production host and
Google Fonts, so a local build cannot render faithfully (`next/font/google` fails offline) and
screenshots taken here would differ from production in font metrics. Visual verification was done
through a real browser against production instead, which is better evidence but not a diffable
artifact. **The committed dual-theme Playwright baseline moves to Phase 1**, where it belongs anyway —
it needs to run somewhere with network access (CI or a workstation), not in this sandbox.

**Carried forward to Phase 3 as planned:** the drawer still themes itself with `isDark` ternaries. Only
the top bar was converted here, since that is where the invisible-chrome defect lived. The drawer is
reachable and correct after hydration; its SSR flash is Phase 3's problem.

---

## 7. Phase 1 — complete (commit `b236617`)

**Decisions applied:** CTA fills → `#008299`; `--accent-text` darkens to `#007b91` on light surfaces
and returns to full brand cyan in dark; default theme stays `system`.

### What shipped

The full token layer — four surface levels, paired foregrounds, three distinct accent roles, borders,
shadows, scrim and media tokens — exported via `@theme inline`. The `.dark` block is now **only values**.
It was previously a set of per-class `.dark .glass { … }` overrides, each one a place to forget a
component; because the shared utilities consume tokens, re-pointing tokens themes all of them at once.
That collapse is the whole point of the layer.

`color-scheme` and `themeColor` both landed. Thirteen dead legacy variables deleted; the six with live
consumers kept as aliases. `--bbc-navy` now points at `--fg`, which is what it always meant.

Verified live in production: `--surface`, `--fg`, `--accent-solid`, `--accent-text`, `--accent-fg` all
resolve; `color-scheme` reports `light`/`dark` correctly; both `theme-color` metas present;
`.btn-primary` computes to `rgb(0,130,153)` on white text; `.eyebrow` computes to `rgb(0,123,145)` in
light and `rgb(0,171,201)` in dark, exactly as designed.

### Checkpoint results

- **CP-a11y** — `scripts/verify-contrast.mjs` parses the real token values out of `globals.css`,
  resolves `var()` indirection, flattens alpha over the surface each token actually sits on, and checks
  **52 pairings against AA in both themes. All pass.** It validates against the *worst* surface in each
  family, per Primer.
- **CP-a11y (the gate earned its keep)** — it caught two things on first run: the focus ring at 2.74:1,
  below the 3:1 WCAG 1.4.11 requires of a non-text indicator; and one check of mine that modelled
  `--fg` on `--accent`, a pairing that does not exist. The latter produced `--accent-fg`, a
  theme-invariant token for the foreground on brand cyan — using `--fg` there would give
  light-blue-on-cyan at 1.83:1 in dark mode. Verified the gate fails correctly by lightening
  `--fg-muted` and confirming a non-zero exit.
- **CP-static** — `verify-classes` still green across 233 candidates.
- **CP-build** — `npm run verify` (tsc + classes + contrast) passes; Vercel READY.
- **CP-visual (no-regression)** — the honest one. Measured low-contrast text on `/give` on the Phase 0
  deployment and the Phase 1 deployment, same page, same theme: **dark 50 → 50, light 33 → 33.**
  Identical counts, identical items, identical ratios. Phase 1 changed neither theme's contrast
  profile, which is what it promised.

  *What those numbers do not prove:* the absolute values come from a quick in-page heuristic whose
  backdrop resolution cannot see through photos, overlays or blend modes, so they over-count. The
  trustworthy part is the **delta, which is zero**. The committed Playwright sweep has the better
  implementation and will produce the authoritative figures in CI.

### Known and expected: dark mode is still broken

Dark mode now has correct surfaces and correct chrome sitting under **hardcoded navy text**. On `/give`
that is ~50 elements around 1.06:1 — card titles and descriptions in `text-[#00205B]` on a dark
`.glass` surface. This is not new: `.dark .glass` was already `#162030` before any of this work, so
navy-on-dark was already invisible. Phase 1 simply measured it. Phase 4 fixes it.

**Consequence for the visual baseline:** the Playwright sweep cannot be committed green yet, because
dark mode legitimately fails its own contrast assertion on most routes. That is the test correctly
reporting unfinished work. It goes green as Phase 4 lands, route by route — which makes it a useful
progress meter rather than a broken build.

### Added to Phase 6 cleanup

Eleven utility classes in `globals.css` have **zero usages** anywhere in the tree: `glow-teal`,
`glow-navy`, `orb-teal`, `orb-navy`, `text-gradient`, `text-gradient-navy`, `text-gradient-gold`,
`glass-deep`, `glass-dark-deep`, `glass-light`, `btn-shimmer`, `btn-pulse`, `float`. Dead CSS is the
same liability the dead `tailwind.config.ts` was. Not removed here to keep this diff reviewable.
*(Done in Phase 2 instead — see below.)*

---

## 8. Phase 2 — complete (commit `0f15b91`)

### The token-file split was a prerequisite, not tidying

The plan called for Stylelint with "the token file" exempted. But `globals.css` was the project's
**only** stylesheet, so that exemption would have exempted every line of CSS in the codebase and the
rail would have been theatre. Tokens now live in `app/tokens.css`, the single sanctioned home for a raw
colour value; every other stylesheet must reach colour through `var()`.

Driving `globals.css` to zero raw colour surfaced two things worth having:

- **The thirteen dead utility classes above were the bulk of the remaining literals**, so they were
  deleted here rather than tokenised. Tokenising dead code would have been worse than removing it.
  Phase 6 cleanup pulled forward because the rail forced the question.
- **The rest resolved into a real token family**: `--fg-on-dark`, `--fg-on-dark-muted`,
  `--surface-on-dark`, `--border-on-dark*`, `--hover-on-dark` — content sitting on ground that is dark
  in *both* themes (a navy band, a hero photo, the scrimmed nav). Theme-**invariant** on purpose; Radix
  ships `black-a`/`white-a` alpha scales for exactly this case. Swapping them to `--fg` would turn
  white text on a navy hero light-blue in dark mode, over ground that never changed.

Nav chrome values moved too, leaving only selector logic in `globals.css` — which let the
`.dark .bbc-nav[data-chrome="glass"]` rule be **deleted outright**, since `--nav-ink-glass` is itself
re-pointed under `.dark`. Verified in production: `--nav-ink` resolves to `#00205b` in light and
`#c8d4e8` in dark with no `.dark` nav selector anywhere in `globals.css`.

### The rails

| Rail | Covers | Severity |
|---|---|---|
| Stylelint | hex, named colours, raw `rgb()`/`hsl()` in CSS; colour properties restricted to `var()`/`transparent`/`currentColor` | error (passes today) |
| `bbc/no-raw-color` (local ESLint rule) | Tailwind arbitrary colour classes; colour literals in inline `style` objects | **warn** — 957 pre-existing |
| `scripts/ratchet.mjs` | eight migration metrics, may only decrease | error on any increase |

**Why the ESLint rule is load-bearing rather than belt-and-braces:** verified against the engine,
clearing the palette with `--color-*: initial` does **not** block `bg-[#00205B]`. Arbitrary hex is the
dominant pattern in this codebase, so this rule is the only thing that closes that hole.

**Why it is `warn` and not `error`:** 957 pre-existing violations. A gate that always fails is one
everybody learns to ignore. The ratchet does the gating; the rule is promoted to `error` in Phase 6.

### Baseline recorded (`scripts/ratchet-baseline.json`)

| Metric | Count |
|---|---|
| `raw-hex` | 1007 |
| `raw-rgb-fn` | 322 |
| `arbitrary-color-class` | 957 |
| `unthemeable-tailwind-class` | 425 |
| `bg-white-route-shell` | 26 |
| `js-theme-branch` | 15 |
| `unthemed-files` | 61 |
| `eslint-errors` | 53 |

These are the numbers Phases 3–5 drive to zero. Re-baseline with `npm run ratchet:update` after each
phase; the file is deleted in Phase 6 when the rails become hard errors.

### Checkpoint results

- **CP-static (each rail catches its own bug class)** — proven, not assumed. A raw hex, an `rgba()` and
  a named colour injected into `globals.css` produce six Stylelint errors and exit 2. A fixture of
  arbitrary colour classes and inline-style literals is flagged 8/8, while non-colour arbitrary values
  (`border-x-[6px]`, `w-[72ch]`, `top-[-15%]`) and `var()` usages are correctly ignored. One injected
  line trips four ratchet metrics at once and exits 1.
- **CP-static (the token file does not trip its own rules)** — `app/tokens.css` holds 39 hex values and
  many `rgba()` calls and passes Stylelint cleanly via the single `overrides` entry.
- **CP-ratchet** — baseline recorded above.
- **CP-build** — all five rails green locally; Vercel READY; production verified to load every token
  through the new `@import`, including the new `--fg-on-dark` family and `--nav-scrim`.

### Deviation, recorded honestly

CI runs the rails on push and PR but **does not gate the Vercel deploy**. The rails pass on the current
tree locally, but they have never run on a GitHub runner, and blocking deploys on an unproven workflow
is how you end up unable to ship a Sunday-morning fix. Once `verify.yml` has a few green runs, make it
a required status check on `main` and add `needs: verify` to the deploy workflow. That is now a Phase 6
step.

The Playwright sweep is also deliberately absent from CI: dark mode legitimately fails its own contrast
assertion until Phase 4, and adding a job that always fails would contradict the reasoning above.

---

## 9. Phase 3 — complete

**This is the phase where the site actually starts responding to the theme.**

### Scope change, made deliberately

The plan had Phase 3 as chrome plus route shells only, with component interiors in Phase 4. Measuring
first showed that would have shipped something **worse than before**: navy-as-text outnumbers
navy-as-background 448 to 15, and there were ~79 non-shell `bg-white` instances, so sweeping only the
shells would have given dark-mode visitors a dark page covered in white patches with invisible navy card
text. The default theme is `system`, so that is real visitors on dark-mode phones. Phase 4's *mechanical*
layer therefore came forward into this phase. Phase 4 keeps the genuinely bespoke files.

### What shipped

| Area | Change |
|---|---|
| Navbar drawer | Off all 15 `isDark` branches. The only `isDark` uses left in the app are the toggle's own icon and label, both `mounted`-gated, neither a colour. **No colour decision anywhere now comes from JS.** |
| Drawer shell | `--surface-raised` — identical in light, `#162030` in dark instead of brand navy, which also stops it clashing with the bar it slides from |
| Footer | `bg-brand-navy`, not `--surface`: it is deliberately navy in *both* themes and is not a page surface |
| "Plan a Visit" ×2 | Were inline `background:#00abc9; color:white` — 2.74:1 — so Phase 1's `.btn-primary` fix never reached them |
| Route shells | All 26 `min-h-screen bg-white` → `bg-surface`. That metric is now **0** |
| The sweep | ~800 literals migrated by **role**, not by value |
| Clearstream form | 13 invisible labels in dark; also fixed a 2.74:1 submit button and 2.81:1 placeholder that were failing in *light* mode |

**The distinction the whole phase turns on:** navy-as-TEXT becomes `--fg` and inverts; navy-as-BACKGROUND
stays brand navy. Getting that backwards would flip a navy hero to pale blue in dark mode. Cyan fills were
classified by what sits on them — a fill carrying white text or a white glyph becomes `--accent-solid`,
because white on brand cyan fails both the 4.5:1 for text and the 3:1 for a non-text graphic. The 24
translucent `bg-white/N` chips were left alone: they sit on ground that is dark in both themes.

`/about` needed the sharpest version of this. It has two deliberately-navy bands, and inside those brand
cyan is legible at 5.65:1 while the darkened `--accent-text` would be a **regression** at 2.4:1. Each of
its eleven constant usages was resolved by walking the section boundaries to see which band it sits in.

### Result, measured in a real browser

**Every route audited measures 0 invisible-text elements in both themes**, except one decorative step
counter at exactly 2.00:1 (perceivable, up from 1.52). Routes verified: `/`, `/about`, `/beliefs`, `/bx`,
`/community`, `/connect`, `/connect/care`, `/connect/stay-connected`, `/give`, `/life-groups`, `/live`,
`/ministries/kids`, `/ministries/students`, `/sermons`, `/sermons/bts-8`, `/series/[slug]`, `/staff`,
`/visit`, `/wednesday`, `/who-is-jesus`. `/give` alone went from **50 → 0**.

| Metric | Phase 2 | Phase 3 |
|---|---|---|
| `raw-hex` | 1007 | **319** |
| `arbitrary-color-class` | 957 | **226** |
| `raw-rgb-fn` | 322 | **245** |
| `bg-white-route-shell` | 26 | **0** |
| `js-theme-branch` | 15 | **4** |
| `unthemed-files` | 61 | **46** |

### Five bugs in my own tooling, all caught by verifying rather than trusting

This is the honest part, and the transferable lesson.

1. **Regexes ending `\]\b` matched nothing.** `\b` asserts nothing between `]` and `"`. Patterns ending
   in a digit worked, bare ones didn't — so the first pass quietly converted 297 of ~800 and reported
   success. Found by checking residue counts instead of reading the summary.
2. **The shape heuristic mis-read sections carrying a `border-b`** as cards. The pre-existing `dark:`
   variants were ground truth for which surface each element is.
3. **The contrast probe mis-parsed `oklab()`.** Tailwind v4 emits opacity modifiers as `oklab()`, and
   taking "the first three numbers" reads L/a/b as R/G/B — so white-at-60% scored as near-black and the
   footer produced **33 phantom failures** on a page that was clean. Fixed by letting the browser resolve
   colours through a 1×1 canvas.
4. **It flagged disabled controls,** which WCAG 1.4.11 explicitly exempts.
5. **It compared hero text against the page, not the video behind it** — `backdrop()` bailed on a CSS
   `background-image` but not on a real `<img>`/`<video>`. That was **18 phantom failures on the homepage
   alone**, every one at exactly 1.00:1.

A contrast probe is mostly an exercise in knowing when it *cannot* judge. Every false positive it emits
is a future failure someone learns to ignore.

`app/layout.tsx` also got clobbered **twice** by the sweep, which rewrote its `themeColor` meta value to
`var(--fg)` — meaningless in a `<meta>` attribute — the second time *despite* a comment saying it must
stay a literal. A sweep needs an explicit exclusion list for non-CSS contexts, not a comment asking it
politely.

### Left for Phase 4/5, deliberately

Dark hero gradients (theme-invariant art direction), white-on-dark text inside those heroes, data-driven
series accent colours, the internal analytics dashboard, and `SermonNotes`. That last one matters: most of
its ~40 literals belong to a standalone **print document** it generates. Paper has no theme, so those must
stay light-on-white, and separating print from screen is real work rather than a sweep.

Also worth recording: `unthemeable-tailwind-class` (327) has a **legitimate floor**. `text-white/60` on the
navy footer is correct, not a bug, so that metric will never reach zero and should not be driven there.

---

## 10. Phase 4 — complete

Clusters 4a–4e, the focus system, feedback and on-dark token families. Not yet deployed.

### The two structural gaps this phase closed

**Focus indicators barely existed.** 209 interactive elements, 2 with any focus styling, and 11 files
calling `outline-none` with nothing put back — a WCAG 2.4.7 Level AA failure affecting every keyboard
user. The fix is one unlayered `:focus-visible` rule in `globals.css`, which outranks Tailwind's layered
utilities (verified by compiling and checking nesting depth, not assumed), so a stray `focus:outline-none`
can no longer suppress it. `--focus-ring: #008ba3` is theme-invariant and clears 3:1 on all eleven grounds
the site paints. The redundant per-input rings came out of 9 files so there is one indicator, not two.
Three scoped `outline: none` cases (two textareas, one contenteditable) got explicit `:focus-visible`
replacements, since a 1.5px tinted border is not an indicator.

**On-dark ink had one tier and it was wrong.** `--fg-on-dark-muted` at 0.50 alpha measured **4.36:1** on
the navy band's lightest gradient stop. The family is now `--fg-on-dark` / `-body` (0.86) / `-muted`
(0.54), plus `--hover-on-dark-strong` because `:active` was reusing a value identical to hover and so
never showed a press.

### Live accessibility defects found and fixed

These were real, in production, before this phase:

| Where | Measured | Now |
|---|---|---|
| `/who-is-jesus` "← Back" | **1.00:1 — invisible** in light mode | on-dark family on a restored band |
| `/who-is-jesus` step title + body | white on white in light mode | on-dark family |
| `ThreeCircles` Next/Talk CTA | 2.74:1 | `--accent-solid` + `--fg-on-accent` |
| `GlobalAudioPlayer` — 11 text uses | 2.59–4.44:1 | `--fg-on-dark-muted`, 5.2–6.1:1 |
| `LivePlayer` `#4a5568` (×6) | 2.17:1 | `--fg-on-dark-muted` |
| `LivePlayer` `#6b7f9e` (×24) | 4.02:1 | `--fg-on-dark-muted` |
| `/sermons` CTA section rule | navy-on-navy, invisible | `--border-on-dark` |
| `/sermons/[slug]` passage link | 2.4:1 (`--accent-text` on navy) | `--accent`, 5.65:1 |
| `SermonGrid` series label + "Clear" hover | 2.74:1 / 3.78:1 | `--accent-text` / underline |
| 4 ministry tiles + CTA borders | **rendered nothing** | see below |

That last row was not a contrast bug but broken CSS. `app/ministries/page.tsx` and `app/wednesday/page.tsx`
build tints by concatenating alpha onto a data value — `` `${color}18` `` — and three of those data entries
had been converted to `var(--accent-text)`. `var(--accent-text)18` is not a colour, so those icon tiles had
no background and those borders fell back to `currentColor`. Fixed with `color-mix`, which accepts a hex or
a `var()` and so makes the call site indifferent to which the data holds.

### What "dark in both themes" now means explicitly

Three families, all theme-invariant, each with a documented reason rather than a habit:

- `--theater-*` — the live page. Also load-bearing: `lib/nav-treatment.ts` classifies `/live` as an overlay
  route from a measured backdrop of L 0.01, so the navbar floats there with white ink. If that surface
  followed the theme, light mode would put white ink on a white page — the exact Phase 0 defect.
- `--player-*` — the audio transport, for the reason Spotify's and Apple Music's are dark: one persistent
  object inverting mid-track is worse than disagreeing with a light page.
- `--brand-band` / `--brand-band-deep` / `--brand-ink` — the navy feature bands. Three distinct
  treatments, not variants: a migration without `--brand-ink` kept reaching for `--brand-band` and quietly
  turned flat navy sections into gradients.

`--plate` is the counterpart: a fixed light ground for artwork drawn for white. `ThreeCircles`' diagram
palette is tuned for a white card, and the card had been converted to `--surface-sunken`, which goes
near-black in dark mode and erased the illustration.

### Verification

`verify-contrast` went from 84 pairings to **216**, and now checks gradients too — via
`--brand-band-lightest` and `--brand-band-deep-lightest`, named stops that exist purely so the worst case
on a gradient is verifiable at all. A gradient has no single value to read, which is how the muted ink sat
at 4.36:1 unnoticed.

`theme.spec.mjs` gained a keyboard focus sweep: 25 real `Tab` presses per route per theme, asserting a
visible indicator on each control. The Tab presses come from the runner deliberately — a synthetic
`KeyboardEvent` does not move focus, and the `el.focus()` workaround sets `:focus-visible` for text inputs
but not dependably for buttons, so a bare button would pass a check built that way.

`verify-classes` now scans `lib/` as well, which it did not, and immediately earned it: the on-dark family
had never been exported to `@theme`, so `text-fg-on-dark-muted` compiled to nothing.

### Ratchet

| metric | Phase 3 | Phase 4 |
|---|---|---|
| raw-hex | 319 | **106** |
| raw-rgb-fn | 245 | **80** |
| arbitrary-color-class | 226 | **79** |
| unthemeable-tailwind-class | 327 | **192** |
| unthemed-files | 46 | **38** |

Part of that drop is honesty rather than work: `scripts/color-literal-exemptions.mjs` now declares, with a
reason each, the places a literal is *correct* — satori/`next/og` PNGs and `@react-pdf` output resolve no
CSS variables at all; `buildPrintHTML` emits a standalone document; `@media print` blocks re-point tokens
to ink; and a hex that gets alpha concatenated onto it is load-bearing as a string. This exists because
`app/layout.tsx` was clobbered twice, the second time despite a comment saying it must stay literal. A
comment is documentation; a sweep needs data. The ratchet reads that registry, so the counts now measure
real residue.

`NotesEditor`'s print block shows the payoff of tokens: one reset there makes the whole document print as
ink on paper from either theme, instead of sending light-grey text to the printer in dark mode.

### Open, with measurements — for Phase 5

1. **Identity palettes fail AA as text in light mode — all eleven.** Per-ministry hues (kids `#c9a84c`
   2.11:1, adults `#4ab8c4` 2.17:1, missions `#e07b54` 2.72:1, college `#9b6ecc` 3.53:1, students
   `#4a7fcb` 3.74:1, `#5b7fa6` 3.86:1, `#8b6fae` 3.89:1) and per-series accents (amber `#f59e0b` 1.98:1,
   emerald `#34d399` 1.78:1, violet `#a78bfa` 2.51:1, slate `#94a3b8` 2.37:1). Several fail 3:1 even as
   graphics. This needs a dual-tone identity palette — a graphic value and a darker text value per hue,
   the same split the brand already has in `--accent` / `--accent-text` — not a per-hue token, since the
   hues are content-driven. A scalable form is `color-mix` against a per-theme mix target.
2. **Photo scrim ramps have no token.** Multi-stop legibility ramps over photography at
   `MinistriesSection` (×2), `app/visit/page.tsx` (×3), `ministries/students`, `ministries/kids`,
   `components/home/Hero.tsx`, `VideoHero.tsx`, `app/sermons/page.tsx`. `--scrim` is a single flat value
   *and* theme-dependent, so it can express neither the ramp nor a permanently-dark hero. Wants a
   `--scrim-hero-*` stop set.
3. **`ThreeCircles`' diagram palette.** TEAL 2.74:1 and RED 4.18:1 on the plate; the SVG labels sit at
   2.16:1 and want ~0.65 alpha. The circles likely need outlines so the boundaries survive regardless of
   fill contrast.
4. **`ScriptureInline.tsx` is dead code** — 24 literals, zero importers; `LivePlayer` has its own inline
   verse rendering that superseded it. Not themed, on purpose: theming code that never renders would have
   inflated the numbers. Delete in Phase 6 or revive it deliberately.
5. **`app/admin/analytics/page.tsx`** — 12 literals, excluded from the visual sweep as internal, but it
   will look broken in dark mode for whoever opens it.

### Lesson recorded

A CSS comment inside a `<style>{`...`}</style>` JSX template literal must not contain a backtick — it
closes the string and turns the rest of the file into JSX. Cost one `tsc` cycle to find. Related: my own
global focus rule initially carried `border-radius: inherit`, which re-shapes the element on focus rather
than the outline; browsers already curve an outline to its element.

---

## 11. Phase 5 — complete

Media, assets and third-party embeds. Not yet deployed.

### CP-static passed before it was checked

Zero `filter: brightness`, zero `opacity` dimming, and no `<picture media="(prefers-color-scheme: dark)">`
anywhere. So Soueidan's rule — **do not dim** — was never violated here, and the OS-preference limitation
recorded as a Phase 5 decision only ever applied to `themeColor` in `app/layout.tsx`, which is already
documented in place. Nothing to fix, and worth knowing rather than assuming.

### The logo shipped twice

`logo-white.png` and `logo-black.png` were the **same artwork**: identical alpha, identical opaque pixel
count (1,997,214 each), one colour bucket apiece. Both shipped on every page while six CSS rules — keyed on
`.dark` *and* `data-chrome` — hid one, and a navy band or the theater page would have needed a third
variant.

A single-colour mark does not need to be an image. It needs a shape and a colour, so the shape is now a
mask and the colour is `currentColor`. In the navbar it picks up `--nav-ink`, which is already computed per
chrome and per theme, so the wordmark and the hamburger finally derive from one value instead of two
parallel mechanisms. One 49KB asset replaces 178KB of duplicated PNG, four `<Image>` elements become two
spans, and the mark is now correct on any ground the site has without variants.

**Deliberate deviation from the plan**, which called for inline SVG: there is no vector source, and tracing
a wordmark risks shipping a subtly wrong logo, which is worse than a raster mask. The mask keeps the artwork
exactly as drawn and gains the same theming. If a vector arrives, the `mask-image` URL is the only line
that changes. Both prefixed and unprefixed mask properties are set, because unprefixed is Safari 15.4+ and
this audience has a long tail of older iPads.

### A watermark that rendered nothing

`ConnectBand` drew the "A" mark under `mix-blend-mode: screen`, with a comment explaining that screen
"leaves only the white logo lines visible." The asset has no white lines — every opaque pixel is pure
black — and `screen(0, b) = b`, so the watermark was invisible. It had presumably never rendered. Masking
the same artwork and painting it with `--fg-on-dark` makes it appear, with no blend mode.

### Eleven scrims, four bases

The photo scrims were inline at four different near-identical base colours — `rgba(0,16,48)`,
`rgba(7,16,30)`, `rgba(0,20,42)`, `rgba(0,20,60)` — which is drift, not design, on the most visible
surfaces the site has. Now one `--scrim-base` and four ramp shapes named for where the text sits:
`--scrim-hero`, `--scrim-card`, `--scrim-card-soft`, `--scrim-side`, plus `--scrim-veil` for a portrait
vignette that carries no text.

CP-a11y is satisfied against the **scrimmed composite**, not the raw photo, and against the worst possible
photo — a blown-out white sky. At the dark end of each ramp white text lands at 16.5–17.3:1 and the muted
tier at 5.6+. The light stops carry no text, deliberately: at 0.45 alpha white would be 3.07:1.

### The letterbox hole

`LivePlayer`'s YouTube well was `bg-black` — pure black punched into a `#0d1525` page while the iframe
loads, which is exactly the defect `--media-bg` exists to prevent. It is now `--theater-sunken`, a well
rather than a hole, with a border so the seam against YouTube's own chrome reads as intentional. YouTube
will not theme, so that seam is permanent and is better owned than hidden.

Both hero video boxes also had no ground, so in light mode a white flash preceded a dark hero until the
poster decoded. They now paint `--scrim-solid` — the same value the scrim above them settles to.

`app/bx`'s Google Calendar iframe was already correctly wrapped, and the Clearstream form is injected HTML
we style rather than an iframe, so it themes outright. Every `<video>` uses `object-cover` and therefore
never letterboxes; the letterboxing risk was confined to the one embed and the card thumbnail wells.

### Icons

18 of 21 hardcoded `fill`/`stroke` values converted, against the 120 already on `currentColor`. The three
left are the two wordmark rects inside `buildPrintHTML` (a standalone printed document) and one case where
`currentColor` would have been wrong: `ConnectSidebar`'s play triangle is a **knockout** through the YouTube
shape, so with `currentColor` it would vanish. It tracks `--surface-raised` instead and now follows the card
in both themes rather than being white on a dark card.

No `var()` went into an SVG presentation attribute. It works in current Chromium — verified in a real
browser rather than assumed — but support has been patchy across Safari versions, so every token goes
through `style={{ … }}`, which is mapped through the cascade in every engine.

### The identity palettes, solved properly

All eleven content-driven hues failed AA as text in light mode (1.78–3.89:1) and four failed on dark too.

A uniform `color-mix` was tried first and rejected: at the 60% needed by emerald, `#4a7fcb` landed at
8.01:1, so every hue collapsed toward the same dark and stopped being distinguishable from the others —
which defeats the reason for having them. So each hue carries a **triple** in `lib/identity-colors.ts`:

- `hue` — the raw colour, decorative fills only (the 1px identity bar, a dot), where nothing reads it
- `light` / `dark` — accessible as text, mixed only as far as needed to clear 4.6:1 on the worst surface
- `solid` — safe as a fill under white text, and theme-invariant, because a filled identity button that
  inverted would put white text on a pale fill, which is the failure being fixed

That is the split Material, Primer and Linear all make for category colours, and the same split the brand
already had in `--accent` / `--accent-text`. Two filled buttons on `/ministries/students` were putting
white text on the raw hue at 4.05:1 and now use `solid` at 4.60:1.

`.identity-ink` / `.identity-border` do the theme switch as classes rather than one variable, because a
custom property declared on `:root` is substituted **on `:root`** — `--identity-ink: var(--identity-light)`
would resolve against a value the element has not set yet and fall back to nothing. The switch has to
happen in a selector that matches the element carrying the pair.

### A new rail, because the old ones structurally could not cover this

`verify-contrast` reads token pairings out of `app/tokens.css`. The identity hues are deliberately not
tokens — content adds more of them — so that gate could never see them, which is exactly how all eleven
came to fail unmeasured. `scripts/verify-identity.mjs` checks the table directly: `light` as text on the
light surfaces, `dark` as text on the dark ones, and white on `solid`. It was tested by feeding it the raw
kids hue as its light value, which it caught at 2.11:1, and it is in the `verify` chain.

### The diagram

`ThreeCircles` sits on `--plate`, a fixed light ground, so its ink is fixed too — a theme token there would
break artwork drawn for white. On the plate, brand cyan measured 2.74:1, below both the 4.5:1 its text
labels need and the 3:1 a meaningful stroke needs; `#e04428` was 4.18:1; and the "Money / Success /
Religion" labels were 2.16:1. The palette is now darkened to measured values (4.6–15.5:1), with
`BAND_TEAL` split out and left as brand cyan, because the step text and ghost numeral sit on the navy band
where the darkened value would be a **regression** (4.75:1 → 2.63:1).

### Ratchet

| metric | Phase 4 | Phase 5 |
|---|---|---|
| raw-hex | 106 | **83** |
| raw-rgb-fn | 80 | **56** |
| arbitrary-color-class | 79 | **70** |
| unthemed-files | 38 | **34** |

`verify-contrast` is at 230 pairings, plus 11 identity hues on their own gate.

### Open for Phase 6

1. **`logo-white.png`, `logo-black.png`, `logo-a-mark.png` are now unreferenced** — 188KB of dead assets.
   Left in place deliberately: removing brand files is the church's call, not a cleanup decision, and they
   cost nothing at runtime since Next only serves what is requested.
2. **`ScriptureInline.tsx`** — still dead, 24 literals, zero importers.
3. **`app/admin/analytics/page.tsx`** — 12 literals, excluded from the visual sweep as internal, but it
   will look broken in dark mode for whoever opens it.
4. **`unthemeable-tailwind-class` (192) has a legitimate floor** and should not be driven to zero —
   `text-white/60` on the navy footer is correct. Unchanged from the Phase 3 note.
5. `SermonGrid`'s `SERIES_COLORS` now carries an `ink` pair that nothing in that file consumes — every use
   there is decorative. Kept for parity with the series page; drop it if that parity is not wanted.

### Addendum — a bug class the static gates structurally cannot see

Phase 5 was verified in a real browser against the live deploy, and that turned up two defects the five
gates had all passed.

**1. The masked wordmark was navy on the dark hero.** The mark used `background-color: currentColor` on the
assumption that the navbar's colour *is* `--nav-ink`. It is not: `--nav-ink` is applied to `.nav-ctl` and
`.nav-bar-line`, never to the nav element, so the logo link inherited the page's own colour. The
measurement was unambiguous — `data-chrome="transparent"` over the dark hero, `--nav-ink` resolving to
white, and the mark computing to `rgb(0,32,91)`. The hamburger was never affected because it *paints* the
variable rather than inheriting it; the wordmark now does the same.

**2. Identity CTAs rendered their light ink in dark mode, at 3.79:1.** Their sibling labels in the same
card switched correctly, with identical classes and identical inline variables, and a freshly created
element with the same markup got it right — which ruled out markup and cascade.

The cause: because the theme flip changes **which rule** supplies `color`, Chromium holds a transitioned
colour at its pre-flip value — indefinitely, not for the transition's duration. `transition: none` resolved
it instantly. Narrowing `transition-all` to `transition-colors` did **not** fix it, because `color` is
still in that set; nor did re-routing through an intermediate custom property. Both were tested live before
shipping, and both would have looked like plausible fixes on paper.

A themed token is not affected: `text-fg` keeps the same rule and only the variable's value changes, which
transitions normally. So this is specific to a rule swap, and the property list now lives in the
`.identity-ink` rule itself — unlayered, so it beats any Tailwind transition utility a call site adds, and
the hazard cannot be reintroduced by a className.

**Why all five gates missed both.** Every phase so far verified themes by presetting `localStorage` *before*
load, so nothing ever exercised a live toggle — and a toggle is how visitors actually change the theme.
`verify-contrast` reads token values, not what a page paints. `verify-classes` proves a class emits CSS.
The ratchet counts literals. `theme.spec.mjs` renders each theme from a fresh load. None of them models
"the theme changed while the page was open," which is exactly where both bugs lived.

Two follow-ups, recorded rather than rushed: `theme.spec.mjs` should toggle the theme in a live page and
re-assert, in addition to its fresh-load passes; and 62 `transition-all` usages remain across 34 files.
None currently sits on a rule swap, so none is broken today, but `transition-all` animates layout
properties too and is worth narrowing.

Lastly, the ratchet only skipped lines that *start* with a comment marker, so a sentence inside a block
comment mentioning a colour counted as residue — the gate failed on its own documentation. It now tracks
block-comment state, which also cleared eight other miscounted lines.

---

## 12. Phase 6 — complete. The rebuild is locked.

Regression is now mechanically blocked rather than a matter of discipline.

### The palette is gone

`@theme { --color-*: initial }`. `text-gray-500`, `bg-slate-100` and every other default colour utility
now emit nothing, so `verify-classes` fails the build on them. It was measured before being switched on —
the codebase had **zero** default-palette utilities left — and `transparent`, `current` and `inherit` were
checked against the engine and are unaffected, because Tailwind does not treat them as palette entries.

Two survive deliberately: **white and black**. `text-white/60` on the navy footer is correct — theme-invariant
ink on a permanently dark ground — and `black/10` as a gradient stop over a photo is a scrim. Zeroing those
would mean a token per alpha step and a visual change to a dozen bands for no gain, which is what the Phase 3
note about a legitimate floor was pointing at. The dangerous case is handled instead by the lint rule, which
rejects an **opaque** `bg-white` or `bg-black` while allowing a translucent wash. The first draft of that
check flagged `bg-white/8` too; that was noise and was narrowed.

Switching the palette off immediately earned its keep: it surfaced form validation still on `red-500` and
`bg-red-50` while `--danger-text` and `--danger-bg` had existed since Phase 4, and a `bg-gray-400` status
dot on the theater page.

### The rails block, and each one is proven to fail

| rail | catches | proven by |
|---|---|---|
| `lint:css` | raw colour in CSS outside the token file | injecting `color: #bada55` |
| `lint:color` | raw colour in components, incl. opaque white surfaces | injecting `bg-[#00205B]` |
| `verify:classes` | a utility that compiles to nothing | injecting `bg-slate-200` |
| `verify:contrast` | a token pairing below AA, worst surface in the family | lightening `--fg-muted` to 1.52:1 |
| `verify:identity` | a content hue unreadable as text | feeding it the raw kids hue, 2.11:1 |

A gate that has only ever passed is not evidence. Each was broken on purpose and confirmed to fail, and the
first attempt at proving `verify:contrast` did not work because the injection used the wrong indentation and
silently no-op'd — which is its own reminder that a green run means nothing if the test never ran.

`bbc/no-raw-color` is now **error**, at zero. It runs through `scripts/lint-color.mjs` rather than bare
`eslint`, because the repo carries 52 pre-existing non-colour errors (unescaped entities, react-hooks, `<img>`)
and chaining plain `eslint` would make the gate permanently red — the trap that got it pulled from the chain
in Phase 2. The scoped gate blocks on colour; the unrelated debt stays visible in `npm run lint` without
holding the build hostage.

### Two holes in the rule, both closed

**The registry.** The rule flagged files the exemption registry already declared correct — a satori PNG, a
print document, a hex that gets alpha concatenated onto it. It could not go blocking while doing that, so it
now reads `scripts/color-literal-exemptions.mjs`, the same data the ratchet reads.

**Hoisted class strings.** The rule only inspected JSX `className` and `style` attributes, so
`const inputCls = "… text-[#00142a] …"` passed clean — and that one was a live inversion bug, near-black ink
pinned onto a surface that goes dark. A rail a variable name defeats is not a rail. It now also checks string
constants whose name looks like a class list.

### Counters

| metric | Phase 5 | now |
|---|---|---|
| raw-hex | 83 | **0** |
| raw-rgb-fn | 56 | **0** |
| arbitrary-color-class | 70 | **0** |
| bg-white-route-shell | 0 | **0** |
| unthemeable-tailwind-class | 192 | 177 · floor |
| js-theme-branch | 4 | 3 · floor |
| unthemed-files | 34 | 14 · floor |
| eslint-errors | 53 | 52 · floor |

The plan said all counters would reach zero. Four of them cannot, and the ratchet now **records why** next to
each so a non-zero number is not mistaken for unfinished work: `text-white/60` on navy is correct; the theme
toggle's own icon and aria-label must read the resolved theme in JS, because you cannot write "Switch to light
mode" in CSS; and `eslint-errors` is unrelated debt. Claiming zero there would have meant either damaging the
site or lying in a config file.

### Deletions, with the owner's approval

`ScriptureInline.tsx` (19 violations, zero importers, superseded by LivePlayer's own verse rendering) and the
three logo PNGs the mask assets replaced (188KB). Both recoverable from history.

`lib/constants.ts` was repeating six ministry hues that `lib/identity-colors.ts` already owned — a second
source of truth for colours that need accessible pairings. It now references the table, and the sixth hue
(`#5cb87a`, which existed only in constants) was measured and added properly.

Also deleted: the six Phase 1 compatibility aliases, after migrating their four remaining consumers. One of
those consumers was `border-gray-100 dark:border-white/8` — a hand-rolled theme pair that `--border` had been
able to express on its own since Phase 1.

### A Phase 5 bug the lint rule found

Worth recording because of how it was caught. Six photo scrims were left **malformed** by the Phase 5 sweep:
`var(--scrim-card) 50%, rgba(7,16,30,0.1) 100%)` — my regex matched only the head of each gradient, leaving an
orphaned stop list and an unbalanced paren. That is invalid CSS, so those overlays painted **nothing**, and the
text over them had been unscrimmed since that phase. Neither `verify-contrast` nor `verify-classes` can see an
invalid inline gradient; it took the colour rule flagging the leftover `rgba(` to expose them.

`--plate` also shipped without a paired foreground, so a white button ended up wearing `--accent-fg` — right
value, right invariance, wrong label. `--plate-fg` exists now, which is the pairing rule this token file
already states elsewhere.

### CI

`verify.yml` gained `lint:color` and `verify:identity`, and a second **visual** job that builds the site and
runs the dual-theme sweep: nav chrome per route, the invisible-text floor, the keyboard focus sweep, an axe
`color-contrast` pass, and — new — a **live toggle** assertion.

That last one exists because of the Phase 5 addendum: every check before it loaded with the theme already
preset, which is not how a visitor changes theme, and two real defects lived in exactly that gap. The
assertion toggles the theme on an open page and fails if any colour that moved on the way out refuses to come
back.

The pixel baseline is gated behind `PIXEL_BASELINE`, honestly: this sandbox cannot run `next build`
(`next/font` cannot reach Google Fonts through the egress proxy), so the reference images have to be generated
on a runner. A `baseline` job does that on manual dispatch; commit the artifact and flip the flag. The other
five assertions need no baseline and block today.

Vercel still deploys independently. Making `verify` a required status check is a repo **setting**, not a file,
and on a church website the call about whether a red rail should block a Sunday-morning fix belongs to a
person — so the recommendation is written into the workflow header rather than forced.

### What remains, deliberately

- **The pixel baseline** — one manual dispatch away.
- **`unthemeable-tailwind-class` at 177** — the documented floor. Do not drive it to zero.
- **52 non-colour eslint errors** — real debt, out of scope here, held flat by the ratchet.
- **62 `transition-all` usages across 34 files** — none currently sits on a rule swap, so none is broken, but
  `transition-all` animates layout properties and is worth narrowing.
- **`app/sermons/[slug]/notes/PrintButton.tsx`** — themed, but imported nowhere. Either wire it up or delete it.

---

## 13. Post-Phase-6 cleanup

The two loose ends that were mine to close.

**`transition-all` → `transition`, 60 sites across 32 files.** Verified against the engine first:
Tailwind's bare `transition` covers colour, opacity, box-shadow, transform, filter and backdrop-filter —
everything visual — and excludes the layout properties that cause jank. Then checked that nothing actually
relied on animating one: a first pass flagged 24 sites, all of which turned out to be `hover:border-accent/40`
and `hover:text-fg`, i.e. border and text *colour*, which `transition` handles. A precise second pass found
**zero** sites animating a property `transition` cannot. So the swap loses nothing and drops the layout
thrash.

This matters beyond performance. The Phase 5 bug where identity CTAs stuck at their pre-toggle ink was a
transition holding a stale value across a rule swap; `transition-all` made every element a candidate for
that class of bug. None of the 60 sat on a rule swap, so none was broken — but the exposure is gone now.

**`PrintButton.tsx` deleted.** Themed in Phase 6, imported nowhere. It was not an unwired component:
`NotesEditor.tsx:740` already renders a Print button calling `window.print()` with the same `.btn .btn-ghost`
styling as its siblings, so this was a superseded duplicate — the same situation as `ScriptureInline`.

### The two that are not mine to do

1. **Pixel baselines.** GitHub → Actions → "Verify" → Run workflow. That fires the `baseline` job, which
   builds the site on a runner and writes the reference images. Download the `pixel-baselines` artifact,
   commit `tests/theme.spec.mjs-snapshots/`, then set `PIXEL_BASELINE: "1"` on the `visual` job. The other
   five assertions in that suite already block without it.

   This cannot be done from a sandbox session: `next build` needs `next/font` to reach Google Fonts, which
   the egress proxy blocks, and the GitHub API is not reachable from here either — so neither building the
   images locally nor dispatching the workflow remotely is possible.

2. **Make `verify` a required status check.** Settings → Branches → `main` → require "verify" and "visual".
   Deliberately not forced from a config file: on a church website, whether a red rail should block a
   Sunday-morning fix is a judgement call that belongs to a person.

### Still open, not picked up

52 eslint errors, none colour-related: 21 `react/no-unescaped-entities` (cosmetic), 14
`react-hooks/set-state-in-effect` and 11 `react-hooks/refs` (real bug classes), 4
`@next/next/no-html-link-for-pages` (these break client-side navigation), 1 `react-hooks/purity`, 1
`no-explicit-any`. Held flat by the ratchet so they cannot grow.

---

## 14. CI hardening — what the browser found that the tokens could not

Phase 6 declared the rebuild locked, and the first CI run with the new visual job
(Verify #19) failed all 52 tests in 29m26s. Runs #1–#18 had passed in about a
minute, because they only ran the token-level rails. Adding a real browser to the
pipeline is what made the difference, and it found defects in three categories that
no amount of token checking could have reached.

### The harness faults (why the run took 29 minutes)

`page.goto(..., { waitUntil: "networkidle" })` can never settle on this site: the
home page loops an ambient video and several routes embed YouTube, so there is no
quiet moment. Playwright's own docs discourage `networkidle` for exactly this
reason. Every test waited out its timeout.

Replacing it with `domcontentloaded` then failed differently: three routes reported
137 elements at `rgb(0, 0, 0)` and a flat 1.00:1, the signature of a page rendering
before its stylesheet applies. The fix is to wait for the stylesheet to be *live*
rather than for the document to exist:

```js
await page.waitForFunction(
  () => getComputedStyle(document.documentElement)
          .getPropertyValue("--fg").trim().length > 0,
);
```

A third harness fault only surfaced once the suite went green: a fully passing run
reported `51 skipped, 0 passed`. `test.skip()` called inside a test body marks the
*whole* test skipped, including the five assertions that already passed above it —
so the pixel-baseline gate was erasing the result of everything before it. In CI
that is indistinguishable from a suite that never ran. It is an `if` now.

### The blind spot in the token gate

`verify-contrast.mjs` declared an `over:` key on five pairings. Nothing read it.
Every translucent fill was flattened over `--surface` and only `--surface`, while
the page composites it over whatever is actually beneath — so the file looked more
rigorous than it was.

A keyboard-shortcut chip on `--hover-subtle` measured 4.43 in the gate (over white)
and 4.09 in a real browser (over `--surface-sunken`). Wiring `over:` up took the
suite from 242 pairings to 288 and immediately exposed three further failures that
had been invisible: `--accent-text` at 4.41 and `--danger-text` at 4.20 and 3.89,
all on tinted fills over the raised and overlay surfaces.

Extending it to `--hover-subtle` found one more, and this one matters because axe
structurally cannot see it: a muted caption inside a `bg-hover-subtle` panel is
only rendered after a form submit, and a muted row label on the same tint only
exists while the pointer is on the row. Both measured below AA (4.04 light,
3.61 dark). A browser sweep tests resting state; only a token gate sees these.

Fixing it also corrected an inversion nobody had noticed: dark `--fg-muted`
(`#838fa2`) was *darker* than `--fg-subtle` (`#8591a1`), and the two light values
differed by one hex digit. The "muted" and "subtle" tiers were not two tiers. They
are now `#56698c` / `#5e7093` light and `#97a1b1` / `#8591a1` dark.

### Identity hues arriving as data

The identity palette handled twelve fixed hues with a hand-tuned light/dark/solid
triple each. Series and speaker accents are not fixed — they come from content — and
fourteen call sites painted a raw data hue straight into text. The default brand
cyan measured 2.73:1 as 10px text on a white card.

No table can cover arbitrary data, so the method the table was built with is now a
function. `deriveInk(hue)` mixes toward black or white only as far as needed to
clear 4.6:1 against the worst surface in that theme. Fed the twelve table hues it
returns the hand-tuned values — nine byte-identical, three off by a single hex
digit — which is the evidence that the function and the table are one idea rather
than two. `inkOn(hue, ground)` handles the case where the ground is also data (a
series hero paints its own background).

`verify:identity` now also asserts that the two ground constants in
`lib/identity-colors.ts` are still the worst light and dark surfaces in
`tokens.css`, so a token change cannot silently invalidate a bundled literal.

### Decoration, and not taking the word for it

Fifteen oversized ghost ordinals ("01".."04", 2–6rem, 0.12–0.4 opacity) across four
routes measured 1.17–2.07:1. WCAG 1.4.3 exempts pure decoration and these qualify:
a faint watermark beside a heading that already carries the meaning. Darkening them
to 3:1 would not make the page more accessible, only make the ornament loud.

But "it's decorative" is the excuse that hides real failures, so the exemption is
guarded rather than trusted. Each is marked `data-decorative`, axe excludes that
selector, and a separate assertion requires every `[data-decorative]` element to be
`aria-hidden="true"` and to hold at most three characters. The marker exempts an
ornament; it cannot be used to silence content.

Note that `aria-hidden` alone does not satisfy axe's `color-contrast` rule, and
should not: sighted users still see the element.

### Two defects the migration itself created

Worth recording because both passed every gate.

A step label on `/visit` had been `${TEAL}88` — a hex with an alpha suffix, which
`var()` cannot express. The migration reproduced the paint exactly as
`color: var(--accent); opacity: 0.53`. Faithful, and wrong: the original composited
to `#00647e` on the navy band, 2.75:1. Reproducing a colour exactly is the wrong
goal when the original colour was the defect.

`ShareButton` used `text-fg-on-dark-muted` and `border-white/10` while the two
sibling controls in the same row used themed tokens, on a surface that follows the
theme. In light mode it painted near-white text on white: 1.00:1. It had been
`text-white/50` before the token work, so it was invisible then too — the migration
just carried it across. That is how an invisible control survives a rewrite.

### The ratchet failing on its own documentation

`unthemed-files` went 14 → 15 and the new entry was a comment explaining a colour
(`it composites to #00647e, 2.75:1`). `countMatches` had been taught block-comment
state in Phase 6; `countFiles` had not, and read raw source. Both read through one
`codeOnly()` helper now — and the true count is **0**, not 14. That metric had been
counting documentation and exempt regions the whole time.

A gate that fails on its own documentation teaches people to delete the
documentation.

### The correction owed on the `text-white/N` floor

The `unthemeable-tailwind-class` floor was defended twice in this document on the
grounds that `text-white/N` on a permanently dark band is theme-invariant and
therefore correct. That was true of the class and false of the count. axe measured
`text-white/30` at 2.56:1 and `text-white/40` at 3.52:1 on the same navy — real AA
failures sitting inside a floor marked legitimate.

White clears 4.5:1 on this navy at 52% alpha. Every site at `/50` and below (40
sites across 14 files) is now `--fg-on-dark-muted`, and the count fell 177 → 131.
The floor's recorded reason now states the measured cutoff.

A floor is a claim about correctness, and this one went unexamined because it
sounded reasonable. That is the only way a rail hides a defect: by being agreed
with.

### Result

52/52 green in both themes across 26 routes: nav chrome, an invisible-text floor,
a 25-press keyboard focus sweep, axe `color-contrast`, a live theme toggle, and the
decorative-marker guard. Token rails: 288 contrast pairings, identity light/dark/
solid plus the derivation, zero raw colours, ratchet clean.

Still open, and both are yours rather than the codebase's: dispatch the `baseline`
job once to generate pixel baselines, and make `verify` a required status check in
the repo's branch-protection settings so a red run actually blocks a merge.
