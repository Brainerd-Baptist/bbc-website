"use client";

import { useEffect, useState } from "react";

interface Verse {
  verse: number;
  text: string;
}

interface ScriptureResult {
  reference: string;
  verses: Verse[];
  translation_name: string;
}

interface Props {
  /** The reference exactly as written/clicked — "John 3:16", "1 cor 15:3-5",
   * etc. /api/scripture lowercases and parses it, so casing doesn't matter. */
  reference: string;
  accentColor?: string;
  onClose: () => void;
}

/**
 * Inline "read the passage" popup — used anywhere a Scripture reference is
 * clickable: the sermon page's Scripture chip, the hero passage link, the
 * manuscript's inline scripture marks, and auto-detected references inside
 * a user's own notes (see lib/tiptap-scripture-ref.ts). Backed by the same
 * /api/scripture endpoint /live's Passage tab already uses — CSB only
 * (via api.bible), per 2026-10-03 direction: no other translation is ever
 * shown.
 */
export default function ScripturePopup({ reference, accentColor = "#00abc9", onClose }: Props) {
  const [data, setData] = useState<ScriptureResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);
    fetch(`/api/scripture?p=${encodeURIComponent(reference)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reference]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(10,22,40,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.25rem",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "var(--shadow-lg)",
          maxWidth: 540, width: "100%", maxHeight: "80vh", overflowY: "auto",
          padding: "1.5rem 1.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, marginBottom: "0.25rem" }}>
              Scripture
            </p>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.01em" }}>
              {data?.reference ?? reference}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: "0.25rem", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 13, borderRadius: 4, background: "var(--hover-subtle)", width: `${90 - i * 10}%` }} />
            ))}
          </div>
        )}

        {error && !loading && (
          <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)", lineHeight: 1.6 }}>
            Couldn&apos;t load this passage.{" "}
            <a
              href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=CSB`}
              target="_blank" rel="noopener noreferrer"
              style={{ color: accentColor, textDecoration: "underline" }}
            >
              Read on Bible Gateway →
            </a>
          </p>
        )}

        {data && !loading && !error && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(data.verses ?? []).map((v) => (
                <p key={v.verse} style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "var(--fg-muted)", margin: 0 }}>
                  <sup style={{ fontSize: "0.65rem", color: "var(--fg-subtle)", marginRight: 4, userSelect: "none" }}>{v.verse}</sup>
                  {v.text}
                </p>
              ))}
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)" }}>
              {data.translation_name}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
