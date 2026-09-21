import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import bbc from "./eslint-rules/no-raw-color.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Theming rail. See eslint-rules/no-raw-color.mjs for why this rule is
  // load-bearing rather than a nicety: clearing the Tailwind palette does not
  // block `bg-[#hex]`, and arbitrary hex is the dominant pattern in this
  // codebase.
  //
  // Severity is "warn" on purpose. There are hundreds of pre-existing
  // violations across the ~68 unmigrated files; making this an error today
  // would mean a permanently red build, and a gate that always fails gets
  // ignored. scripts/ratchet.mjs counts these and fails only when the count
  // goes UP. It is promoted to "error" in Phase 6, once the count is zero.
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    plugins: { bbc },
    rules: {
      "bbc/no-raw-color": "warn",
    },
  },

  // The token file's own values are written as CSS, not JS, so nothing here
  // needs exempting — but the scripts that PARSE those values legitimately
  // contain colour literals in their test fixtures and docs.
  {
    files: ["scripts/**", "tests/**", "eslint-rules/**"],
    rules: {
      "bbc/no-raw-color": "off",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
