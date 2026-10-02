/**
 * lib/sermon.ts
 *
 * Shared server-side fetcher for the latest sermon data.
 *
 * Source 1 — Google Drive folder (Curtis drops docs weekly):
 *   Filename format: "YYYY MM DD – Title – Passage"
 *   For .docx files: downloads binary, extracts text via mammoth, generates
 *   outline with Claude API.
 *   For native Google Docs: exports as plain text and parses outline locally.
 *   Auth: a Google service account (lib/google-auth.ts), authorized against
 *   Curtis's real "Sermon Notes" folders below. Those folders are shared
 *   with named people only (not "Anyone with the link"), so this reads via
 *   an authenticated identity the folders are explicitly shared with —
 *   NOT a bare API key, which only works on link-public folders. See
 *   claude/sermon-notes-drive-folder-mismatch-2026-10-02.md for why this
 *   matters: an earlier version of this file silently pointed at a
 *   one-time manual duplicate of Curtis's folder (made to work around this
 *   exact permissions gap with the old API-key approach), which stopped
 *   getting new sermons the moment it was copied.
 *
 * Source 2 — YouTube RSS feed (no API key needed):
 *   Returns the channel's most recently uploaded video ID.
 */

import { getDriveAccessToken } from "./google-auth";
import { getTaggingRowByDate } from "./sermon-tagging";
// Re-exported for existing server-side importers — the values themselves
// now live in lib/sermon-shared.ts (a zero-dependency module) so a "use
// client" component can import them directly without pulling in
// google-auth-library (and its Node-only child_process dependency) via this
// file. See that file's doc comment for why this split exists.
export { YOUTUBE_CHANNEL_ID, formatSermonDate } from "./sermon-shared";
// Curated "Sermons" playlist — the homepage card should only ever pull from
// this, never from the channel's full upload feed (which includes clips,
// announcements, and anything else posted to the channel).
export const YOUTUBE_SERMONS_PLAYLIST_ID = "PLmi1s4e0rk_5Mm_vS6JWamVhtkrhfpKt7";

// Curtis's real, live "Sermon Notes" Drive folders — confirmed 2026-10-02 via
// the Drive connector (filenames + owners match Curtis's actual weekly
// workflow). Josiah has writer access to both as of 2026-10-02.
const DRIVE_FOLDER_ID = "1DssOoq5Yn9W1nEeHAxasG12kyX4iL05a"; // 2026 (current year)

export interface SermonData {
  title: string;
  passage: string;
  speaker: string;
  /** Series name, e.g. "Not a Straight Line" — from the Tagging sheet only;
   * there's no other source that reliably knows this. Empty when the sheet
   * has no row yet for this date (e.g. this week's sermon, tagged later). */
  series: string;
  /** Series part/number as the sheet wrote it, e.g. "Part 8" or "8". Empty
   * for standalone sermons (Bookmarks) or when not yet tagged. */
  part: string;
  /** Written summary paragraph from the Tagging sheet's SERMON SUMMARY
   * column. Empty when not yet tagged. */
  summary: string;
  date: string;           // "YYYY-MM-DD"
  youtubeId: string | null;
  watchUrl: string;
  /** True when watchUrl is an internal /sermons/[slug] path rather than an
   * external YouTube link — lets the homepage render it as a normal in-app
   * link (and eventually an inline player) instead of opening a new tab. */
  watchUrlIsInternal: boolean;
  thumbnail: string | null;
  outline: string[];      // parsed outline points from Curtis's doc
  outlineType: "structured" | "scripture" | "none";
}

/**
 * Finds the /sermons/[slug] page for a given YouTube video ID, so the
 * homepage's "latest sermon" card can send people to the actual sermon
 * page (which plays inline, has notes/outline tabs, etc.) instead of
 * bouncing them out to YouTube. Checks Sanity first, then the static
 * fallback library — same source order every other sermon lookup uses.
 */
async function findSlugForYoutubeId(youtubeId: string): Promise<string | null> {
  try {
    const { getAllSermons } = await import("./sanity");
    const all = await getAllSermons();
    const match = all.find((s) => s.youtubeId === youtubeId);
    if (match?.slug?.current) return match.slug.current;
  } catch {
    // fall through to static
  }

  const { SERMONS } = await import("./sermons");
  const staticMatch = SERMONS.find((s) => s.youtubeId === youtubeId);
  return staticMatch?.id ?? null;
}


/**
 * Parse Curtis's filename convention:
 *   "2026 09 20 – Named and Known – Selected Scriptures"
 *   Separator: space + en dash (U+2013) + space
 */
