/**
 * lib/sermon.ts
 *
 * Shared server-side fetcher for the latest sermon data.
 *
 * Source 1 — Google Drive folder (Curtis drops docs weekly):
 *   Filename format: "YYYY MM DD – Title – Passage"
 *   Exports doc as plain text to parse the sermon outline.
 *   Folder ID: 1DssOoq5Yn9W1nEeHAxasG12kyX4iL05a
 *   Auth: GOOGLE_API_KEY (folder must be "Anyone with link" → viewer)
 *
 * Source 2 — YouTube RSS feed (no API key needed):
 *   Returns the channel's most recently uploaded video ID.
 */

export const YOUTUBE_CHANNEL_ID = "UCEcu35yHidS8fQVwsoSP3zQ";

const DRIVE_FOLDER_ID = "1DssOoq5Yn9W1nEeHAxasG12kyX4iL05a";

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
function parseOutline(text: string): { items: string[]; type: "structured" | "scripture" | "none" } {
  const structured = parseStructuredOutline(text);
  if (structured.length >= 2) return { items: structured, type: "structured" };

  const scripture = parseScriptureJourney(text);
  if (scripture.length >= 2) return { items: scripture, type: "scripture" };

  return { items: [], type: "none" };
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
      const q = encodeURIComponent(
        `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
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

    // 2. Export the doc as plain text to extract the outline
    const cache = overrideFileId ? "no-store" : undefined;
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain&key=${key}`;
    const exportRes = await fetch(exportUrl, cache ? { cache } : { next: { revalidate: 3600 } });
    const { items: outline, type: outlineType } = exportRes.ok
      ? parseOutline(await exportRes.text())
      : { items: [], type: "none" as const };

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
