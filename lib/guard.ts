// lib/guard.ts
//
// Abuse guards for the public form endpoints (contact, prayer, notes email,
// belief question, next step). Added after the 2026-11 security audit: none of
// these routes had rate limits, length caps or address checks, so they could be
// used to spam staff inboxes, send mail to strangers from our domain, or run up
// the Anthropic bill.
//
// The counters live in memory, per server instance. That is enough to stop a
// casual script or a runaway loop, but it resets on deploy/cold start and is not
// shared across instances — pair it with a Vercel Firewall rate-limit rule.

import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const EMAIL_RE = /^[^\s@,;<>]{1,64}@[^\s@,;<>]+\.[^\s@,;<>]+$/;

const hits = new Map<string, { n: number; reset: number }>();

/** True when this key has exceeded `max` hits inside `windowMs`. Counts the call. */
export function overLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now > h.reset) {
    hits.set(key, { n: 1, reset: now + windowMs });
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.reset) hits.delete(k);
      if (hits.size > 5000) hits.clear();
    }
    return false;
  }
  h.n += 1;
  return h.n > max;
}

export function clientIp(req: NextRequest | Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

type Parsed = { body: Record<string, unknown>; res?: undefined } | { body?: undefined; res: NextResponse };

/**
 * Rate-limit by IP, parse the JSON body safely, trim every top-level string to a
 * sane length, and reject a malformed email. Use at the top of a POST handler:
 *   const p = await parseForm(req, "contact", 5); if (p.res) return p.res;
 */
export async function parseForm(
  req: NextRequest,
  bucket: string,
  maxPerTenMin = 5,
  opts: { maxLen?: number; longFields?: Record<string, number> } = {},
): Promise<Parsed> {
  if (overLimit(`${bucket}:${clientIp(req)}`, maxPerTenMin, 10 * 60_000)) {
    return { res: NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 }) };
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { res: NextResponse.json({ error: "Invalid request body." }, { status: 400 }) };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { res: NextResponse.json({ error: "Invalid request body." }, { status: 400 }) };
  }
  const maxLen = opts.maxLen ?? 5000;
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const cap = opts.longFields?.[k] ?? (k === "email" ? 254 : /name|title|subject|phone|category|interest|ministry/i.test(k) ? 200 : maxLen);
    body[k] =
      typeof v === "string" ? v.slice(0, cap)
      : typeof v === "number" ? String(v).slice(0, cap)
      : Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 50).map((x: string) => x.slice(0, 100))
      : typeof v === "boolean" ? v
      : "";
  }
  const email = body.email;
  if (typeof email === "string" && email.trim() && !EMAIL_RE.test(email.trim())) {
    return { res: NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 }) };
  }
  return { body };
}

/** Constant-time check of an `Authorization: Bearer <secret>` header. */
export function bearerOk(header: string | null, secret: string): boolean {
  const d = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(d(header ?? ""), d(`Bearer ${secret}`));
}
