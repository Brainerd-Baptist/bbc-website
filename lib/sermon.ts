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
 * Parse a sermon outline from the exported plain-text Google Doc.
 *
 * Extracts heading lines that match Curtis's typical structure:
 *   - Roman-numeral points:  "I. TITLE" / "II. TITLE (vv. X-Y)"
 *   - Section headers:       "INTRODUCTION", "CONCLUSION", "APPLICATION"
 *   - All-caps short lines   that look like structural headings
 */
function parseOutline(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const results: string[] = [];

  // Patterns for outline lines
  const ROMAN  = /^(I{1,3}|IV|V|VI{0,3}|IX|X)\s*[.:]\s+/i;
  const HEADER = /^(INTRODUCTION|CONCLUSION|APPLICATION|TRANSITION|SUMMARY|MAIN\s+POINT|POINT\s+[IVX\d]+)\b/i;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length > 120) continue;

    if (ROMAN.test(line) || HEADER.test(line)) {
      // Clean up the line — remove (vv. X-Y) notation for cleaner display
      results.push(line.replace(/\s*\(vv?\.\s*[\d–\-]+\)/i, "").trim());
      continue;
    }

    // Catch short all-caps lines (e.g. "THE GREAT REVERSAL", "GOD'S FAITHFULNESS")
    // Must be at least 4 chars, no numbers, and mostly uppercase letters
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

// ── Drive API ─────────────────────────────────────────────────────────────────

interface DriveResult {
  title: string;
  passage: string;
  date: string;
  fileId: string;
  outline: string[];
}

/** Fetch & parse the most recently modified Google Doc from Curtis's folder. */
async function getLatestFromDrive(): Promise<DriveResult | null> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    console.warn("[sermon] GOOGLE_API_KEY not set — skipping Drive fetch");
    return null;
  }

  try {
    // 1. List files sorted by name desc (most recent date first)
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

    // Find the first file whose name parses correctly
    let parsed: ReturnType<typeof parseSermonFilename> | null = null;
    let fileId = "";
    for (const file of files) {
      const p = parseSermonFilename(file.name);
      if (p) { parsed = p; fileId = file.id; break; }
    }
    if (!parsed || !fileId) return null;

    // 2. Export the doc as plain text to extract the outline
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain&key=${key}`;
    const exportRes = await fetch(exportUrl, { next: { revalidate: 3600 } });
    const outline = exportRes.ok
      ? parseOutline(await exportRes.text())
      : [];

    return { ...parsed, fileId, outline };
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

export async function getLatestSermon(): Promise<SermonData> {
  const [drive, youtubeId] = await Promise.all([
    getLatestFromDrive(),
    getLatestYouTubeId(),
  ]);

  return {
    title:     drive?.title    ?? "Latest Sermon",
    passage:   drive?.passage  ?? "",
    date:      drive?.date     ?? new Date().toISOString().slice(0, 10),
    outline:   drive?.outline  ?? [],
    youtubeId: youtubeId       ?? null,
    watchUrl:  youtubeId
      ? `https://www.youtube.com/watch?v=${youtubeId}`
      : "https://www.youtube.com/@brainerdbaptist",
    thumbnail: youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : null,
  };
}
