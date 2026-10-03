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
 *
 * Resources column (J): added by Curtis 2026-10-03 for the sermon resource
 * catalog (see claude/sermon-resource-catalog-scope-2026-10-03.md). He
 * enters one or more resources per week as real hyperlinks (Insert → Link)
 * over whatever text he likes ("his new book", a bare URL, etc.), one per
 * line in the same cell. Plain `values.get` only ever returns a cell's
 * displayed TEXT — it cannot see a hyperlink layered over that text at all.
 * Reading the real URLs out requires the richer `spreadsheets.get` endpoint
 * with grid data, which exposes each cell's `hyperlink` field (whole-cell
 * links, Curtis's primary flow) and `textFormatRuns[].format.link.uri`
 * (an inline-range link within a longer line, in case he ever links only
 * part of a line). This is a second, separate fetch from the plain-text one
 * below — grid data is a materially heavier response, so it's worth paying
 * for only on the one column that needs it.
 */

import { getDriveAccessToken } from "./google-auth";

const TAGGING_SHEET_ID = "1TYpJRJMy0hRGW7X74TSgD2jbFULjsOIynD9Ien2mh0A";
const TAGGING_TAB = "Tagging";

// Column order on the "Tagging" tab, A → J:
//   Date | Series | Part | Title | Text (passage) | Teacher | PODCAST/SERMON TAGGING | SERMON SUMMARY | LINK TO NOTES | RESOURCES
const RANGE = `${TAGGING_TAB}!A:I`;
const RESOURCES_RANGE = `${TAGGING_TAB}!J:J`;

export interface TaggingRow {
  date: string; // "YYYY-MM-DD"
  series: string;
  part: string;
  title: string;
  passage: string;
  teacher: string;
  summary: string;
  /** Real hyperlink URLs pulled from column J for this date, deduped. Empty
   * if the row has no resources, the grid-data fetch failed, or the date
   * has no Tagging row at all. */
  resourceUrls: string[];
}

/** "8/10/2025" or "08/10/2025" → "2025-08-10". Returns null if unparseable. */
function normalizeSheetDate(raw: string): string | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  const [m, d, y] = parts.map((p) => parseInt(p, 10));
  if (!m || !d || !y) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Pulls real hyperlink URLs out of column J via the grid-data endpoint,
 * keyed by 0-based ROW INDEX into the sheet (row 0 = header, matching the
 * `values.get` response's own row indexing) so the caller can zip them
 * together with the plain-text rows by position. Returns {} (not a
 * rejection) on any failure — resources are a nice-to-have enrichment, and
 * losing them should never break the Date/Series/Passage sync that every
 * sermon doc already depends on.
 */
async function fetchResourceUrlsByRowIndex(token: string): Promise<Record<number, string[]>> {
  try {
    const params = new URLSearchParams({
      ranges: RESOURCES_RANGE,
      fields: "sheets.data.rowData.values(hyperlink,textFormatRuns.format.link.uri,userEnteredValue,formattedValue)",
    });
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${TAGGING_SHEET_ID}?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[sermon-tagging] resources grid-data fetch error:", res.status, body.slice(0, 500));
      return {};
    }

    const json = await res.json();
    const rowData = json?.sheets?.[0]?.data?.[0]?.rowData as
      | { values?: { hyperlink?: string; textFormatRuns?: { format?: { link?: { uri?: string } } }[] }[] }[]
      | undefined;
    if (!rowData) return {};

    const out: Record<number, string[]> = {};
    rowData.forEach((row, rowIndex) => {
      const cell = row.values?.[0];
      if (!cell) return;
      const urls = new Set<string>();
      if (cell.hyperlink) urls.add(cell.hyperlink.trim());
      for (const run of cell.textFormatRuns ?? []) {
        const uri = run.format?.link?.uri;
        if (uri) urls.add(uri.trim());
      }
      if (urls.size > 0) out[rowIndex] = [...urls];
    });
    return out;
  } catch (err) {
    console.error("[sermon-tagging] resources grid-data fetch error:", err);
    return {};
  }
}

let cachedRows: TaggingRow[] | null = null;
let cachedAt = 0;
const CACHE_MS = 3600_000; // 1h — matches the Next.js revalidate window elsewhere in lib/sermon.ts

