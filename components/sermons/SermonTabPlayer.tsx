"use client";

import { useEffect } from "react";
import SermonPlayer from "./SermonPlayer";
import AudioPlayer from "./AudioPlayer";
import { type AudioTrack, useAudio } from "@/lib/audio-context";
import SermonNotes from "./SermonNotes";

interface Props {
  slug: string;
  youtubeId: string;
  title: string;
  speaker?: string;
  series?: string;
  date?: string;
  passage?: string;
  audioTrack?: AudioTrack | null;
  nextTrack?: AudioTrack | null;
  passages?: string[];
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
  highlights?: string[];
  accentColor: string;
}

export default function SermonTabPlayer({
  slug,
  youtubeId,
  title,
  speaker = "",
  series = "",
  date = "",
  passage = "",
  audioTrack,
  nextTrack,
  passages = [],
  outline,
  outlineType,
  rawText,
  highlights = [],
  accentColor,
}: Props) {
  const { setNextTrack } = useAudio();

  // Register the next track for autoplay whenever it changes
  useEffect(() => {
    setNextTrack(nextTrack ?? null);
    return () => setNextTrack(null);
  }, [nextTrack, setNextTrack]);
  const hasMedia = !!(youtubeId || audioTrack);
  const hasOutline = outline.length > 0 || highlights.length > 0 || passages.length > 0;
  // Notes download is available if we have outline content or raw text
  const hasNotes = rawText || outline.length > 0 || highlights.length > 0;

  // Scripture-only fallback: show a softer label
  const showScriptureLabel = outlineType === "scripture" && !highlights.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Section 1: Media card ── */}
      {hasMedia && (
        <div
          style={{
            background: "#f4f6f9",
            border: "1px solid rgba(0,32,91,0.08)",
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          {youtubeId && (
            <SermonPlayer youtubeId={youtubeId} title={title} slug={slug} />
          )}
          {audioTrack && (
            <div
              style={
                youtubeId
                  ? { borderTop: "1px solid rgba(0,32,91,0.06)", padding: "1rem 1.25rem" }
                  : { padding: "1rem 1.25rem" }
              }
            >
              <AudioPlayer track={audioTrack} accentColor={accentColor} theme="light" />
            </div>
          )}
        </div>
      )}

      {/* ── Section 2: Outline + Notes download card ── */}
      {(hasOutline || hasNotes) && (
        <div
          style={{
            background: "#f4f6f9",
            border: "1px solid rgba(0,32,91,0.08)",
            borderRadius: "1rem",
            padding: "1.5rem 1.75rem",
          }}
        >
          {/* ── Key passage chip — only when we have a real structured outline below ── */}
          {passages.length > 0 && outlineType !== "scripture" && (
            <div style={{ marginBottom: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.375rem 0.625rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,32,91,0.3)", marginRight: "0.25rem" }}>
                Scripture
              </span>
              {passages.slice(0, 2).map((p) => (
                <a
                  key={p}
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(p)}&version=CSB`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.6)", textDecoration: "none", fontWeight: 500 }}
                >
                  {p}
                </a>
              ))}
            </div>
          )}

          {/* ── Main outline points ── */}
          {hasOutline && (
            <div>
              {showScriptureLabel && (
                <p style={{ color: "rgba(0,32,91,0.4)", fontSize: "0.75rem", marginBottom: "1rem", lineHeight: "1.625" }}>
                  Passages from this message
                </p>
              )}

              {outline.length > 0 && (
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {outline.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          color: accentColor,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          marginTop: "0.125rem",
                          flexShrink: 0,
                          width: "1.25rem",
                        }}
                      >
                        {outlineType === "scripture" ? "—" : `${i + 1}.`}
                      </span>
                      <span style={{ color: "rgba(0,32,91,0.75)" }}>{item}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* ── Key phrases (highlights) — shown below outline ── */}
              {highlights.length > 0 && (
                <div style={{ marginTop: outline.length > 0 ? "1.5rem" : 0 }}>
                  <p style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(0,32,91,0.3)",
                    marginBottom: "0.75rem",
                  }}>
                    Key Phrases
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {highlights.map((phrase, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8rem" }}>
                        <span style={{ color: accentColor, fontWeight: 700, flexShrink: 0, marginTop: "0.1rem" }}>›</span>
                        <span style={{ color: "rgba(0,32,91,0.65)", fontStyle: "italic" }}>{phrase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── Download Notes button ── */}
          {hasNotes && (
            <div style={{ marginTop: hasOutline ? "1.5rem" : 0, paddingTop: hasOutline ? "1.25rem" : 0, borderTop: hasOutline ? "1px solid rgba(0,32,91,0.07)" : "none" }}>
              <a
                href={`/sermons/${slug}/notes`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "rgba(0,32,91,0.5)",
                  textDecoration: "none",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(0,32,91,0.12)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#00205B";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,32,91,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(0,32,91,0.5)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,32,91,0.12)";
                }}
              >
                {/* Download icon */}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
                </svg>
                Sermon Notes
              </a>
            </div>
          )}
        </div>
      )}
      {/* ── Section 3: Personal notes card ─────────────────────────── */}
      <div
        style={{
          background: "#f4f6f9",
          border: "1px solid rgba(0,32,91,0.08)",
          borderRadius: "1rem",
          padding: "1.5rem 1.75rem",
        }}
      >
        <SermonNotes
          slug={slug}
          youtubeId={youtubeId || undefined}
          accentColor={accentColor}
          sermonTitle={title}
          speaker={speaker}
          series={series}
          date={date}
          passage={passage}
        />
      </div>
    </div>
  );
}
