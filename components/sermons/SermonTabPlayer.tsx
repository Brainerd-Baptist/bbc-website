"use client";

import { useEffect } from "react";
import SermonPlayer from "./SermonPlayer";
import AudioPlayer from "./AudioPlayer";
import { type AudioTrack, useAudio } from "@/lib/audio-context";
import SermonNotes from "./SermonNotes";
import PassageLink from "./PassageLink";

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
  // Still accepted from the caller (app/sermons/[slug]/page.tsx) but no
  // longer rendered — see the 2026-10-03 note near hasScriptureChip below.
  outline?: string[];
  outlineType?: "structured" | "scripture" | "none";
  rawText?: string | null;
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
  accentColor,
}: Props) {
  const { setNextTrack } = useAudio();

  // Register the next track for autoplay whenever it changes
  useEffect(() => {
    setNextTrack(nextTrack ?? null);
    return () => setNextTrack(null);
  }, [nextTrack, setNextTrack]);
  const hasMedia = !!(youtubeId || audioTrack);
  // The auto-extracted outline/highlights block (parsed out of Curtis's raw
  // notes doc — yellow-highlight fragments and regex-matched scripture
  // lines) was removed 2026-10-03: it was surfacing junk, out-of-context
  // snippets rather than usable notes. Going back to the drawing board on
  // that — see lib/sermon.ts's parseOutline/parseHighlights, still intact
  // but no longer rendered. The "Scripture" chip below is real tagged
  // passage metadata (Sanity/Tagging sheet), not scraped from notes, so it
  // stays.
  const hasScriptureChip = passages.length > 0;
  const hasNotes = true; // jump-to-notes link always available — notes live client-side

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* ── Section 1: Media card ── */}
      {hasMedia && (
        <div
          style={{
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
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
                  ? { borderTop: "1px solid var(--border)", padding: "1rem 1.25rem" }
                  : { padding: "1rem 1.25rem" }
              }
            >
              <AudioPlayer track={audioTrack} accentColor={accentColor} theme="light" />
            </div>
          )}
        </div>
      )}

      {/* ── Section 2: Scripture chip + jump-to-notes link ── */}
      {(hasScriptureChip || hasNotes) && (
        <div
          style={{
            background: "var(--surface-sunken)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.5rem 1.75rem",
          }}
        >
          {/* ── Key passage chip — real tagged passage metadata, not scraped from notes ── */}
          {hasScriptureChip && (
            <div style={{ marginBottom: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.375rem 0.625rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-subtle)", marginRight: "0.25rem" }}>
                Scripture
              </span>
              {passages.slice(0, 2).map((p) => (
                <PassageLink
                  key={p}
                  passage={p}
                  accentColor={accentColor}
                  style={{ fontSize: "0.8rem", color: "var(--fg-muted)", fontWeight: 500 }}
                >
                  {p}
                </PassageLink>
              ))}
            </div>
          )}

          {/* ── Jump-to-notes link ── */}
          {hasNotes && (
            <div style={{ marginTop: hasScriptureChip ? "1.5rem" : 0, paddingTop: hasScriptureChip ? "1.25rem" : 0, borderTop: hasScriptureChip ? "1px solid var(--border)" : "none" }}>
              <a
                href="#notes"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("notes")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--fg-muted)",
                  textDecoration: "none",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "9999px",
                  border: "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg-muted)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
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
        id="notes"
        style={{
          background: "var(--surface-sunken)",
          border: "1px solid var(--border)",
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
