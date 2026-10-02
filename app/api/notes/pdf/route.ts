/**
 * POST /api/notes/pdf
 *
 * Renders a user's typed rich-text sermon notes (from components/sermons/
 * SermonNotes.tsx) into a real downloadable PDF. Deliberately takes the
 * sermon's metadata directly in the request body instead of resolving it by
 * slug — this is what lets the exact same editor/export work on /live for a
 * sermon that just aired and doesn't have a /sermons/[slug] page yet.
 *
 * Body: { title, series?, passage?, speaker?, formattedDate?, notesHtml }
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { NotesPDFDocument } from "@/lib/notes-pdf";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title : "";
  const notesHtml = typeof body.notesHtml === "string" ? body.notesHtml : "";
  if (!title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const series = typeof body.series === "string" ? body.series : "";
  const passage = typeof body.passage === "string" ? body.passage : "";
  const speaker = typeof body.speaker === "string" ? body.speaker : "";
  const formattedDate = typeof body.formattedDate === "string" ? body.formattedDate : "";

  const buffer = await renderToBuffer(
    NotesPDFDocument({ title, series, passage, speaker, formattedDate, notesHtml }),
  );

  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60) || "sermon";
  const filename = `${safeTitle}-my-notes.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
