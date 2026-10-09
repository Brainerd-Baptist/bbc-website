/**
 * lib/resource-enrich.ts
 *
 * Best-effort metadata for a resource URL — author/creator and a short
 * description — so cards made from a bare Tagging-sheet link aren't empty.
 * Never throws and never blocks for long: every failure is just "nothing
 * found". Results are only ever written into EMPTY fields (creator,
 * autoSummary); a human-written blurb or creator is never touched, and the
 * resource stays `needsReview` so Studio still flags it.
 *
 * Retailers (Amazon etc.) usually serve bots a robot-check page; those are
 * detected and discarded rather than shown on a public page.
 */

export interface ResourceMeta {
  creator?: string;
  summary?: string;
}

const TIMEOUT_MS = 4000;
const MAX_BYTES = 250_000;

const BOT_PAGE = /robot check|captcha|are you a human|access denied|enable javascript|just a moment|sign in|log in|403 forbidden/i;

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ").trim();
}

function metaContent(html: string, key: string): string | undefined {
  const tag = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i").exec(html)?.[0];
  if (!tag) return undefined;
  const content = /content=["']([^"']*)["']/i.exec(tag)?.[1];
  return content ? decode(content) : undefined;
}

/** Pure HTML → metadata, exported for testing. */
export function parseMeta(html: string): ResourceMeta {
  const desc = metaContent(html, "og:description") ?? metaContent(html, "description");
  const author = metaContent(html, "author") ?? metaContent(html, "article:author");
  const out: ResourceMeta = {};
  if (desc && desc.length >= 40 && !BOT_PAGE.test(desc)) {
    out.summary = desc.length > 240 ? `${desc.slice(0, 237).trimEnd()}…` : desc;
  }
  // article:author is sometimes a profile URL, not a name.
  if (author && !/^https?:/i.test(author) && author.length <= 80 && !BOT_PAGE.test(author)) {
    out.creator = author;
  }
  return out;
}

async function timedFetch(url: string, init?: RequestInit): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, redirect: "follow", cache: "no-store" });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchResourceMeta(url: string): Promise<ResourceMeta> {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      const res = await timedFetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (!res?.ok) return {};
      const j = (await res.json()) as { author_name?: string };
      return j.author_name ? { creator: j.author_name } : {};
    }

    const res = await timedFetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BrainerdBaptistBot/1.0; +https://brainerdbaptist.org)", Accept: "text/html" },
    });
    if (!res?.ok || !(res.headers.get("content-type") ?? "").includes("html")) return {};
    const html = (await res.text()).slice(0, MAX_BYTES);
    return parseMeta(html);
  } catch {
    return {};
  }
}
