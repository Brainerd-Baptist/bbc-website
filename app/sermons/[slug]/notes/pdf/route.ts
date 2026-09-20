/**
 * GET /sermons/[slug]/notes/pdf
 *
 * Generates and streams a branded sermon notes PDF using @react-pdf/renderer.
 * No headless browser required — pure serverless-safe PDF generation.
 */

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer, Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getSermonBySlug } from "@/lib/sanity";
import { getSermonNotesByDate } from "@/lib/sermon";

export const dynamic = "force-dynamic";

// ── Brand colours ──────────────────────────────────────────────────────────
const NAVY  = "#00205B";
const CYAN  = "#00abc9";
const GREY  = "#8494a9";
const RULE  = "#d4dae3";
const WHITE = "#ffffff";

// ── Styles ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: WHITE,
    paddingBottom: 48,
  },

  // Header band
  header: {
    backgroundColor: NAVY,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 48,
  },
  churchName: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sermonTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    lineHeight: 1.1,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaItem: {
    fontSize: 8.5,
    color: "rgba(255,255,255,0.55)",
  },
  metaSep: {
    fontSize: 8.5,
    color: "rgba(255,255,255,0.25)",
    marginHorizontal: 4,
  },

  // Cyan accent stripe
  stripe: {
    height: 4,
    backgroundColor: CYAN,
  },

  // Body
  body: {
    paddingHorizontal: 48,
    paddingTop: 28,
  },

  // Passage callout
  passageBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,171,201,0.3)",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 24,
    backgroundColor: "rgba(0,171,201,0.06)",
    alignSelf: "flex-start",
  },
  passageLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: GREY,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginRight: 8,
  },
  passageText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },

  // Section label
  sectionLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  // Outline items
  outlineList: {
    gap: 20,
  },
  outlineItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  outlineNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  outlineNumberText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  outlineNumberCircleScripture: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(0,32,91,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  outlineNumberDash: {
    fontSize: 8,
    color: GREY,
  },
  outlineContent: {
    flex: 1,
  },
  outlinePoint: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  ruleLines: {
    gap: 8,
  },
  ruleLine: {
    height: 0.75,
    backgroundColor: RULE,
  },

  // Blank lines (no outline)
  blankLines: {
    gap: 10,
  },

  // Additional notes section
  additionalNotes: {
    marginTop: 28,
  },

  // Key phrases
  keyPhrases: {
    marginTop: 28,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: RULE,
  },
  phraseItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  phraseAccent: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    marginTop: 0,
  },
  phraseText: {
    fontSize: 9,
    color: GREY,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.5,
    flex: 1,
  },

  // Footer
  footer: {
    marginTop: 32,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: RULE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerChurch: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  footerAddress: {
    fontSize: 7,
    color: GREY,
  },
  footerUrl: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
  },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function RuleLines({ count = 4 }: { count?: number }) {
  return React.createElement(
    View,
    { style: s.ruleLines },
    ...Array.from({ length: count }).map((_, i) =>
      React.createElement(View, { key: i, style: s.ruleLine })
    )
  );
}

// ── PDF Document ────────────────────────────────────────────────────────────

function SermonNotesPDF({
  title,
  series,
  passage,
  speaker,
  formattedDate,
  outline,
  outlineType,
  highlights,
}: {
  title: string;
  series: string;
  passage: string;
  speaker: string;
  formattedDate: string;
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  highlights: string[];
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
        React.createElement(Text, { style: s.churchName }, "Brainerd Baptist Church"),
        React.createElement(Text, { style: s.sermonTitle }, title),
        metaParts.length > 0 &&
          React.createElement(
            View,
            { style: s.metaRow },
            ...metaParts.map((part, i) =>
              React.createElement(
                React.Fragment,
                { key: i },
                i > 0 && React.createElement(Text, { style: s.metaSep }, "·"),
                React.createElement(Text, { style: s.metaItem }, part)
              )
            )
          )
      ),

      // ── Cyan stripe ──
      React.createElement(View, { style: s.stripe }),

      // ── Body ──
      React.createElement(
        View,
        { style: s.body },

        // Passage callout
        passage &&
          React.createElement(
            View,
            { style: s.passageBox },
            React.createElement(Text, { style: s.passageLabel }, "Key Passage"),
            React.createElement(Text, { style: s.passageText }, passage)
          ),

        // Section label
        React.createElement(Text, { style: s.sectionLabel }, "Message Notes"),

        // Outline or blank lines
        outline.length > 0
          ? React.createElement(
              View,
              { style: s.outlineList },
              ...outline.map((point, i) =>
                React.createElement(
                  View,
                  { key: i, style: s.outlineItem },
                  outlineType === "scripture"
                    ? React.createElement(
                        View,
                        { style: s.outlineNumberCircleScripture },
                        React.createElement(Text, { style: s.outlineNumberDash }, "—")
                      )
                    : React.createElement(
                        View,
                        { style: s.outlineNumberCircle },
                        React.createElement(Text, { style: s.outlineNumberText }, `${i + 1}`)
                      ),
                  React.createElement(
                    View,
                    { style: s.outlineContent },
                    React.createElement(Text, { style: s.outlinePoint }, point),
                    React.createElement(RuleLines, { count: 4 })
                  )
                )
              )
            )
          : React.createElement(
              View,
              { style: s.blankLines },
              ...Array.from({ length: 12 }).map((_, i) =>
                React.createElement(View, { key: i, style: s.ruleLine })
              )
            ),

        // Additional notes
        React.createElement(
          View,
          { style: s.additionalNotes },
          React.createElement(Text, { style: s.sectionLabel }, "Additional Notes"),
          React.createElement(
            View,
            { style: s.blankLines },
            ...Array.from({ length: 8 }).map((_, i) =>
              React.createElement(View, { key: i, style: s.ruleLine })
            )
          )
        ),

        // Key phrases
        highlights.length > 0 &&
          React.createElement(
            View,
            { style: s.keyPhrases },
            React.createElement(Text, { style: s.sectionLabel }, "Key Phrases"),
            ...highlights.map((phrase, i) =>
              React.createElement(
                View,
                { key: i, style: s.phraseItem },
                React.createElement(Text, { style: s.phraseAccent }, "›"),
                React.createElement(Text, { style: s.phraseText }, phrase)
              )
            )
          ),

        // Footer
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
    )
  );
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Resolve sermon metadata
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
    if (!staticS) {
      return new NextResponse("Sermon not found", { status: 404 });
    }
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

  const formattedDate = date ? formatDate(date) : "";

  // Generate PDF buffer
  const buffer = await renderToBuffer(
    React.createElement(SermonNotesPDF, {
      title,
      series,
      passage,
      speaker,
      formattedDate,
      outline,
      outlineType,
      highlights,
    })
  );

  // Safe filename
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60);
  const filename  = `${safeTitle}-notes.pdf`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
