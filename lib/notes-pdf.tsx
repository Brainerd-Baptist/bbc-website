/**
 * lib/notes-pdf.tsx
 *
 * Turns the rich-text HTML produced by the TipTap notes editor
 * (components/sermons/SermonNotes.tsx) into a real, downloadable PDF via
 * @react-pdf/renderer — used by app/api/notes/pdf and app/api/notes/email so
 * every "My Notes" surface (the sermon page, /live, and email) renders from
 * the exact same source instead of three divergent note-taking systems.
 *
 * The TipTap schema here is deliberately small (StarterKit with heading/
 * blockquote/codeBlock/horizontalRule disabled, plus Underline and
 * Highlight) so the HTML it emits is limited to: <p>, <ul>/<ol> with
 * (possibly nested) <li><p>...</p></li>, <br>, and the inline marks
 * <strong> <em> <u> <s> <mark>. This file writes a small purpose-built
 * tokenizer for exactly that vocabulary rather than pulling in a full HTML
 * parsing dependency for a few known tags.
 */

import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

type TextStyle = React.ComponentProps<typeof Text>["style"];

// ── Brand tokens — match app/sermons/[slug]/notes/pdf/route.ts ──────────────
const NAVY  = "#00205B";
const CYAN  = "#00abc9";
const GREY  = "#8494a9";
const RULE  = "#d8dde6";
const WHITE = "#ffffff";

// ── Mini HTML tree ───────────────────────────────────────────────────────────

interface ElNode { type: "el"; tag: string; children: Node[] }
interface TextNode { type: "text"; value: string }
type Node = ElNode | TextNode;

const VOID_TAGS = new Set(["br"]);

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Parses the small, well-formed HTML vocabulary TipTap emits into a tree. */
function parseHtml(html: string): Node[] {
  const root: ElNode = { type: "el", tag: "root", children: [] };
  const stack: ElNode[] = [root];
  const tagRe = /<\/?([a-zA-Z0-9]+)[^>]*>|([^<]+)/g;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html)) !== null) {
    const whole = m[0];
    if (m[2] !== undefined) {
      const text = decodeEntities(m[2]);
      if (text) stack[stack.length - 1].children.push({ type: "text", value: text });
      continue;
    }
    const tag = (m[1] ?? "").toLowerCase();
    const isClose = whole.startsWith("</");
    if (isClose) {
      // Pop back to (and including) the matching open tag, in case of any
      // stray/unmatched tags — keeps this resilient rather than throwing.
      for (let i = stack.length - 1; i >= 1; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
      continue;
    }
    const node: ElNode = { type: "el", tag, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!VOID_TAGS.has(tag) && !whole.endsWith("/>")) stack.push(node);
  }

  return root.children;
}

// ── HTML tree → PDF blocks ───────────────────────────────────────────────────

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  highlight?: boolean;
}

export type NotesBlock =
  | { kind: "paragraph"; runs: Run[] }
  | { kind: "listItem"; runs: Run[]; depth: number; ordered: boolean; index: number };

const MARK_TAGS: Record<string, keyof Run> = {
  strong: "bold",
  b: "bold",
  em: "italic",
  i: "italic",
  u: "underline",
  s: "strike",
  strike: "strike",
  mark: "highlight",
};

/** Walks inline content (text + marks + <br>) into a flat run list. */
function inlineRuns(nodes: Node[], active: Partial<Run> = {}): Run[] {
  const runs: Run[] = [];
  for (const n of nodes) {
    if (n.type === "text") {
      if (n.value) runs.push({ text: n.value, ...active });
      continue;
    }
    if (n.tag === "br") { runs.push({ text: "\n", ...active }); continue; }
    if (n.tag === "p") { runs.push(...inlineRuns(n.children, active)); continue; }
    const markKey = MARK_TAGS[n.tag];
    if (markKey) {
      runs.push(...inlineRuns(n.children, { ...active, [markKey]: true }));
      continue;
    }
    // Unknown inline tag — descend anyway so its text isn't dropped.
    runs.push(...inlineRuns(n.children, active));
  }
  return runs;
}

