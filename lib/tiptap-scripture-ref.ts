/**
 * lib/tiptap-scripture-ref.ts
 *
 * TipTap/ProseMirror extension: recognizes Bible references inside free text
 * (personal sermon notes — SermonNotes.tsx, used on /sermons/[slug], /live,
 * and therefore every past and future sermon alike, since it's one shared
 * editor) and decorates them as clickable, so a reference typed mid-note can
 * be read inline instead of looked up elsewhere.
 *
 * Implemented as view-only Decorations, not real marks: they're recomputed
 * from the document text on every change (see `apply` below), not stored in
 * the saved HTML. That means detection is effectively instant — it runs
 * again on every keystroke that changes the doc, no debounce — and it never
 * touches the HTML that's persisted to localStorage or fed into the
 * PDF/email/print export paths, so there's nothing stale to clean up if the
 * detection logic (lib/scripture-refs.ts) improves later.
 *
 * Clicking a decorated span is handled by the host component via
 * `editorProps.handleClickOn`, matching on the `bbc-scripture-ref` class —
 * see SermonNotes.tsx.
 */

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { findScriptureRefs } from "./scripture-refs";

export const scriptureRefPluginKey = new PluginKey("scriptureRefDecorations");

function computeDecorations(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    for (const match of findScriptureRefs(node.text)) {
      decorations.push(
        Decoration.inline(pos + match.start, pos + match.end, {
          class: "bbc-scripture-ref",
          "data-ref": match.ref,
        }),
      );
    }
  });
  return DecorationSet.create(doc, decorations);
}

export const ScriptureRefHighlight = Extension.create({
  name: "scriptureRefHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: scriptureRefPluginKey,
        state: {
          init(_, { doc }) {
            return computeDecorations(doc);
          },
          apply(tr, old) {
            return tr.docChanged ? computeDecorations(tr.doc) : old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
