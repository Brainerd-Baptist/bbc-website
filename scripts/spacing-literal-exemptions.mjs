/**
 * scripts/spacing-literal-exemptions.mjs
 *
 * The places where a raw spacing/radius/micro-label value is CORRECT, and
 * why. Mirrors scripts/color-literal-exemptions.mjs -- same reasoning: an
 * exemption declared as data survives a future sweep; a comment next to the
 * value does not.
 *
 * Scope: this registry only covers the three things
 * eslint-rules/no-raw-spacing.mjs checks -- arbitrary Tailwind spacing
 * (p-/m-/gap-) and radius (rounded-) classes, and the micro-label pattern
 * (a tiny arbitrary text size combined with `uppercase`). It does not cover
 * `w-[…]`/`h-[…]` (fixed-dimension sizing -- icons, thumbnails -- is a
 * different, legitimate category the spacing/radius/type audit explicitly
 * left alone) or inline-style spacing (out of scope; the audit that
 * justified blocking at zero only covered className arbitrary values).
 *
 * `whole: true`   — the entire file is exempt from this rule.
 * `match`         — a regex; lines matching it are exempt.
 */

export const SPACING_LITERAL_EXEMPTIONS = [
  {
    file: "components/live/LivePlayer.tsx",
    match: /text-\[1[01]px\]\s+font-semibold\s+tracking-wide\b(?!st)/,
    reason:
      "The live-page tab buttons (captions/notes) use text-[10px]/[11px] " +
      "tracking-wide -- deliberately left out of the micro-label sweep " +
      "(docs/spacing-radius-type-plan.md): they're an interactive tab-label " +
      "role, not the passive micro-label .label-micro targets, and they " +
      "don't use `uppercase`. Forcing them onto .label-micro would be the " +
      "'flatten real, intentional variation' mistake the plan warns against.",
  },
];

/**
 * Return the set of 0-indexed line numbers exempt in `src` for this file, or
 * `null` if the whole file is exempt. Mirrors exemptLines() in
 * color-literal-exemptions.mjs.
 */
export function exemptLines(relPath, src) {
  const entries = SPACING_LITERAL_EXEMPTIONS.filter((e) => e.file === relPath);
  if (entries.some((e) => e.whole)) return null;
  if (entries.length === 0) return new Set();
  const lines = src.split("\n");
  const out = new Set();
  entries.forEach((e) => {
    if (!e.match) return;
    lines.forEach((line, i) => {
      if (e.match.test(line)) out.add(i);
    });
  });
  return out;
}
