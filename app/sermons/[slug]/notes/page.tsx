/**
 * /sermons/[slug]/notes — Printable sermon notes
 *
 * Opens in a new tab. Shows outline points with ruled writing lines,
 * key phrases (highlights), and a print button. Designed to be saved
 * as PDF via Cmd+P / Ctrl+P → "Save as PDF".
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

// Ruled lines for note-taking under each outline point
function RuledLines({ count = 3 }: { count?: number }) {
  return (
    <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "1px",
            background: "rgba(0,32,91,0.13)",
            borderRadius: "1px",
          }}
        />
      ))}
    </div>
  );
}

export default async function SermonNotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try Sanity first, fall back to static
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

  // Load notes from Drive (outline + highlights)
  const notes = date ? await getSermonNotesByDate(date) : null;
  const outline: string[]   = notes?.outline    ?? [];
  const highlights: string[] = notes?.highlights ?? [];
  const outlineType = notes?.outlineType ?? "none";

  // Also check podcast for audio (so notes page can show audio duration context)
  let audioAvailable = false;
  if (date) {
    const podcastMap: Record<string, string> = await getPodcastAudioMap().catch(() => ({}));
    const key = dateToKey(date);
    const d = new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    const prevKey = dateToKey(d.toISOString().slice(0, 10));
    audioAvailable = !!(podcastMap[key] || podcastMap[prevKey]);
  }

  const formattedDate = date ? formatDate(date) : "";
  const sermonUrl = `https://brainerdbaptist.org/sermons/${slug}`;
  const hasContent = outline.length > 0 || highlights.length > 0;

  return (
    <>
      {/* Global print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0.75in; size: letter; }
        }
        @media screen {
          body { background: #e8ecf1; }
        }
      `}</style>

      {/* Screen wrapper */}
      <div style={{ minHeight: "100vh", padding: "2rem 1rem", fontFamily: "Georgia, 'Times New Roman', serif" }}>

        {/* Paper */}
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            background: "#fff",
            padding: "3rem 3.5rem 4rem",
            boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
            borderRadius: "4px",
            minHeight: "11in",
          }}
        >
          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "2px solid #00205B" }}>
            <div>
              {/* Church name */}
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00abc9", marginBottom: "0.25rem", fontFamily: "system-ui, sans-serif" }}>
                Brainerd Baptist Church
              </div>
              {/* Sermon title */}
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#00205B", margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em", fontFamily: "system-ui, sans-serif" }}>
                {title}
              </h1>
              {/* Meta row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0 1.25rem", marginTop: "0.5rem" }}>
                {series && <span style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.5)", fontFamily: "system-ui, sans-serif" }}>{series}</span>}
                {passage && (
                  <span style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.5)", fontFamily: "system-ui, sans-serif" }}>
                    {passage}
                  </span>
                )}
                {formattedDate && <span style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.5)", fontFamily: "system-ui, sans-serif" }}>{formattedDate}</span>}
                {speaker && <span style={{ fontSize: "0.8rem", color: "rgba(0,32,91,0.5)", fontFamily: "system-ui, sans-serif" }}>{speaker}</span>}
              </div>
            </div>

            {/* Print button — hidden in print */}
            <div className="no-print" style={{ marginLeft: "1rem", flexShrink: 0 }}>
              <PrintButton />
            </div>
          </div>

          {/* ── Message Notes heading ── */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00abc9", margin: "0 0 0.375rem", fontFamily: "system-ui, sans-serif" }}>
              Message Notes
            </p>
            <div style={{ height: "1px", background: "rgba(0,32,91,0.1)" }} />
          </div>

          {/* ── Outline points with writing lines ── */}
          {outline.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
              {outline.map((point, i) => (
                <div key={i}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#00abc9", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0, marginTop: "0.1rem", fontFamily: "system-ui, sans-serif" }}>
                      {outlineType === "scripture" ? "—" : `${i + 1}.`}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#00205B", fontWeight: 600, lineHeight: 1.4, fontFamily: "system-ui, sans-serif" }}>
                      {point}
                    </span>
                  </div>
                  <RuledLines count={4} />
                </div>
              ))}
            </div>
          ) : (
            /* No outline — just give blank writing space */
            <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <RuledLines count={4} />
                </div>
              ))}
            </div>
          )}

          {/* ── Extra free-write space ── */}
          <div style={{ marginTop: "3rem" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,32,91,0.3)", margin: "0 0 0.875rem", fontFamily: "system-ui, sans-serif" }}>
              Additional Notes
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: "1px", background: "rgba(0,32,91,0.1)" }} />
              ))}
            </div>
          </div>

          {/* ── Key phrases (highlights) ── */}
          {highlights.length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,32,91,0.1)" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00abc9", margin: "0 0 1rem", fontFamily: "system-ui, sans-serif" }}>
                Key Phrases
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {highlights.map((phrase, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "#00abc9", flexShrink: 0 }}>›</span>
                    <span style={{ color: "rgba(0,32,91,0.7)", fontStyle: "italic", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>{phrase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ marginTop: "4rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(0,32,91,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.65rem", color: "rgba(0,32,91,0.3)", fontFamily: "system-ui, sans-serif" }}>
              brainerdbaptist.org · 300 Brookfield Ave, Chattanooga, TN
            </span>
            <a
              href={sermonUrl}
              style={{ fontSize: "0.65rem", color: "rgba(0,32,91,0.3)", textDecoration: "none", fontFamily: "system-ui, sans-serif" }}
              className="no-print"
            >
              {audioAvailable ? "Listen to this message →" : "View this message →"}
            </a>
          </div>
        </div>

        {/* Screen-only back link */}
        <div className="no-print" style={{ maxWidth: "680px", margin: "1.25rem auto 0", textAlign: "center" }}>
          <a
            href={`/sermons/${slug}`}
            style={{ fontSize: "0.75rem", color: "rgba(0,32,91,0.4)", textDecoration: "none", fontFamily: "system-ui, sans-serif" }}
          >
            ← Back to sermon
          </a>
        </div>
      </div>
    </>
  );
}
