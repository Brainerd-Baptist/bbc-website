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
 *   Auth: GOOGLE_API_KEY (folder must be "Anyone with link" → viewer)
 *
 * Source 2 — YouTube RSS feed (no API key needed):
 *   Returns the channel's most recently uploaded video ID.
 */

export const YOUTUBE_CHANNEL_ID = "UCEcu35yHidS8fQVwsoSP3zQ";

// Root folder: 15eQjQeoGLB2MJ2RxDjLf9fmzN6TlFzSK
// 2025 subfolder: 1Lxs7IeOguQNdDF00lA_RvCoJeYddFqdu
// 2026 subfolder: 164EEh4JxBxgdUWTeNKTx6ahyFkf3dCPS
const DRIVE_FOLDER_ID = "164EEh4JxBxgdUWTeNKTx6ahyFkf3dCPS"; // current year

export interface SermonData {
  title: string;
  passage: string;
  date: string;           // "YYYY-MM-DD"
  youtubeId: string | null;
  watchUrl: string;
  thumbnail: string | null;
  outline: string[];      // parsed outline points from Curtis's doc
  outlineType: "structured" | "scripture" | "none";
}

/** Format a "YYYY-MM-DD" date string for display. */
export function formatSermonDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
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
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    console.warn("[sermon] GOOGLE_API_KEY not set — skipping Drive fetch");
    return null;
  }

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
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=name+desc&pageSize=3&fields=${fields}&key=${key}`;

      const listRes = await fetch(listUrl, { next: { revalidate: 3600 } });
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
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name&key=${key}`;
      const metaRes = await fetch(metaUrl, { cache: "no-store" });
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
      const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain&key=${key}`;
      const exportRes = await fetch(exportUrl, cache ? { cache } : { next: { revalidate: 3600 } });
      if (exportRes.ok) {
        const result = parseOutline(await exportRes.text());
        outline = result.items;
        outlineType = result.type;
      } else {
        // Not a native Google Doc — try downloading as .docx binary
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${key}`;
        const dlRes = await fetch(downloadUrl, cache ? { cache } : { next: { revalidate: 3600 } });
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

/** Fetch the most recently uploaded video ID from the public YouTube RSS feed. */
async function getLatestYouTubeId(): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const xml   = await res.text();
    const match = xml.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    return match?.[1] ?? null;
  } catch (err) {
    console.error("[sermon] YouTube RSS fetch error:", err);
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
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;

  // "2026-09-20" → "2026 09 20"
  const datePart = date.replace(/-/g, " ");
  // Determine which subfolder to search based on year
  const year = date.slice(0, 4);
  const subfolderMap: Record<string, string> = {
    "2026": "164EEh4JxBxgdUWTeNKTx6ahyFkf3dCPS",
    "2025": "1Lxs7IeOguQNdDF00lA_RvCoJeYddFqdu",
  };
  const subfolderId = subfolderMap[year] ?? DRIVE_FOLDER_ID;

  try {
    const q = encodeURIComponent(
      `'${subfolderId}' in parents and name contains '${datePart}'`,
    );
    const fields = encodeURIComponent("files(id,name,mimeType)");
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=1&fields=${fields}&key=${key}`;

    const listRes = await fetch(listUrl, { next: { revalidate: 3600 } });
    if (!listRes.ok) return null;

    const files: Array<{ id: string; name: string; mimeType: string }> = (await listRes.json()).files ?? [];
    if (files.length === 0) return null;

    const file = files[0];
    const isGoogleDoc = file.mimeType === "application/vnd.google-apps.document";

    // ── .docx path: download binary → mammoth → AI outline ───────────────────
    if (!isGoogleDoc) {
      try {
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${key}`;
        const dlRes = await fetch(downloadUrl, { next: { revalidate: 3600 } });
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

    const exportUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text%2Fhtml&key=${key}`;
    const exportRes = await fetch(exportUrl, { next: { revalidate: 3600 } });
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

export async function getLatestSermon(overrideFileId?: string): Promise<SermonData> {
  const [drive, youtubeId] = await Promise.all([
    getLatestFromDrive(overrideFileId),
    getLatestYouTubeId(),
  ]);

  return {
    title:       drive?.title       ?? "Latest Sermon",
    passage:     drive?.passage     ?? "",
    date:        drive?.date        ?? new Date().toISOString().slice(0, 10),
    outline:     drive?.outline     ?? [],
    outlineType: drive?.outlineType ?? "none",
    youtubeId:   youtubeId          ?? null,
    watchUrl:    youtubeId
      ? `https://www.youtube.com/watch?v=${youtubeId}`
      : "https://www.youtube.com/@brainerdbaptist",
    thumbnail:   youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : null,
  };
}
