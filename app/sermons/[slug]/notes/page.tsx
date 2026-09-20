/**
 * /sermons/[slug]/notes — Printable sermon notes
 *
 * Professional branded print resource. Opens in a new tab.
 * User hits Print → "Save as PDF" in their browser.
 */

import { notFound } from "next/navigation";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getSermonBySlug } from "@/lib/sanity";
import { getSermonNotesByDate } from "@/lib/sermon";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";
import PrintButton from "./PrintButton";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticS = SERMONS.find((s) => s.id === slug);
  const title = staticS?.title ?? "Sermon";
  return {
    title: `${title} — Message Notes`,
    robots: "noindex",
  };
}

export default async function SermonNotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const sanitySermon = await getSermonBySlug(slug).catch(() => null);
  let title = "", series = "", passage = "", speaker = "", date = "";

  if (sanitySermon) {
    title   = sanitySermon.title ?? "";
    series  = sanitySermon.series?.title ?? "";
    passage = sanitySermon.passage ?? "";
    speaker = sanitySermon.speaker ?? "";
    date    = sanitySermon.date ?? "";
  } else {
    const staticS = SERMONS.find((s) => s.id === slug);
    if (!staticS) notFound();
    title   = staticS.title;
    series  = staticS.series;
    passage = staticS.passage;
    speaker = staticS.speaker;
    date    = staticS.date;
  }

  const notes = date ? await getSermonNotesByDate(date) : null;
  const outline: string[]    = notes?.outline    ?? [];
  const highlights: string[] = notes?.highlights ?? [];
  const outlineType = notes?.outlineType ?? "none";

  let audioUrl = "";
  if (date) {
    const podcastMap: Record<string, string> = await getPodcastAudioMap().catch(() => ({}));
    const key = dateToKey(date);
    const d = new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    const prevKey = dateToKey(d.toISOString().slice(0, 10));
    audioUrl = podcastMap[key] || podcastMap[prevKey] || "";
  }

  const formattedDate = date ? formatDate(date) : "";

  return (
    <>
      <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .notes-root {
            font-family: var(--font-inter), system-ui, sans-serif;
            background: #d6dce5;
            min-height: 100vh;
            padding: 2.5rem 1rem 3rem;
            -webkit-font-smoothing: antialiased;
          }

          .page {
            max-width: 720px;
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 8px 60px rgba(0,20,60,0.18), 0 2px 12px rgba(0,20,60,0.08);
            border-radius: 3px;
            overflow: hidden;
          }

          /* ── Header band ── */
          .header-band {
            background: #00205B;
            padding: 2rem 3rem 1.75rem;
            position: relative;
            overflow: hidden;
          }

          .header-band::before {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 280px; height: 100%;
            background: radial-gradient(ellipse at 100% 0%, rgba(0,171,201,0.18) 0%, transparent 65%);
            pointer-events: none;
          }

          .church-name {
            font-family: var(--font-barlow-condensed), sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #00abc9;
            margin-bottom: 0.625rem;
          }

          .sermon-title {
            font-family: var(--font-barlow-condensed), sans-serif;
            font-size: 2.5rem;
            font-weight: 800;
            color: #fff;
            line-height: 1.0;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
          }

          .meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0 1.5rem;
          }

          .meta-item {
            font-size: 0.8rem;
            font-weight: 500;
            color: rgba(255,255,255,0.55);
            letter-spacing: 0.01em;
          }

          .meta-item + .meta-item::before {
            content: '·';
            margin-right: 1.5rem;
          }

          /* ── Cyan accent stripe ── */
          .accent-stripe {
            height: 4px;
            background: linear-gradient(90deg, #00abc9 0%, rgba(0,171,201,0.3) 100%);
          }

          /* ── Body ── */
          .body {
            padding: 2.75rem 3rem 3.5rem;
          }

          /* ── Section label ── */
          .section-label {
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.18em;
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
            background: rgba(0,32,91,0.1);
          }

          /* ── Passage callout ── */
          .passage-callout {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(0,171,201,0.07);
            border: 1px solid rgba(0,171,201,0.2);
            border-radius: 6px;
            padding: 0.5rem 0.875rem;
            margin-bottom: 2rem;
          }
          .passage-label {
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: rgba(0,32,91,0.4);
          }
          .passage-text {
            font-size: 0.85rem;
            font-weight: 600;
            color: #00205B;
          }

          /* ── Outline points ── */
          .outline-list {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
          }

          .outline-item {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
          }

          .outline-number {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: #00205B;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 0.05rem;
          }

          .outline-number.scripture {
            background: transparent;
            border: 1.5px solid rgba(0,32,91,0.2);
            color: rgba(0,32,91,0.4);
          }

          .outline-content {
            flex: 1;
          }

          .outline-point {
            font-size: 1rem;
            font-weight: 600;
            color: #00205B;
            line-height: 1.4;
            margin-bottom: 0.875rem;
          }

          /* ── Ruled lines ── */
          .ruled-lines {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .rule {
            height: 1px;
            background: rgba(0,32,91,0.11);
          }

          /* ── Empty state (no outline) ── */
          .blank-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          /* ── Additional notes ── */
          .additional-notes {
            margin-top: 3rem;
          }

          /* ── Key phrases ── */
          .key-phrases {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(0,32,91,0.08);
          }
          .phrase-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .phrase-item {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
          }
          .phrase-accent {
            color: #00abc9;
            font-size: 1rem;
            font-weight: 700;
            flex-shrink: 0;
            line-height: 1.5;
          }
          .phrase-text {
            font-size: 0.875rem;
            font-style: italic;
            color: rgba(0,32,91,0.65);
            line-height: 1.6;
          }

          /* ── Footer ── */
          .footer {
            margin-top: 3.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid rgba(0,32,91,0.07);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .footer-left {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }
          .footer-church {
            font-family: var(--font-barlow-condensed), sans-serif;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #00205B;
          }
          .footer-address {
            font-size: 0.65rem;
            color: rgba(0,32,91,0.35);
          }
          .footer-url {
            font-size: 0.65rem;
            font-weight: 600;
            color: #00abc9;
            text-decoration: none;
            letter-spacing: 0.02em;
          }

          /* ── Screen-only elements ── */
          .screen-toolbar {
            max-width: 720px;
            margin: 1.25rem auto 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 0.25rem;
          }
          .back-link {
            font-size: 0.75rem;
            color: rgba(0,32,91,0.4);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }
          .back-link:hover { color: #00205B; }

          /* ── Print styles ── */
          @media print {
            .no-print { display: none !important; }
            html, body, .notes-root { font-size: 12pt; background: #fff; padding: 0; }
            .notes-root { min-height: unset; }
            .page {
              box-shadow: none;
              border-radius: 0;
              max-width: 100%;
            }
            .body { padding: 2rem 2.5rem 2.5rem; }
            .header-band { padding: 1.5rem 2.5rem; }
            .outline-point { font-size: 1rem; }
            .phrase-text { font-size: 0.875rem; }
            .screen-toolbar { display: none !important; }
            @page {
              size: letter;
              margin: 0;
            }
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        `}</style>

      <div className="notes-root">
        {/* ── Paper sheet ── */}
        <div className="page">

          {/* ── Branded header ── */}
          <div className="header-band">
            <div className="church-name">Brainerd Baptist Church</div>
            <h1 className="sermon-title">{title}</h1>
            <div className="meta-row">
              {series   && <span className="meta-item">{series}</span>}
              {formattedDate && <span className="meta-item">{formattedDate}</span>}
              {speaker  && <span className="meta-item">{speaker}</span>}
            </div>
          </div>

          {/* ── Cyan stripe ── */}
          <div className="accent-stripe" />

          {/* ── Body ── */}
          <div className="body">

            {/* Action buttons — screen only */}
            <div className="no-print" style={{ float: "right", marginLeft: "1.5rem", marginBottom: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <a
                href={`/sermons/${slug}/notes/pdf`}
                download
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "linear-gradient(135deg, #00205B 0%, #0a2d6e 100%)",
                  padding: "0.6rem 1.1rem",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(0,32,91,0.25)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
                </svg>
                Download PDF
              </a>
              <PrintButton />
            </div>

            {/* Passage callout */}
            {passage && (
              <div className="passage-callout">
                <span className="passage-label">Key Passage</span>
                <span className="passage-text">{passage}</span>
              </div>
            )}

            {/* Section label */}
            <div className="section-label">Message Notes</div>

            {/* Outline points */}
            {outline.length > 0 ? (
              <div className="outline-list">
                {outline.map((point, i) => (
                  <div className="outline-item" key={i}>
                    <div className={`outline-number${outlineType === "scripture" ? " scripture" : ""}`}>
                      {outlineType === "scripture" ? "—" : i + 1}
                    </div>
                    <div className="outline-content">
                      <div className="outline-point">{point}</div>
                      <div className="ruled-lines">
                        <div className="rule" />
                        <div className="rule" />
                        <div className="rule" />
                        <div className="rule" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No outline — open writing space */
              <div className="blank-section">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div className="rule" key={i} />
                ))}
              </div>
            )}

            {/* Additional notes section */}
            <div className="additional-notes">
              <div className="section-label">Additional Notes</div>
              <div className="blank-section">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="rule" key={i} />
                ))}
              </div>
            </div>

            {/* Key phrases */}
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
            <div className="footer">
              <div className="footer-left">
                <span className="footer-church">Brainerd Baptist Church</span>
                <span className="footer-address">300 Brookfield Ave · Chattanooga, TN · Sundays 8:30 & 11:00 AM</span>
              </div>
              <a
                href="https://brainerdbaptist.org"
                className="footer-url no-print"
              >
                brainerdbaptist.org
              </a>
              <span className="footer-address" style={{ display: "none" }}>brainerdbaptist.org</span>
            </div>
          </div>
        </div>

        {/* ── Screen-only toolbar ── */}
        <div className="screen-toolbar no-print">
          <a href={`/sermons/${slug}`} className="back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            Back to sermon
          </a>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {audioUrl && (
              <a
                href={audioUrl}
                download
                style={{ fontSize: "0.75rem", color: "rgba(0,32,91,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem" }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
                </svg>
                Audio
              </a>
            )}
            <a
              href={`/sermons/${slug}/notes/pdf`}
              download
              style={{ fontSize: "0.75rem", color: "rgba(0,32,91,0.4)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.375rem" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10"/>
              </svg>
              PDF
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
