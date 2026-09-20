"use client";

import { useState } from "react";
import SermonPlayer from "./SermonPlayer";

type Tab = "video" | "outline" | "notes";

interface Props {
  youtubeId: string;
  title: string;
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
  accentColor: string;
}

function NotesContent({ rawText, accentColor }: { rawText: string; accentColor: string }) {
  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{ background: "#f4f6f9", border: "1px solid rgba(0,32,91,0.08)" }}
    >
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
    </div>
  );
}

export default function SermonTabPlayer({
  youtubeId,
  title,
  outline,
  outlineType,
  rawText,
  accentColor,
}: Props) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "video", label: "Video" },
    ...(outline.length > 0 ? [{ id: "outline" as Tab, label: "Outline" }] : []),
    ...(rawText ? [{ id: "notes" as Tab, label: "Notes" }] : []),
  ];

  const [active, setActive] = useState<Tab>("video");

  return (
    <div>
      {/* Tab pills */}
      {tabs.length > 1 && (
        <div className="flex gap-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                padding: "0.375rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.025em",
                transition: "all 0.15s",
                cursor: "pointer",
                border: "none",
                background: active === tab.id ? accentColor : "transparent",
                color: active === tab.id ? "#fff" : "rgba(0,32,91,0.4)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Video tab */}
      {active === "video" && (
        youtubeId
          ? <SermonPlayer youtubeId={youtubeId} title={title} />
          : (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "#f4f6f9", border: "1px solid rgba(0,32,91,0.08)" }}
            >
              <p style={{ color: "rgba(0,32,91,0.4)", fontSize: "0.875rem" }}>
                Video not yet available for this sermon.
              </p>
            </div>
          )
      )}

      {/* Outline tab */}
      {active === "outline" && outline.length > 0 && (
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "#f4f6f9", border: "1px solid rgba(0,32,91,0.08)" }}
        >
          {outlineType === "scripture" && (
            <p style={{ color: "rgba(0,32,91,0.4)", fontSize: "0.75rem", marginBottom: "1.25rem", lineHeight: "1.625" }}>
              Scripture passages from this message
            </p>
          )}
          <ol className="space-y-3">
            {outline.map((item, i) => (
              <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem" }}>
                <span
                  style={{ color: accentColor, fontWeight: 700, fontSize: "0.75rem",
                    marginTop: "0.125rem", flexShrink: 0, width: "1.25rem" }}
                >
                  {outlineType === "scripture" ? "—" : `${i + 1}.`}
                </span>
                <span style={{ color: "rgba(0,32,91,0.75)" }}>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Notes tab */}
      {active === "notes" && rawText && (
        <NotesContent rawText={rawText} accentColor={accentColor} />
      )}
    </div>
  );
}
