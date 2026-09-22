# Spacing, radius & type — building the second token system

Requested 2026-09-21, immediately after the color system was finished and
published as a reference. The question that prompted it: if we ever want to
change something again, can it be one edit instead of a file-by-file hunt —
for spacing and type the way it now is for color?

Color could answer yes immediately, because the mechanism already existed:
every color was a CSS custom property, and the rebuild's job was mostly
enforcement and cleanup, not invention. Spacing, radius and type have no such
layer yet. This document is Phase 0: the audit that has to happen before
writing a single token, because inventing names for values that are already
consistent would be busywork, and inventing names that flatten real,
intentional variation would make the site worse, not better.

## What the audit found

**Spacing has no drift.** Every padding, margin and gap value in the
codebase is a stock Tailwind number (`p-6`, `gap-3`, `py-24`...) — the kind
of class where the same number always means the same physical size,
everywhere, because Tailwind's scale is fixed. Grepping for the arbitrary
escape hatch (`p-[13px]`, `gap-[22px]`, and so on) across every `.tsx` file
in `app/` and `components/` returned **zero** matches for padding, margin or
gap. Nobody has ever needed to step outside the scale for spacing.

**Radius has no drift either.** Same check, same result: `rounded-2xl`,
`rounded-full`, `rounded-xl` and so on account for every corner on the site,
and zero arbitrary radius values exist.

**Type has real drift**, in two shapes:

1. A small uppercase label — the kind used on a thumbnail timestamp, a badge,
   a chip — is hand-typed as `text-[8px]`, `text-[9px]`, `text-[10px]` or
   `text-[11px]` at **21 separate call sites across 14 files**, each paired
   with its own choice of `font-bold` vs `font-semibold` and `tracking-widest`
   vs no tracking at all. This is one role wearing four slightly different
   costumes. The site already has an `.eyebrow` class (11.2px, weight 600,
   `0.12em` tracking) doing almost exactly this job in 36 other files — these
   21 sites needed something a step smaller and didn't know to extend it, so
   they improvised instead.
2. **Every major heading site-wide is a hand-rolled `clamp()`.** This was
   initially scoped as "two dead classes" from a narrow check; a full grep
   found **60+ distinct inline `clamp()` headings** across the codebase, and
   `.h-section` — the one heading class that exists and *is* wired up — is
   used in exactly one file. `.h-display` and `.h-hero` are defined and used
   nowhere. This is a materially bigger job than the initial estimate, and
   it's worth saying so plainly rather than quietly absorbing the scope
   change.

   It is not 60 unrelated numbers, though. Clustering the exact `clamp()`
   strings shows the same handful repeating: `clamp(2rem, 5vw, 3rem)` alone
   appears 11 times, `clamp(1.8rem, 4vw, 2.6rem)` 8 times, `clamp(2.8rem,
   7vw, 4.5rem)` 6 times, `clamp(2.8rem, 8vw, 5.5rem)` 5 times. People
   converged on nearly the same values independently, the same pattern raw
   hex colors showed before that got consolidated — which means a real scale
   already exists here, just not named yet.

So the honest shape of this project is not three equally-sized jobs. It is:
name the two things that are already consistent, so a future change is one
edit instead of a grep-and-replace across dozens of files; and separately,
actually fix the one place where inconsistency is real, the same way the
raw-hex sweep did for color.

## The vocabulary

Every name below maps onto a value the site is *already* using at that
frequency — nothing here invents a new size. Values are the raw Tailwind
figure for traceability; the CSS custom property holds the real one.

### Spacing — one canonical value per role, not an invented ladder

Each token below is the *modal* value already in use for that role — the
single most common choice among the sites doing that job — not a new number
and not an average. Where real sites intentionally want a tighter or looser
variant of the same role (a denser stat row, a more generous hero section),
the plain Tailwind class remains correct and legitimate; the token names the
default, it doesn't outlaw the exception. This mirrors how `--fg-subtle`
exists as one value with a documented exception (large text only) rather
than as `--fg-subtle-sm`/`-lg`.

| Token | Value | Role | Modal usage it's drawn from |
|---|---|---|---|
| `--spacing-gutter-tight` | 0.375rem (6px) | Icon-to-label spacing inside a control | `gap-1.5` — 14 sites, exact match |
| `--spacing-gutter` | 0.75rem (12px) | Spacing between small siblings (chips, stat rows) | `gap-3` — 46 sites, the more common of the two closely-tied candidates |
| `--spacing-gutter-loose` | 1rem (16px) | Spacing between cards or list items | `gap-4` — 42 sites, most common in that band |
| `--spacing-control-x` | 1.5rem (24px) | Button/pill/badge horizontal padding | `px-6` — 99 sites, the single most common class in the whole padding scan |
| `--spacing-control-y` | 0.75rem (12px) | Button/pill/badge vertical padding | `py-3` — tied with `py-2.5` at 31 sites, rounder number |
| `--spacing-card-pad` | 1.75rem (28px) | Card and panel interior padding | `p-7` — 27 sites, most common of the card-padding trio |
| `--spacing-section` | 6rem (96px) | Default vertical rhythm between page sections | `py-24` — 29 sites, most common of the section-rhythm family |

