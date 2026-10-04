/**
 * POST /api/notes/email
 *
 * Emails a user's own typed sermon notes back to themselves, as a real PDF
 * attachment generated from the same TipTap HTML the editor saves — this
 * replaces the old mailto: link on /live, which silently truncates long
 * notes in many mail clients because the whole body has to fit in a URL.
 *
 * Body: { to, title, series?, passage?, speaker?, formattedDate?, notesHtml }
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { NotesPDFDocument, htmlToNotesBlocks, notesBlocksHaveContent } from "@/lib/notes-pdf";
import { sendMail } from "@/lib/mail";
import { buildNotesEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const title = typeof body.title === "string" ? body.title : "";
  const notesHtml = typeof body.notesHtml === "string" ? body.notesHtml : "";

  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const series = typeof body.series === "string" ? body.series : "";
  const passage = typeof body.passage === "string" ? body.passage : "";
  const speaker = typeof body.speaker === "string" ? body.speaker : "";
  const formattedDate = typeof body.formattedDate === "string" ? body.formattedDate : "";
  const accentColor = typeof body.accentColor === "string" ? body.accentColor : undefined;

  const blocks = htmlToNotesBlocks(notesHtml);
  if (!notesBlocksHaveContent(blocks)) {
    return NextResponse.json({ error: "No notes to send yet" }, { status: 400 });
  }

  const buffer = await renderToBuffer(
    NotesPDFDocument({ title, series, passage, speaker, formattedDate, notesHtml }),
  );

  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60) || "sermon";

  const result = await sendMail({
    to,
    subject: `My Notes — ${title}`,
    text: `Your notes from "${title}"${formattedDate ? ` (${formattedDate})` : ""} are attached as a PDF.\n\nBrainerd Baptist Church\nbrainerdbaptist.org`,
    html: buildNotesEmailHtml({ title, series, passage, speaker, formattedDate, accentColor }),
    attachments: [{ filename: `${safeTitle}-my-notes.pdf`, content: Buffer.from(buffer) }],
  });

  if (!result.sent && !result.queued) {
    return NextResponse.json({ error: "Could not send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ...result });
}
