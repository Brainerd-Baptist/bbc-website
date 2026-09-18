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
}

export default function ScriptureInline({ passage, label, accentColor = "#00abc9" }: Props) {
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
    <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Scripture</span>
          <span className="text-sm font-semibold text-white/80">{label ?? passage}</span>
          {data && (
            <span className="text-[10px] text-white/25 font-medium uppercase tracking-wide ml-1">{data.translation_id.toUpperCase()}</span>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="text-white/25 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          {loading && (
            <div className="py-4 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-2 rounded-full animate-pulse flex-1"
                  style={{ background: "rgba(255,255,255,0.07)", animationDelay: `${i*0.1}s` }} />
              ))}
            </div>
          )}
          {error && (
            <p className="py-4 text-sm text-white/30 italic">Unable to load scripture text.</p>
          )}
          {data && (
            <>
              {data.verses.length <= 3 ? (
                // Short passage: inline flowing text
                <p className="pt-4 text-base text-white/75 leading-loose font-light tracking-wide">
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
                      <p className="text-base text-white/70 leading-relaxed font-light">{v.text.trim()}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-white/20 text-right font-medium tracking-wide">
                {data.reference} · {data.translation_name}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
