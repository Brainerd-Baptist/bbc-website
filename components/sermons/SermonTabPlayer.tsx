"use client";

import { useState } from "react";
import SermonPlayer from "./SermonPlayer";
import AudioPlayer from "./AudioPlayer";
import { type AudioTrack } from "@/lib/audio-context";

type ContentTab = "outline" | "notes";

interface Props {
  youtubeId: string;
  title: string;
  audioTrack?: AudioTrack | null;
  passages?: string[];
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
  highlights?: string[];
  accentColor: string;
}

function NotesContent({ rawText, accentColor }: { rawText: string; accentColor: string }) {
  return (
    <div className="max-w-none">
      {rawText.split(/\n{2,}/).map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;
        const isHeading =
          trimmed.length <= 80 &&
          (/^[A-Z][A-Z\s\d:,'.!?–\-]{3,}$/.test(trimmed) ||
            /^[A-Z].{0,60}:$/.test(trimmed));
        if (isHeading) {
          return (
            <h3
              key={i}
              style={{
                fontWeight: 700,
                fontSize: "0.875rem",
                marginTop: "1.75rem",
                marginBottom: "0.5rem",
                letterSpacing: "-0.01em",
                color: accentColor,
              }}
            >
              {trimmed}
            </h3>
          );
        }
        return (
          <p
            key={i}
            style={{
              color: "rgba(0,32,91,0.65)",
              fontSize: "0.875rem",
              lineHeight: "1.625",
              marginBottom: "1rem",
            }}
          >
            {trimmed.split(/\n/).map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function SermonTabPlayer({
  youtubeId,
  title,
  audioTrack,
  passages = [],
  outline,
  outlineType,
  rawText,
  highlights = [],
  accentColor,
}: Props) {
  const hasMedia = !!(youtubeId || audioTrack);
  const hasOutline = highlights.length > 0 || outline.length > 0 || passages.length > 0;
  const hasNotes = !!rawText;
  const hasContent = hasOutline || hasNotes;

  const contentTabs: { id: ContentTab; label: string }[] = [
    ...(hasOutline ? [{ id: "outline" as ContentTab, label: "Outline" }] : []),
    ...(hasNotes ? [{ id: "notes" as ContentTab, label: "Notes" }] : []),
  ];

  const [activeTab, setActiveTab] = useState<ContentTab>(
    contentTabs[0]?.id ?? "outline"
  );

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
            <SermonPlayer youtubeId={youtubeId} title={title} />
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

      {/* ── Section 2: Content card ── */}
      {hasContent && (
        <div
          style={{
            background: "#f4f6f9",
            border: "1px solid rgba(0,32,91,0.08)",
            borderRadius: "1rem",
            padding: "1.5rem 1.75rem",
          }}
        >
          {/* Tab pills */}
          {contentTabs.length > 1 && (
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
              {contentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "0.375rem 1rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.025em",
                    transition: "all 0.15s",
                    cursor: "pointer",
                    border: "none",
                    background: activeTab === tab.id ? accentColor : "transparent",
                    color: activeTab === tab.id ? "#fff" : "rgba(0,32,91,0.4)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Outline tab */}
          {(!contentTabs.length || activeTab === "outline") && hasOutline && (
            <div>
              {/* Key Passage row */}
              {passages.length > 0 && (
                <div style={{ marginBottom: "1.25rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
                  {passages.map((p) => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,32,91,0.3)" }}>
                        Scripture
                      </span>
                      <a
                        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(p)}&version=CSB`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.6)", textDecoration: "none", fontWeight: 500 }}
                      >
                        {p}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights as primary outline */}
              {highlights.length > 0 ? (
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {highlights.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          color: "#00abc9",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          marginTop: "0.125rem",
                          flexShrink: 0,
                          width: "1.25rem",
                        }}
                      >
                        {i + 1}.
                      </span>
                      <span style={{ color: "rgba(0,32,91,0.75)" }}>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : outline.length > 0 ? (
                <>
                  {outlineType === "scripture" && (
                    <p style={{ color: "rgba(0,32,91,0.4)", fontSize: "0.75rem", marginBottom: "1.25rem", lineHeight: "1.625" }}>
                      Scripture passages from this message
                    </p>
                  )}
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
                </>
              ) : null}
            </div>
          )}

          {/* Notes tab */}
          {activeTab === "notes" && rawText && (
            <NotesContent rawText={rawText} accentColor={accentColor} />
          )}
        </div>
      )}
    </div>
  );
}
