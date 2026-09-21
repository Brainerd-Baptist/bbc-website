"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useAudio } from "@/lib/audio-context";

interface Props {
  slug: string;
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
        background: active ? `${accentColor}18` : "transparent",
        color: active ? accentColor : danger ? "rgba(180,40,30,0.4)" : "var(--fg-muted)",
        transition: "background 0.12s, color 0.12s",
        flexShrink: 0, WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        if (!active) el.style.background = danger ? "rgba(180,40,30,0.06)" : "rgba(0,32,91,0.06)";
        if (!active && danger) el.style.color = "rgba(180,40,30,0.75)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        if (!active) el.style.background = "transparent";
        if (!active && danger) el.style.color = "rgba(180,40,30,0.4)";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "rgba(0,32,91,0.09)", flexShrink: 0, margin: "0 3px", alignSelf: "center" }} />;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconBold      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const IconItalic    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const IconUnderline = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const IconStrike    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.3 12H6.7"/><path d="M10 7.3C10 6 11.3 5 13 5s3 1 3 2.3"/><path d="M14 16.7c0 1.3-1.3 2.3-3 2.3s-3-1-3-2.3"/></svg>;
const IconHighlight = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="13" height="6" rx="1"/><path d="M16 15l4-4-2-2-4 4"/><line x1="3" y1="19" x2="16" y2="19" strokeWidth="3" stroke="#f9e000" strokeLinecap="round"/></svg>;
const IconBullets   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>;
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
  fontSize: "0.8rem", fontWeight: 500, color: "rgba(0,32,91,0.7)",
  textAlign: "left", borderRadius: "0.5rem", transition: "background 0.1s",
  WebkitTapHighlightColor: "transparent", fontFamily: "system-ui, sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SermonNotes({
  slug, youtubeId, accentColor, sermonTitle,
  speaker = "", series = "", date = "", passage = "",
}: Props) {
  const storageKey = `bbc-notes-${slug}`;
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

  const saveTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContent = useRef<string>("");
  const shareRef       = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) initialContent.current = saved;
    } catch { /* private mode */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        orderedList: false, blockquote: false, codeBlock: false, code: false,
        horizontalRule: false, heading: false,
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
    ],
    content: initialContent.current || "<p></p>",
    editorProps: { attributes: { class: "bbc-notes-editor", spellcheck: "true" } },
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

  const handleShareBtn = useCallback(() => {
    if (!editor || !editor.getText().trim()) return;
    setShareOpen((o) => !o);
  }, [editor]);

  const hasContent = wordCount > 0;
  if (!editor) return null;

  return (
    <>
      <style>{`
        .bbc-notes-editor {
          outline: none; min-height: 130px;
          font-size: 0.9rem; line-height: 1.8; color: #0a1628;
          font-family: var(--font-inter), system-ui, sans-serif;
          caret-color: ${accentColor}; word-break: break-word;
        }
        .bbc-notes-editor p { margin: 0 0 0.2rem 0; }
        .bbc-notes-editor p:last-child { margin-bottom: 0; }
        .bbc-bullets { padding-left: 1.35rem; margin: 0.2rem 0; list-style-type: disc; }
        .bbc-bullets li { margin: 0.1rem 0; color: #0a1628; }
        .bbc-bullets li p { margin: 0; display: inline; }
        .bbc-bullets .bbc-bullets { list-style-type: circle; margin-top: 0.1rem; }
        .bbc-bullets .bbc-bullets .bbc-bullets { list-style-type: square; }
        .bbc-notes-editor strong { font-weight: 700; color: #00205B; }
        .bbc-notes-editor em { font-style: italic; color: rgba(0,32,91,0.75); }
        .bbc-notes-editor u { text-decoration-color: ${accentColor}; text-underline-offset: 2px; }
        .bbc-notes-editor s { text-decoration-color: rgba(0,32,91,0.3); color: rgba(0,32,91,0.45); }
        .bbc-notes-editor mark { background-color: #fff176; color: #0a1628; border-radius: 2px; padding: 0 2px; }
        .bbc-notes-editor ::selection { background: ${accentColor}25; }

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
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: accentColor, display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                    color: shareLabel === "Copied!" ? accentColor : "var(--fg-muted)",
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
                    background: "var(--surface-raised)", border: "1px solid rgba(0,32,91,0.1)",
                    borderRadius: "0.75rem", boxShadow: "0 8px 24px rgba(0,32,91,0.12)",
                    minWidth: 190, zIndex: 50, overflow: "hidden", padding: "6px",
                  }}>
                    {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                      <button onClick={shareNative} style={popItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,32,91,0.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                        Share via…
                      </button>
                    )}
                    <button onClick={openPrintView} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,32,91,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                      </svg>
                      Save / Print
                    </button>
                    <button onClick={copyText} style={popItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,32,91,0.05)")}
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
          padding: "3px 5px", background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(0,32,91,0.09)", borderRadius: "0.625rem",
          flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none",
        }}>
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      title="Bold"          accentColor={accentColor}><IconBold /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    title="Italic"        accentColor={accentColor}><IconItalic /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"     accentColor={accentColor}><IconUnderline /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive("strike")}    title="Strikethrough" accentColor={accentColor}><IconStrike /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"     accentColor={accentColor}><IconHighlight /></ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}           active={editor.isActive("bulletList")} title="Bullet list" accentColor={accentColor}><IconBullets /></ToolBtn>
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
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: accentColor, marginLeft: 1, flexShrink: 0, lineHeight: 1 }}>
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
            background: "rgba(255,255,255,0.65)",
            border: `1.5px solid ${editorFocused ? `${accentColor}50` : "rgba(0,32,91,0.09)"}`,
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
                <kbd style={{ fontFamily: "system-ui, sans-serif", background: "var(--hover-subtle)", border: "1px solid rgba(0,32,91,0.1)", borderRadius: "3px", padding: "1px 4px", fontSize: "0.6rem" }}>{keys}</kbd>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
