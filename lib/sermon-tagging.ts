/**
 * lib/sermon-tagging.ts
 *
 * Reads Curtis's weekly "Sermon Tagging" Google Sheet — the hand-maintained
 * record he already keeps for podcast tagging — and uses it as the
 * authoritative source for series/part/passage/teacher/summary whenever a
 * row exists for a given sermon date. This is richer and more reliable than
 * parsing the YouTube video title: the sheet has an explicit Series/Part
 * column (which the site previously had no automatic way to determine at
 * all — series was always a manual Sanity field) plus a written summary
 * paragraph, neither of which YouTube's title text can give us.
 *
 * Only the "Tagging" tab is read — this is the completed, looked-back
 * record of sermons already delivered. The sheet's "Planning" tab (future
 * series/topic planning, sometimes weeks ahead of the pulpit) is
 * deliberately never read here: it can include not-yet-announced or
 * still-undecided content that shouldn't leak onto the live site.
 *
 * Auth: same service account as lib/google-auth.ts (Drive + Sheets scopes
 * share one JWT client). The sheet must be shared with that service
 * account's email as Viewer — confirmed done 2026-10-02.
 */

import { getDriveAccessToken } from "./google-auth";

const TAGGING_SHEET_ID = "1TYpJRJMy0hRGW7X74TSgD2jbFULjsOIynD9Ien2mh0A";
const TAGGING_TAB = "Tagging";

// Column order on the "Tagging" tab, A → I:
//   Date | Series | Part | Title | Text (passage) | Teacher | PODCAST/SERMON TAGGING | SERMON SUMMARY | LINK TO NOTES
const RANGE = `${TAGGING_TAB}!A:I`;

export interface TaggingRow {
  date: string; // "YYYY-MM-DD"
  series: string;
  part: string;
  title: string;
  passage: string;
  teacher: string;
  summary: string;
}

/** "8/10/2025" or "08/10/2025" → "2025-08-10". Returns null if unparseable. */
function normalizeSheetDate(raw: string): string | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  const [m, d, y] = parts.map((p) => parseInt(p, 10));
  if (!m || !d || !y) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

let cachedRows: TaggingRow[] | null = null;
let cachedAt = 0;
const CACHE_MS = 3600_000; // 1h — matches the Next.js revalidate window elsewhere in lib/sermon.ts

async function fetchTaggingRows(): Promise<TaggingRow[]> {
  const now = Date.now();
  if (cachedRows && now - cachedAt < CACHE_MS) return cachedRows;

  const token = await getDriveAccessToken();
  if (!token) return [];

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${TAGGING_SHEET_ID}/values/${encodeURIComponent(RANGE)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("[sermon-tagging] Sheets fetch error:", res.status);
      return cachedRows ?? [];
    }

    const { values } = (await res.json()) as { values?: string[][] };
    if (!values || values.length < 2) return [];

    const rows: TaggingRow[] = [];
    // values[0] is the header row — skip it.
    for (const row of values.slice(1)) {
      const [rawDate, series, part, title, passage, teacher, , summary] = row;
      if (!rawDate) continue;
      const date = normalizeSheetDate(rawDate);
      if (!date) continue;

      rows.push({
        date,
        series: (series ?? "").trim(),
        part: (part ?? "").trim(),
        title: (title ?? "").trim(),
        passage: (passage ?? "").trim(),
        teacher: (teacher ?? "").trim(),
        summary: (summary ?? "").trim(),
      });
    }

    cachedRows = rows;
    cachedAt = now;
    return rows;
  } catch (err) {
    console.error("[sermon-tagging] Sheets fetch error:", err);
    return cachedRows ?? [];
  }
}

/**
 * Looks up the Tagging sheet row for a specific sermon date ("YYYY-MM-DD").
 * Returns null if the sheet isn't configured, isn't reachable, or simply
 * has no row for that date yet (e.g. this week's sermon, tagged later).
 */
export async function getTaggingRowByDate(date: string): Promise<TaggingRow | null> {
  const rows = await fetchTaggingRows();
  return rows.find((r) => r.date === date) ?? null;
}
