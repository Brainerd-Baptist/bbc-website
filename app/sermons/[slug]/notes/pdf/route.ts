/**
 * GET  /sermons/[slug]/notes/pdf  — blank template PDF (no typed notes)
 * POST /sermons/[slug]/notes/pdf  — filled PDF with user's typed notes
 *
 * Ink-light design: white background, navy text/accents only.
 * No dark filled bands — minimal ink, maximum readability when printed.
 */

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getSermonBySlug } from "@/lib/sanity";
import { getSermonNotesByDate } from "@/lib/sermon";

export const dynamic = "force-dynamic";

// ── Brand tokens ────────────────────────────────────────────────────────────
const NAVY  = "#00205B";
const CYAN  = "#00abc9";
const GREY  = "#8494a9";
const RULE  = "#d8dde6";
const WHITE = "#ffffff";
const LIGHT = "#f5f7fa";

// ── Styles — ink-light ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: WHITE,
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 52,
  },

  // ── Header: white bg, navy top border, no filled band ──
  header: {
    borderTopWidth: 5,
    borderTopColor: NAVY,
    paddingTop: 18,
    paddingBottom: 14,
    marginBottom: 0,
  },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  churchEyebrow: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  metaSep: {
    fontSize: 7,
    color: "rgba(0,32,91,0.2)",
  },
  metaText: {
    fontSize: 7,
    color: "rgba(0,32,91,0.4)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sermonTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.1,
    letterSpacing: -0.3,
  },

  // ── Cyan stripe ──
  stripe: {
    height: 3,
    backgroundColor: CYAN,
    marginTop: 14,
    marginBottom: 20,
  },

  // ── Passage callout ──
  passageBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,171,201,0.22)",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginBottom: 20,
    backgroundColor: "rgba(0,171,201,0.05)",
    alignSelf: "flex-start",
  },
  passageLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: GREY,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginRight: 7,
  },
  passageText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },

  // ── Section label ──
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionLabelText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  sectionLabelLine: {
    flex: 1,
    height: 0.75,
    backgroundColor: "rgba(0,32,91,0.08)",
  },

  // ── Outline items ──
  outlineList: { gap: 18 },
  outlineItem: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  outlineCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  outlineCircleScripture: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(0,32,91,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  outlineNumber: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  outlineNumberScripture: {
    fontSize: 7.5,
    color: GREY,
  },
  outlineContent: { flex: 1 },
  outlinePoint: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.4,
    marginBottom: 6,
  },

  // ── Typed note area ──
  typedNoteBox: {
    backgroundColor: LIGHT,
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,171,201,0.3)",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  typedNoteText: {
    fontSize: 9,
    color: "#1a2a4a",
    lineHeight: 1.6,
  },

  // ── Rule lines (when no typed notes) ──
  ruleLines: { gap: 7 },
  ruleLine: { height: 0.75, backgroundColor: RULE },

  // ── Blank lines ──
  blankLines: { gap: 9 },

  // ── Additional notes ──
  additionalSection: { marginTop: 24 },
  additionalTypedBox: {
    backgroundColor: LIGHT,
    borderRadius: 3,
    padding: 10,
    minHeight: 48,
  },
  additionalTypedText: {
    fontSize: 9,
    color: "#1a2a4a",
    lineHeight: 1.6,
  },

  // ── Key phrases ──
  keyPhrases: {
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 0.75,
    borderTopColor: RULE,
  },
  phraseItem: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 7,
    alignItems: "flex-start",
  },
  phraseAccent: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
  },
  phraseText: {
    fontSize: 8.5,
    color: GREY,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.5,
    flex: 1,
  },

  // ── Footer ──
  footer: {
    marginTop: 28,
    paddingTop: 10,
    borderTopWidth: 0.75,
    borderTopColor: RULE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerChurch: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  footerAddress: { fontSize: 6.5, color: GREY },
  footerUrl: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: CYAN },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return React.createElement(
    View,
    { style: s.sectionLabelRow },
    React.createElement(Text, { style: s.sectionLabelText }, text),
    React.createElement(View, { style: s.sectionLabelLine })
  );
}

function RuleLines({ count = 4 }: { count?: number }) {
  return React.createElement(
    View,
    { style: s.ruleLines },
    ...Array.from({ length: count }).map((_, i) =>
      React.createElement(View, { key: i, style: s.ruleLine })
    )
  );
}

// ── PDF Document ─────────────────────────────────────────────────────────────