// If a fetch fails (network, 403, quota, etc.), remember that for a short
// window too — NOT just on success. Found 2026-10-02: every sermon in a
// resync run calls getTaggingRowByDate() once, and without this, a single
// broken/rate-limited period meant every one of those (up to 500 on a
// manual backfill) retried the Sheets API from scratch, which both wasted
// the function's entire 60s budget on repeated failures (causing runs to
// time out with no forward progress at all) and made an API-side rate
// limit worse by hammering it harder. A short failure cache means one bad
// request per ~2 minutes, not one per video.
const FAILURE_CACHE_MS = 120_000; // 2m
let lastFailureAt = 0;

async function fetchTaggingRows(): Promise<TaggingRow[]> {
  const now = Date.now();
  if (cachedRows && now - cachedAt < CACHE_MS) return cachedRows;
  if (now - lastFailureAt < FAILURE_CACHE_MS) {
    // TEMP diagnostic (2026-10-03): this used to be silent, which made a
    // run-wide outage (every sermon in one cron invocation getting a null
    // tagging row) indistinguishable in the logs from "nothing to sync."
    console.error(
      `[sermon-tagging] skipping fetch — still inside the ${FAILURE_CACHE_MS / 1000}s failure-cache window from an earlier failure this run`,
    );
    return cachedRows ?? [];
  }

  const token = await getDriveAccessToken();
  if (!token) {
    console.error("[sermon-tagging] no Drive access token — see [google-auth] log above for why");
    lastFailureAt = now;
    return cachedRows ?? [];
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${TAGGING_SHEET_ID}/values/${encodeURIComponent(RANGE)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[sermon-tagging] Sheets fetch error:", res.status, body.slice(0, 500));
      lastFailureAt = now;
      return cachedRows ?? [];
    }

    const { values } = (await res.json()) as { values?: string[][] };
    if (!values || values.length < 2) {
      console.error(`[sermon-tagging] Sheets returned no usable rows (got ${values?.length ?? 0})`);
      return [];
    }

    // TEMP diagnostic (2026-10-03): every row is failing to parse into a
    // TaggingRow (0 rows out of a non-empty values response, confirmed by
    // the log two steps up the call chain) — this dumps the header plus
    // the first 3 data rows' raw column-A values exactly as Sheets returns
    // them, to see what normalizeSheetDate() is actually choking on.
    console.log(
      `[sermon-tagging] header row: ${JSON.stringify(values[0])}; first raw dates: ${JSON.stringify(values.slice(1, 4).map((r) => r[0]))}`,
    );

    // Fetched in parallel with nothing else outstanding at this point in
    // the function, and tolerant of its own failure (returns {}) — a
    // resources-column hiccup should never take down the Date/Series/
    // Passage sync every sermon doc already depends on.
    const resourceUrlsByRow = await fetchResourceUrlsByRowIndex(token);

    const rows: TaggingRow[] = [];
    // values[0] is the header row — skip it. rowIndex tracks the ORIGINAL
    // position in `values` (not the filtered `rows` array) so it lines up
    // with fetchResourceUrlsByRowIndex's row indexing, which comes from the
    // same sheet and never skips blank/unparseable rows.
    values.slice(1).forEach((row, i) => {
      const rowIndex = i + 1;
      const [rawDate, series, part, title, passage, teacher, , summary] = row;
      if (!rawDate) return;
      const date = normalizeSheetDate(rawDate);
      if (!date) return;

      rows.push({
        date,
        series: (series ?? "").trim(),
        part: (part ?? "").trim(),
        title: (title ?? "").trim(),
        passage: (passage ?? "").trim(),
        teacher: (teacher ?? "").trim(),
        summary: (summary ?? "").trim(),
        resourceUrls: resourceUrlsByRow[rowIndex] ?? [],
      });
    });

    cachedRows = rows;
    cachedAt = now;
    // TEMP diagnostic (2026-10-03): the fetch itself has never logged an
    // error in any run so far, yet every getTaggingRowByDate() lookup comes
    // back null — so either the sheet is genuinely returning zero usable
    // rows (would show rows.length: 0 here) or the dates it has don't
    // match what resolveSermonDate()/the backfill reference compute (would
    // show a populated list that still never contains the dates being
    // looked up). This pins down which.
    console.log(
      `[sermon-tagging] fetched ${rows.length} rows; dates: ${JSON.stringify(rows.map((r) => r.date))}`,
    );
    return rows;
  } catch (err) {
    console.error("[sermon-tagging] Sheets fetch error:", err);
    lastFailureAt = now;
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
