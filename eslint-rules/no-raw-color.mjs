/**
 * ESLint rule: no-raw-color
 *
 * Flags the two ways a raw colour gets into a component, neither of which any
 * other rail can see:
 *
 *   1. Arbitrary colour classes — `className="text-[#00205B]"`.
 *      This one is LOAD-BEARING, not belt-and-braces. Clearing the Tailwind
 *      palette with `--color-*: initial` makes `bg-white` a build error but
 *      does NOT touch arbitrary values: verified against the Tailwind v4
 *      engine, `bg-[#00205B]` still compiles fine after the palette is
 *      cleared. Since arbitrary hex is the dominant pattern in this codebase
 *      (455 occurrences of the brand navy alone), this rule is the only thing
 *      that closes that hole.
 *
 *   2. Colour literals in inline style objects — `style={{ color: "#fff" }}`.
 *      No off-the-shelf rule covers this well.
 *
 * Reports at whatever severity the config sets. During the migration it is a
 * warning: the count is tracked by scripts/ratchet.mjs, which fails the build
 * only if it goes UP. It becomes an error in Phase 6.
 *
 * Non-colour arbitrary values are intentionally allowed — `border-x-[6px]`
 * and `w-[72ch]` are fine and have nothing to do with theming.
 */

/** A colour literal in any CSS-writable form. */
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklch|oklab)\s*\(/;

/** Tailwind utility families whose arbitrary value would be a colour. */
const COLOR_UTILITIES =
  "bg|text|border|ring|divide|outline|shadow|fill|stroke|from|via|to|decoration|accent|caret|placeholder";

/** e.g. `text-[#00205B]`, `hover:bg-[rgba(0,0,0,.5)]`, `border-t-[#fff]` */
const ARBITRARY_COLOR_CLASS = new RegExp(
  String.raw`(?:^|\s|:)(?:${COLOR_UTILITIES})(?:-[a-z]+)?-\[` +
    String.raw`(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\([^\]]*\))\]`,
  "g",
);

/** CSS properties whose value would be a colour. */
const COLOR_PROPS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "fill",
  "stroke",
  "boxShadow",
  "textShadow",
  "textDecorationColor",
  "caretColor",
  "columnRuleColor",
  "WebkitTextFillColor",
]);

/** Collect every static string inside an arbitrary expression. */
function stringsIn(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push([node.value, node]);
      break;
    case "TemplateLiteral":
      for (const q of node.quasis) out.push([q.value.cooked ?? q.value.raw, q]);
      for (const e of node.expressions) stringsIn(e, out);
      break;
    case "ConditionalExpression":
      stringsIn(node.consequent, out);
      stringsIn(node.alternate, out);
      break;
    case "LogicalExpression":
    case "BinaryExpression":
      stringsIn(node.left, out);
      stringsIn(node.right, out);
      break;
    case "CallExpression":
      for (const a of node.arguments) stringsIn(a, out);
      break;
    case "ArrayExpression":
      for (const el of node.elements) stringsIn(el, out);
      break;
    case "ObjectExpression":
      for (const p of node.properties) if (p.value) stringsIn(p.value, out);
      break;
    default:
      break;
  }
  return out;
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw colour literals in className arbitrary values and inline style objects; use a semantic token instead.",
    },
    schema: [],
    messages: {
      arbitraryClass:
        'Raw colour in a Tailwind arbitrary value: "{{text}}". Use a semantic token utility (bg-surface, text-fg, text-fg-muted, border-border, bg-accent-solid…). Clearing the palette does not catch this, so it has to be caught here.',
      inlineStyle:
        'Raw colour literal "{{text}}" in an inline style. Use var(--token) — e.g. style={{ color: "var(--fg)" }}.',
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        const name = node.name?.name;
        if (name !== "className" && name !== "class") return;

        const value =
          node.value?.type === "JSXExpressionContainer"
            ? node.value.expression
            : node.value;

        for (const [text, strNode] of stringsIn(value)) {
          for (const m of text.matchAll(ARBITRARY_COLOR_CLASS)) {
            context.report({
              node: strNode,
              messageId: "arbitraryClass",
              // Strip the leading whitespace or variant colon the pattern
              // consumed, so the message shows just the class.
              data: { text: m[0].replace(/^[\s:]+/, "") },
            });
          }
        }
      },

      /** style={{ … }} on a JSX element. */
      JSXExpressionContainer(node) {
        const attr = node.parent;
        if (attr?.type !== "JSXAttribute" || attr.name?.name !== "style") return;
        const obj = node.expression;
        if (obj?.type !== "ObjectExpression") return;

        for (const prop of obj.properties) {
          if (prop.type !== "Property") continue;
          const key =
            prop.key?.name ?? (typeof prop.key?.value === "string" ? prop.key.value : null);
          if (!key || !COLOR_PROPS.has(key)) continue;

          for (const [text, strNode] of stringsIn(prop.value)) {
            const hit = text.match(COLOR_LITERAL);
            if (hit) {
              context.report({
                node: strNode,
                messageId: "inlineStyle",
                data: { text: hit[0] },
              });
            }
          }
        }
      },
    };
  },
};

export default { rules: { "no-raw-color": rule } };
