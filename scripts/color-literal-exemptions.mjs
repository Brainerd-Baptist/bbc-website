/**
 * scripts/color-literal-exemptions.mjs
 *
 * The places where a raw colour literal is CORRECT, and why.
 *
 * This file exists because of a specific failure. `app/layout.tsx` carries a
 * `themeColor` viewport export whose value must be a literal — it lands in a
 * `<meta>` attribute, where `var(--fg)` resolves to nothing. A bulk sweep
 * rewrote it to `var(--fg)` twice: the second time the line already carried a
 * comment saying it must stay literal. A comment is documentation, not a
 * guard. Anything that must survive a sweep has to be data the sweep reads.
 *
 * So: every exemption is declared here with a reason, the ratchet subtracts
 * these regions from its counts, and any future sweep consults this list
 * rather than trusting prose in the file it is rewriting.
 *
 * `whole: true`   — the entire file is exempt.
 * `match`         — a regex; lines matching it are exempt.
 * `fn`            — the name of a function; its whole body (by brace balance)
 *                   is exempt.
 * `atRule`        — a CSS at-rule (e.g. "@media print"); its block is exempt.
 */

export const COLOR_LITERAL_EXEMPTIONS = [
  {
    file: "app/tokens.css",
    whole: true,
    reason:
      "The token layer itself — the one sanctioned home for raw colour. " +
      "Every literal here is a definition that everything else references.",
  },
  {
    file: "app/layout.tsx",
    match: /color:\s*"#|themeColor/,
    reason:
      "`themeColor` becomes a <meta> attribute, not CSS. var() does not " +
      "resolve in an HTML attribute, so these must stay literal. Keep them " +
      "in step with --surface in each theme.",
  },
  {
    file: "components/sermons/SermonNotes.tsx",
    fn: "buildPrintHTML",
    reason:
      "Builds a standalone HTML document that opens in a new window to be " +
      "printed. It has its own <html> and <style> and never loads " +
      "app/tokens.css, so a var() reference there would resolve to nothing. " +
      "It is also paper output, which has no dark mode.",
  },
  {
    file: "app/sermons/[slug]/opengraph-image.tsx",
    whole: true,
    reason:
      "Renders a 1200x630 PNG through next/og (satori). There is no document, " +
      "no :root and no CSS custom properties in that renderer, and the output " +
      "is a static social card that appears in Twitter and iMessage rather " +
      "than in our page. Literals are the only thing that works here.",
  },
  {
    file: "app/sermons/[slug]/notes/pdf/route.ts",
    whole: true,
    reason:
      "Generates a PDF with @react-pdf/renderer, which resolves no CSS " +
      "variables, and the output is paper. Its own header says 'ink-light " +
      "design: white background, navy text' — that is correct and must not " +
      "follow the screen theme.",
  },
  {
    file: "components/audio/GlobalAudioPlayer.tsx",
    match: /accentColor \?\? "#/,
    reason:
      "The per-track accent falls back to brand cyan, and the value has to be " +
      "a 6-digit hex string because the component builds translucent variants " +
      "by concatenating alpha onto it (`${accent}99`, `${accent}33`). " +
      "`var(--accent)99` is not a colour. Every OTHER colour in this file is " +
      "tokenised; this one is load-bearing as a string.",
  },
  // ── hex required because alpha is string-concatenated onto it ────────────
  // Same mechanism as GlobalAudioPlayer above: `var(--accent)66` is not a
  // colour, so these fallbacks are load-bearing AS STRINGS.
  {
    file: "components/sermons/AudioPlayer.tsx",
    match: /accentColor = "#/,
    reason: "Concatenated as `${accentColor}11|44|66|18`.",
  },
  {
    file: "components/sermons/ContinueListeningShelf.tsx",
    match: /seriesAccent \?\? "#/,
    reason: "Concatenated as `${accent}66`.",
  },
  {
    file: "app/sermons/page.tsx",
    match: /seriesAccent \?\? "#/,
    reason: "Concatenated as `${heroAccent}22` for the badge tint.",
  },
  {
    file: "app/sermons/[slug]/page.tsx",
    match: /accentColor.*\?\? "#/,
    reason:
      "Flows into GlobalAudioPlayer (`${accent}99`) and SpeakerCard " +
      "(accentColor + '33'); converting it breaks both at runtime.",
  },
  {
    file: "app/sermons/[slug]/notes/NotesEditor.tsx",
    atRule: "@media print",
    reason:
      "The print-time token reset. Paper has no dark mode, so this block " +
      "deliberately re-points the tokens at ink values; that is the whole " +
      "point of it, and it is the one place literals belong in this file.",
  },
];

/**
 * Lines (0-based) in `source` that are exempt for `file`.
 * Returns null when the whole file is exempt.
 */
export function exemptLines(file, source) {
  const rules = COLOR_LITERAL_EXEMPTIONS.filter((r) => r.file === file);
  if (!rules.length) return new Set();
  if (rules.some((r) => r.whole)) return null;

  const lines = source.split("\n");
  const out = new Set();

  const blockFrom = (startIdx) => {
    let depth = 0;
    for (let i = startIdx; i < lines.length; i++) {
      depth += (lines[i].match(/\{/g) ?? []).length;
      depth -= (lines[i].match(/\}/g) ?? []).length;
      out.add(i);
      if (depth === 0 && i > startIdx) return;
    }
  };

  for (const r of rules) {
    if (r.match) {
      lines.forEach((l, i) => {
        if (r.match.test(l)) out.add(i);
      });
    }
    if (r.fn) {
      const i = lines.findIndex((l) => new RegExp(`function\\s+${r.fn}\\b`).test(l));
      if (i !== -1) blockFrom(i);
    }
    if (r.atRule) {
      lines.forEach((l, i) => {
        if (l.includes(r.atRule)) blockFrom(i);
      });
    }
  }
  return out;
}
