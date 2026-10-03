#!/usr/bin/env node
/**
 * scripts/verify-shared-ui.mjs
 *
 * New glass cards should use <Card> (components/ui/Card.tsx), not a
 * hand-written "glass-frost ..." class string, so the card look lives in one
 * place. Existing link-style cards that still use the raw class are counted
 * as the baseline; the count may go down, never up.
 *
 *   node scripts/verify-shared-ui.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASELINE = 4; // series row link, returning-visitor link, ConnectTiles link, ThisWeek card
const ROOT = process.cwd();
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx") && !p.includes(`components${path.sep}ui${path.sep}`)) out.push(p);
  }
  return out;
}
let count = 0;
const hits = [];
for (const d of ["app", "components"]) {
  for (const f of walk(path.join(ROOT, d))) {
    const n = (fs.readFileSync(f, "utf8").match(/glass-frost/g) || []).length;
    if (n) { count += n; hits.push(`${path.relative(ROOT, f)} (${n})`); }
  }
}
console.log(`verify-shared-ui: ${count} raw glass-frost use(s), baseline ${BASELINE}`);
if (count > BASELINE) {
  for (const h of hits) console.log("  " + h);
  console.log("\n✗ use <Card> from components/ui/Card.tsx (and <Section> for the backdrop) instead of the raw class.");
  process.exit(1);
}
console.log("✓ cards go through <Card>");