function parseSermonFilename(
  filename: string,
): { title: string; passage: string; date: string } | null {
  const name = filename.replace(/\.\w+$/, "").trim();
  const parts = name.split(" – ");
  if (parts.length < 3) return null;

  const datePart = parts[0].trim();
  const title    = parts[1].trim();
  const passage  = parts.slice(2).join(" – ").trim();

  const m = datePart.match(/^(\d{4})\s+(\d{2})\s+(\d{2})$/);
  if (!m) return null;

  return { title, passage, date: `${m[1]}-${m[2]}-${m[3]}` };
}

/**
 * Parse structured outline points: Roman numerals, section headers, all-caps headings.
 * This works for typical expository/topical sermons with explicit outline formatting.
 */
function parseStructuredOutline(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const results: string[] = [];

  const ROMAN  = /^(I{1,3}|IV|V|VI{0,3}|IX|X)\s*[.:]\s+/i;
  const HEADER = /^(INTRODUCTION|CONCLUSION|APPLICATION|TRANSITION|SUMMARY|MAIN\s+POINT|POINT\s+[IVX\d]+)\b/i;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length > 120) continue;

    if (ROMAN.test(line) || HEADER.test(line)) {
      results.push(line.replace(/\s*\(vv?\.\s*[\d–\-]+\)/i, "").trim());
      continue;
    }

    // Skip stage directions: (SERIES SLIDE), (VIDEO), (TRANSITION), etc.
    if (/^\(.*\)$/.test(line)) continue;

    const alpha = line.replace(/[^A-Za-z]/g, "");
    if (
      line.length >= 4 &&
      line.length <= 80 &&
      alpha.length > 0 &&
      alpha === alpha.toUpperCase() &&
      !/^\d/.test(line)
    ) {
      results.push(line);
    }
  }

  return results;
}

/**
 * Fallback for narrative/topical sermons: extract scripture references as a
 * "Scripture Journey" — the passages Curtis walks through become the outline.
 *
 * Matches lines starting with a Bible citation like "Genesis 46:6–8 …"
 * and extracts just the reference (e.g. "Genesis 46:6–8").
 */
function parseScriptureJourney(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const results: string[] = [];
  const seen = new Set<string>();

  // Matches: optional "1-3 " prefix + capitalized book name + chapter:verse[-verse]
  const REF = /^([1-3]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+:\d+(?:[–\-]\d+)?)/;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const m = REF.exec(line);
    if (m) {
      const ref = `${m[1].trim()} ${m[2]}`;
      if (!seen.has(ref)) {
        seen.add(ref);
        results.push(ref);
      }
    }
  }

  return results;
}

/**
 * Main outline parser — tries structured first, falls back to scripture journey.
 */
export function parseOutline(text: string): { items: string[]; type: "structured" | "scripture" | "none" } {
  const structured = parseStructuredOutline(text);
  if (structured.length >= 2) return { items: structured, type: "structured" };

  const scripture = parseScriptureJourney(text);
  if (scripture.length >= 2) return { items: scripture, type: "scripture" };

  return { items: [], type: "none" };
}

/**
 * Use Claude API to generate a clean sermon outline from raw text.
 * Returns 3–5 outline points as concise phrases.
 * Falls back to empty array if the API key is missing or the call fails.
 */
async function generateOutlineWithAI(rawText: string): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  // Trim the text so we don't blow the token budget
  const excerpt = rawText.slice(0, 6000).trim();
  if (excerpt.length < 100) return [];

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `You are summarizing a pastor's sermon notes. Extract 3–5 main outline points as short, clear phrases (not full sentences). Each point should capture a key idea or movement in the sermon.

Rules:
- Skip stage directions like (SERIES SLIDE), (VIDEO), (TRANSITION), (OPEN), (CLOSE), or any line in parentheses
- Skip tech/production cues, announcements, or anything not a sermon content point
- Return ONLY the sermon content points, one per line, no numbering, no bullets, no explanation

Sermon notes:
${excerpt}`,
          },
        ],
      }),
      next: { revalidate: 86400 }, // cache for 24h — sermon notes don't change
    } as RequestInit);

    if (!res.ok) return [];

    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "";
    return text
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && l.length < 120)
      .slice(0, 5);
  } catch {
    return [];
  }
}

// ── Drive API ─────────────────────────────────────────────────────────────────

interface DriveResult {
  title: string;
  passage: string;
  date: string;
  fileId: string;
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
}

