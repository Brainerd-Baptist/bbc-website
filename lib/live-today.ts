/**
 * lib/live-today.ts
 *
 * Reads TODAY's actual sermon info for the /live page during the live
 * window, independent of YouTube sync.
 *
 * Why this exists: getLatestSermon() (lib/sermon.ts) resolves whatever's
 * newest in the curated YouTube playlist — during Sunday's live window
 * that's always LAST week's sermon, since this week's video doesn't post
 * until Mon/Tue/Wed (see claude/sunday-morning-live-pipeline-audit-
 * 2026-10-03.md). But Curtis's Tagging sheet row for *today* is usually
 * filled out by 7:30-7:45am, well before the first service — so during the
 * live window, reading the Tagging sheet by TODAY's real calendar date
 * (instead of by whatever date the last-synced YouTube video happens to
 * carry) gets the actually-correct title/series/passage/speaker, with zero
 * dependency on YouTube at all.
 *
 * Returns null (not a guess) when today's row isn't there yet — callers
 * should fall back to the existing stale-but-real getLatestSermon() result
 * and say so, rather than inventing placeholder content.
 */

import { getTaggingRowByDate } from "./sermon-tagging";
import { getSermonNotesByDate } from "./sermon";

export interface TodayLiveOverlay {
  title:   string;
  passage: string;
  speaker: string;
  series:  string;
  part:    string;
  summary: string;
  date:    string; // "YYYY-MM-DD" — always today's real Eastern date
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
}

export async function getTodayLiveOverlay(todayEasternDate: string): Promise<TodayLiveOverlay | null> {
  const row = await getTaggingRowByDate(todayEasternDate).catch(() => null);
  if (!row || !row.title) return null;

  // Best-effort: Curtis's outline/manuscript doc for today, if it's already
  // landed in Drive (same 7:30-7:45am window as the Tagging sheet). Missing
  // outline just means no outline section renders — never blocks showing
  // the correct title/speaker/series above.
  let outline: string[] = [];
  let outlineType: "structured" | "scripture" | "none" = "none";
  try {
    const notes = await getSermonNotesByDate(todayEasternDate);
    if (notes) {
      outline = notes.outline;
      outlineType = notes.outlineType;
    }
  } catch {
    // no Drive doc yet — fine
  }

  return {
    title:   row.title,
    passage: row.passage,
    speaker: row.teacher,
    series:  row.series,
    part:    row.part,
    summary: row.summary,
    date:    todayEasternDate,
    outline,
    outlineType,
  };
}
