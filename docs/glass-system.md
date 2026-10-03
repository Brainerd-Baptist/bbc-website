# Glass system

How the frosted, floating look is built and how to keep it working. Source of truth for values is `app/tokens.css` (tokens) and `app/globals.css` (classes).

## The tiers

| Class | Use it for | Notes |
| --- | --- | --- |
| `.glass-frost` | Hero-level cards: sermon card, service cards, event cards, Connect tiles, Kids and Students cards, error pages | Strongest blur (18px, saturate 1.5), top highlight, ring, two-layer shadow. Lifts on hover where hover exists. Add `.glass-static` for cards that are not links. |
| `.glass` | Quieter cards and nested panels | Blur 16px. Do not nest glass in glass more than one level; it gets muddy and slow. |
| `.glass-md` | Large container panels that hold other cards (Give "Other ways", Life Groups panels) | Translucent fill, blur 12px, plain border. |
| `.glass-dark` | Chips and counters over photos or navy | Dark fill, used by the countdown. |
| `.nav-glass` | The navbar once it leaves the hero | Driven by `data-chrome` in `Navbar.tsx`. |

Every tier falls back to a solid fill under `@supports not (backdrop-filter: blur(1px))`.

## Give it something to blur

Glass over a flat colour looks like a plain card. Every section with glass gets a backdrop:

```tsx
<section className="relative overflow-hidden py-20 px-6">
  <div className="bx-bloom" aria-hidden="true" />
  <div className="relative max-w-5xl mx-auto">...</div>
</section>
```

Do not put an opaque `bg-*` on a page wrapper or a section: it hides the body gradient and grain the glass is meant to bend. Page wrappers use `min-h-screen` only.

## Rules that bite

- Write `backdrop-filter` unprefixed only. Writing `-webkit-backdrop-filter` first makes the minifier drop the unprefixed one and Chrome and Edge lose the blur.
- Unlayered CSS beats `@layer utilities`. Put overridable component rules in `@layer components`.
- Keep fills at 50 percent opacity or higher and run `npm run verify:contrast` after changing a fill token.
- Text on cyan uses `bg-accent-solid text-fg-on-accent`, never white on `--accent`.
- Secondary buttons use `border-border`, not `border-white/20` (invisible on light).

## Motion

Only `transform` and `opacity` animate. Durations 200 to 600ms. Easing and durations come from the motion tokens. Everything is switched off under `prefers-reduced-motion`. Scroll reveal is `ScrollReveal` (one `IntersectionObserver`, no library).

## Guards (all part of `npm run verify`)

| Script | Catches |
| --- | --- |
| `verify:classes` | Tailwind colour utilities that compile to nothing |
| `verify:custom-classes` | Project classes used in markup but defined in no stylesheet (how `glass-frost` went missing) |
| `verify:motion` | Keyframes that animate anything but transform and opacity, or ignore reduced motion |
| `verify:backdrop` | Route files that use glass with no `bx-bloom` |
| `verify:contrast` | Text pairings below WCAG AA in either theme |

Known baseline: `lint:css`, `lint:color` and `ratchet` already failed on `main` before this work. The goal is that they never get worse.