function isEmptyParagraph(el: ElNode): boolean {
  return el.children.length === 0 || (el.children.length === 1 && el.children[0].type === "text" && !el.children[0].value.trim());
}

/** Walks <li> content: its own paragraph runs, then recurses into any nested <ul>/<ol>. */
function walkListItems(items: Node[], depth: number, ordered: boolean, out: NotesBlock[]) {
  let index = 0;
  for (const li of items) {
    if (li.type !== "el" || li.tag !== "li") continue;
    index += 1;
    const ownParagraphs = li.children.filter((c): c is ElNode => c.type === "el" && c.tag === "p");
    const nestedLists = li.children.filter((c): c is ElNode => c.type === "el" && (c.tag === "ul" || c.tag === "ol"));
    const directText = li.children.filter((c) => c.type === "text" || (c.type === "el" && MARK_TAGS[c.tag]));

    const runs = ownParagraphs.length
      ? ownParagraphs.flatMap((p) => inlineRuns(p.children))
      : inlineRuns(directText);

    out.push({ kind: "listItem", runs, depth, ordered, index });

    for (const nested of nestedLists) {
      walkListItems(nested.children, depth + 1, nested.tag === "ol", out);
    }
  }
}

/** Top-level walk: <p> → paragraph block, <ul>/<ol> → listItem blocks. */
export function htmlToNotesBlocks(html: string): NotesBlock[] {
  const nodes = parseHtml(html);
  const blocks: NotesBlock[] = [];

  for (const n of nodes) {
    if (n.type !== "el") continue;
    if (n.tag === "p") {
      if (isEmptyParagraph(n)) continue;
      blocks.push({ kind: "paragraph", runs: inlineRuns(n.children) });
    } else if (n.tag === "ul" || n.tag === "ol") {
      walkListItems(n.children, 0, n.tag === "ol", blocks);
    }
  }

  return blocks;
}

export function notesBlocksHaveContent(blocks: NotesBlock[]): boolean {
  return blocks.some((b) => b.runs.some((r) => r.text.trim()));
}

// ── PDF rendering ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: WHITE, paddingTop: 40, paddingBottom: 52, paddingHorizontal: 52 },
  header: { borderTopWidth: 5, borderTopColor: NAVY, paddingTop: 18, paddingBottom: 14 },
  headerMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  churchEyebrow: { fontSize: 7, fontFamily: "Helvetica-Bold", color: CYAN, letterSpacing: 1.8, textTransform: "uppercase" },
  metaSep: { fontSize: 7, color: "rgba(0,32,91,0.2)" },
  metaText: { fontSize: 7, color: "rgba(0,32,91,0.4)", letterSpacing: 0.8, textTransform: "uppercase" },
  sermonTitle: { fontSize: 24, fontFamily: "Helvetica-Bold", color: NAVY, lineHeight: 1.1, letterSpacing: -0.3 },
  stripe: { height: 3, backgroundColor: CYAN, marginTop: 14, marginBottom: 22 },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  sectionLabelText: { fontSize: 6, fontFamily: "Helvetica-Bold", color: CYAN, letterSpacing: 1.8, textTransform: "uppercase" },
  sectionLabelLine: { flex: 1, height: 0.75, backgroundColor: "rgba(0,32,91,0.08)" },
  paragraph: { fontSize: 10, color: "#1a2a4a", lineHeight: 1.7, marginBottom: 9 },
  listItem: { flexDirection: "row", gap: 7, marginBottom: 5, alignItems: "flex-start" },
  bulletDot: { fontSize: 10, color: CYAN, width: 12, flexShrink: 0 },
  numberLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: CYAN, width: 16, flexShrink: 0 },
  listText: { fontSize: 10, color: "#1a2a4a", lineHeight: 1.6, flex: 1 },
  empty: { fontSize: 9.5, color: GREY, fontFamily: "Helvetica-Oblique" },
  footer: { marginTop: 28, paddingTop: 10, borderTopWidth: 0.75, borderTopColor: RULE, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerChurch: { fontSize: 8, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 },
  footerAddress: { fontSize: 6.5, color: GREY },
  footerUrl: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: CYAN },
});

