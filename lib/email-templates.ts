/**
 * lib/email-templates.ts
 *
 * Shared HTML wrapper for transactional emails sent via lib/mail.ts.
 *
 * sendMail() only ever got a `text` body before — fine for Resend's own
 * fallback rendering, but every mail client that prefers HTML (Gmail,
 * Apple Mail, Outlook) was left to invent its own default styling, which
 * is why the "My Notes" email reported 2026-10-04 looked like a bare,
 * oddly-wrapped text dump instead of anything resembling the site.
 *
 * Deliberately NOT the same markup as SermonNotes.tsx's buildPrintHTML
 * (the downloaded/printed notes page) — that one can use modern CSS
 * freely because it only ever opens in a real browser tab. Email HTML has
 * to survive Outlook's Word rendering engine and Gmail's stripped
 * <style> tags, so this stays to inline styles on table/td — the one
 * layout primitive every client agrees on — rather than flexbox, grid, or
 * external/```<style>``` blocks.
 */

function escStr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const NAVY = "#00205B";
const INK_MUTED = "rgba(0,32,91,0.55)";
const BORDER = "rgba(0,32,91,0.1)";

/**
 * A single branded wrapper for any short transactional notice — body is
 * already-safe inline HTML (a handful of <p>/<a> tags), not user content.
 */
export function wrapEmailHtml({
  preheader,
  heading,
  bodyHtml,
  accentColor = "#00abc9",
}: {
  /** Short hidden preview text shown in the inbox list, before the subject is opened. */
  preheader: string;
  heading: string;
  bodyHtml: string;
  accentColor?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>${escStr(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escStr(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${NAVY};padding:22px 32px;">
              <span style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">
                Brainerd Baptist Church
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              <div style="width:40px;height:4px;background:${accentColor};border-radius:2px;margin-bottom:20px;"></div>
              <h1 style="margin:0 0 18px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:22px;font-weight:800;color:${NAVY};letter-spacing:-0.3px;">
                ${escStr(heading)}
              </h1>
              <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.65;color:#20304f;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px;border-top:1px solid ${BORDER};margin-top:12px;">
              <p style="margin:20px 0 0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:12px;color:${INK_MUTED};">
                Brainerd Baptist Church · 300 Brookfield Ave, Chattanooga, TN 37411<br/>
                <a href="https://brainerdbaptist.org" style="color:${INK_MUTED};text-decoration:underline;">brainerdbaptist.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text message body → safe HTML paragraphs, one per blank-line-separated chunk, preserving single line breaks within a chunk as <br/>. */
function messageToHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 14px;">${escStr(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/**
 * Shared template for every /api/contact/* route's "someone submitted the
 * form" notification to a staff inbox — membership, general, staff, care,
 * missions, utility. One function so a future tweak to how these look
 * (or a future contact route) only has to change one place, same reason
 * wrapEmailHtml() itself is shared.
 */
export function buildContactNotificationHtml({
  heading,
  fromName,
  fromEmail,
  message,
  meta,
}: {
  /** Shown as the email's heading — usually the same text as the subject line, e.g. "Membership interest" or "Message from a visitor". */
  heading: string;
  fromName: string;
  /** Omitted for the rare care-request submission with no email on file. */
  fromEmail?: string;
  message: string;
  /** Extra label/value rows shown above the message — phone, category, interest, etc. Rendered in the order given. */
  meta?: { label: string; value: string }[];
}): string {
  const fromLine = fromEmail
    ? `${escStr(fromName)} — <a href="mailto:${escStr(fromEmail)}" style="color:${NAVY};">${escStr(fromEmail)}</a>`
    : escStr(fromName);

  const metaRows = (meta ?? [])
    .map(
      (m) =>
        `<tr><td style="padding:2px 10px 2px 0;color:${INK_MUTED};font-size:13px;white-space:nowrap;">${escStr(m.label)}</td><td style="padding:2px 0;color:${NAVY};font-size:13px;">${escStr(m.value)}</td></tr>`,
    )
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${INK_MUTED};">From</p>
    <p style="margin:0 0 16px;font-size:15px;">${fromLine}</p>
    ${metaRows ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">${metaRows}</table>` : ""}
    <div style="border-top:1px solid ${BORDER};padding-top:16px;">
      ${messageToHtml(message)}
    </div>
  `;

  return wrapEmailHtml({
    preheader: `${fromName}: ${message.slice(0, 120)}`,
    heading,
    bodyHtml,
  });
}

export function buildNotesEmailHtml({
  title, series, passage, speaker, formattedDate, accentColor,
}: {
  title: string; series?: string; passage?: string; speaker?: string;
  formattedDate?: string; accentColor?: string;
}): string {
  const metaParts = [formattedDate, speaker, passage].filter((s): s is string => Boolean(s)).map(escStr);
  const bodyHtml = `
    ${series ? `<p style="margin:0 0 4px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${accentColor ?? "#00abc9"};">${escStr(series)}</p>` : ""}
    <p style="margin:0 0 18px;font-weight:700;color:${NAVY};font-size:16px;">${escStr(title)}</p>
    ${metaParts.length ? `<p style="margin:0 0 18px;color:${INK_MUTED};font-size:13px;">${metaParts.join(" &nbsp;·&nbsp; ")}</p>` : ""}
    <p style="margin:0;">Your notes are attached as a PDF, ready to print, save, or read on your phone.</p>
  `;
  return wrapEmailHtml({
    preheader: `Your notes from "${title}" are attached.`,
    heading: "Your notes are ready",
    bodyHtml,
    accentColor,
  });
}
