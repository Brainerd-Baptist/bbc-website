#!/usr/bin/env node
/**
 * scripts/verify-backdrop.mjs
 *
 * Glass needs something to blur. The site has ONE fixed colour layer
 * (.bx-backdrop) rendered in ConditionalLayout, behind every page. This guard
 * checks that the layer is still rendered and still styled; without it every
 * glass card turns into a flat solid card.
 *
 *   node scripts/verify-backdrop.mjs
 */
import fs from "node:fs";

const layout = fs.readFileSync("components/ConditionalLayout.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const problems = [];
if (!layout.includes("bx-backdrop")) problems.push("components/ConditionalLayout.tsx no longer renders <div className=\"bx-backdrop\" />");
if (!/\.bx-backdrop\s*\{[^}]*position:\s*fixed/.test(css)) problems.push("app/globals.css has no fixed-position .bx-backdrop rule");

console.log("verify-backdrop: checking the global page backdrop");
if (problems.length) {
  for (const p of problems) console.log("  ✗ " + p);
  process.exit(1);
}
console.log("✓ the page backdrop is rendered and fixed behind every page");
