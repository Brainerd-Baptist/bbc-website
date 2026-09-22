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
/**
 * The file's source with everything that is NOT code blanked out: comments,
 * and the regions the exemption registry declares (print documents, <meta>
 * attributes, the token layer) where a literal is the correct answer.
 *
 * Returns null for a whole-file exemption.
 *
 * Every metric reads through this. It used to be inlined in countMatches
 * alone, so countFiles saw raw source — and a comment EXPLAINING a colour
 * ("it composites to #00647e, 2.75:1") counted as an unthemed file. A gate
 * that fails on its own documentation teaches people to delete the
 * documentation.
 */
function codeOnly(f, src) {
  const exempt = exemptLines(f, src);
  if (exempt === null) return null;
  let inBlock = false;
  return src
    .split("\n")
    .map((line, i) => {
      const t = line.trim();
      const opens = line.lastIndexOf("/*");
      const closes = line.lastIndexOf("*/");
      const wasInBlock = inBlock;
      if (opens !== -1 && opens > closes) inBlock = true;
      else if (closes !== -1 && closes > opens) inBlock = false;
      if (wasInBlock || inBlock) return "";
      if (exempt.has(i)) return "";
      if (t.startsWith("//") || t.startsWith("*")) return "";
      return line;
    })
    .join("\n");
}

function countMatches(re, filter = () => true) {
  let n = 0;
  for (const f of files.filter(filter)) {
    const code = codeOnly(f, read(f));
    if (code === null) continue;
    n += (code.match(re) ?? []).length;
  }
  return n;
}

function countFiles(pred) {
  return files.filter((f) => {
    const code = codeOnly(f, read(f));
    return code !== null && pred(code, f);
  }).length;
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
  "arbitrary-spacing-radius-class": {
    what: "arbitrary spacing/radius classes and the micro-label text-size scatter (bbc-spacing/no-raw-spacing)",
    value: () => eslintWarnings("bbc-spacing/no-raw-spacing"),
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
  "hue-on-own-tint": {
    what: "text or an icon painted in a hue over a tint of that same hue",
    // A brand hue at full strength on a 6-13% wash of itself is the same
    // failing pairing at every hue -- the player speed pill measured 2.31:1
    // (#00abc9 on #ddeff4) and three more sites repeated it. None was
    // reachable locally: those components render only when the CMS says the
    // sermon has audio, and the sandbox cannot reach the CMS. CI found one by
    // luck; this finds the shape without needing the data.
    //
    // Scans whitespace-collapsed source, not lines. The first version matched
    // `background:` and the tint on one line, and a prettier-wrapped
    // `background:\n  ... `${hue}18`` walked straight through it -- which the
    // proof-of-failure caught only because the proof was run. A gate nobody
    // tries to break is a comment.
    //
    // It sees a tint and the bare hue used as ink within ~240 characters of
    // each other. That covers one style object, which is the shape in
    // practice; it does NOT catch a tint and an ink that live on different
    // elements far apart, and it is not claimed to.
    //
    // The fix is always the same: `solid` under --fg-on-accent for a filled
    // chip, or deriveInk(hue).dark for ink on a dark tint. Both are gated by
    // verify:identity.
    value: () => {
      let n = 0;
      for (const f of files.filter((x) => /\.(tsx|jsx)$/.test(x))) {
        const code = codeOnly(f, read(f));
        if (code === null) continue;
        const flat = code.replace(/\s+/g, " ");
        for (const m of flat.matchAll(/\$\{(\w+)\}[0-9a-fA-F]{2}\b/g)) {
          const id = m[1];
          const from = Math.max(0, m.index - 240);
          const near = flat.slice(from, m.index + 240);
          // the identifier used bare as ink -- `color: hue` or `color: x ? hue`
          if (new RegExp(`color:[^;}]{0,80}\\b${id}\\b\\s*[,:?}]`).test(near)) n++;
        }
      }
      return n;
    },
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

/**
 * Metrics with a LEGITIMATE FLOOR — they will never be zero, and driving them
 * there would make the site worse, not better. Recorded so nobody mistakes a
 * non-zero count here for unfinished work.
 */
const FLOORS = {
  "unthemeable-tailwind-class":
    "`text-white/60` and above on a permanently dark band is correct: " +
    "theme-invariant ink on a ground that never flips. A token per alpha step " +
    "would be churn.\n" +
    "        This floor was previously claimed for the whole metric, and that " +
    "claim was wrong. axe measured text-white/30 at 2.56:1 and text-white/40 " +
    "at 3.52:1 on the same navy — real AA failures sitting inside a " +
    "\"legitimate\" floor. The alpha at which white clears 4.5:1 on this navy " +
    "is 52%, so every site at /50 and below was converted to " +
    "--fg-on-dark-muted (40 sites, 14 files) and the count fell 177 -> 131.\n" +
    "        A floor is a claim about correctness. This one went unchecked " +
    "because it sounded reasonable, which is the only way a rail hides a " +
    "defect: by being agreed with.",
  "js-theme-branch":
    "The theme toggle's own icon and aria-label. You cannot write \"Switch to " +
    "light mode\" in CSS, so these three must read the resolved theme in JS. " +
    "They decide an icon and a label, never a colour.",
  "eslint-errors":
    "Pre-existing non-colour debt: unescaped entities, react-hooks rules, " +
    "<img> warnings. Tracked so it cannot grow; not this project's to fix. " +
    "`npm run lint:color` is the scoped gate that blocks at zero.",
  "hue-on-own-tint":
    "Blocked at zero. A hue on a wash of itself fails at every hue; use the " +
    "`solid` tier under --fg-on-accent, which verify:identity gates.",
  "unthemed-files":
    "Counts files holding any hardcoded colour with no dark: variant, which " +
    "includes every file whose colour is legitimately theme-invariant. " +
    "Overlaps the floor above.",
};

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

// Any metric sitting at a documented floor is reported as such, so a non-zero
// number here is not read as leftover work by whoever looks next.
const atFloor = Object.keys(FLOORS).filter((k) => k in current);
if (atFloor.length) {
  console.log("\n  Metrics with a documented floor (non-zero is correct):");
  for (const k of atFloor) {
    console.log(`    ${k} = ${current[k]}`);
    console.log(`      ${FLOORS[k]}`);
  }
}

console.log(
  improvements > 0
    ? `✓ nothing regressed, ${improvements} metric(s) improved — run \`npm run ratchet:update\` to lock it in`
    : "✓ nothing regressed",
);
process.exit(0);
