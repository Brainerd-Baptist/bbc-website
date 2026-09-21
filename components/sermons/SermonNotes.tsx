"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function SermonNotes({ slug, youtubeId, accentColor, sermonTitle }: Props) {
  const storageKey = `bbc-notes-${slug}`;
  const videoKey   = youtubeId ? `bbc-sermon-pos-${youtubeId}` : null;
  const audioKey   = `bbc-ap-${slug}`;

  const { track: activeTrack, currentTime: audioTime } = useAudio();
  const isAudioActive = activeTrack?.slug === slug;

  const [notes,      setNotes]      = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [wordCount,  setWordCount]  = useState(0);
  const [copied,     setCopied]     = useState(false);
  const [focused,    setFocused]    = useState(false);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(saved);
        setWordCount(countWords(saved));
      }
    } catch { /* private mode */ }
  }, [storageKey]);

  // Auto-resize textarea on content change
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.max(ta.scrollHeight, 140)}px`;
  }, [notes]);

  const saveNotes = useCallback((val: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(() => {
      try {
        if (val) {
          localStorage.setItem(storageKey, val);
        } else {
          localStorage.removeItem(storageKey);
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch { /* no-op */ }
    }, 400);
  }, [storageKey]);

  const handleChange = useCallback((val: string) => {
    setNotes(val);
    setWordCount(countWords(val));
    saveNotes(val);
  }, [saveNotes]);

  const getCurrentPosition = useCallback((): number | null => {
    // Prefer live audio context if this sermon is currently playing
    if (isAudioActive && audioTime > 5) return audioTime;

    // Fall back to localStorage for video position
    try {
      if (videoKey) {
        const raw = localStorage.getItem(videoKey);
        if (raw) return parseFloat(raw);
      }
      // Check audio localStorage as fallback
      const raw = localStorage.getItem(audioKey);
      if (raw) return parseFloat(raw);
    } catch { /* no-op */ }

    return null;
  }, [isAudioActive, audioTime, videoKey, audioKey]);

  const insertTimestamp = useCallback(() => {
    const pos = getCurrentPosition();
    const ts  = pos !== null ? `[${formatTime(pos)}] ` : `[-- ] `;
    const ta  = textareaRef.current;
    if (!ta) return;

    const start  = ta.selectionStart;
    const end    = ta.selectionEnd;
    // If cursor is mid-line and not at start of line, prepend a newline
    const before = notes.slice(0, start);
    const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" + ts : ts;
    const newVal = before + prefix + notes.slice(end);
    handleChange(newVal);

    setTimeout(() => {
      ta.focus();
      const newPos = start + prefix.length;
      ta.setSelectionRange(newPos, newPos);
    }, 0);
  }, [notes, getCurrentPosition, handleChange]);

  const copyNotes = useCallback(() => {
    if (!notes) return;
    const header = `Notes — ${sermonTitle}\n${"─".repeat(40)}\n\n`;
    navigator.clipboard.writeText(header + notes)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [notes, sermonTitle]);

  const clearNotes = useCallback(() => {
    if (!notes) return;
    if (!confirm("Clear all notes for this sermon?")) return;
    handleChange("");
  }, [notes, handleChange]);

  const hasNotes = notes.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

      {/* ── Header row ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Pencil icon */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Word count */}
          {wordCount > 0 && (
            <span style={{ fontSize: "0.65rem", color: "rgba(0,32,91,0.3)", fontWeight: 500 }}>
              {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
            </span>
          )}

          {/* Save indicator */}
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

          {/* Copy button */}
          {hasNotes && (
            <button
              onClick={copyNotes}
              title={copied ? "Copied!" : "Copy notes"}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0.2rem 0", color: copied ? accentColor : "rgba(0,32,91,0.3)",
                display: "flex", alignItems: "center", gap: "0.3rem",
                fontSize: "0.65rem", fontWeight: 600, transition: "color 0.15s",
              }}
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>

      {/* ── Textarea ────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Take notes as you listen…"
          style={{
            width: "100%",
            minHeight: "140px",
            resize: "none",
            overflowY: "hidden",
            background: focused ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
            border: focused
              ? `1.5px solid ${accentColor}50`
              : "1.5px solid rgba(0,32,91,0.09)",
            borderRadius: "0.875rem",
            padding: "1rem 1.125rem",
            fontSize: "0.9rem",
            lineHeight: "1.75",
            color: "#0a1628",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
            boxShadow: focused ? `0 0 0 3px ${accentColor}12` : "none",
          }}
        />

        {/* Empty state hint — only when blurred and no content */}
        {!hasNotes && !focused && (
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1.125rem",
              pointerEvents: "none",
            }}
          >
            <span style={{
              fontSize: "0.65rem",
              color: "rgba(0,32,91,0.2)",
              fontStyle: "italic",
            }}>
              auto-saved
            </span>
          </div>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {/* Insert timestamp */}
        <button
          onClick={insertTimestamp}
          title="Insert the current playback position as a timestamp marker"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "rgba(0,32,91,0.45)",
            background: "rgba(0,32,91,0.04)",
            border: "1px solid rgba(0,32,91,0.1)",
            borderRadius: "9999px",
            padding: "0.375rem 0.75rem",
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#00205B";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,32,91,0.07)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,32,91,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,32,91,0.45)";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,32,91,0.04)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,32,91,0.1)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Timestamp
        </button>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Clear — only shown when there are notes */}
        {hasNotes && (
          <button
            onClick={clearNotes}
            style={{
              fontSize: "0.65rem",
              fontWeight: 500,
              color: "rgba(0,32,91,0.25)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem 0",
              letterSpacing: "0.01em",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#c0392b"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,32,91,0.25)"; }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Timestamp hint — shown only when media is active ─────── */}
      {isAudioActive && audioTime > 5 && (
        <div style={{
          fontSize: "0.65rem",
          color: "rgba(0,32,91,0.35)",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginTop: "-0.25rem",
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>Now at <strong style={{ color: accentColor }}>{formatTime(audioTime)}</strong> — tap Timestamp to mark it</span>
        </div>
      )}
    </div>
  );
}
