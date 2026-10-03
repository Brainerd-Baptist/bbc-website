#!/usr/bin/env node
/**
 * scripts/verify-motion.mjs
 *
 * Motion ground rules for the site, enforced:
 *   1. @keyframes may only animate transform and opacity, so nothing reflows
 *      or repaints the layout while it plays.
 *   2. Every named animation must be switched off (animation: none, or
 *      referenced by name) inside a prefers-reduced-motion: reduce block.
 *
 *   node scripts/verify-motion.mjs
 */
import fs from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "app/globals.css");
const css = fs.readFileSync(FILE, "utf8");
const ALLOWED = new Set(["transform", "opacity"]);

// Balanced-brace block reader starting at the "{" at index i.
function block(src, i) {
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return src.slice(i + 1, j);
  }
  return "";
}

const problems = [];
const names = [];
for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
  const name = m[1];
  names.push(name);
  const body = block(css, m.index + m[0].length - 1);
  for (const d of body.matchAll(/([a-z-]+)\s*:/g)) {
    if (!ALLOWED.has(d[1])) problems.push(`@keyframes ${name} animates "${d[1]}" (only transform and opacity are allowed)`);
  }
}

let reduced = "";
for (const m of css.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g)) {
  reduced += block(css, m.index + m[0].length - 1) + "\n";
}

// Which selectors use each keyframe, and are they neutralised under reduced motion?
for (const name of names) {
  const used = new RegExp(`animation(?:-name)?\\s*:[^;]*\\b${name}\\b`).test(css.replace(/@media\s*\(prefers-reduced-motion[\s\S]*?\n\}/g, ""));
  if (!used) continue;
  const handled = new RegExp(`\\b${name}\\b`).test(reduced) || /animation\s*:\s*none/.test(reduced) || /animation-duration/.test(reduced);
  if (!handled) problems.push(`animation "${name}" has no prefers-reduced-motion handling`);
}

console.log(`verify-motion: ${names.length} keyframes checked (${names.join(", ")})`);
if (problems.length) {
  for (const p of problems) console.log("  ✗ " + p);
  process.exit(1);
}
console.log("✓ motion uses transform/opacity only and respects reduced motion");
