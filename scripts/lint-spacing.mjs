#!/usr/bin/env node
/**
 * scripts/lint-spacing.mjs
 *
 * Runs ESLint and fails ONLY on bbc-spacing/no-raw-spacing. Same rationale
 * as scripts/lint-color.mjs: the repo carries 52 pre-existing errors
 * unrelated to theming, so bare `eslint .` would make the gate permanently
 * red. This gate is scoped to the one rule it's responsible for.
 */

import { ESLint } from "eslint";

const eslint = new ESLint({});
const results = await eslint.lintFiles(["app", "components", "lib"]);

const hits = [];
for (const r of results) {
  for (const m of r.messages) {
    if (m.ruleId === "bbc-spacing/no-raw-spacing") {
      hits.push(`  ${r.filePath.replace(process.cwd() + "/", "")}:${m.line}  ${m.message}`);
    }
  }
}

if (hits.length) {
  console.error(`lint-spacing: ${hits.length} raw spacing/radius/micro-label violation(s)\n`);
  console.error(hits.join("\n"));
  console.error(
    "\n✗ Use a semantic spacing/radius token, or .label-micro. If the literal is\n" +
      "  genuinely correct, declare it in scripts/spacing-literal-exemptions.mjs\n" +
      "  with a reason, rather than silencing the rule.",
  );
  process.exit(1);
}
console.log("lint-spacing: 0 raw spacing/radius/micro-label violations in app, components, lib");
console.log("✓ the spacing/radius/type rail is clean");
