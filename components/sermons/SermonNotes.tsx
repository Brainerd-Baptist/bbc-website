"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useAudio } from "@/lib/audio-context";
import { deriveInk, inkVarsFor } from "@/lib/identity-colors";
import { ScriptureRefHighlight } from "@/lib/tiptap-scripture-ref";
import ScripturePopup from "./ScripturePopup";

interface Props {
  /** Identifies the sermon for the notes storage key — a /sermons/[slug]
   * slug once one exists. */
  slug: string;
  /** Overrides the storage key entirely (e.g. a date-based draft key for
   * /live, before a sermon has a /sermons/[slug] page). Falls back to
   * `bbc-notes-${slug}` when omitted, so every surface converges on the
   * same notes once a slug exists. */
  noteKey?: string;
  youtubeId?: string;
  accentColor: string;
  sermonTitle: string;
  speaker?: string;
  series?: string;
  date?: string;
  passage?: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDateLong(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  } catch { return iso; }
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function escStr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The retired /sermons/[slug]/notes page (NotesEditor.tsx) used to save to
 * this exact same localStorage key, but as a JSON blob
 * ({ pointNotes: string[], additionalNotes: string }) instead of this
 * editor's HTML string — the two were silently clobbering each other.
 * Anyone who saved notes there before the pages were unified would otherwise
 * see raw JSON text dumped into this editor on first load; recover it into
 * real paragraphs instead.
 */
function migrateLegacyNotes(saved: string): string {
  const trimmed = saved.trim();
  if (!trimmed.startsWith("{")) return saved;
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed?.pointNotes) && typeof parsed?.additionalNotes !== "string") return saved;
    const paras: string[] = [
      ...(Array.isArray(parsed.pointNotes) ? parsed.pointNotes : []),
      ...(typeof parsed.additionalNotes === "string" ? [parsed.additionalNotes] : []),
    ]
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);
    return paras.length ? paras.map((p) => `<p>${escStr(p)}</p>`).join("") : "<p></p>";
  } catch {
    return saved;
  }
}

