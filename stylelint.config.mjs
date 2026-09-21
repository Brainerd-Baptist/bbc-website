/**
 * Stylelint — keeps raw colour out of every stylesheet except the token file.
 *
 * The `overrides` block at the bottom is the important half. One file is the
 * sanctioned home for raw values; everywhere else colour has to come through
 * var(). Without that split the rule would be unenforceable here, because
 * app/globals.css used to be the project's ONLY stylesheet — exempting "the
 * token file" would have exempted all of it.
 *
 * Deliberately narrow: this only polices colour. It is not a formatting or
 * style-opinion config, so it will not churn the codebase or argue about
 * whitespace.
 */
export default {
  rules: {
    // Raw colour literals, in every form.
    "color-no-hex": true,
    "color-named": "never",

    // Colour-bearing properties may only reference a token (plus the three
    // keywords that carry no colour of their own).
    "declaration-property-value-allowed-list": {
      "/^color$/": ["/^var\\(--/", "transparent", "currentColor", "inherit", "unset"],
      "background-color": ["/^var\\(--/", "transparent", "currentColor", "inherit"],
      "border-color": ["/^var\\(--/", "transparent", "currentColor", "inherit"],
      "border-top-color": ["/^var\\(--/", "transparent", "currentColor"],
      "border-right-color": ["/^var\\(--/", "transparent", "currentColor"],
      "border-bottom-color": ["/^var\\(--/", "transparent", "currentColor"],
      "border-left-color": ["/^var\\(--/", "transparent", "currentColor"],
      "outline-color": ["/^var\\(--/", "transparent", "currentColor"],
      "fill": ["/^var\\(--/", "transparent", "currentColor", "none"],
      "stroke": ["/^var\\(--/", "transparent", "currentColor", "none"],
    },

    // Colour functions are how you smuggle a literal past the rules above
    // (e.g. `background: rgba(0,0,0,.5)`), so they are banned outside the
    // token file too.
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch"],
  },

  overrides: [
    {
      // THE token file. The only place a raw colour may be written.
      files: ["app/tokens.css"],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "declaration-property-value-allowed-list": null,
        "function-disallowed-list": null,
      },
    },
  ],

  ignoreFiles: ["**/node_modules/**", ".next/**", "out/**", "build/**"],
};
