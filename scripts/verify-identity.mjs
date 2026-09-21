#!/usr/bin/env node
/**
 * scripts/verify-identity.mjs
 *
 * Checks the identity palette in lib/identity-colors.ts against WCAG AA.
 *
 * verify-contrast cannot do this job: it reads token pairings out of
 * app/tokens.css, and these are deliberately NOT tokens — they are content
 * colours, and content adds more of them. So they need their own gate, or the
 * next hue someone adds goes in unmeasured, which is exactly how all eleven
 * of the current ones ended up failing as text in light mode (1.78–3.89:1).
 *
 * Three assertions per hue:
 *   light  — readable as text on the light surfaces
 *   dark   — readable as text on the dark surfaces
 *   solid  — safe as a FILL under white text, and theme-invariant
 *
 * The raw `hue` is intentionally unchecked. It is for decorative fills only —
 * a 1px identity bar, a dot — where nothing depends on reading it.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AA = 4.5;

const tokens = fs.readFileSync(path.join(ROOT, "app/tokens.css"), "utf8");
function tokenValue(name, block) {
  // pull `name` out of either the :root or the .dark block
  const re = new RegExp(`${name}:\\s*([^;]+);`, "g");
  const all = [...tokens.matchAll(re)].map((m) => m[1].trim());
  return block === "dark" && all.length > 1 ? all[1] : all[0];
}

const hex = (s) => {
  const h = s.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};
const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
};

const LIGHT_SURFACES = ["--surface", "--surface-sunken", "--surface-raised"]
  .map((t) => tokenValue(t, "light"))
  .filter((v) => v && v.startsWith("#"))
  .map(hex);
const DARK_SURFACES = ["--surface", "--surface-sunken", "--surface-raised", "--surface-overlay"]
  .map((t) => tokenValue(t, "dark"))
  .filter((v) => v && v.startsWith("#"))
  .map(hex);
const WHITE = [255, 255, 255];

// Parse the table rather than importing it, so this runs without a TS loader.
const src = fs.readFileSync(path.join(ROOT, "lib/identity-colors.ts"), "utf8");
const body = src.slice(src.indexOf("export const IDENTITY"));
const rows = [
  ...body.matchAll(
    /(\w+):\s*\{\s*hue:\s*"(#[0-9a-fA-F]{3,6})",\s*light:\s*"(#[0-9a-fA-F]{3,6})",\s*dark:\s*"(#[0-9a-fA-F]{3,6})",\s*solid:\s*"(#[0-9a-fA-F]{3,6})"/g,
  ),
];

if (!rows.length) {
  console.error("verify-identity: parsed no hues out of lib/identity-colors.ts");
  process.exit(1);
}

let failed = 0;
const worst = (fg, surfaces) => Math.min(...surfaces.map((s) => ratio(fg, s)));

console.log(`verify-identity: ${rows.length} hues\n`);
for (const [, name, , light, dark, solid] of rows) {
  const checks = [
    ["light as text on light surfaces", worst(hex(light), LIGHT_SURFACES)],
    ["dark  as text on dark surfaces ", worst(hex(dark), DARK_SURFACES)],
    ["white text on solid fill       ", ratio(WHITE, hex(solid))],
  ];
  for (const [what, r] of checks) {
    const ok = r >= AA;
    if (!ok) failed++;
    console.log(
      `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(9)} ${what}  ${r.toFixed(2)}  (needs ${AA})`,
    );
  }
}

/* --------------------------------------------------------------------------
 * Part 2: the DERIVATION, for hues that arrive as data.
 *
 * lib/identity-colors.ts hardcodes the two worst grounds, because a bundled
 * module cannot read tokens.css. That is only safe if something fails when a
 * token changes underneath it — so this checks it. Then it feeds every table
 * hue through the derivation and requires the result to pass AA, which is how
 * the function and the hand-tuned table are held to one standard instead of
 * drifting into two different ideas of the same thing.
 * ------------------------------------------------------------------------ */

const declared = (name) => {
  const m = src.match(new RegExp(`export const ${name} = "([^"]+)"`));
  if (!m) {
    console.error(`✗ ${name} is not exported from lib/identity-colors.ts`);
    process.exit(1);
  }
  return m[1];
};

// Worst light ground = the LOWEST-luminance light surface (hardest for dark
// text). Worst dark ground = the HIGHEST-luminance dark surface.
const worstLight = LIGHT_SURFACES.reduce((a, b) => (lum(a) < lum(b) ? a : b));
const worstDark = DARK_SURFACES.reduce((a, b) => (lum(a) > lum(b) ? a : b));
const asHex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

for (const [name, declaredHex, actual] of [
  ["WORST_LIGHT_GROUND", declared("WORST_LIGHT_GROUND"), worstLight],
  ["WORST_DARK_GROUND", declared("WORST_DARK_GROUND"), worstDark],
]) {
  const ok = asHex(hex(declaredHex)) === asHex(actual);
  if (!ok) failed++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(18)} ${declaredHex} ${ok ? "==" : "!="} ${asHex(actual)} (worst surface in tokens.css)`,
  );
}

// Re-implement the derivation here on purpose. A test that imports the
// function under test can only confirm it is self-consistent; this confirms
// the method still produces AA-passing tones.
const TARGET = 4.6;
const towardTone = (hueHex, end, test) => {
  const from = hex(hueHex);
  for (let t = 0; t <= 1.0001; t += 0.01) {
    const c = asHex(from.map((v, i) => v + (end[i] - v) * t));
    if (test(c) >= TARGET) return c;
  }
  return asHex(end);
};
const BLACK = [0, 0, 0];

console.log();
for (const [, name, hue] of rows) {
  const dl = towardTone(hue, BLACK, (c) => ratio(hex(c), worstLight));
  const dd = towardTone(hue, WHITE, (c) => ratio(hex(c), worstDark));
  const checks = [
    ["derived light on light surfaces", worst(hex(dl), LIGHT_SURFACES)],
    ["derived dark  on dark surfaces ", worst(hex(dd), DARK_SURFACES)],
  ];
  for (const [what, r] of checks) {
    const ok = r >= AA;
    if (!ok) failed++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(9)} ${what}  ${r.toFixed(2)}`);
  }
}

console.log();
if (failed) {
  console.error(
    `✗ ${failed} identity value(s) below AA. Adjust them in lib/identity-colors.ts —\n` +
      `  darken toward black for the light value, lighten toward white for the dark\n` +
      `  one, and darken the fill until white text clears ${AA}.`,
  );
  process.exit(1);
}
console.log("✓ every identity hue meets WCAG 2.1 AA in both themes");
