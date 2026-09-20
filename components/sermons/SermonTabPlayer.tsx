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
    <div className="rounded-2xl border border-[#00205B]/08 p-6 md:p-8 bg-[#f4f6f9]">
      <div className="prose prose-sm max-w-none">
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
                className="font-bold text-sm mt-7 mb-2"
                style={{ letterSpacing: "-0.01em", color: accentColor }}
              >
                {trimmed}
              </h3>
            );
          }
          return (
            <p key={i} className="text-[#00205B]/65 text-sm leading-relaxed mb-4">
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
              className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer"
              style={
                active === tab.id
                  ? { background: accentColor, color: "#fff" }
                  : { color: "rgba(0,32,91,0.4)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Video tab */}
      {active === "video" && youtubeId && (
        <SermonPlayer youtubeId={youtubeId} title={title} />
      )}

      {/* Outline tab */}
      {active === "outline" && outline.length > 0 && (
        <div className="rounded-2xl border border-[#00205B]/08 p-6 md:p-8 bg-[#f4f6f9]">
          {outlineType === "scripture" && (
            <p className="text-xs text-[#00205B]/40 mb-5 leading-relaxed">
              Scripture passages from this message
            </p>
          )}
          <ol className="space-y-3">
            {outline.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#00205B]/75">
                <span
                  className="text-xs font-bold mt-0.5 flex-shrink-0 w-5"
                  style={{ color: accentColor }}
                >
                  {outlineType === "scripture" ? "—" : `${i + 1}.`}
                </span>
                <span>{item}</span>
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
