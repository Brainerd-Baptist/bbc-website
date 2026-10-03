#!/usr/bin/env node
/**
 * scripts/verify-backdrop.mjs
 *
 * Glass needs something to blur. A route file that uses .glass, .glass-md or
 * .glass-frost but has no <div className="bx-bloom"> reads as a flat solid
 * card on a flat page, which is the look the glass work exists to remove.
 *
 * Scope: route files (app/**\/page.tsx, not-found, error). Shared components
 * such as ConnectTiles are covered by the page that renders them.
 *
 *   node scripts/verify-backdrop.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
// Route files that match for a reason other than a glass card class.
const EXEMPT = new Map([
  ["app/bx-map/page.tsx", "self-contained embedded document; \"glass\" is its own CSS variable, not a card class"],
]);
const GLASS = /\bglass(?:-frost|-md)?\b(?!-)/;
const ROUTE = /(?:^|\/)(?:page|not-found|error)\.tsx$/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (ROUTE.test(p)) out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT, "app"));
const flat = [];
let withGlass = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (EXEMPT.has(path.relative(ROOT, f))) continue;
  if (!GLASS.test(src)) continue;
  withGlass++;
  if (!src.includes("bx-bloom")) flat.push(path.relative(ROOT, f));
}

console.log(`verify-backdrop: ${withGlass} route files use glass`);
if (flat.length) {
  for (const f of flat) console.log(`  ✗ ${f} uses glass but has no bx-bloom backdrop`);
  console.log("\n✗ add <div className=\"bx-bloom\" aria-hidden=\"true\" /> inside a relative overflow-hidden section.");
  process.exit(1);
}
console.log("✓ every glass route has a backdrop to blur");
