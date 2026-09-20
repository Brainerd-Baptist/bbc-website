/**
 * lib/sermon.ts
 *
 * Shared server-side fetcher for the latest sermon data.
 *
 * Source 1 — Google Drive folder (Curtis drops docs weekly):
 *   Filename format: "YYYY MM DD – Title – Passage"
 *   Folder ID: 1DssOoq5Yn9W1nEeHAxasG12kyX4iL05a
 *   Auth: GOOGLE_API_KEY env var (folder must be "Anyone with link" → viewer)
 *
 * Source 2 — YouTube RSS feed (no API key needed):
 *   https://www.youtube.com/feeds/videos.xml?channel_id=...
 *   Returns the channel's most recently uploaded video ID.
 *
 * Used by:
 *   - components/home/SermonBand.tsx  (server component, direct import)
 *   - app/api/sermon/route.ts         (ISR-cached JSON for client components)
 *   - app/live/page.tsx               (live page server shell)
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
  // Remove file extension if present (e.g. .gdoc, .docx)
  const name = filename.replace(/\.\w+$/, "").trim();

  const parts = name.split(" – "); // en dash separator
  if (parts.length < 3) return null;

  const datePart = parts[0].trim();
  const title = parts[1].trim();
  const passage = parts.slice(2).join(" – ").trim();

  const m = datePart.match(/^(\d{4})\s+(\d{2})\s+(\d{2})$/);
  if (!m) return null;

  return {
    title,
    passage,
    date: `${m[1]}-${m[2]}-${m[3]}`,
  };
}

/** Fetch the most recently modified Google Doc from Curtis's folder. */
async function getLatestFromDrive(): Promise<{
  title: string;
  passage: string;
  date: string;
} | null> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    console.warn("[sermon] GOOGLE_API_KEY not set — skipping Drive fetch");
    return null;
  }

  try {
    const q = encodeURIComponent(
      `'${DRIVE_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
    );
    const fields = encodeURIComponent("files(name)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=name+desc&pageSize=3&fields=${fields}&key=${key}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[sermon] Drive API error:", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const files: Array<{ name: string }> = json.files ?? [];

    // Files are sorted by name desc ("2026 09 20…" sorts before "2026 09 13…")
    // Try each until one parses cleanly
    for (const file of files) {
      const parsed = parseSermonFilename(file.name);
      if (parsed) return parsed;
    }

    return null;
  } catch (err) {
    console.error("[sermon] Drive fetch error:", err);
    return null;
  }
}

/** Fetch the most recently uploaded video ID from the public YouTube RSS feed. */
async function getLatestYouTubeId(): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[sermon] YouTube RSS error:", res.status);
      return null;
    }

    const xml = await res.text();
    // First <yt:videoId> in the feed is the most recent upload
    const match = xml.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    return match?.[1] ?? null;
  } catch (err) {
    console.error("[sermon] YouTube RSS fetch error:", err);
    return null;
  }
}

/** Primary export — call from server components and API routes. */
export async function getLatestSermon(): Promise<SermonData> {
  const [drive, youtubeId] = await Promise.all([
    getLatestFromDrive(),
    getLatestYouTubeId(),
  ]);

  return {
    title: drive?.title ?? "Latest Sermon",
    passage: drive?.passage ?? "",
    date: drive?.date ?? new Date().toISOString().slice(0, 10),
    youtubeId: youtubeId ?? null,
    watchUrl: youtubeId
      ? `https://www.youtube.com/watch?v=${youtubeId}`
      : "https://www.youtube.com/@brainerdbaptist",
    thumbnail: youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
      : null,
  };
}
