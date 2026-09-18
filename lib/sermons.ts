// ── Sermon library ──────────────────────────────────────────────────────────
// Each entry maps a sermon to its YouTube video and structured metadata.
// Add a new entry here each Sunday after uploading to YouTube.
// When Sanity CMS is wired up, this file becomes the seed data and the
// SERMONS array is replaced by a server fetch.

export interface Sermon {
  id: string;
  youtubeId: string;   // YouTube video ID — thumbnail + link derived from this
  title: string;
  series: string;
  seriesId: string;    // slug — used to group sermons by series
  speaker: string;
  date: string;        // ISO format: "YYYY-MM-DD" — used for sorting + year filter
  passage: string;     // e.g. "Romans 8:28–39"
  book: string;        // e.g. "Romans" — drives passage search
  duration?: string;   // e.g. "42 min" (optional)
  description?: string;
}

export const SERMONS: Sermon[] = [
  // ── God's Work / Our Work (current series) ────────────────────────────────
  {
    id: "gods-work-1",
    youtubeId: "VLzTn8WEdAA",
    title: "The God Who Keeps His Promises",
    series: "God's Work / Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-09-14",
    passage: "Romans 8:28–39",
    book: "Romans",
    duration: "42 min",
  },
  {
    id: "gods-work-2",
    youtubeId: "",
    title: "Justified by Faith",
    series: "God's Work / Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-09-07",
    passage: "Romans 5:1–11",
    book: "Romans",
    duration: "38 min",
  },
  {
    id: "gods-work-3",
    youtubeId: "",
    title: "No Condemnation",
    series: "God's Work / Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-08-31",
    passage: "Romans 8:1–11",
    book: "Romans",
    duration: "45 min",
  },
  {
    id: "gods-work-4",
    youtubeId: "",
    title: "The Spirit of Adoption",
    series: "God's Work / Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-08-24",
    passage: "Romans 8:12–17",
    book: "Romans",
    duration: "40 min",
  },

  // ── Psalms of Ascent ──────────────────────────────────────────────────────
  {
    id: "psalms-1",
    youtubeId: "",
    title: "Our Help Comes From the Lord",
    series: "Psalms of Ascent",
    seriesId: "psalms-of-ascent",
    speaker: "Curtis Hill",
    date: "2026-08-17",
    passage: "Psalm 121",
    book: "Psalms",
    duration: "36 min",
  },
  {
    id: "psalms-2",
    youtubeId: "",
    title: "Unless the Lord Builds the House",
    series: "Psalms of Ascent",
    seriesId: "psalms-of-ascent",
    speaker: "Curtis Hill",
    date: "2026-08-10",
    passage: "Psalm 127",
    book: "Psalms",
    duration: "41 min",
  },
  {
    id: "psalms-3",
    youtubeId: "",
    title: "A Song of Degrees",
    series: "Psalms of Ascent",
    seriesId: "psalms-of-ascent",
    speaker: "Curtis Hill",
    date: "2026-08-03",
    passage: "Psalm 120",
    book: "Psalms",
    duration: "39 min",
  },

  // ── Grace Upon Grace ──────────────────────────────────────────────────────
  {
    id: "grace-1",
    youtubeId: "",
    title: "More Grace",
    series: "Grace Upon Grace",
    seriesId: "grace-upon-grace",
    speaker: "Curtis Hill",
    date: "2026-07-27",
    passage: "John 1:14–17",
    book: "John",
    duration: "44 min",
  },
  {
    id: "grace-2",
    youtubeId: "",
    title: "Grace That Transforms",
    series: "Grace Upon Grace",
    seriesId: "grace-upon-grace",
    speaker: "Curtis Hill",
    date: "2026-07-20",
    passage: "Titus 2:11–14",
    book: "Titus",
    duration: "37 min",
  },
  {
    id: "grace-3",
    youtubeId: "",
    title: "The Throne of Grace",
    series: "Grace Upon Grace",
    seriesId: "grace-upon-grace",
    speaker: "Curtis Hill",
    date: "2026-07-13",
    passage: "Hebrews 4:14–16",
    book: "Hebrews",
    duration: "43 min",
  },

  // ── The King and His Kingdom ───────────────────────────────────────────────
  {
    id: "kingdom-1",
    youtubeId: "",
    title: "The Kingdom Is Here",
    series: "The King and His Kingdom",
    seriesId: "king-and-his-kingdom",
    speaker: "Curtis Hill",
    date: "2026-06-29",
    passage: "Mark 1:14–15",
    book: "Mark",
    duration: "41 min",
  },
  {
    id: "kingdom-2",
    youtubeId: "",
    title: "Parables of the Kingdom",
    series: "The King and His Kingdom",
    seriesId: "king-and-his-kingdom",
    speaker: "Curtis Hill",
    date: "2026-06-22",
    passage: "Mark 4:1–20",
    book: "Mark",
    duration: "46 min",
  },
  {
    id: "kingdom-3",
    youtubeId: "",
    title: "The Servant King",
    series: "The King and His Kingdom",
    seriesId: "king-and-his-kingdom",
    speaker: "Curtis Hill",
    date: "2026-06-15",
    passage: "Mark 10:42–45",
    book: "Mark",
    duration: "38 min",
  },
];

// ── Derived lists for filter dropdowns ────────────────────────────────────────

export const ALL_SERIES = Array.from(
  new Map(SERMONS.map((s) => [s.seriesId, s.series])).entries()
).map(([id, name]) => ({ id, name }));

export const ALL_SPEAKERS = Array.from(new Set(SERMONS.map((s) => s.speaker)));

export const ALL_YEARS = Array.from(
  new Set(SERMONS.map((s) => s.date.slice(0, 4)))
).sort((a, b) => Number(b) - Number(a));

// ── YouTube helpers ───────────────────────────────────────────────────────────

export function thumbnailUrl(youtubeId: string): string {
  if (!youtubeId) return "";
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function watchUrl(youtubeId: string): string {
  if (!youtubeId) return "/sermons";
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
