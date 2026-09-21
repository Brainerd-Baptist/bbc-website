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
  // Severity is "error" as of Phase 6. Through the migration it was a warning,
  // because making it an error while hundreds of violations existed would have
  // meant a permanently red build, and a gate that always fails gets ignored —
  // the ratchet held the count down instead. The count is now zero, so the
  // rule blocks, and `npm run lint:color` is the scoped gate in the verify
  // chain (bare eslint would drag in 52 unrelated pre-existing errors).
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    plugins: { bbc },
    rules: {
      // BLOCKING as of Phase 6. It was a warning through the migration, with
      // the count held down by scripts/ratchet.mjs; the count is now zero, so
      // the rule becomes an error and the next raw colour fails the build
      // instead of being absorbed into a baseline.
      "bbc/no-raw-color": "error",
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