/**
 * Fetch & parse a Google Doc from Curtis's folder.
 * Pass overrideFileId to load a specific sermon (for testing/preview).
 * Otherwise loads the most recently modified doc in the folder.
 */
async function getLatestFromDrive(overrideFileId?: string): Promise<DriveResult | null> {
  const token = await getDriveAccessToken();
  if (!token) {
    console.warn("[sermon] GOOGLE_SERVICE_ACCOUNT_KEY not set (or auth failed) — skipping Drive fetch");
    return null;
  }
  const authHeaders = { Authorization: `Bearer ${token}` };

  try {
    let fileId = overrideFileId ?? "";
    let parsed: ReturnType<typeof parseSermonFilename> | null = null;

    if (!overrideFileId) {
      // 1a. List files sorted by name desc (most recent date first)
      // Files are .docx (Word format), not native Google Docs
      const q = encodeURIComponent(
        `'${DRIVE_FOLDER_ID}' in parents and (mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType='application/vnd.google-apps.document')`,
      );
      const fields = encodeURIComponent("files(id,name)");
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=name+desc&pageSize=3&fields=${fields}`;

      const listRes = await fetch(listUrl, { headers: authHeaders, next: { revalidate: 3600 } });
      if (!listRes.ok) {
        console.error("[sermon] Drive list error:", listRes.status);
        return null;
      }

      const listJson = await listRes.json();
      const files: Array<{ id: string; name: string }> = listJson.files ?? [];

      for (const file of files) {
        const p = parseSermonFilename(file.name);
        if (p) { parsed = p; fileId = file.id; break; }
      }
      if (!parsed || !fileId) return null;
    } else {
      // 1b. Fetch metadata for the specific file to get its name
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name`;
      const metaRes = await fetch(metaUrl, { headers: authHeaders, cache: "no-store" });
      if (!metaRes.ok) {
        console.error("[sermon] Drive metadata error:", metaRes.status);
        return null;
      }
      const meta: { id: string; name: string } = await metaRes.json();
      parsed = parseSermonFilename(meta.name);
      if (!parsed) return null;
    }

    // 2. Try to get doc content for outline parsing
    const cache = overrideFileId ? "no-store" : undefined;
    let outline: string[] = [];
    let outlineType: "structured" | "scripture" | "none" = "none";
    try {
      // Try Google Docs export first (works if file is native Google Doc)
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`;
      const exportRes = await fetch(exportUrl, { headers: authHeaders, ...(cache ? { cache } : { next: { revalidate: 3600 } }) });
      if (exportRes.ok) {
        const result = parseOutline(await exportRes.text());
        outline = result.items;
        outlineType = result.type;
      } else {
        // Not a native Google Doc — try downloading as .docx binary
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const dlRes = await fetch(downloadUrl, { headers: authHeaders, ...(cache ? { cache } : { next: { revalidate: 3600 } }) });
        if (dlRes.ok) {
          const buffer = await dlRes.arrayBuffer();
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const mammoth = require("mammoth");
          const { value: rawText } = await mammoth.extractRawText({ buffer });
          if (rawText && rawText.trim().length >= 50) {
            const parsed = parseOutline(rawText);
            if (parsed.items.length >= 2) {
              outline = parsed.items;
              outlineType = parsed.type;
            } else {
              const aiItems = await generateOutlineWithAI(rawText);
              if (aiItems.length > 0) { outline = aiItems; outlineType = "structured"; }
            }
          }
        }
      }
    } catch {
      // Outline parsing failed; title/date/passage still come from the filename
    }

    return { ...parsed, fileId, outline, outlineType };
  } catch (err) {
    console.error("[sermon] Drive fetch error:", err);
    return null;
  }
}

// ── YouTube RSS ───────────────────────────────────────────────────────────────

/**
 * Fetch the most recent video ID from the curated "Sermons" playlist's public
 * RSS feed — NOT the channel's general upload feed. The channel feed includes
 * every video posted (clips, announcements, etc.), which previously let an
 * unrelated upload outrank the actual latest sermon on the homepage.
 */
async function getLatestYouTubeId(): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_SERMONS_PLAYLIST_ID}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const xml   = await res.text();
    const match = xml.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    return match?.[1] ?? null;
  } catch (err) {
    console.error("[sermon] YouTube playlist RSS fetch error:", err);
    return null;
  }
}

// ── Notes by date (sermon detail page) ───────────────────────────────────────

/**
 * Strip HTML tags from a string, returning plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

/**
 * Parse yellow-highlighted spans from Google Docs HTML export.
 * Matches background-color: #ffff00, #ffff02, rgb(255,255,0), rgb(255,255,2), yellow.
 */
function parseHighlights(html: string): string[] {
  const HIGHLIGHT_RE = /<span[^>]*style="[^"]*background-color\s*:\s*(?:#ffff0[02]|rgb\(255\s*,\s*255\s*,\s*[02]\)|yellow)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  const seen = new Set<string>();
  const results: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = HIGHLIGHT_RE.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text.length >= 4 && !seen.has(text)) {
      seen.add(text);
      results.push(text);
    }
  }

  return results;
}

/**
 * Look up Curtis's notes for a specific sermon date.
 * Searches Drive for a doc whose filename starts with "YYYY MM DD".
 * Returns outline, outlineType, rawText, and highlights for the Notes tab.
 */
export async function getSermonNotesByDate(date: string): Promise<{
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
  highlights: string[];
} | null> {
  const token = await getDriveAccessToken();
  if (!token) return null;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // "2026-09-20" → "2026 09 20"
  const datePart = date.replace(/-/g, " ");
  // Determine which subfolder to search based on year. These are Curtis's
  // real, live "Sermon Notes" folders (see the file header comment above).
  const year = date.slice(0, 4);
  const subfolderMap: Record<string, string> = {
    "2026": "1DssOoq5Yn9W1nEeHAxasG12kyX4iL05a",
    "2025": "1xBsIwdGJ3lLPrzTK09cbvztyoDZGBhPL",
  };
  const subfolderId = subfolderMap[year] ?? DRIVE_FOLDER_ID;

  try {
    const q = encodeURIComponent(
      `'${subfolderId}' in parents and name contains '${datePart}'`,
    );
    const fields = encodeURIComponent("files(id,name,mimeType)");
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=1&fields=${fields}`;

    const listRes = await fetch(listUrl, { headers: authHeaders, next: { revalidate: 3600 } });
    if (!listRes.ok) return null;

    const files: Array<{ id: string; name: string; mimeType: string }> = (await listRes.json()).files ?? [];
    if (files.length === 0) return null;

    const file = files[0];
    const isGoogleDoc = file.mimeType === "application/vnd.google-apps.document";

    // ── .docx path: download binary → mammoth → AI outline ───────────────────
    if (!isGoogleDoc) {
      try {
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
        const dlRes = await fetch(downloadUrl, { headers: authHeaders, next: { revalidate: 3600 } });
        if (!dlRes.ok) return { outline: [], outlineType: "none" as const, rawText: null, highlights: [] };

        const buffer = await dlRes.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require("mammoth");
        const { value: rawText } = await mammoth.extractRawText({ buffer });

        if (!rawText || rawText.trim().length < 50) {
          return { outline: [], outlineType: "none" as const, rawText: null, highlights: [] };
        }

        // Try regex-based parse first, then AI
        const parsed = parseOutline(rawText);
        if (parsed.items.length >= 2) {
          return { outline: parsed.items, outlineType: parsed.type, rawText: rawText.trim(), highlights: [] };
        }

        // Fall back to AI-generated outline
        const aiOutline = await generateOutlineWithAI(rawText);
        if (aiOutline.length > 0) {
          return { outline: aiOutline, outlineType: "structured" as const, rawText: rawText.trim(), highlights: [] };
        }

        return { outline: [], outlineType: "none" as const, rawText: rawText.trim(), highlights: [] };
      } catch {
        return { outline: [], outlineType: "none" as const, rawText: null, highlights: [] };
      }
    }

    const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text%2Fhtml`;
    const exportRes = await fetch(exportUrl, { headers: authHeaders, next: { revalidate: 3600 } });
    if (!exportRes.ok) return null;

    const html = await exportRes.text();
    const highlights = parseHighlights(html);
    const rawText = stripHtml(html);
    const { items: outline, type: outlineType } = parseOutline(rawText);

    return { outline, outlineType, rawText, highlights };
  } catch (err) {
    console.error("[sermon] getSermonNotesByDate error:", err);
    return null;
  }
}

// ── Primary export ────────────────────────────────────────────────────────────

/**
 * Builds the Drive+RSS-only SermonData shape — the original pairing, used
 * as a fallback when the YouTube Data API is unavailable (no key, or the
 * call failed) and for the overrideFileId preview path (checking a Drive
 * draft before it's been uploaded to YouTube at all).
 */
async function getFromDriveAndRss(overrideFileId?: string): Promise<SermonData> {
  const [drive, youtubeId] = await Promise.all([
    getLatestFromDrive(overrideFileId),
    getLatestYouTubeId(),
  ]);

  const slug = youtubeId ? await findSlugForYoutubeId(youtubeId) : null;
  const date = drive?.date ?? new Date().toISOString().slice(0, 10);

  // The Tagging sheet wins over Drive's filename-parsed title/passage too,
  // same precedence as the primary YouTube path below — it's Curtis's
  // hand-verified record, Drive's filename is just a best-effort parse.
  const tagging = await getTaggingRowByDate(date).catch(() => null);

  return {
    title:       tagging?.title     || drive?.title       || "Latest Sermon",
    passage:     tagging?.passage   || drive?.passage      || "",
    speaker:     tagging?.teacher   || "",
    series:      tagging?.series    ?? "",
    part:        tagging?.part      ?? "",
    summary:     tagging?.summary   ?? "",
    date,
    outline:     drive?.outline     ?? [],
    outlineType: drive?.outlineType ?? "none",
    youtubeId:   youtubeId          ?? null,
    watchUrl:    slug
      ? `/sermons/${slug}`
      : youtubeId
        ? `https://www.youtube.com/watch?v=${youtubeId}`
        : "https://www.youtube.com/@brainerdbaptist",
    watchUrlIsInternal: Boolean(slug),
    thumbnail:   youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : null,
  };
}

export async function getLatestSermon(overrideFileId?: string): Promise<SermonData> {
  // Preview mode: an explicit Drive file ID was passed (e.g. /live?fileId=...
  // to sanity-check a draft before it's uploaded) — Drive is the only
  // source that makes sense here, since the video may not exist on YouTube
  // yet at all.
  if (overrideFileId) {
    return getFromDriveAndRss(overrideFileId);
  }

  // Primary path: the YouTube video's own title is, for now, the only name
  // source that's guaranteed to be current. Curtis's Drive folder is
  // view-only for the person maintaining this site (no edit access yet to
  // fix names there), and Drive vs. YouTube can independently lag each
  // other by however long it takes a doc to land in the folder — which
  // previously showed up as the homepage card pairing last week's Drive
  // title with this week's YouTube thumbnail. So title/passage/speaker/date
  // now all come straight from the YouTube video via the Data API
  // (lib/youtube.ts), parsed from BBC's "Title (Passage) | Speaker"
  // convention. Revisit once the Drive folder has real edit access and
  // up-to-date names — see claude/ sermon pipeline notes.
  const { getLatestSermon: getLatestYouTubeSermon } = await import("./youtube");
  const yt = await getLatestYouTubeSermon();

  if (!yt) {
    // No YOUTUBE_API_KEY, or the call failed — fall back to the old
    // Drive + RSS pairing rather than showing nothing.
    return getFromDriveAndRss();
  }

  const date = yt.publishedAt.slice(0, 10);
  const slug = await findSlugForYoutubeId(yt.videoId);

  // Best-effort: attach Curtis's outline/notes for this exact date if his
  // doc has made it into Drive by now. Matched by date (not "most recent
  // file"), so a missing or out-of-sync doc just means no outline yet
  // rather than a mismatched one.
  let outline: string[] = [];
  let outlineType: "structured" | "scripture" | "none" = "none";
  try {
    const notes = await getSermonNotesByDate(date);
    if (notes) {
      outline = notes.outline;
      outlineType = notes.outlineType;
    }
  } catch {
    // no Drive doc for this date yet — fine, the YouTube title still stands
  }

  // The Tagging sheet is Curtis's hand-verified weekly record (series/part/
  // passage/teacher/summary) and wins over YouTube's title parsing whenever
  // a row exists for this date. Most weeks it won't exist yet for the sermon
  // that *just* aired (tagging happens after the fact), so this just fills
  // in gaps most of the time rather than overriding anything — but once the
  // row shows up, it becomes the source of truth. YouTube keeps the site from
  // showing nothing in the meantime.
  const tagging = await getTaggingRowByDate(date).catch(() => null);

  return {
    title:       tagging?.title   || yt.title || "Latest Sermon",
    passage:     tagging?.passage || yt.passage,
    speaker:     tagging?.teacher || yt.speaker,
    series:      tagging?.series  ?? "",
    part:        tagging?.part    ?? "",
    summary:     tagging?.summary ?? "",
    date,
    outline,
    outlineType,
    youtubeId:   yt.videoId,
    watchUrl:    slug ? `/sermons/${slug}` : `https://www.youtube.com/watch?v=${yt.videoId}`,
    watchUrlIsInternal: Boolean(slug),
    thumbnail:   yt.thumbnail,
  };
}
