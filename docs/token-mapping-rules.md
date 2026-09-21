# Mapping a raw colour to a semantic token

Written during Phase 4 of the dark-mode rebuild, after ~900 literals had been
converted by hand. It is the rule set that produced them, so the next person
(or the next sweep) gets the same answers.

## The one rule

**Classify by the ROLE the colour plays, never by the value.**

Brand navy is the clearest illustration. `#00205b` used as *text* becomes
`--fg`, which inverts to a light grey in dark mode. The same `#00205b` used as
a *band background* stays brand navy in both themes, because a navy band is a
branded object, not a page surface. Two identical literals, two different
answers. Reading the value tells you nothing; you have to look at what it does.

A corollary: before converting a colour, find out what is *behind* it. Text on
a navy band needs the on-dark family, not `--fg`, or it will invert into
illegibility. This is where the `/about` page needed section-boundary walking:
brand cyan is legible at 5.65:1 inside its navy bands, and `--accent-text`
there would have been a regression to 2.4:1.

## The table

| Role | Token |
|---|---|
| Body text on a page surface | `--fg` |
| Secondary text | `--fg-muted` |
| De-emphasised text (large only) | `--fg-subtle` |
| Page background | `--surface` |
| Inset / recessed area | `--surface-sunken` |
| Card, panel, sheet | `--surface-raised` |
| Popover, dropdown, modal | `--surface-overlay` |
| Hairline / divider / container edge | `--border` |
| Emphasised or hovered edge | `--border-strong` |
| Input boundary (the only affordance) | `--border-input` |
| Subtle hover wash | `--hover-subtle` |
| Accent as text | `--accent-text` |
| Accent as a decorative mark, rule, gradient | `--accent` |
| Filled primary action, filled badge | `--accent-solid` (+ `--accent-solid-hover`) |
| Text on a filled accent | `--fg-on-accent` |
| Accent-tinted container fill / edge | `--accent-bg` / `--accent-border` |
| Focus indicator | `--focus-ring` (theme-invariant) |
| Error / success / warning text | `--danger-text` / `--success-text` / `--warning-text` |
| Filled feedback + its text | `--danger-solid` … / `--feedback-fg` |
| Elevation | `--shadow-sm` / `-md` / `-lg` / `-sm-hover` |
| Highlighter fill and its text | `--highlight-bg` / `--highlight-fg` |

### On a permanently dark ground

A navy band, the theater, the audio player, a hero over video. These do **not**
invert, so their ink must not either.

| Role | Token |
|---|---|
| Heading / emphasis | `--fg-on-dark` |
| Reading text | `--fg-on-dark-body` |
| Secondary text | `--fg-on-dark-muted` |
| Tint fill | `--surface-on-dark` |
| Hairline | `--border-on-dark` |
| Control boundary | `--border-on-dark-strong` |
| Hover wash | `--hover-on-dark` |
| The grounds themselves | `--brand-band`, `--theater-*`, `--player-*` |
| Fixed light plate for artwork drawn on white | `--plate` |

## When a literal is correct

Some are. They live in `scripts/color-literal-exemptions.mjs` with a reason
each, because a comment saying "must stay literal" does not survive a bulk
sweep — `app/layout.tsx` proved that twice. The recurring legitimate cases:

- a value that lands in an HTML attribute rather than CSS (`themeColor`)
- a renderer with no CSS variables at all (satori/`next/og`, `@react-pdf`)
- a standalone document we emit and do not style (`buildPrintHTML`)
- paper: an `@media print` block, which should *re-point the tokens* to ink
  values so the whole document prints correctly from either theme
- a hex that is string-concatenated with alpha (`` `${accent}99` ``)

## How you know you got it right

Three gates, none of which overlap:

- `npm run verify:classes` — every colour utility actually emits CSS. Catches
  `text-fg-on-dark-muted` when the token was never exported to `@theme`.
- `npm run verify:contrast` — every token *pairing* meets AA, in both themes,
  against the **worst** surface in its family rather than the typical one.
- `npm run test:visual` — renders both themes and measures what is painted.
  The only gate that catches a token that is real, compiles, and is simply the
  wrong one for its surface.

Run `npm run verify` for the first two plus the ratchet.
