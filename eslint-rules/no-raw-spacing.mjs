/**
 * ESLint rule: no-raw-spacing
 *
 * The spacing/radius/type counterpart to no-raw-color. Flags three shapes,
 * each backed by a specific audit finding in
 * docs/spacing-radius-type-plan.md rather than a guess:
 *
 *   1. Arbitrary spacing classes — `gap-[22px]`, `p-[13px]`, `mt-[6px]`.
 *      The audit grepped every padding/margin/gap class in app/ and
 *      components/ and found ZERO arbitrary-bracket sites: every one was
 *      already a stock Tailwind number. That's a real floor, not an
 *      aspiration — this rule exists to keep it at zero, the same way
 *      hue-on-own-tint is blocked at zero in scripts/ratchet.mjs rather than
 *      tracked down to it.
 *
 *   2. Arbitrary radius classes — `rounded-[10px]`, `rounded-t-[6px]`.
 *      Same audit, same result: zero arbitrary radius sites existed.
 *
 *   3. The micro-label scatter — a tiny arbitrary text size (`text-[8px]`
 *      through `text-[11px]`) combined with `uppercase` in the same class
 *      string. This is deliberately narrower than "any small arbitrary text
 *      size": the audit found 21 sites of THIS specific uppercase-label
 *      pattern reinventing what .eyebrow already does one size down, and 17
 *      were swept onto .label-micro. A bare `text-[10px]` with no uppercase
 *      is very often a legitimate one-off (a timer digit, a middle-dot
 *      separator) that was never part of the drift being fixed, so it is
 *      intentionally NOT flagged — flagging it would be noise, and the first
 *      draft of no-raw-color made exactly this mistake with bg-black/30.
 *
 * NOT covered, on purpose: `w-[…]`/`h-[…]` (fixed-dimension icon/thumbnail
 * sizing is a different, legitimate category — 21 such sites were found
 * during the audit and are expected to stay literal) and inline-style
 * spacing/font-size (out of scope — the audit that justifies blocking at
 * zero only covered className arbitrary values; a bespoke heading's inline
 * `style={{ fontSize: "clamp(...)" }}` is a deliberate design decision per
 * the plan doc, not drift, and this rule does not touch it).
 */

import path from "node:path";
import { exemptLines } from "../scripts/spacing-literal-exemptions.mjs";

/** e.g. `p-[13px]`, `gap-x-[6px]`, `hover:mt-[2px]`, `-mb-[4px]` */
const ARBITRARY_SPACING_CLASS =
  /(?:^|\s|:)-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\[[^\]\s"'`]+\]/g;

/** e.g. `rounded-[10px]`, `rounded-t-[6px]`, `rounded-tl-[4px]` */
const ARBITRARY_RADIUS_CLASS =
  /(?:^|\s|:)rounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|ee|es))?-\[[^\]\s"'`]+\]/g;

/** A tiny arbitrary text size: text-[8px] through text-[11px] specifically —
 *  the exact range the micro-label audit measured, not "any small size". */
const MICRO_TEXT_SIZE = /(?:^|\s|:)text-\[(?:[89]|1[01])px\]/;
const HAS_UPPERCASE = /(?:^|\s)uppercase(?:\s|$)/;

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

function checkString(text, strNode, report) {
  for (const m of text.matchAll(ARBITRARY_SPACING_CLASS)) {
    report(strNode, "arbitrarySpacing", m[0].replace(/^[\s:]+/, ""));
  }
  for (const m of text.matchAll(ARBITRARY_RADIUS_CLASS)) {
    report(strNode, "arbitraryRadius", m[0].replace(/^[\s:]+/, ""));
  }
  if (MICRO_TEXT_SIZE.test(text) && HAS_UPPERCASE.test(text)) {
    const m = text.match(MICRO_TEXT_SIZE);
    report(strNode, "microLabel", m[0].replace(/^[\s:]+/, ""));
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw arbitrary spacing/radius classes and the micro-label text-size scatter; use a semantic token or .label-micro instead.",
    },
    schema: [],
    messages: {
      arbitrarySpacing:
        'Arbitrary spacing value: "{{text}}". The spacing audit found zero legitimate uses of this shape (docs/spacing-radius-type-plan.md) -- use a stock Tailwind number, or a --spacing-* token (gap-gutter, px-control-x, p-card-pad, py-section…) if this is the role it names.',
      arbitraryRadius:
        'Arbitrary radius value: "{{text}}". Use a stock Tailwind radius class, or a --radius-* token (rounded-control, rounded-card, rounded-panel, rounded-input, rounded-tag) if this is the role it names.',
      microLabel:
        'Arbitrary micro text size "{{text}}" combined with uppercase -- this is the compact-label pattern .label-micro exists for (21-site scatter documented in docs/spacing-radius-type-plan.md). Use className="label-micro" instead of hand-typing size/weight/tracking/uppercase.',
    },
  },

  create(context) {
    const rel = path.relative(
      process.cwd(),
      context.filename ?? context.getFilename(),
    );
    const exempt = exemptLines(rel, context.sourceCode?.getText?.() ?? "");
    const isExempt = (node) =>
      exempt === null || exempt.has((node.loc?.start?.line ?? 0) - 1);

    const report = (strNode, messageId, text) => {
      context.report({ node: strNode, messageId, data: { text } });
    };

    return {
      JSXAttribute(node) {
        const name = node.name?.name;
        if (name !== "className" && name !== "class") return;
        if (isExempt(node)) return;

        const value =
          node.value?.type === "JSXExpressionContainer"
            ? node.value.expression
            : node.value;

        for (const [text, strNode] of stringsIn(value)) {
          checkString(text, strNode, report);
        }
      },

      // Same rationale as no-raw-color: a class list hoisted into a `const`
      // still needs to be caught, or `foo-classes` const defeats the rule.
      VariableDeclarator(node) {
        if (isExempt(node)) return;
        const name = node.id?.name;
        if (!name || !/(class|cls|className|styles?)$/i.test(name)) return;
        for (const [text, strNode] of stringsIn(node.init)) {
          checkString(text, strNode, report);
        }
      },
    };
  },
};

export default { rules: { "no-raw-spacing": rule } };