### Radius — five roles, one-to-one with what's already there

| Token | Value | Role | Seen at |
|---|---|---|---|
| `--radius-control` | 9999px (full) | Buttons, pills, badges, avatars, player controls | `rounded-full` — 136 sites, the single most common class in the codebase |
| `--radius-card` | 1rem (16px) | Cards, panels, sheets | `rounded-2xl` — 79 sites |
| `--radius-panel` | 0.75rem (12px) | Secondary containers, inputs at their larger size | `rounded-xl` — 39 sites |
| `--radius-input` | 0.5rem (8px) | Form fields, small controls | `rounded-lg` — 16 sites |
| `--radius-tag` | 0.25rem (4px) | Small chips and tags | `rounded` (default) — 11 sites |

### Type — the two real roles, plus what's already fine left alone

Body copy sizes (`text-sm`, `text-base`, `text-xs` used as actual reading
text) are not being renamed. They're plain Tailwind sizes doing exactly what
they say, used consistently, and naming them would add a layer without
fixing anything.

| Token | Value | Role | Replaces |
|---|---|---|---|
| `.label-micro` | 10px / 700 / `0.1em` tracking / uppercase | A compact label — timestamp, chip, thumbnail overlay | the 21-site `text-[8..11px]` scatter |
| `.eyebrow` | 11.2px / 600 / `0.12em` tracking / uppercase | A kicker above a heading | already exists, unchanged, 36 sites |
| `.h-item` | `text-xl`–`text-2xl`, condensed, weight 800 | Card and list-item heading | the hand-typed `font-condensed font-800 text-2xl` pattern |
| `.h-subsection` | `clamp(2rem, 5vw, 3rem)` | A sub-heading, one step under a full section heading | the single most repeated clamp string, 11 sites |
| `.h-section` | `clamp(1.8rem, 4vw, 2.6rem)` | Section heading | revises the existing (unused-in-practice) class to the value the site actually converged on 8 times, rather than the one nobody adopted |
| `.h-hero` | `clamp(2.8rem, 7vw, 4.5rem)` | Page-level hero heading | revises the existing dead class to match its nearest real cluster (6 sites) |
| `.h-display` | `clamp(2.8rem, 8vw, 5.5rem)` | The largest display size — a landing page's main headline | revises the existing dead class to match its nearest real cluster (5 sites) |

Four tiers, not the three originally guessed — the data supported a fourth
once it was actually clustered. `.h-section`'s existing value
(`clamp(1.8rem, 4vw, 2.8rem)`) is close enough to real usage that revising it
by 0.2rem rather than discarding it seemed right; keeping a stale value for
the sake of not touching a class nobody uses yet would be its own kind of
carelessness.

**Still open, deliberately:** clustering finds the *modal* values, not a
guarantee every one of the 60+ sites is a clean fit. Phase 4's sweep checks
each site against these four tiers rather than assuming a match — a heading
that's genuinely bespoke (there may be a couple) stays bespoke rather than
getting forced onto the nearest tier for the sake of a clean number.

## Phases

Mirrors the shape the color rebuild took — a plan doc up front, phases run
one at a time, each proven before moving on.

0. **This document.** Audit + vocabulary. Done.
1. Wire the spacing tokens into `app/tokens.css`, exposed as Tailwind
   utilities via `@theme`, the same mechanism the color tokens use. Verify
   the build; no component sweep yet.
2. Wire the radius tokens the same way.
3. Wire the type roles — this is where the actual defect gets fixed, so it
   needs the hero-heading check above resolved first.
4. Sweep the codebase: replace the drifting type call sites with the new
   classes, and adopt the named spacing/radius tokens at the sites that are
   the clearest instances of each role. Not every `p-6` needs to become
   `--space-card-pad` by decree — only where doing so genuinely names a real,
   repeated decision.
5. Enforcement: an ESLint rule (or ratchet metric, matching the color rail)
   that blocks a new arbitrary spacing/radius/font-size value from being
   introduced, with the same exemption-registry escape hatch color has for
   genuinely one-off cases (a fixed-width thumbnail, an icon's literal pixel
   size — the 21 `w-[Npx]`/`h-[Npx]` sites found during this audit are this
   kind of value, not spacing drift, and are expected to stay literal).
6. Extract the finished tokens into the published Design System artifact
   alongside color, and rewrite its README to describe the completed system
   rather than color alone.
