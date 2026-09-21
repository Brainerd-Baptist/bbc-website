"use client";

/**
 * NotesEditor — the interactive, type-first sermon notes experience.
 *
 * - Each outline point has an auto-expanding textarea beneath it
 * - Notes auto-save to localStorage keyed by sermon slug
 * - "Download PDF" POSTs the typed notes to the PDF route → real downloadable PDF
 * - Ink-light print styles for direct browser print
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  slug: string;
  title: string;
  series: string;
  passage: string;
  speaker: string;
  formattedDate: string;
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  highlights: string[];
  audioUrl: string;
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  storageKey,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  storageKey: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="note-textarea"
      value={value}
      placeholder={placeholder}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`Notes for ${storageKey}`}
    />
  );
}

export default function NotesEditor({
  slug,
  title,
  series,
  passage,
  speaker,
  formattedDate,
  outline,
  outlineType,
  highlights,
  audioUrl,
}: Props) {
  // One textarea per outline point + one for "additional notes"
  const [pointNotes, setPointNotes] = useState<string[]>(() =>
    outline.map(() => "")
  );
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `bbc-notes-${slug}`;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.pointNotes)) {
          // Pad/trim to match current outline length
          const merged = outline.map((_, i) => parsed.pointNotes[i] ?? "");
          setPointNotes(merged);
        }
        if (typeof parsed.additionalNotes === "string") {
          setAdditionalNotes(parsed.additionalNotes);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey, outline]);

  // Debounced auto-save
  const scheduleSave = useCallback(
    (pts: string[], add: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ pointNotes: pts, additionalNotes: add })
          );
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch {
          // ignore quota errors
        }
      }, 800);
    },
    [storageKey]
  );

  const updatePoint = (i: number, value: string) => {
    const next = [...pointNotes];
    next[i] = value;
    setPointNotes(next);
    scheduleSave(next, additionalNotes);
  };

  const updateAdditional = (value: string) => {
    setAdditionalNotes(value);
    scheduleSave(pointNotes, value);
  };

  const hasAnyNotes =
    pointNotes.some((n) => n.trim()) || additionalNotes.trim();

  // POST to PDF route with typed notes
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/sermons/${slug}/notes/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointNotes, additionalNotes }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60);
      a.download = `${safeTitle}-notes.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const clearNotes = () => {
    if (!confirm("Clear all your notes for this sermon?")) return;
    const empty = outline.map(() => "");
    setPointNotes(empty);
    setAdditionalNotes("");
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .notes-root {
          font-family: var(--font-inter), system-ui, sans-serif;
          background: #eef1f6;
          min-height: 100vh;
          padding: 2rem 1rem 4rem;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Top toolbar (screen only) ── */
        .top-bar {
          max-width: 740px;
          margin: 0 auto 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .back-link {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(0,32,91,0.45);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: color 0.15s;
        }
        .back-link:hover { color: #00205B; }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .save-indicator {
          font-size: 0.7rem;
          color: #00abc9;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.3s;
          white-space: nowrap;
        }
        .save-indicator.visible { opacity: 1; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: none;
          padding: 0.55rem 1rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: opacity 0.15s, box-shadow 0.15s;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-primary {
          color: #fff;
          background: #00205B;
          box-shadow: 0 2px 8px rgba(0,32,91,0.22);
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.88; box-shadow: 0 4px 14px rgba(0,32,91,0.32); }
        .btn-ghost {
          color: rgba(0,32,91,0.5);
          background: transparent;
          border: 1px solid rgba(0,32,91,0.15);
        }
        .btn-ghost:hover { color: #00205B; border-color: rgba(0,32,91,0.3); }

        /* ── Paper sheet ── */
        .page {
          max-width: 740px;
          margin: 0 auto;
          background: #fff;
          box-shadow: 0 4px 40px rgba(0,20,60,0.12), 0 1px 6px rgba(0,20,60,0.07);
          border-radius: 4px;
          overflow: hidden;
        }

        /* ── Ink-light header ── */
        .header-band {
          background: #fff;
          padding: 2rem 2.5rem 1.5rem;
          border-top: 5px solid #00205B;
          position: relative;
        }
        .header-meta-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .church-eyebrow {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #00abc9;
        }
        .meta-sep { color: rgba(0,32,91,0.2); font-size: 0.65rem; }
        .meta-text {
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(0,32,91,0.4);
        }

        .sermon-title {
          font-family: var(--font-barlow-condensed), sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: #00205B;
          line-height: 1.05;
          letter-spacing: -0.01em;
        }

        .accent-stripe {
          height: 3px;
          background: linear-gradient(90deg, #00abc9 0%, rgba(0,171,201,0.2) 100%);
        }

        /* ── Body ── */
        .body {
          padding: 2rem 2.5rem 3rem;
        }

        /* ── Context strip (passage + hints) ── */
        .context-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .passage-callout {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,171,201,0.07);
          border: 1px solid rgba(0,171,201,0.2);
          border-radius: 6px;
          padding: 0.45rem 0.875rem;
        }
        .passage-label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,32,91,0.35);
        }
        .passage-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: #00205B;
        }
        .type-hint {
          font-size: 0.7rem;
          color: rgba(0,32,91,0.35);
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #00abc9;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0,32,91,0.08);
        }

        /* ── Outline items ── */
        .outline-list { display: flex; flex-direction: column; gap: 2rem; }
        .outline-item { display: flex; gap: 1rem; align-items: flex-start; }
        .outline-number {
          width: 1.875rem;
          height: 1.875rem;
          border-radius: 50%;
          background: #00205B;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .outline-number.scripture {
          background: transparent;
          border: 1.5px solid rgba(0,32,91,0.2);
          color: rgba(0,32,91,0.35);
        }
        .outline-content { flex: 1; min-width: 0; }
        .outline-point {
          font-size: 0.975rem;
          font-weight: 600;
          color: #00205B;
          line-height: 1.45;
          margin-bottom: 0.625rem;
        }

        /* ── The key piece: typed note area ── */
        .note-textarea {
          width: 100%;
          min-height: 3.5rem;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.875rem;
          line-height: 1.75;
          color: #1a2a4a;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(0,32,91,0.1);
          border-radius: 0;
          resize: none;
          outline: none;
          padding: 0.375rem 0.25rem;
          transition: border-color 0.15s, background 0.15s;
          overflow: hidden;
          display: block;
        }
        .note-textarea:focus {
          border-bottom-color: #00abc9;
          background: rgba(0,171,201,0.03);
        }
        .note-textarea::placeholder {
          color: rgba(0,32,91,0.2);
          font-style: italic;
        }

        /* Additional notes */
        .additional-notes { margin-top: 2.5rem; }
        .additional-textarea {
          width: 100%;
          min-height: 6rem;
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 0.875rem;
          line-height: 1.75;
          color: #1a2a4a;
          background: rgba(0,32,91,0.018);
          border: 1px solid rgba(0,32,91,0.08);
          border-radius: 6px;
          resize: vertical;
          outline: none;
          padding: 0.75rem 1rem;
          transition: border-color 0.15s, background 0.15s;
        }
        .additional-textarea:focus {
          border-color: #00abc9;
          background: rgba(0,171,201,0.03);
        }
        .additional-textarea::placeholder {
          color: rgba(0,32,91,0.2);
          font-style: italic;
        }

        /* ── Key phrases ── */
        .key-phrases {
          margin-top: 2.5rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(0,32,91,0.07);
        }
        .phrase-list { display: flex; flex-direction: column; gap: 0.625rem; }
        .phrase-item { display: flex; gap: 0.625rem; align-items: flex-start; }
        .phrase-accent {
          color: #00abc9;
          font-size: 0.95rem;
          font-weight: 700;
          flex-shrink: 0;
          line-height: 1.6;
        }
        .phrase-text {
          font-size: 0.85rem;
          font-style: italic;
          color: rgba(0,32,91,0.55);
          line-height: 1.65;
        }

        /* ── Footer ── */
        .doc-footer {
          margin-top: 3rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(0,32,91,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .footer-church {
          font-family: var(--font-barlow-condensed), sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #00205B;
        }
        .footer-address {
          font-size: 0.65rem;
          color: rgba(0,32,91,0.3);
          margin-top: 0.1rem;
        }
        .footer-url {
          font-size: 0.65rem;
          font-weight: 600;
          color: #00abc9;
          text-decoration: none;
        }

        /* ── Bottom action bar (screen only) ── */
        .bottom-bar {
          max-width: 740px;
          margin: 1.5rem auto 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* ── Print styles: ink-light ── */
        @media print {
          .no-print, .top-bar, .bottom-bar, .type-hint { display: none !important; }
          html, body, .notes-root { background: #fff !important; padding: 0 !important; }
          .notes-root { min-height: unset; }
          .page { box-shadow: none; border-radius: 0; max-width: 100%; }
          .body { padding: 1.5rem 2rem 2rem; }
          .header-band { padding: 1.5rem 2rem 1rem; }
          .note-textarea, .additional-textarea {
            border: none !important;
            background: transparent !important;
            resize: none;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Show rule lines under each note area when printing */
          .note-textarea:empty::after,
          .note-textarea:placeholder-shown::after {
            content: '';
          }
          .note-textarea { border-bottom: 1px solid #ccc !important; }
          @page { size: letter; margin: 0.5in; }
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .header-band { padding: 1.5rem 1.25rem 1.25rem; }
          .body { padding: 1.5rem 1.25rem 2rem; }
          .sermon-title { font-size: 1.75rem; }
          .top-bar { margin-bottom: 1rem; }
        }
      `}</style>

      <div className="notes-root">
        {/* ── Top bar ── */}
        <div className="top-bar no-print">
          <a href={`/sermons/${slug}`} className="back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            Back to sermon
          </a>
          <div className="toolbar-actions">
            <span className={`save-indicator${saved ? " visible" : ""}`}>
              ✓ Notes saved
            </span>
            {hasAnyNotes && (
              <button className="btn btn-ghost no-print" onClick={clearNotes}>
                Clear
              </button>
            )}
            {audioUrl && (
              <a className="btn btn-ghost no-print" href={audioUrl} download>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
                </svg>
                Audio
              </a>
            )}
          </div>
        </div>

        {/* ── Paper sheet ── */}
        <div className="page">

          {/* ── Ink-light header ── */}
          <div className="header-band">
            <div className="header-meta-line">
              <span className="church-eyebrow">Brainerd Baptist Church</span>
              {(series || formattedDate || speaker) && (
                <>
                  <span className="meta-sep">·</span>
                  {series && <span className="meta-text">{series}</span>}
                  {series && formattedDate && <span className="meta-sep">·</span>}
                  {formattedDate && <span className="meta-text">{formattedDate}</span>}
                  {(series || formattedDate) && speaker && <span className="meta-sep">·</span>}
                  {speaker && <span className="meta-text">{speaker}</span>}
                </>
              )}
            </div>
            <h1 className="sermon-title">{title}</h1>
          </div>

          {/* ── Cyan stripe ── */}
          <div className="accent-stripe" />

          {/* ── Body ── */}
          <div className="body">

            {/* Passage + typing hint */}
            <div className="context-strip">
              {passage ? (
                <div className="passage-callout">
                  <span className="passage-label">Key Passage</span>
                  <span className="passage-text">{passage}</span>
                </div>
              ) : <div />}
              <div className="type-hint no-print">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 4h10M2 7h7M2 10h5"/>
                </svg>
                Type your notes below — auto-saved
              </div>
            </div>

            {/* Section label */}
            <div className="section-label">Message Notes</div>

            {/* Outline with typeable areas */}
            {outline.length > 0 ? (
              <div className="outline-list">
                {outline.map((point, i) => (
                  <div className="outline-item" key={i}>
                    <div className={`outline-number${outlineType === "scripture" ? " scripture" : ""}`}>
                      {outlineType === "scripture" ? "—" : i + 1}
                    </div>
                    <div className="outline-content">
                      <div className="outline-point">{point}</div>
                      <AutoTextarea
                        value={pointNotes[i] ?? ""}
                        onChange={(v) => updatePoint(i, v)}
                        placeholder={`Your thoughts on point ${i + 1}…`}
                        storageKey={`point-${i}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No outline — open writing space */
              <textarea
                className="additional-textarea"
                value={pointNotes[0] ?? ""}
                placeholder="Type your notes here as you follow along…"
                onChange={(e) => updatePoint(0, e.target.value)}
                rows={12}
                style={{ minHeight: "14rem" }}
              />
            )}

            {/* Additional notes */}
            <div className="additional-notes">
              <div className="section-label">Additional Notes</div>
              <textarea
                className="additional-textarea"
                value={additionalNotes}
                placeholder="Questions, action steps, things to look up…"
                onChange={(e) => updateAdditional(e.target.value)}
                rows={5}
              />
            </div>

            {/* Key phrases (read-only reference) */}
            {highlights.length > 0 && (
              <div className="key-phrases">
                <div className="section-label">Key Phrases</div>
                <div className="phrase-list">
                  {highlights.map((phrase, i) => (
                    <div className="phrase-item" key={i}>
                      <span className="phrase-accent">›</span>
                      <span className="phrase-text">{phrase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="doc-footer">
              <div>
                <div className="footer-church">Brainerd Baptist Church</div>
                <div className="footer-address">300 Brookfield Ave · Chattanooga, TN · Sundays 8:30 & 11:00 AM</div>
              </div>
              <a href="https://brainerdbaptist.org" className="footer-url no-print">
                brainerdbaptist.org
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="bottom-bar no-print">
          <button
            className="btn btn-ghost"
            onClick={() => window.print()}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="10" height="7" rx="1"/>
              <path d="M4 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              <path d="M4 9h1M4 11h6"/>
            </svg>
            Print
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
            </svg>
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>
    </>
  );
}
