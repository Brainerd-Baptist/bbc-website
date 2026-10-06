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

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SITE = "https://brainerdbaptist.org";

/** Bulletproof centered button — background + radius on the <td>, a minimal
 * standards-only <a> (no MSO-only or duplicated properties: Gmail's mobile
 * app strips the whole style attribute if it sees those). Same pattern as the
 * Personnel/BX Reservations emails — see claude/bx-email-template-reference-2026-09-25.md. */
function buttonHtml(label: string, url: string, accentColor: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 4px;">
    <tr><td style="background:${accentColor};border-radius:8px;">
      <a href="${escStr(url)}" style="display:inline-block;color:#ffffff;font-family:${FONT};font-weight:700;font-size:15px;text-decoration:none;padding:13px 28px;">${escStr(label)}</a>
    </td></tr>
  </table>`;
}

/**
 * A single branded wrapper for any short transactional notice — body is
 * already-safe inline HTML (a handful of <p>/<a> tags), not user content.
 * Matches the shared Personnel / BX Reservations email look: logo header,
 * one font stack top to bottom, navy heading, Brainerd-blue accent used only
 * for the bar and the one button, a human sign-off.
 */
export function wrapEmailHtml({
  preheader,
  heading,
  bodyHtml,
  accentColor = "#00abc9",
  cta,
  footnoteHtml,
}: {
  /** Short hidden preview text shown in the inbox list, before the subject is opened. */
  preheader: string;
  heading: string;
  bodyHtml: string;
  accentColor?: string;
  /** One primary button under the body. */
  cta?: { label: string; url: string };
  /** Small muted line under the button, e.g. "Didn't send this? Just ignore it." Already-safe HTML. */
  footnoteHtml?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light"/>
<title>${escStr(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f8;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escStr(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f8;padding:32px 16px;font-family:${FONT};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${NAVY};padding:20px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:12px;vertical-align:middle;"><img src="${SITE}/email-logo.png" width="34" height="34" alt="" style="display:block;border:0;"/></td>
                <td style="vertical-align:middle;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">Brainerd Baptist Church</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 8px;">
              <div style="width:40px;height:4px;background:${accentColor};border-radius:2px;margin-bottom:20px;"></div>
              <h1 style="margin:0 0 18px;font-family:${FONT};font-size:22px;font-weight:700;color:${NAVY};letter-spacing:-0.01em;">
                ${escStr(heading)}
              </h1>
              <div style="font-family:${FONT};font-size:15px;line-height:1.65;color:#374151;">
                ${bodyHtml}
              </div>
              ${cta ? buttonHtml(cta.label, cta.url, accentColor) : ""}
              ${footnoteHtml ? `<p style="margin:16px 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:#6b7280;text-align:center;">${footnoteHtml}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;">
              <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-family:${FONT};">
                <p style="margin:0 0 12px;font-size:14px;color:#374151;">— The Brainerd Baptist team</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  Brainerd Baptist Church<br/>
                  300 Brookfield Ave, Chattanooga, TN 37411<br/>
                  <a href="${SITE}" style="color:#9ca3af;text-decoration:underline;">brainerdbaptist.org</a>
                </p>
              </div>
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
    cta: fromEmail ? { label: `Reply to ${fromName.split(" ")[0] || fromName}`, url: `mailto:${fromEmail}` } : undefined,
  });
}

/**
 * "We got your message" receipt sent back to the person who filled out a
 * contact form. Deliberately does NOT echo their message — this endpoint
 * sends to a visitor-supplied address, so the body stays fixed text to keep
 * it from being usable to deliver arbitrary content to someone else's inbox.
 */
export function buildContactConfirmationHtml({
  name,
  teamLabel,
  careful,
}: {
  name: string;
  /** Who received it, in plain words: "our Kids Ministry team", "Pastor Ethan". */
  teamLabel: string;
  /** Pastoral-care wording: gentler, and says what to do if it's urgent. */
  careful?: boolean;
}): string {
  const first = escStr(name.trim().split(" ")[0] || name.trim());
  const bodyHtml = careful
    ? `<p style="margin:0 0 14px;">Hi ${first} — we received your request, and it went straight to ${escStr(teamLabel)}. Someone will reach out to you personally.</p>
       <p style="margin:0 0 14px;">If this is an emergency, please call 911. If you need someone sooner, call the church office and tell them you sent a care request.</p>`
    : `<p style="margin:0 0 14px;">Hi ${first} — thanks for reaching out. Your message went to ${escStr(teamLabel)}, and someone will reply by email soon.</p>
       <p style="margin:0 0 14px;">You can reply to this email if you want to add anything.</p>`;
  return wrapEmailHtml({
    preheader: "We got your message — someone will be in touch.",
    heading: "We got your message",
    bodyHtml,
    cta: { label: "Visit brainerdbaptist.org", url: SITE },
    footnoteHtml: "Didn&#39;t send this? You can safely ignore this email.",
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
    ${series ? `<p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${accentColor ?? "#00abc9"};">${escStr(series)}</p>` : ""}
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
