#!/usr/bin/env node
/**
 * scripts/ratchet.mjs
 *
 * A one-way gate on the theming migration.
 *
 * The problem this solves: there are ~950 raw-colour violations across ~60
 * unmigrated files. Turning the rails on as errors today would mean a
 * permanently red build, and a gate that always fails is one everybody learns
 * to ignore. Turning them off until the end means nothing stops the count
 * creeping back up while 68 files get rewritten.
 *
 * So: record today's counts, then fail only when a count goes UP. Every phase
 * drives the numbers down and re-baselines. This is the same pattern used for
 * incremental TypeScript-strictness migrations.
 *
 *   node scripts/ratchet.mjs            check against the baseline
 *   node scripts/ratchet.mjs --update   re-record (do this when a count drops)
 *
 * Phase 6 flips the rails to hard errors and deletes the baseline entirely.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { exemptLines } from "./color-literal-exemptions.mjs";

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, "scripts/ratchet-baseline.json");
const SCAN_DIRS = ["app", "components", "lib"];

/**
 * Where raw colour is legitimate. Declared as data in
 * color-literal-exemptions.mjs, with a reason per entry — see the note at the
 * top of that file for why this is not a comment in the source it protects.
 */
const EXEMPT = new Set(["app/tokens.css"]);

function walk(dir, out = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return out;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walk(rel, out);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name) && !EXEMPT.has(rel)) out.push(rel);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(d));
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

/** Count regex matches across the tree, ignoring comment-only lines. */
function countMatches(re, filter = () => true) {
  let n = 0;
  for (const f of files.filter(filter)) {
    const src = read(f);
    // Regions where a literal is the correct answer (print documents, <meta>
    // attributes, the token layer) are not residue and must not be counted —
    // otherwise the only way to make the number go down is to break them.
    const exempt = exemptLines(f, src);
    if (exempt === null) continue;
    // Track block-comment state rather than only skipping lines that START
    // with a comment marker. A continuation line inside a /* ... */ block does
    // not, so prose mentioning a colour ("--nav-ink resolved to #fff") used to
    // count as residue — which it is not, and which made the gate fail on a
    // comment.
    let inBlock = false;
    src.split("\n").forEach((line, i) => {
      const t = line.trim();
      const opens = line.lastIndexOf("/*");
      const closes = line.lastIndexOf("*/");
      const wasInBlock = inBlock;
      if (opens !== -1 && opens > closes) inBlock = true;
      else if (closes !== -1 && closes > opens) inBlock = false;
      if (wasInBlock || inBlock) return;
      if (exempt.has(i)) return;
      if (t.startsWith("//") || t.startsWith("*")) return;
      n += (line.match(re) ?? []).length;
    });
  }
  return n;
}

function countFiles(pred) {
  return files.filter((f) => pred(read(f), f)).length;
}