const BULLETS = ["•", "◦", "▪"];

function RunsText({ runs, style }: { runs: Run[]; style: TextStyle }) {
  // react-pdf's Text overloads (plain vs. SVG <text>) don't resolve cleanly
  // through React.createElement with a spread child array — cast locally
  // rather than fight the overload picker; the runtime props are correct.
  const TextAny = Text as unknown as (props: Record<string, unknown>) => React.ReactElement;
  return React.createElement(
    TextAny,
    { style },
    ...runs.map((r, i) =>
      React.createElement(
        TextAny,
        {
          key: i,
          style: {
            fontFamily: r.bold ? "Helvetica-Bold" : r.italic ? "Helvetica-Oblique" : "Helvetica",
            textDecoration: [r.underline && "underline", r.strike && "line-through"].filter(Boolean).join(" ") || undefined,
            backgroundColor: r.highlight ? "#fff176" : undefined,
            color: r.bold ? NAVY : undefined,
          },
        },
        r.text,
      ),
    ),
  );
}

export function NotesPDFDocument({
  title, series, passage, speaker, formattedDate, notesHtml,
}: {
  title: string; series: string; passage: string; speaker: string;
  formattedDate: string; notesHtml: string;
}) {
  const metaParts = [series, formattedDate, speaker].filter(Boolean);
  const blocks = htmlToNotesBlocks(notesHtml);
  const hasContent = notesBlocksHaveContent(blocks);

  return React.createElement(
    Document,
    { title: `${title} — My Notes`, author: "Brainerd Baptist Church" },
    React.createElement(
      Page,
      { size: "LETTER", style: s.page },
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          { style: s.headerMetaRow },
          React.createElement(Text, { style: s.churchEyebrow }, "Brainerd Baptist Church"),
          ...metaParts.flatMap((part, i) => [
            React.createElement(Text, { key: `sep-${i}`, style: s.metaSep }, "·"),
            React.createElement(Text, { key: `part-${i}`, style: s.metaText }, part),
          ]),
        ),
        React.createElement(Text, { style: s.sermonTitle }, title),
      ),
      React.createElement(View, { style: s.stripe }),
      passage && React.createElement(Text, { style: { ...s.metaText, marginBottom: 20, fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 9 } }, passage),
      React.createElement(
        View,
        { style: s.sectionLabelRow },
        React.createElement(Text, { style: s.sectionLabelText }, "My Notes"),
        React.createElement(View, { style: s.sectionLabelLine }),
      ),
      hasContent
        ? React.createElement(
            View,
            null,
            ...blocks.map((b, i) => {
              if (b.kind === "paragraph") {
                return React.createElement(RunsText, { key: i, runs: b.runs, style: { ...s.paragraph, marginLeft: 0 } });
              }
              const indent = b.depth * 16;
              return React.createElement(
                View,
                { key: i, style: { ...s.listItem, marginLeft: indent } },
                b.ordered
                  ? React.createElement(Text, { style: s.numberLabel }, `${b.index}.`)
                  : React.createElement(Text, { style: s.bulletDot }, BULLETS[b.depth % BULLETS.length]),
                React.createElement(RunsText, { runs: b.runs, style: s.listText }),
              );
            }),
          )
        : React.createElement(Text, { style: s.empty }, "No notes were typed for this message."),
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.footerChurch }, "Brainerd Baptist Church"),
          React.createElement(Text, { style: s.footerAddress }, "300 Brookfield Ave · Chattanooga, TN · Sundays 8:30 & 11:00 AM"),
        ),
        React.createElement(Text, { style: s.footerUrl }, "brainerdbaptist.org"),
      ),
    ),
  );
}