function SermonNotesPDF({
  title,
  series,
  passage,
  speaker,
  formattedDate,
  outline,
  outlineType,
  highlights,
  pointNotes,      // user-typed notes per outline point
  additionalNotes, // user-typed additional notes
}: {
  title: string;
  series: string;
  passage: string;
  speaker: string;
  formattedDate: string;
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  highlights: string[];
  pointNotes: string[];
  additionalNotes: string;
}) {
  const metaParts = [series, formattedDate, speaker].filter(Boolean);

  return React.createElement(
    Document,
    { title: `${title} — Message Notes`, author: "Brainerd Baptist Church" },
    React.createElement(
      Page,
      { size: "LETTER", style: s.page },

      // ── Header ──
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          { style: s.headerMetaRow },
          React.createElement(Text, { style: s.churchEyebrow }, "Brainerd Baptist Church"),
          ...metaParts.flatMap((part, i) => [
            React.createElement(Text, { key: `sep-${i}`, style: s.metaSep }, "·"),
            React.createElement(Text, { key: `part-${i}`, style: s.metaText }, part),
          ])
        ),
        React.createElement(Text, { style: s.sermonTitle }, title)
      ),

      // ── Cyan stripe ──
      React.createElement(View, { style: s.stripe }),

      // ── Passage ──
      passage &&
        React.createElement(
          View,
          { style: s.passageBox },
          React.createElement(Text, { style: s.passageLabel }, "Key Passage"),
          React.createElement(Text, { style: s.passageText }, passage)
        ),

      // ── Message Notes ──
      React.createElement(SectionLabel, { text: "Message Notes" }),

      outline.length > 0
        ? React.createElement(
            View,
            { style: s.outlineList },
            ...outline.map((point, i) => {
              const typed = (pointNotes[i] ?? "").trim();
              return React.createElement(
                View,
                { key: i, style: s.outlineItem },
                // Circle
                outlineType === "scripture"
                  ? React.createElement(
                      View,
                      { style: s.outlineCircleScripture },
                      React.createElement(Text, { style: s.outlineNumberScripture }, "—")
                    )
                  : React.createElement(
                      View,
                      { style: s.outlineCircle },
                      React.createElement(Text, { style: s.outlineNumber }, `${i + 1}`)
                    ),
                // Content
                React.createElement(
                  View,
                  { style: s.outlineContent },
                  React.createElement(Text, { style: s.outlinePoint }, point),
                  typed
                    ? React.createElement(
                        View,
                        { style: s.typedNoteBox },
                        React.createElement(Text, { style: s.typedNoteText }, typed)
                      )
                    : React.createElement(RuleLines, { count: 3 })
                )
              );
            })
          )
        : // No outline — blank lines or typed notes
          React.createElement(
            View,
            { style: s.blankLines },
            ...(pointNotes[0]?.trim()
              ? [React.createElement(
                  View,
                  { style: s.typedNoteBox },
                  React.createElement(Text, { style: s.typedNoteText }, pointNotes[0])
                )]
              : Array.from({ length: 14 }).map((_, i) =>
                  React.createElement(View, { key: i, style: s.ruleLine })
                ))
          ),

      // ── Additional Notes ──
      React.createElement(
        View,
        { style: s.additionalSection },
        React.createElement(SectionLabel, { text: "Additional Notes" }),
        additionalNotes.trim()
          ? React.createElement(
              View,
              { style: s.additionalTypedBox },
              React.createElement(Text, { style: s.additionalTypedText }, additionalNotes.trim())
            )
          : React.createElement(
              View,
              { style: s.blankLines },
              ...Array.from({ length: 8 }).map((_, i) =>
                React.createElement(View, { key: i, style: s.ruleLine })
              )
            )
      ),

      // ── Key phrases ──
      highlights.length > 0 &&
        React.createElement(
          View,
          { style: s.keyPhrases },
          React.createElement(SectionLabel, { text: "Key Phrases" }),
          ...highlights.map((phrase, i) =>
            React.createElement(
              View,
              { key: i, style: s.phraseItem },
              React.createElement(Text, { style: s.phraseAccent }, "›"),
              React.createElement(Text, { style: s.phraseText }, phrase)
            )
          )
        ),

      // ── Footer ──
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.footerChurch }, "Brainerd Baptist Church"),
          React.createElement(
            Text,
            { style: s.footerAddress },
            "300 Brookfield Ave · Chattanooga, TN · Sundays 8:30 & 11:00 AM"
          )
        ),
        React.createElement(Text, { style: s.footerUrl }, "brainerdbaptist.org")
      )
    )
  );
}

// ── Shared sermon resolver ───────────────────────────────────────────────────

async function resolveSermon(slug: string) {
  const sanitySermon = await getSermonBySlug(slug).catch(() => null);
  let title = "", series = "", passage = "", speaker = "", date = "";

  if (sanitySermon) {
    title   = sanitySermon.title   ?? "";
    series  = sanitySermon.series?.title ?? "";
    passage = sanitySermon.passage ?? "";
    speaker = sanitySermon.speaker ?? "";
    date    = sanitySermon.date    ?? "";
  } else {
    const staticS = SERMONS.find((s) => s.id === slug);
    if (!staticS) return null;
    title   = staticS.title;
    series  = staticS.series;
    passage = staticS.passage;
    speaker = staticS.speaker;
    date    = staticS.date;
  }

  const notes = date ? await getSermonNotesByDate(date) : null;
  const outline: string[]    = notes?.outline    ?? [];
  const highlights: string[] = notes?.highlights ?? [];
  const outlineType = (notes?.outlineType ?? "none") as "structured" | "scripture" | "none";
  const formattedDate = date ? formatDate(date) : "";

  return { title, series, passage, speaker, formattedDate, outline, highlights, outlineType };
}

async function buildPDF(
  slug: string,
  pointNotes: string[],
  additionalNotes: string
): Promise<NextResponse> {
  const sermon = await resolveSermon(slug);
  if (!sermon) {
    return new NextResponse("Sermon not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    React.createElement(SermonNotesPDF, {
      ...sermon,
      pointNotes,
      additionalNotes,
    })
  );

  const safeTitle = sermon.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60);
  const filename  = `${safeTitle}-notes.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// ── Route handlers ───────────────────────────────────────────────────────────

/** GET — blank template (no typed notes) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return buildPDF(slug, [], "");
}

/** POST — filled PDF with user's typed notes */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let pointNotes: string[] = [];
  let additionalNotes = "";

  try {
    const body = await req.json();
    if (Array.isArray(body.pointNotes)) {
      pointNotes = body.pointNotes.map((n: unknown) =>
        typeof n === "string" ? n : ""
      );
    }
    if (typeof body.additionalNotes === "string") {
      additionalNotes = body.additionalNotes;
    }
  } catch {
    // body parse failed — fall through with empty notes
  }

  return buildPDF(slug, pointNotes, additionalNotes);
}
