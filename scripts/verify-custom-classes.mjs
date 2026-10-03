#!/usr/bin/env node
/**
 * scripts/verify-custom-classes.mjs
 *
 * Catches project-owned CSS classes that are used in markup but defined
 * nowhere. This is how `glass-frost` and `bx-bloom` shipped on the home page
 * with no CSS behind them: Tailwind utilities are covered by verify-classes,
 * but hand-written classes in globals.css fail silently when missing.
 *
 * Only classes with a project prefix are checked, so third-party and Tailwind
 * classes never cause noise. Add a prefix below when a new family is created.
 *
 *   node scripts/verify-custom-classes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];
const PREFIXES =
  "glass|bx|btn|bbc|nav|eyebrow|label|digit|identity|gold|blue|rv";
const TOKEN_RE = new RegExp(`^(?:${PREFIXES})(?:-[a-z0-9]+)*$`);

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

// Every class selector defined in any project stylesheet.
const defined = new Set();
for (const d of SCAN_DIRS) {
  for (const f of walk(path.join(ROOT, d), [".css"])) {
    const css = fs.readFileSync(f, "utf8");
    for (const m of css.matchAll(/\.([a-zA-Z_][\w-]*)/g)) defined.add(m[1]);
  }
}

// Components may also define a class in an inline <style> block, so count any
// `.prefixed-name` selector that appears in source as defined too.
const SELECTOR_IN_SRC = new RegExp(`\\.((?:${PREFIXES})(?:-[a-z0-9]+)*)(?=[\\s{,:.>\\[)+~]|$)`, "gm");
for (const d of SCAN_DIRS) {
  for (const f of walk(path.join(ROOT, d), [".tsx", ".jsx"])) {
    const src = fs.readFileSync(f, "utf8");
    if (!/<style/.test(src)) continue;
    for (const m of src.matchAll(SELECTOR_IN_SRC)) defined.add(m[1]);
  }
}

// Every className / class string literal in source.
const used = new Map(); // token -> first file
for (const d of SCAN_DIRS) {
  for (const f of walk(path.join(ROOT, d), [".tsx", ".ts", ".jsx", ".js"])) {
    const src = fs.readFileSync(f, "utf8");
    for (const m of src.matchAll(/class(?:Name)?\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|'([^']*)')/g)) {
      const str = m[1] ?? m[2] ?? m[3] ?? "";
      for (const raw of str.split(/\s+/)) {
        const tok = raw.replace(/^(?:[a-z0-9-]+:)+/, "");
        if (TOKEN_RE.test(tok) && !used.has(tok)) used.set(tok, path.relative(ROOT, f));
      }
    }
  }
}

const missing = [...used].filter(([t]) => !defined.has(t));
console.log(`verify-custom-classes: checked ${used.size} project classes against ${defined.size} CSS selectors`);
if (missing.length) {
  for (const [t, f] of missing) console.log(`  ✗ .${t} is used (first in ${f}) but defined in no stylesheet`);
  console.log("\n✗ define the class in app/globals.css, or fix the typo.");
  process.exit(1);
}
console.log("✓ every project class has CSS behind it");
