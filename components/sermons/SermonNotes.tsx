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
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({
  onClick,
  active,
  title,
  children,
  accentColor,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        background: active ? `${accentColor}18` : "transparent",
        color: active ? accentColor : "rgba(0,32,91,0.45)",
        transition: "background 0.12s, color 0.12s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,32,91,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

// ── Divider between toolbar groups ───────────────────────────────────────────
function Divider() {
  return <div style={{ width: 1, height: 18, background: "rgba(0,32,91,0.1)", flexShrink: 0, margin: "0 2px" }} />;
}

export default function SermonNotes({ slug, youtubeId, accentColor, sermonTitle }: Props) {
  const storageKey = `bbc-notes-${slug}`;
  const videoKey   = youtubeId ? `bbc-sermon-pos-${youtubeId}` : null;
  const audioKey   = `bbc-ap-${slug}`;

  const { track: activeTrack, currentTime: audioTime } = useAudio();
  const isAudioActive = activeTrack?.slug === slug;

  const [saveStatus,   setSaveStatus]   = useState<"saved" | "saving" | "idle">("idle");
  const [wordCount,    setWordCount]    = useState(0);
  const [copied,       setCopied]       = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContent = useRef<string>("");

  // Load initial content from localStorage before editor mounts
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
        if (isEmpty) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, html);
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch { /* no-op */ }
    }, 400);
  }, [storageKey]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: { class: "bbc-notes-bullets" },
        },
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: false,
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
    ],
    content: initialContent.current || "<p></p>",
    editorProps: {
      attributes: {
        class: "bbc-notes-editor",
        spellcheck: "true",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      setWordCount(countWords(html));
      saveContent(html);
    },
    onCreate({ editor }) {
      const html = editor.getHTML();
      setWordCount(countWords(html));
    },
    onFocus() { setEditorFocused(true); },
    onBlur()  { setEditorFocused(false); },
  });

  const getCurrentPosition = useCallback((): number | null => {
    if (isAudioActive && audioTime > 5) return audioTime;
    try {
      if (videoKey) {
        const raw = localStorage.getItem(videoKey);
        if (raw) return parseFloat(raw);
      }
      const raw = localStorage.getItem(audioKey);
      if (raw) return parseFloat(raw);
    } catch { /* no-op */ }
    return null;
  }, [isAudioActive, audioTime, videoKey, audioKey]);

  const insertTimestamp = useCallback(() => {
    if (!editor) return;
    const pos = getCurrentPosition();
    const ts  = pos !== null ? `[${formatTime(pos)}]` : "[--:--]";
    // Insert as bold text then space so user can type after
    editor
      .chain()
      .focus()
      .insertContent(`<strong>${ts} </strong>`)
      .run();
  }, [editor, getCurrentPosition]);

  const copyNotes = useCallback(() => {
    if (!editor) return;
    const text = editor.getText({ blockSeparator: "\n" }).trim();
    if (!text) return;
    const header = `Notes — ${sermonTitle}\n${"─".repeat(40)}\n\n`;
    navigator.clipboard.writeText(header + text)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
      .catch(() => {});
  }, [editor, sermonTitle]);

  const clearNotes = useCallback(() => {
    if (!editor) return;
    if (!editor.getText().trim()) return;
    if (!confirm("Clear all notes for this sermon?")) return;
    editor.commands.clearContent(true);
    try { localStorage.removeItem(storageKey); } catch { /* no-op */ }
    setSaveStatus("idle");
    setWordCount(0);
  }, [editor, storageKey]);

  const hasContent = wordCount > 0;

  if (!editor) return null;

  return (
    <>
      {/* ── Scoped styles ────────────────────────────────────────── */}
      <style>{`
        .bbc-notes-editor {
          outline: none;
          min-height: 130px;
          font-size: 0.9rem;
          line-height: 1.75;
          color: #0a1628;
          font-family: var(--font-inter), system-ui, sans-serif;
          caret-color: ${accentColor};
          word-break: break-word;
        }
        .bbc-notes-editor p {
          margin: 0 0 0.25rem 0;
        }
        .bbc-notes-editor p:last-child {
          margin-bottom: 0;
        }
        .bbc-notes-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(0,32,91,0.25);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .bbc-notes-bullets {
          padding-left: 1.25rem;
          margin: 0.25rem 0;
          list-style-type: disc;
        }
        .bbc-notes-bullets li {
          margin: 0.1rem 0;
          color: #0a1628;
        }
        .bbc-notes-bullets li p {
          margin: 0;
          display: inline;
        }
        .bbc-notes-bullets .bbc-notes-bullets {
          list-style-type: circle;
          margin-top: 0.1rem;
        }
        .bbc-notes-bullets .bbc-notes-bullets .bbc-notes-bullets {
          list-style-type: square;
        }
        .bbc-notes-editor strong {
          font-weight: 700;
          color: #00205B;
        }
        .bbc-notes-editor u {
          text-decoration-color: ${accentColor};
          text-underline-offset: 2px;
        }
        .bbc-notes-editor mark {
          background-color: #fff176;
          color: #0a1628;
          border-radius: 2px;
          padding: 0 1px;
        }
        .bbc-notes-editor ::selection {
          background: ${accentColor}28;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(0,32,91,0.35)",
            }}>
              Your Notes
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {wordCount > 0 && (
              <span style={{ fontSize: "0.65rem", color: "rgba(0,32,91,0.3)", fontWeight: 500 }}>
                {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
              </span>
            )}
            {saveStatus === "saved" && (
              <span style={{
                fontSize: "0.65rem", fontWeight: 600, color: accentColor,
                display: "flex", alignItems: "center", gap: "0.25rem",
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Saved
              </span>
            )}
            {hasContent && (
              <button
                onMouseDown={(e) => { e.preventDefault(); copyNotes(); }}
                title={copied ? "Copied!" : "Copy notes as plain text"}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0.2rem 0",
                  color: copied ? accentColor : "rgba(0,32,91,0.3)",
                  display: "flex", alignItems: "center", gap: "0.3rem",
                  fontSize: "0.65rem", fontWeight: 600, transition: "color 0.15s",
                }}
              >
                {copied
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                }
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>

        {/* ── Formatting toolbar ─────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "4px 6px",
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(0,32,91,0.09)",
          borderRadius: "0.625rem",
          flexWrap: "wrap",
        }}>
          {/* Bold */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (⌘B)"
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </ToolBtn>

          {/* Underline */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline (⌘U)"
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </ToolBtn>

          {/* Highlight */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive("highlight")}
            title="Highlight"
            accentColor={accentColor}
          >
            {/* Highlighter icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11L4 20h16l-5-9z"/>
              <path d="M12 2L8 8h8l-4-6z"/>
              <line x1="12" y1="8" x2="12" y2="11"/>
            </svg>
          </ToolBtn>

          <Divider />

          {/* Bullet list */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
              <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </ToolBtn>

          {/* Indent (sink list item) */}
          <ToolBtn
            onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
            active={false}
            title="Indent (Tab)"
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="21" y2="8"/>
              <line x1="9" y1="12" x2="21" y2="12"/>
              <line x1="9" y1="16" x2="21" y2="16"/>
              <polyline points="3 12 6 15 3 18"/>
            </svg>
          </ToolBtn>

          {/* Outdent (lift list item) */}
          <ToolBtn
            onClick={() => editor.chain().focus().liftListItem("listItem").run()}
            active={false}
            title="Outdent (Shift+Tab)"
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="21" y2="8"/>
              <line x1="9" y1="12" x2="21" y2="12"/>
              <line x1="9" y1="16" x2="21" y2="16"/>
              <polyline points="7 12 4 15 7 18"/>
            </svg>
          </ToolBtn>

          <Divider />

          {/* Timestamp */}
          <ToolBtn
            onClick={insertTimestamp}
            active={false}
            title={`Insert sermon timestamp${isAudioActive && audioTime > 5 ? ` (${formatTime(audioTime)})` : ""}`}
            accentColor={accentColor}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </ToolBtn>

          {/* Live timestamp label */}
          {isAudioActive && audioTime > 5 && (
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: accentColor,
              marginLeft: "2px",
              letterSpacing: "0.01em",
              opacity: 0.8,
            }}>
              {formatTime(audioTime)}
            </span>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Clear — only when content exists */}
          {hasContent && (
            <button
              onMouseDown={(e) => { e.preventDefault(); clearNotes(); }}
              style={{
                fontSize: "0.65rem",
                fontWeight: 500,
                color: "rgba(0,32,91,0.22)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.25rem",
                letterSpacing: "0.01em",
                transition: "color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c0392b"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,32,91,0.22)"; }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Editor area ────────────────────────────────────────── */}
        <div
          onClick={() => editor.commands.focus()}
          style={{
            background: "rgba(255,255,255,0.65)",
            border: `1.5px solid ${editorFocused ? `${accentColor}50` : "rgba(0,32,91,0.09)"}`,
            borderRadius: "0.875rem",
            padding: "1rem 1.125rem",
            cursor: "text",
            minHeight: "140px",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: editorFocused ? `0 0 0 3px ${accentColor}10` : "none",
          }}
        >
          <EditorContent editor={editor} />
          {/* Placeholder when empty */}
          {!hasContent && (
            <div style={{
              position: "relative",
              marginTop: -28,
              pointerEvents: "none",
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "rgba(0,32,91,0.25)",
              fontStyle: "italic",
            }}>
              Take notes as you listen…
            </div>
          )}
        </div>

        {/* ── Keyboard hint ──────────────────────────────────────── */}
        <div style={{
          display: "flex",
          gap: "0.875rem",
          flexWrap: "wrap",
        }}>
          {[
            { keys: "⌘B", label: "Bold" },
            { keys: "⌘U", label: "Underline" },
            { keys: "Tab", label: "Indent" },
          ].map(({ keys, label }) => (
            <span key={keys} style={{ fontSize: "0.6rem", color: "rgba(0,32,91,0.25)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <kbd style={{
                fontFamily: "system-ui, sans-serif",
                background: "rgba(0,32,91,0.05)",
                border: "1px solid rgba(0,32,91,0.1)",
                borderRadius: "3px",
                padding: "1px 4px",
                fontSize: "0.6rem",
                letterSpacing: 0,
              }}>{keys}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
