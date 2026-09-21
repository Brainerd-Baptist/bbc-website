#!/usr/bin/env node
/**
 * scripts/lint-color.mjs
 *
 * Runs ESLint and fails ONLY on bbc/no-raw-color.
 *
 * Why not just `eslint .`: the repo carries 52 pre-existing errors that have
 * nothing to do with colour — unescaped entities, react-hooks rules, `<img>`
 * warnings. Chaining bare eslint into `verify` would make the gate
 * permanently red, and a gate that always fails is one everybody learns to
 * ignore. That is exactly why it was pulled out of the chain in Phase 2.
 *
 * So this gate is scoped: the theming rail blocks at zero, and the unrelated
 * debt stays visible in `npm run lint` without holding the build hostage.
 */

import { ESLint } from "eslint";

const eslint = new ESLint({});
const results = await eslint.lintFiles(["app", "components", "lib"]);

const hits = [];
for (const r of results) {
  for (const m of r.messages) {
    if (m.ruleId === "bbc/no-raw-color") {
      hits.push(`  ${r.filePath.replace(process.cwd() + "/", "")}:${m.line}  ${m.message}`);
    }
  }
}

if (hits.length) {
  console.error(`lint-color: ${hits.length} raw colour(s)\n`);
  console.error(hits.join("\n"));
  console.error(
    "\n✗ Use a semantic token. If the literal is genuinely correct — a print\n" +
      "  document, a renderer with no CSS variables, a hex that gets alpha\n" +
      "  concatenated onto it — declare it in scripts/color-literal-exemptions.mjs\n" +
      "  with a reason, rather than silencing the rule.",
  );
  process.exit(1);
}
console.log("lint-color: 0 raw colours in app, components, lib");
console.log("✓ the theming rail is clean");