// ── Print-page HTML generator ─────────────────────────────────────────────────
function buildPrintHTML({
  title, speaker, series, date, passage, accentColor, notesHtml,
}: {
  title: string; speaker: string; series: string; date: string;
  passage: string; accentColor: string; notesHtml: string;
}) {
  const dateStr   = formatDateLong(date);
  const metaParts = [dateStr, speaker, passage].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escStr(title)} — My Notes</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    background: #fff;
    color: #0a1628;
    max-width: 680px;
    margin: 48px auto;
    padding: 0 24px 64px;
  }
  .wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }
  .wordmark-text {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #00205B;
    line-height: 1;
  }
  .wordmark-text span {
    display: block;
    font-weight: 400;
    font-size: 8px;
    letter-spacing: 0.12em;
    color: rgba(0,32,91,0.4);
    margin-top: 3px;
  }
  .header {
    border-top: 3px solid #00205B;
    padding-top: 20px;
    margin-bottom: 32px;
  }
  .series-label {
    font-family: system-ui, sans-serif;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${accentColor};
    margin-bottom: 10px;
  }
  .sermon-title {
    font-family: system-ui, sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: #00205B;
    line-height: 1.08;
    letter-spacing: -0.02em;
    margin-bottom: 14px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 0;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    color: rgba(0,32,91,0.45);
  }
  .meta-sep { margin: 0 8px; color: rgba(0,32,91,0.2); }
  .notes-label {
    font-family: system-ui, sans-serif;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${accentColor};
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .notes-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0,32,91,0.08);
  }
  .notes-body {
    font-size: 15px;
    line-height: 1.85;
    color: #0a1628;
  }
  .notes-body p { margin: 0 0 6px 0; }
  .notes-body p:last-child { margin-bottom: 0; }
  .notes-body strong { font-weight: 700; color: #00205B; }
  .notes-body em { font-style: italic; color: rgba(0,32,91,0.75); }
  .notes-body u { text-decoration-color: ${accentColor}; text-underline-offset: 2px; }
  .notes-body s { color: rgba(0,32,91,0.4); }
  .notes-body mark { background: #fff176; padding: 0 2px; border-radius: 2px; color: #0a1628; }
  .notes-body ul { padding-left: 1.4rem; list-style-type: disc; margin: 4px 0; }
  .notes-body ul li { margin: 3px 0; }
  .notes-body ul ul { list-style-type: circle; }
  .notes-body ul ul ul { list-style-type: square; }
  .notes-body ol { padding-left: 1.4rem; list-style-type: decimal; margin: 4px 0; }
  .notes-body ol li { margin: 3px 0; }
  .notes-body ol ol { list-style-type: lower-alpha; }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid rgba(0,32,91,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: system-ui, sans-serif;
    font-size: 10px;
    color: rgba(0,32,91,0.28);
  }
  @media print {
    body { margin: 0; }
    @page { margin: 1.8cm 2.2cm; size: letter; }
  }
</style>
</head>
<body>
  <div class="wordmark">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="1" width="4" height="20" rx="1" fill="#00205B"/>
      <rect x="1" y="7" width="20" height="4" rx="1" fill="#00205B"/>
    </svg>
    <div class="wordmark-text">
      Brainerd Baptist Church
      <span>Chattanooga, Tennessee</span>
    </div>
  </div>
  <div class="header">
    ${series ? `<div class="series-label">${escStr(series)}</div>` : ""}
    <div class="sermon-title">${escStr(title)}</div>
    <div class="meta">
      ${metaParts.map((p, i) => `${i > 0 ? '<span class="meta-sep">·</span>' : ''}<span>${escStr(p)}</span>`).join("")}
    </div>
  </div>
  <div class="notes-label">My Notes</div>
  <div class="notes-body">${notesHtml}</div>
  <div class="footer">
    <span>brainerdbaptist.org</span>
    <span>Personal study notes</span>
  </div>
</body>
</html>`;
}

// ── Toolbar button ─────────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active, title, children, accentColor, danger = false,
}: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; accentColor: string; danger?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title} aria-label={title}
      className="bbc-toolbtn"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, borderRadius: 7, border: "none", cursor: "pointer",
        /* Pressed state uses the `solid` fill under white ink. The hue on a 9%
           tint of itself is the same failing pairing as the player speed pill
           (2.31:1), and an icon still owes 3:1 under SC 1.4.11. */
        background: active ? deriveInk(accentColor).solid : "transparent",
        color: active
          ? "var(--fg-on-accent)"
          : danger
            ? "var(--danger-text)"
            : "var(--fg-muted)",
        transition: "background 0.12s, color 0.12s",
        flexShrink: 0, WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        if (!active) el.style.background = danger ? "var(--danger-bg)" : "var(--hover-subtle)";
        if (!active && danger) el.style.color = "var(--danger-text)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        if (!active) el.style.background = "transparent";
        if (!active && danger) el.style.color = "var(--danger-text)";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0, margin: "0 3px", alignSelf: "center" }} />;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconBold      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const IconItalic    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IconUnderline = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const IconStrike    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.3 12H6.7"/><path d="M10 7.3C10 6 11.3 5 13 5s3 1 3 2.3"/><path d="M14 16.7c0 1.3-1.3 2.3-3 2.3s-3-1-3-2.3"/></svg>;
const IconHighlight = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="13" height="6" rx="1"/><path d="M16 15l4-4-2-2-4 4"/><line x1="3" y1="19" x2="16" y2="19" strokeWidth="3" style={{ stroke: "var(--highlight-bg)" }} strokeLinecap="round"/></svg>;
const IconBullets   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>;
const IconNumbers   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M4 14h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4" strokeLinejoin="round"/></svg>;
const IconDownload  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>;
const IconMail      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
const IconIndent    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="16" x2="21" y2="16"/><polyline points="3 12 6 15 3 18"/></svg>;
const IconOutdent   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="8" x2="21" y2="8"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="16" x2="21" y2="16"/><polyline points="7 12 4 15 7 18"/></svg>;
const IconUndo      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
const IconRedo      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>;
const IconClock     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const IconTrash     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

const popItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.625rem",
  width: "100%", padding: "0.5rem 0.75rem",
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: "0.8rem", fontWeight: 500, color: "var(--fg)",
  textAlign: "left", borderRadius: "0.5rem", transition: "background 0.1s",
  WebkitTapHighlightColor: "transparent", fontFamily: "system-ui, sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SermonNotes({
  slug, noteKey, youtubeId, accentColor, sermonTitle,
  speaker = "", series = "", date = "", passage = "",
}: Props) {
  const storageKey = noteKey ?? `bbc-notes-${slug}`;
  const videoKey   = youtubeId ? `bbc-sermon-pos-${youtubeId}` : null;
  const audioKey   = `bbc-ap-${slug}`;

  const { track: activeTrack, currentTime: audioTime } = useAudio();
  const isAudioActive = activeTrack?.slug === slug;

  const [saveStatus,    setSaveStatus]    = useState<"saved" | "saving" | "idle">("idle");
  const [wordCount,     setWordCount]     = useState(0);
  const [editorFocused, setEditorFocused] = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [shareOpen,     setShareOpen]     = useState(false);
  const [shareLabel,    setShareLabel]    = useState<string | null>(null);
  const [downloading,   setDownloading]   = useState(false);
  const [emailPrompt,   setEmailPrompt]   = useState(false);
  const [emailValue,    setEmailValue]    = useState("");
  const [emailStatus,   setEmailStatus]   = useState<"idle" | "sending" | "sent" | "error">("idle");
  // A Scripture reference the user typed into their own notes (e.g. "John
  // 3:16"), clicked to read inline. Detection runs live as they type — see
  // lib/tiptap-scripture-ref.ts — so this is the one shared notes editor
  // used on /sermons/[slug] (past and future sermons alike, same component)
  // and on /live, meaning it applies everywhere notes are taken.
  const [openRef,       setOpenRef]       = useState<string | null>(null);

  const saveTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareRef       = useRef<HTMLDivElement>(null);

  // Loaded via a lazy useState initializer (runs synchronously during the
  // very first render), NOT a useEffect writing to a ref. Found 2026-10-03
  // while verifying the live-notes fix: useEditor({ content }) below only
  // ever reads this value at the moment the editor is first created — a
  // ref populated by a *later* effect never reaches it, so a page refresh
  // visually showed an empty editor every time even though the saved HTML
  // was sitting right there in localStorage the whole time (confirmed on
  // both /live and the real /sermons/[slug] page — pre-existing, not
  // specific to the live-notes key fix). A lazy initializer runs before
  // useEditor reads it, so the editor is created with the right content
  // the first time, no race. Safe during SSR too: localStorage doesn't
  // exist in Node, so this throws there and the catch below returns ""
  // either way — same as the old behavior, no hydration mismatch.
  const [initialContent] = useState<string>(() => {
    try {
      // Live-draft migration: this is the real, slug-keyed usage (noteKey
      // wasn't passed to override storageKey) for a sermon whose date we
      // know. If nothing's saved here yet, but a live-window draft exists
      // from when this sermon was still streaming and not yet synced
      // (components/live/LivePlayer.tsx's LiveNotesTab always saves under
      // `live-draft-${that Sunday's date}`, never this page's slug key —
      // see that file's comment on why), adopt it here once and clear the
      // draft, so notes taken live land on the sermon's real page instead
      // of staying stranded under the old date-only key forever.
      if (!noteKey && date && !localStorage.getItem(storageKey)) {
        const draftKey = `live-draft-${date}`;
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          localStorage.setItem(storageKey, draft);
          localStorage.removeItem(draftKey);
        }
      }

      const saved = localStorage.getItem(storageKey);
      return saved ? migrateLegacyNotes(saved) : "";
    } catch {
      return ""; // private mode, or no localStorage (SSR)
    }
  });

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [shareOpen]);

  const saveContent = useCallback((html: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      try {
        const isEmpty = !html || html === "<p></p>";
        isEmpty ? localStorage.removeItem(storageKey) : localStorage.setItem(storageKey, html);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch { /* no-op */ }
    }, 400);
  }, [storageKey]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false, HTMLAttributes: { class: "bbc-bullets" } },
        orderedList: { keepMarks: true, keepAttributes: false, HTMLAttributes: { class: "bbc-numbers" } },
        blockquote: false, codeBlock: false, code: false,
        horizontalRule: false, heading: false,
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      ScriptureRefHighlight,
    ],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: { class: "bbc-notes-editor", spellcheck: "true" },
      handleClickOn(_view, _pos, _node, _nodePos, event) {
        const ref = (event.target as HTMLElement)?.closest?.("[data-ref]")?.getAttribute("data-ref");
        if (ref) { setOpenRef(ref); return true; }
        return false;
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setWordCount(countWords(html));
      saveContent(html);
    },
    onCreate({ editor }) { setWordCount(countWords(editor.getHTML())); },
    onFocus() { setEditorFocused(true); },
    onBlur()  { setEditorFocused(false); },
  });

  const getCurrentPosition = useCallback((): number | null => {
    if (isAudioActive && audioTime > 5) return audioTime;
    try {
      if (videoKey) { const r = localStorage.getItem(videoKey); if (r) return parseFloat(r); }
      const r = localStorage.getItem(audioKey); if (r) return parseFloat(r);
    } catch { /* no-op */ }
    return null;
  }, [isAudioActive, audioTime, videoKey, audioKey]);

  const insertTimestamp = useCallback(() => {
    if (!editor) return;
    const pos = getCurrentPosition();
    editor.chain().focus().insertContent(`<strong>[${pos !== null ? formatTime(pos) : "--:--"}] </strong>`).run();
  }, [editor, getCurrentPosition]);

  const clearNotes = useCallback(() => {
    if (!editor || !editor.getText().trim()) return;
    if (!confirm("Clear all notes for this sermon?")) return;
    editor.commands.clearContent(true);
    try { localStorage.removeItem(storageKey); } catch { /* no-op */ }
    setSaveStatus("idle");
    setWordCount(0);
  }, [editor, storageKey]);

  const getPlainText = useCallback((): string => {
    if (!editor) return "";
    const dateStr   = formatDateLong(date);
    const metaParts = [series, dateStr, speaker, passage].filter(Boolean).join("  ·  ");
    const divider   = "─".repeat(40);
    const notes     = editor.getText({ blockSeparator: "\n" }).trim();
    return ["BRAINERD BAPTIST CHURCH", divider, sermonTitle, metaParts, divider, "", notes, "", divider, "brainerdbaptist.org"].join("\n");
  }, [editor, sermonTitle, speaker, series, date, passage]);

  const openPrintView = useCallback(() => {
    if (!editor) return;
    const html = buildPrintHTML({
      title: sermonTitle, speaker, series, date, passage,
      accentColor, notesHtml: editor.getHTML(),
    });
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (win) win.addEventListener("load", () => URL.revokeObjectURL(url));
    setShareOpen(false);
  }, [editor, sermonTitle, speaker, series, date, passage, accentColor]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(getPlainText())
      .then(() => { setShareLabel("Copied!"); setTimeout(() => setShareLabel(null), 2000); })
      .catch(() => {});
    setShareOpen(false);
  }, [getPlainText]);

  const shareNative = useCallback(async () => {
    try { await navigator.share({ title: sermonTitle, text: getPlainText() }); setShareOpen(false); }
    catch { /* dismissed */ }
  }, [getPlainText, sermonTitle]);

  const downloadPDF = useCallback(async () => {
    if (!editor) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/notes/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sermonTitle, series, passage, speaker, formattedDate: formatDateLong(date), notesHtml: editor.getHTML() }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = sermonTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60) || "sermon";
      a.download = `${safeTitle}-my-notes.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setShareOpen(false);
    } catch {
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [editor, sermonTitle, series, passage, speaker, date]);

  const sendEmail = useCallback(async () => {
    if (!editor || !emailValue.trim()) return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/notes/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailValue.trim(), title: sermonTitle, series, passage, speaker,
          formattedDate: formatDateLong(date), notesHtml: editor.getHTML(),
        }),
      });
      setEmailStatus(res.ok ? "sent" : "error");
      if (res.ok) setTimeout(() => { setEmailPrompt(false); setEmailStatus("idle"); setShareOpen(false); }, 1600);
    } catch {
      setEmailStatus("error");
    }
  }, [editor, emailValue, sermonTitle, series, passage, speaker, date]);

  const handleShareBtn = useCallback(() => {
    if (!editor || !editor.getText().trim()) return;
    setShareOpen((o) => !o);
  }, [editor]);

  const hasContent = wordCount > 0;
  if (!editor) return null;

  return (
    <>
      <style>{`
        /* contenteditable: the resting outline is suppressed below (a permanent focus
           box around a note field reads as broken), so it has to come back
           explicitly on keyboard focus. */
        .bbc-notes-editor:focus-visible {
          outline: 2px solid var(--focus-ring);
          outline-offset: 3px;
          border-radius: 4px;
        }
        .bbc-notes-editor {
          outline: none; min-height: 130px;
          font-size: 0.9rem; line-height: 1.8; color: var(--fg);
          font-family: var(--font-inter), system-ui, sans-serif;
          caret-color: ${accentColor}; word-break: break-word;
        }
        .bbc-notes-editor p { margin: 0 0 0.2rem 0; }
        .bbc-notes-editor p:last-child { margin-bottom: 0; }
        .bbc-bullets { padding-left: 1.35rem; margin: 0.2rem 0; list-style-type: disc; }
        .bbc-bullets li { margin: 0.1rem 0; color: var(--fg); }
        .bbc-bullets li p { margin: 0; display: inline; }
        .bbc-bullets .bbc-bullets { list-style-type: circle; margin-top: 0.1rem; }
        .bbc-bullets .bbc-bullets .bbc-bullets { list-style-type: square; }
        .bbc-numbers { padding-left: 1.35rem; margin: 0.2rem 0; list-style-type: decimal; }
        .bbc-numbers li { margin: 0.1rem 0; color: var(--fg); }
        .bbc-numbers li p { margin: 0; display: inline; }
        .bbc-numbers .bbc-numbers { list-style-type: lower-alpha; margin-top: 0.1rem; }
        .bbc-notes-editor strong { font-weight: 700; color: var(--fg); }
        .bbc-notes-editor em { font-style: italic; color: var(--fg-muted); }
        .bbc-notes-editor u { text-decoration-color: ${accentColor}; text-underline-offset: 2px; }
        .bbc-notes-editor s { text-decoration-color: var(--border-strong); color: var(--fg-muted); }
        .bbc-notes-editor mark { background-color: var(--highlight-bg); color: var(--highlight-fg); border-radius: 2px; padding: 0 2px; }
        .bbc-notes-editor ::selection { background: ${accentColor}25; }
        /* Auto-detected Scripture reference ("John 3:16") typed into notes —
           recomputed live as you type (lib/tiptap-scripture-ref.ts), never
           part of the saved HTML. Click opens the passage inline. */
        .bbc-notes-editor .bbc-scripture-ref {
          color: ${accentColor}; text-decoration: underline; text-decoration-style: dotted;
          text-underline-offset: 2px; cursor: pointer; border-radius: 2px;
        }
        .bbc-notes-editor .bbc-scripture-ref:hover { background: ${accentColor}15; }

        /* Mobile: bigger tap targets, sticky toolbar so it never scrolls
           out of reach while typing, and a scroll-fade hint since the
           toolbar can overflow horizontally on narrow phones. */
        .bbc-notes-toolbar {
          position: sticky;
          top: 0;
          z-index: 5;
          -webkit-mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
          mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
        }
        @media (max-width: 640px) {
          .bbc-toolbtn { width: 40px !important; height: 40px !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
              Your Notes
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {wordCount > 0 && (
              <span style={{ fontSize: "0.65rem", color: "var(--fg-subtle)", fontWeight: 500 }}>
                {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="identity-ink" style={{ ...inkVarsFor(accentColor), fontSize: "0.65rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Saved
              </span>
            )}

            {/* Share button + popover */}
            {hasContent && (
              <div ref={shareRef} style={{ position: "relative" }}>
                <button
                  onClick={handleShareBtn}
                  title="Share notes"
                  style={{
                    background: shareOpen ? `${accentColor}12` : "none",
                    border: "none", cursor: "pointer", padding: "0.2rem 0.5rem",
                    /* Derived tone, not the raw hue: brand cyan on this toolbar
                       measures 2.73:1 in light mode, and a confirmation nobody
                       can read is worse than none. */
                    ...(shareLabel === "Copied!" ? inkVarsFor(accentColor) : {}),
                    color:
                      shareLabel === "Copied!" ? "var(--identity-light)" : "var(--fg-muted)",
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    fontSize: "0.65rem", fontWeight: 600, transition: "color 0.15s",
                    WebkitTapHighlightColor: "transparent", borderRadius: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span>{shareLabel ?? "Share"}</span>
                </button>

                {shareOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 6px)",
                    background: "var(--surface-raised)", border: "1px solid var(--border)",
                    borderRadius: "0.75rem", boxShadow: "var(--shadow-lg)",
                    minWidth: 220, zIndex: 50, overflow: "hidden", padding: "6px",
                  }}>
                    {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                      <button onClick={shareNative} style={popItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                        Share via…
                      </button>
                    )}
                    <button onClick={downloadPDF} disabled={downloading} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <IconDownload />
                      {downloading ? "Generating…" : "Download PDF"}
                    </button>
                    <button onClick={() => setEmailPrompt((o) => !o)} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <IconMail />
                      Email as PDF
                    </button>
                    {emailPrompt && (
                      <div style={{ padding: "0.5rem 0.75rem 0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <input
                            type="email"
                            inputMode="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") sendEmail(); }}
                            placeholder="you@example.com"
                            style={{
                              flex: 1, fontSize: "0.78rem", padding: "0.4rem 0.6rem",
                              borderRadius: "0.5rem", border: "1px solid var(--border)",
                              background: "var(--surface)", color: "var(--fg)",
                            }}
                          />
                          <button
                            onClick={sendEmail}
                            disabled={emailStatus === "sending" || !emailValue.trim()}
                            style={{
                              fontSize: "0.72rem", fontWeight: 600, padding: "0 0.75rem",
                              borderRadius: "0.5rem", border: "none", cursor: "pointer",
                              background: "var(--accent-solid)", color: "var(--fg-on-accent)",
                              opacity: emailStatus === "sending" || !emailValue.trim() ? 0.55 : 1,
                            }}
                          >
                            {emailStatus === "sent" ? "Sent!" : emailStatus === "sending" ? "…" : "Send"}
                          </button>
                        </div>
                        {emailStatus === "error" && (
                          <p style={{ fontSize: "0.68rem", color: "var(--danger-text)", marginTop: "0.375rem" }}>
                            Couldn&apos;t send that. Try again?
                          </p>
                        )}
                      </div>
                    )}
                    <Divider />
                    <button onClick={openPrintView} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Print
                    </button>
                    <button onClick={copyText} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      Copy text
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────── */}
        <div className="bbc-notes-toolbar" style={{
          display: "flex", alignItems: "center", gap: "1px",
          padding: "3px 5px", background: "var(--surface-overlay)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          border: "1px solid var(--border)", borderRadius: "0.625rem",
          flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none",
        }}>
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      title="Bold"          accentColor={accentColor}><IconBold /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    title="Italic"        accentColor={accentColor}><IconItalic /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"     accentColor={accentColor}><IconUnderline /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive("strike")}    title="Strikethrough" accentColor={accentColor}><IconStrike /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"     accentColor={accentColor}><IconHighlight /></ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}           active={editor.isActive("bulletList")}  title="Bullet list"   accentColor={accentColor}><IconBullets /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}          active={editor.isActive("orderedList")} title="Numbered list" accentColor={accentColor}><IconNumbers /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().sinkListItem("listItem").run()}     active={false}                        title="Indent"      accentColor={accentColor}><IconIndent /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().liftListItem("listItem").run()}     active={false}                        title="Outdent"     accentColor={accentColor}><IconOutdent /></ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo" accentColor={accentColor}><IconUndo /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo" accentColor={accentColor}><IconRedo /></ToolBtn>
          <Divider />
          <ToolBtn onClick={insertTimestamp} active={false}
            title={isAudioActive && audioTime > 5 ? `Insert timestamp (${formatTime(audioTime)})` : "Insert timestamp"}
            accentColor={accentColor}><IconClock /></ToolBtn>
          {isAudioActive && audioTime > 5 && (
            <span className="identity-ink" style={{ ...inkVarsFor(accentColor), fontSize: "0.65rem", fontWeight: 700, marginLeft: 1, flexShrink: 0, lineHeight: 1 }}>
              {formatTime(audioTime)}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 4 }} />
          {hasContent && (
            <ToolBtn onClick={clearNotes} active={false} title="Clear all notes" accentColor={accentColor} danger><IconTrash /></ToolBtn>
          )}
        </div>

        {/* ── Editor ────────────────────────────────────────────────── */}
        <div
          onClick={() => editor.commands.focus()}
          style={{
            background: "var(--surface-raised)",
            border: `1.5px solid ${editorFocused ? `${accentColor}50` : "var(--border)"}`,
            borderRadius: "0.875rem", padding: "1rem 1.125rem",
            cursor: "text", minHeight: "140px",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: editorFocused ? `0 0 0 3px ${accentColor}10` : "none",
            position: "relative",
          }}
        >
          <EditorContent editor={editor} />
          {!hasContent && (
            <div style={{
              position: "absolute", top: "1rem", left: "1.125rem",
              pointerEvents: "none", fontSize: "0.9rem", lineHeight: 1.8,
              color: "var(--fg-subtle)", fontStyle: "italic", userSelect: "none",
            }}>
              Take notes as you listen…
            </div>
          )}
        </div>

        {/* ── Keyboard hints — desktop only ─────────────────────────── */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
            {[{ keys: "⌘B", label: "Bold" }, { keys: "⌘I", label: "Italic" }, { keys: "⌘U", label: "Underline" }, { keys: "Tab", label: "Indent" }, { keys: "⌘Z", label: "Undo" }].map(({ keys, label }) => (
              <span key={keys} style={{ fontSize: "0.6rem", color: "var(--fg-subtle)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <kbd style={{ fontFamily: "system-ui, sans-serif", color: "var(--fg)", background: "var(--hover-subtle)", border: "1px solid var(--border)", borderRadius: "3px", padding: "1px 4px", fontSize: "0.6rem" }}>{keys}</kbd>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {openRef && (
        <ScripturePopup reference={openRef} accentColor={accentColor} onClose={() => setOpenRef(null)} />
      )}
    </>
  );
}
