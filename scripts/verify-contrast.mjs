#!/usr/bin/env node
/**
 * scripts/verify-contrast.mjs
 *
 * Validates every foreground/background pairing in the semantic token layer
 * against WCAG 2.1 AA, in BOTH themes, by reading the real values out of
 * app/tokens.css. Change a token and this tells you what you broke.
 *
 * Two rules it encodes that are easy to get wrong:
 *
 *  1. Validate against the WORST surface in a family, not the primary one.
 *     Primer does this explicitly — contrast is checked against the muted
 *     background so it holds for both muted and default. A token that passes
 *     on #ffffff can still fail on #f4f6f9.
 *
 *  2. Flatten alpha over the surface it actually sits on. A translucent
 *     border over a dark surface is a different colour than the same border
 *     over a light one, so the ratio has to be computed per pairing.
 *
 * Failures this would have caught in the pre-token codebase: white on brand
 * cyan (2.74:1, every CTA on the site), brand cyan as text on white
 * (2.74:1, 52 eyebrow labels), and rgba(0,32,91,0.45) muted text (2.81:1).
 *
 *   node scripts/verify-contrast.mjs
 */

import fs from "node:fs";
import path from "node:path";

const CSS = fs.readFileSync(path.join(process.cwd(), "app/tokens.css"), "utf8");

// ── colour maths ──────────────────────────────────────────────────────────

const hexToRgb = (h) => {
  let s = h.replace("#", "").trim();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};

const parseColor = (raw) => {
  const v = raw.trim();
  if (v.startsWith("#")) return [...hexToRgb(v), 1];
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  return null;
};

const flatten = (fg, bg) => {
  const [r, g, b, a] = fg;
  const [br, bg2, bb] = bg;
  return [r * a + br * (1 - a), g * a + bg2 * (1 - a), b * a + bb * (1 - a), 1];
};

const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)];
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

// ── token extraction ──────────────────────────────────────────────────────

/** Pull the custom properties out of a top-level rule (`:root` or `.dark`). */
function readBlock(selector) {
  // Match the LAST occurrence, so a later redefinition wins as CSS would.
  const re = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "g");
  let body = null;
  for (const m of CSS.matchAll(re)) body = m[1];
  if (body === null) throw new Error(`could not find a ${selector} { … } block`);
  const out = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[name] = value.trim();
  }
  return out;
}

const root = readBlock(":root");
const dark = { ...root, ...readBlock("\\.dark") };

/** Resolve `var(--x)` indirection (one or more hops) then parse. */
function resolve(tokens, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular token reference at ${name}`);
  seen.add(name);
  const raw = tokens[name];
  if (raw === undefined) throw new Error(`token ${name} is not defined`);
  const varMatch = raw.match(/^var\((--[\w-]+)\)$/);
  if (varMatch) return resolve(tokens, varMatch[1], seen);
  const parsed = parseColor(raw);
  if (!parsed) throw new Error(`token ${name} is not a plain colour: ${raw}`);
  return parsed;
}

// ── the pairings that must hold ────────────────────────────────────────────

const SURFACES = ["--surface-sunken", "--surface", "--surface-raised", "--surface-overlay"];

/** kind: "body" needs 4.5, "large" needs 3.0, "ui" needs 3.0 (SC 1.4.11). */
const CHECKS = [
  { fg: "--fg", on: SURFACES, kind: "body", note: "body text" },
  { fg: "--fg-muted", on: SURFACES, kind: "body", note: "secondary text" },
  { fg: "--fg-subtle", on: SURFACES, kind: "large", note: "de-emphasised text (LARGE ONLY)" },
  { fg: "--accent-text", on: SURFACES, kind: "body", note: "accent used as text" },
  { fg: "--fg-on-accent", on: ["--accent-solid"], kind: "body", note: "text on a solid accent fill" },
  { fg: "--accent-fg", on: ["--accent"], kind: "body", note: "the fixed foreground on brand cyan" },
  { fg: "--border-input", on: SURFACES, kind: "ui", note: "input boundary (sole affordance)" },
  { fg: "--focus-ring", on: SURFACES, kind: "ui", note: "focus ring" },
];

const MIN = { body: 4.5, large: 3.0, ui: 3.0 };

// ── run ───────────────────────────────────────────────────────────────────

let failures = 0;
let checked = 0;

for (const [theme, tokens] of [["light", root], ["dark", dark]]) {
  console.log(`\n── ${theme} ──`);
  for (const check of CHECKS) {
    for (const surfaceName of check.on) {
      const surface = resolve(tokens, surfaceName);
      // A translucent surface is itself composited over the page canvas.
      const surfaceSolid =
        surface[3] < 1 ? flatten(surface, resolve(tokens, "--surface")) : surface;
      const fg = flatten(resolve(tokens, check.fg), surfaceSolid);
      const r = ratio(fg, surfaceSolid);
      const need = MIN[check.kind];
      const ok = r >= need;
      checked++;
      if (!ok) failures++;
      const label = `${check.fg} on ${surfaceName}`;
      console.log(
        `  ${ok ? "ok  " : "FAIL"} ${label.padEnd(44)} ${r.toFixed(2).padStart(6)}` +
          `  (needs ${need.toFixed(1)}, ${check.note})`,
      );
    }
  }
}

console.log(`\nverify-contrast: ${checked} pairings checked across both themes`);
if (failures === 0) {
  console.log("✓ all pairings meet WCAG 2.1 AA");
  process.exit(0);
}
console.error(`✗ ${failures} pairing(s) below AA — fix the token values in app/tokens.css`);
process.exit(1);
