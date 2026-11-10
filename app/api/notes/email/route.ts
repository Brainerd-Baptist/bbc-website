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
import { clientIp, overLimit } from "@/lib/guard";
import { buildNotesEmailHtml } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  // Sends mail from our domain to whatever address is typed in, so keep it tight:
  // a few per visitor, and only one note email per recipient address per hour.
  if (overLimit(`notes:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const title = typeof body.title === "string" ? body.title.slice(0, 200) : "";
  const notesHtml = typeof body.notesHtml === "string" ? body.notesHtml.slice(0, 200_000) : "";

  if (!EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (to.length > 254 || overLimit(`notes-to:${to.toLowerCase()}`, 1, 60 * 60_000)) {
    return NextResponse.json({ error: "A notes email was just sent to that address. Please try again later." }, { status: 429 });
  }

  const series = typeof body.series === "string" ? body.series.slice(0, 200) : "";
  const passage = typeof body.passage === "string" ? body.passage.slice(0, 200) : "";
  const speaker = typeof body.speaker === "string" ? body.speaker.slice(0, 200) : "";
  const formattedDate = typeof body.formattedDate === "string" ? body.formattedDate.slice(0, 200) : "";
  const accentColor = typeof body.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(body.accentColor) ? body.accentColor : undefined;

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
