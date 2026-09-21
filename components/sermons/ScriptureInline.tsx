"use client";
import { useEffect, useState } from "react";

interface Verse {
  book_id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ScriptureResult {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

interface Props {
  passage: string;
  label?: string;
  accentColor?: string;
  theme?: "dark" | "light";
}

export default function ScriptureInline({ passage, label, accentColor = "#00abc9", theme = "dark" }: Props) {
  const light = theme === "light";
  const [data, setData] = useState<ScriptureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/scripture?p=${encodeURIComponent(passage)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [passage]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: light ? "var(--surface-sunken)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${light ? "rgba(0,32,91,0.08)" : "rgba(255,255,255,0.08)"}`,
    }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: light ? "rgba(0,32,91,0.3)" : "rgba(255,255,255,0.3)" }}>Scripture</span>
          <span className="text-sm font-semibold"
            style={{ color: light ? "rgba(0,32,91,0.8)" : "rgba(255,255,255,0.8)" }}>{label ?? passage}</span>
          {data && (
            <span className="text-[10px] font-medium uppercase tracking-wide ml-1"
              style={{ color: light ? "rgba(0,32,91,0.25)" : "rgba(255,255,255,0.25)" }}>{data.translation_id.toUpperCase()}</span>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ color: light ? "rgba(0,32,91,0.25)" : "rgba(255,255,255,0.25)", transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: `1px solid ${light ? "rgba(0,32,91,0.06)" : "rgba(255,255,255,0.05)"}` }}>
          {loading && (
            <div className="py-4 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-2 rounded-full animate-pulse flex-1"
                  style={{ background: light ? "rgba(0,32,91,0.07)" : "rgba(255,255,255,0.07)", animationDelay: `${i*0.1}s` }} />
              ))}
            </div>
          )}
          {error && (
            <p className="py-4 text-sm italic"
              style={{ color: light ? "rgba(0,32,91,0.3)" : "rgba(255,255,255,0.3)" }}>Unable to load scripture text.</p>
          )}
          {data && (
            <>
              {data.verses.length <= 3 ? (
                // Short passage: inline flowing text
                <p className="pt-4 text-base leading-loose font-light tracking-wide"
                  style={{ color: light ? "rgba(0,32,91,0.75)" : "rgba(255,255,255,0.75)" }}>
                  {data.verses.map((v) => (
                    <span key={v.verse}>
                      <sup className="text-[10px] font-bold mr-0.5 select-none" style={{ color: accentColor, opacity: 0.7 }}>{v.verse}</sup>
                      {v.text.trim()}{" "}
                    </span>
                  ))}
                </p>
              ) : (
                // Longer passage: verse-by-verse list
                <div className="pt-4 space-y-2">
                  {data.verses.map((v) => (
                    <div key={v.verse} className="flex gap-2.5">
                      <span className="text-[11px] font-bold tabular-nums pt-1 select-none flex-shrink-0 w-5 text-right"
                        style={{ color: accentColor, opacity: 0.6 }}>{v.verse}</span>
                      <p className="text-base leading-relaxed font-light"
                        style={{ color: light ? "rgba(0,32,91,0.70)" : "rgba(255,255,255,0.70)" }}>{v.text.trim()}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-right font-medium tracking-wide"
                style={{ color: light ? "rgba(0,32,91,0.2)" : "rgba(255,255,255,0.2)" }}>
                {data.reference} · {data.translation_name}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