function eslintWarnings(ruleId) {
  try {
    const out = execFileSync("npx", ["eslint", "--format", "json"], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const report = JSON.parse(out);
    let n = 0;
    for (const f of report) for (const m of f.messages) if (m.ruleId === ruleId) n++;
    return n;
  } catch (err) {
    // eslint exits non-zero when there are errors; its JSON is still on stdout.
    const out = err.stdout?.toString();
    if (!out) throw err;
    const report = JSON.parse(out);
    let n = 0;
    for (const f of report) for (const m of f.messages) if (m.ruleId === ruleId) n++;
    return n;
  }
}

// ── the metrics ───────────────────────────────────────────────────────────
// Each one must only ever decrease. Descriptions are shown in the output so a
// rising number explains itself without anyone reading this file.

const METRICS = {
  "raw-hex": {
    what: "hex colour literals outside the token file",
    value: () => countMatches(/#[0-9a-fA-F]{3,8}\b/g),
  },
  "raw-rgb-fn": {
    what: "rgb()/rgba()/hsl() calls outside the token file",
    value: () => countMatches(/\b(?:rgba?|hsla?)\s*\(/g),
  },
  "arbitrary-color-class": {
    what: "Tailwind arbitrary colour classes and inline-style colour literals (bbc/no-raw-color)",
    value: () => eslintWarnings("bbc/no-raw-color"),
  },
  "unthemeable-tailwind-class": {
    what: "bg-white / text-white / *-gray-N classes with no dark: sibling",
    value: () =>
      countMatches(
        /\b(?:bg|text|border|divide|ring)-(?:white|black|(?:gray|slate|zinc|neutral|stone)-\d{2,3})\b/g,
        (f) => /\.(tsx|jsx)$/.test(f),
      ),
  },
  "bg-white-route-shell": {
    what: "route wrappers hardcoded to min-h-screen bg-white (blocks dark mode entirely)",
    value: () => countMatches(/min-h-screen\s+bg-white/g),
  },
  "js-theme-branch": {
    what: "isDark / resolvedTheme branches deciding a colour in JS (cannot SSR)",
    value: () => countMatches(/\bisDark\b/g, (f) => /\.(tsx|ts)$/.test(f)),
  },
  "unthemed-files": {
    what: "files with a hardcoded colour and no dark: variant at all",
    value: () =>
      countFiles(
        (src, f) =>
          /\.(tsx|jsx)$/.test(f) &&
          /#[0-9a-fA-F]{3,8}\b|\brgba?\s*\(/.test(src) &&
          !/\bdark:/.test(src),
      ),
  },
  "eslint-errors": {
    what: "total eslint errors (pre-existing debt; must not grow)",
    value: () => {
      try {
        const out = execFileSync("npx", ["eslint", "--format", "json"], {
          cwd: ROOT,
          encoding: "utf8",
          maxBuffer: 64 * 1024 * 1024,
          stdio: ["ignore", "pipe", "ignore"],
        });
        return JSON.parse(out).reduce((a, f) => a + f.errorCount, 0);
      } catch (err) {
        const out = err.stdout?.toString();
        if (!out) throw err;
        return JSON.parse(out).reduce((a, f) => a + f.errorCount, 0);
      }
    },
  },
};

// ── run ───────────────────────────────────────────────────────────────────

const current = {};
for (const [key, m] of Object.entries(METRICS)) current[key] = m.value();

const updating = process.argv.includes("--update");

if (updating || !fs.existsSync(BASELINE)) {
  fs.writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        _comment:
          "Migration ratchet. Counts may only decrease. Regenerate with `npm run ratchet:update` after a phase lands. Deleted in Phase 6 when the rails become hard errors.",
        recorded: new Date().toISOString().slice(0, 10),
        counts: current,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`ratchet: baseline ${fs.existsSync(BASELINE) ? "updated" : "created"}\n`);
  for (const [k, v] of Object.entries(current)) {
    console.log(`  ${String(v).padStart(6)}  ${k} — ${METRICS[k].what}`);
  }
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
const prev = baseline.counts ?? {};

let regressions = 0;
let improvements = 0;

console.log(`ratchet: comparing against baseline recorded ${baseline.recorded}\n`);
for (const [key, m] of Object.entries(METRICS)) {
  const now = current[key];
  const was = prev[key];
  if (was === undefined) {
    console.log(`  ${String(now).padStart(6)}  ${key} — NEW metric, not in baseline`);
    continue;
  }
  const delta = now - was;
  if (delta > 0) {
    regressions++;
    console.error(
      `  WORSE  ${key}: ${was} → ${now} (+${delta})\n         ${m.what}`,
    );
  } else if (delta < 0) {
    improvements++;
    console.log(`  better ${key}: ${was} → ${now} (${delta})`);
  } else {
    console.log(`  same   ${key}: ${now}`);
  }
}

console.log();
if (regressions > 0) {
  console.error(
    `✗ ${regressions} metric(s) went up. Use a semantic token from app/tokens.css instead of a\n` +
      `  raw colour, or run \`npm run ratchet:update\` if the increase is genuinely intended.`,
  );
  process.exit(1);
}
console.log(
  improvements > 0
    ? `✓ nothing regressed, ${improvements} metric(s) improved — run \`npm run ratchet:update\` to lock it in`
    : "✓ nothing regressed",
);
process.exit(0);
