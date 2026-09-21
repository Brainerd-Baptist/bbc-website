#!/usr/bin/env node
/**
 * scripts/verify-classes.mjs
 *
 * Catches utility classes that silently compile to NOTHING.
 *
 * Tailwind fails quietly: write `bg-gold` with no `gold` in your theme, or
 * `border-[#00205B]/08` with a leading zero in the opacity modifier, and you
 * get no CSS and no warning. The element just renders unstyled. Two real
 * examples from this repo, both invisible until we compiled candidates
 * through the engine and compared:
 *
 *   - tailwind.config.ts was never loaded (v4 needs an explicit `@config`),
 *     so 23 usages of bg-gold / text-navy / border-gold emitted nothing and
 *     those buttons had no background and no text colour at all.
 *   - 45 opacity modifiers were written `/06` and `/08`. Tailwind accepts
 *     `/6` and `/8`; the leading-zero forms emit nothing, so every "subtle
 *     border" written that way simply wasn't there.
 *
 * This script extracts colour-ish utility candidates from the source, runs
 * each one through the real Tailwind compiler, and fails if any produces no
 * output. Run it in CI so this class of bug can never ship again.
 *
 *   node scripts/verify-classes.mjs
 */

import { compile } from "tailwindcss";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSS_ENTRY = path.join(ROOT, "app/globals.css");
const SCAN_DIRS = ["app", "components", "lib"];

/** Utility families whose whole job is to emit a colour. */
const COLOR_PREFIXES =
  "bg|text|border|ring|divide|outline|shadow|fill|stroke|from|via|to|accent|caret|decoration";

/** Candidate shapes we check. Anything with an opacity modifier is included
 *  regardless of prefix, since that's where the leading-zero bug lives. */
const VARIANTS = "hover|focus|focus-visible|active|group-hover|dark|sm|md|lg|xl|2xl";

/** The value half of a utility: an identifier (`brand-cyan`, `transparent`),
 *  an arbitrary value (`[#00205B]`), or an identifier carrying one
 *  (`x-[6px]`, `t-[#00142a]`). The bracket branch has to come first, or
 *  `border-x-[6px]` truncates to a bare `border-x-`. */
const VALUE =
  String.raw`(?:[a-z0-9]+(?:-[a-z0-9]+)*-)?\[[^\]\s"'\`]+\]` +
  String.raw`|[a-z0-9]+(?:-[a-z0-9]+)*`;

/** The leading lookbehind matters: without it `btn-outline-navy` (a plain CSS
 *  class from globals.css) yields a phantom `outline-navy` candidate. */
const CANDIDATE_RE = new RegExp(
  String.raw`(?<![\w-])(?:(?:${VARIANTS}):)*` +
    String.raw`(?:${COLOR_PREFIXES})-(?:${VALUE})` +
    String.raw`(?:\/\d+(?:\.\d+)?|\/\[[^\]]+\])?`,
  "g",
);

/**
 * Pull out just the text that is actually a JSX className value.
 *
 * Scanning whole files is wrong: CSS property names sitting in inline <style>
 * template literals ("text-decoration", "border-top", "caret-color") and even
 * ordinary prose ("to-week") match a utility-shaped regex and produce a flood
 * of false positives. Only `className` is considered — not `class`, so the
 * third-party markup injected via dangerouslySetInnerHTML is left alone.
 */
function extractClassNameRegions(text) {
  const regions = [];
  const marker = /className\s*=\s*/g;
  let m;
  while ((m = marker.exec(text)) !== null) {
    let i = m.index + m[0].length;
    const ch = text[i];

    // className="…" or className='…'
    if (ch === '"' || ch === "'") {
      const end = text.indexOf(ch, i + 1);
      if (end > i) {
        regions.push(text.slice(i + 1, end));
        marker.lastIndex = end;
      }
      continue;
    }

    // className={…} — walk to the matching brace, then take every string or
    // template literal inside it (covers ternaries and clsx-style calls).
    if (ch === "{") {
      let depth = 0;
      let j = i;
      for (; j < text.length; j++) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      const body = text.slice(i + 1, j);
      for (const [, s1, s2, s3] of body.matchAll(
        /"([^"]*)"|'([^']*)'|`([^`]*)`/g,
      )) {
        regions.push(s1 ?? s2 ?? s3 ?? "");
      }
      marker.lastIndex = j;
    }
  }
  return regions;
}

function collectFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function makeCompiler(src) {
  return compile(src, {
    base: path.dirname(CSS_ENTRY),
    loadStylesheet: async (id, basedir) => {
      const p =
        id === "tailwindcss"
          ? path.join(ROOT, "node_modules/tailwindcss/index.css")
          : path.resolve(basedir, id);
      return { path: p, base: path.dirname(p), content: fs.readFileSync(p, "utf8") };
    },
    loadModule: async (id, basedir) => {
      const p = path.resolve(basedir, id);
      const mod = await import(p);
      return { path: p, base: path.dirname(p), module: mod.default ?? mod };
    },
  });
}

const src = fs.readFileSync(CSS_ENTRY, "utf8");

// Class names defined as plain CSS rather than generated by Tailwind. These
// legitimately produce no Tailwind output and must not be flagged. Two
// sources: globals.css (.glass, .btn-primary, .eyebrow, …) and per-component
// <style> blocks (NotesEditor defines .outline-item, .accent-stripe, …).
const plainCssClasses = new Set(
  [...src.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]),
);

function harvestLocalCssClasses(text) {
  for (const [, name] of text.matchAll(/\.([a-zA-Z][\w-]*)\s*(?:,|\{)/g)) {
    plainCssClasses.add(name);
  }
}

const allFiles = SCAN_DIRS.flatMap((dir) => {
  const abs = path.join(ROOT, dir);
  return fs.existsSync(abs) ? collectFiles(abs) : [];
});

// Pass 1 — harvest locally-defined CSS class names across every file, so a
// class defined in one file (or later in the same file) is still recognised
// when a candidate referencing it is checked.
for (const file of allFiles) {
  harvestLocalCssClasses(fs.readFileSync(file, "utf8"));
}

// Pass 2 — gather every candidate with the files it appears in.
const occurrences = new Map(); // candidate -> Set<file>
for (const file of allFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const region of extractClassNameRegions(text)) {
    for (const [candidate] of region.matchAll(CANDIDATE_RE)) {
      if (plainCssClasses.has(candidate)) continue;
      if (!occurrences.has(candidate)) occurrences.set(candidate, new Set());
      occurrences.get(candidate).add(path.relative(ROOT, file));
    }
  }
}

const candidates = [...occurrences.keys()].sort();
const baseline = (await makeCompiler(src)).build([]).length;

const dead = [];
for (const candidate of candidates) {
  const compiler = await makeCompiler(src);
  if (compiler.build([candidate]).length - baseline <= 0) dead.push(candidate);
}

console.log(
  `verify-classes: checked ${candidates.length} colour-utility candidates ` +
    `across ${SCAN_DIRS.join(", ")}`,
);

if (dead.length === 0) {
  console.log("✓ every candidate emits CSS");
  process.exit(0);
}

console.error(`\n✗ ${dead.length} candidate(s) emit NO CSS:\n`);
for (const candidate of dead) {
  console.error(`  ${candidate}`);
  for (const file of [...occurrences.get(candidate)].sort()) {
    console.error(`      ${file}`);
  }
}
console.error(
  "\nEach of these renders unstyled. Either define the value in the @theme " +
    "block in app/globals.css, or fix the class name.",
);
process.exit(1);
