// ── Sermon library ──────────────────────────────────────────────────────────
// Real sermon data pulled from BBC YouTube playlist (PLmi1s4e0rk_5Mm_vS6JWamVhtkrhfpKt7).
// This is the static fallback — once sermons are entered in Sanity Studio (/studio),
// this file is bypassed automatically (app/sermons/page.tsx switches when Sanity has data).

export interface Sermon {
  id: string;
  youtubeId: string;   // YouTube video ID — thumbnail + link derived from this
  title: string;
  series: string;
  seriesId: string;    // slug — used to group sermons by series
  speaker: string;
  date: string;        // ISO format: "YYYY-MM-DD"
  passage: string;
  book: string;
  duration?: string;
  description?: string;
  passages?: string[];  // additional scripture references from sermon notes
}

export const SERMONS: Sermon[] = [

  // ── Behind the Scenes (Esther) — current series ────────────────────────────
  {
    id: "bts-guest-0913",
    youtubeId: "Y3Exv0qAz0Y",
    title: "Mark 8",
    series: "Guest Messages",
    seriesId: "guest-messages",
    speaker: "Paul Christensen",
    date: "2026-09-13",
    passage: "Mark 8",
    book: "Mark",
  },
  {
    id: "bts-7",
    youtubeId: "E4CZ5kOuabw",
    title: "Choosing to Remember",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-09-07",
    passage: "Esther 9–10",
    passages: ["Esther 9", "1 Corinthians 2:2", "1 Corinthians 15:3-4", "Galatians 6:14", "Hebrews 12:3"],
    book: "Esther",
  },
  {
    id: "bts-6",
    youtubeId: "XzVcw5oW704",
    title: "The Great Reversal",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-08-31",
    passage: "Esther 7–8",
    passages: ["Esther 7", "Daniel 4:37", "Psalm 30:11-12", "Exodus 15:1-3", "1 Samuel 2:4-6"],
    book: "Esther",
  },
  {
    id: "bts-5",
    youtubeId: "yGxu7qN5EBk",
    title: "The Unlovable Villain",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-08-24",
    passage: "Esther 5–6",
    passages: ["Esther 4", "Psalm 7:14-16", "Romans 3:11-12", "Ephesians 2", "Titus 3:3"],
    book: "Esther",
  },
  {
    id: "bts-4",
    youtubeId: "btbqBK07-vk",
    title: "What Is Your Destiny?",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-08-17",
    passage: "Esther 4",
    passages: ["Esther 4", "Joel 2"],
    book: "Esther",
  },
  {
    id: "bts-3",
    youtubeId: "9QDjTUzMK-E",
    title: "Seeing a Thread",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-08-10",
    passage: "Esther 2–3",
    passages: ["Esther 2:21-3", "Esther 3", "1 Samuel 30", "Judges 3", "1 Samuel 15"],
    book: "Esther",
  },
  {
    id: "bts-2",
    youtubeId: "Fvzqf7jNsKE",
    title: "More Than Meets the Eye",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-08-03",
    passage: "Esther 2",
    passages: ["Psalm 46:1-3", "Proverbs 21:1", "Daniel 2:21", "Psalm 135:6", "Exodus 2:23-25"],
    book: "Esther",
  },
  {
    id: "bts-1",
    youtubeId: "tHm_f7onEDQ",
    title: "The King Exposed",
    series: "Behind the Scenes",
    seriesId: "behind-the-scenes",
    speaker: "Curtis Hill",
    date: "2026-07-27",
    passage: "Esther 1",
    passages: ["James 1:21", "Psalm 2"],
    book: "Esther",
  },

  // ── The Prayer That Shapes Us ───────────────────────────────────────────────
  {
    id: "prayer-3",
    youtubeId: "lcGm3J8LAeM",
    title: "Temptation and Deliverance",
    series: "The Prayer That Shapes Us",
    seriesId: "prayer-that-shapes-us",
    speaker: "Micah Frink",
    date: "2026-07-20",
    passage: "Matthew 6",
    book: "Matthew",
  },
  {
    id: "prayer-2",
    youtubeId: "0hMRNDYFXX8",
    title: "Daily Bread and Sin",
    series: "The Prayer That Shapes Us",
    seriesId: "prayer-that-shapes-us",
    speaker: "Josiah King",
    date: "2026-07-13",
    passage: "Matthew 6",
    book: "Matthew",
  },
  {
    id: "prayer-1",
    youtubeId: "eJ84c_OWwT0",
    title: "Focusing Our Prayers",
    series: "The Prayer That Shapes Us",
    seriesId: "prayer-that-shapes-us",
    speaker: "Curtis Hill",
    date: "2026-07-06",
    passage: "Matthew 6",
    passages: ["Exodus 3", "Ezekiel 36", "Matthew 3", "Romans 14:17", "Matthew 26:39"],
    book: "Matthew",
  },

  // ── OT Revisited ───────────────────────────────────────────────────────────
  {
    id: "otr-saul",
    youtubeId: "fNqEYB4QHCA",
    title: "Insecurity and Saul",
    series: "OT Revisited",
    seriesId: "ot-revisited",
    speaker: "Curtis Hill",
    date: "2026-06-29",
    passage: "Selected Scriptures from 1 Samuel",
    passages: ["1 Samuel 13", "1 Samuel 16", "Philippians 3:4-14", "1 Corinthians 15:9-10", "Galatians 2:20"],
    book: "1 Samuel",
  },
  {
    id: "otr-hezekiah",
    youtubeId: "qpkFmfTK7NI",
    title: "Great Starts, Unsuccessful Finishes",
    series: "OT Revisited",
    seriesId: "ot-revisited",
    speaker: "Curtis Hill",
    date: "2026-06-22",
    passage: "2 Kings 18–20",
    passages: ["2 Kings 18-20", "2 Chronicles 29-32", "Isaiah 36-39", "2 Chronicles 29:2", "2 Chronicles 31:20-21"],
    book: "2 Kings",
  },
  {
    id: "otr-elijah",
    youtubeId: "5L2MThCzwS0",
    title: "Unanswered Prayers",
    series: "OT Revisited",
    seriesId: "ot-revisited",
    speaker: "Curtis Hill",
    date: "2026-06-08",
    passage: "1 Kings 19",
    passages: ["Psalm 13", "Psalm 42:8", "Psalm 145", "Psalm 62", "Psalm 42"],
    book: "1 Kings",
  },

  // ── Complete in Christ (Colossians) ────────────────────────────────────────
  {
    id: "col-11",
    youtubeId: "PJ4xu0Hi7pk",
    title: "A Gospel Team",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-06-01",
    passage: "Colossians 4:7–18",
    passages: ["Acts 13", "Acts 15", "Acts 19-20", "Acts 28:31", "2 Timothy 4:11"],
    book: "Colossians",
  },
  {
    id: "col-10",
    youtubeId: "espt6wDDlN8",
    title: "Devoted to Prayer",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Micah Frink",
    date: "2026-05-25",
    passage: "Colossians 4:2–6",
    book: "Colossians",
  },
  {
    id: "col-9",
    youtubeId: "0oj7GUyU4GI",
    title: "Whatever You Do",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-05-18",
    passage: "Colossians 3:18–4:1",
    book: "Colossians",
  },
  {
    id: "col-8",
    youtubeId: "eEJmdxvrrQI",
    title: "Peace and the Word",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-05-11",
    passage: "Colossians 3:12–17",
    passages: ["Colossians 3:12-17", "Colossians 3"],
    book: "Colossians",
  },
  {
    id: "col-7",
    youtubeId: "FuDNdK4eCtI",
    title: "Mapping Your Story to His",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-05-04",
    passage: "Colossians 3:1–11",
    passages: ["Colossians 3:1-11"],
    book: "Colossians",
  },
  {
    id: "col-6",
    youtubeId: "kaSwWfM7fDU",
    title: "The Limits of Legalism",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-04-27",
    passage: "Colossians 2:16–23",
    passages: ["Colossians 2:16-23", "Colossians 1-2"],
    book: "Colossians",
  },
  {
    id: "col-5",
    youtubeId: "PZ_uSwov-O8",
    title: "Serious Conversations",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-04-20",
    passage: "Colossians 2:4–15",
    book: "Colossians",
  },
  {
    id: "col-4",
    youtubeId: "jyRVwgydS3A",
    title: "Core Drives",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-04-13",
    passage: "Colossians 1:24–2:3",
    passages: ["Colossians 1:24-2", "Colossians 2:2-3"],
    book: "Colossians",
  },
  {
    id: "easter-2026",
    youtubeId: "OZrY_op70b8",
    title: "Easter Expectations",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-04-05",
    passage: "Luke 24:13–27",
    book: "Luke",
  },
  {
    id: "col-3",
    youtubeId: "wZHGl48xcww",
    title: "The Center of Everything",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-03-29",
    passage: "Colossians 1:15–23",
    passages: ["Colossians 1:15-20", "John 1:18", "Hebrews 1:3", "Psalm 89 - 20", "2 Corinthians 5"],
    book: "Colossians",
  },
  {
    id: "col-2",
    youtubeId: "38gQ6T3agiM",
    title: "A Great Big Prayer",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-03-22",
    passage: "Colossians 1:9–14",
    passages: ["Colossians 1", "Colossians 1:9-14", "Philippians 3", "Psalm 13:20"],
    book: "Colossians",
  },
  {
    id: "col-1",
    youtubeId: "BTLyqXXvkvQ",
    title: "The Most Important Thing Happening",
    series: "Complete in Christ",
    seriesId: "complete-in-christ",
    speaker: "Curtis Hill",
    date: "2026-03-15",
    passage: "Colossians 1:1–8",
    passages: ["Colossians 1:1-8"],
    book: "Colossians",
  },

  // ── God's Work | Our Work ──────────────────────────────────────────────────
  {
    id: "gw-5",
    youtubeId: "IM5DeRDpr6w",
    title: "Stewarding Our Heritage",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-03-08",
    passage: "Psalm 90",
    passages: ["Psalm 90", "Matthew 25:14-28"],
    book: "Psalms",
  },
  {
    id: "gw-4",
    youtubeId: "pG0r3Y5Kihc",
    title: "Reaching Our Region",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-03-01",
    passage: "1 Thessalonians 1",
    passages: ["Romans 5:8", "2 Corinthians 5:14-15", "1 Peter 2:9", "Acts 16", "Acts 2:47"],
    book: "1 Thessalonians",
  },
  {
    id: "gw-guest-0222",
    youtubeId: "ROFTKtJ_O2Q",
    title: "Luke 8",
    series: "Guest Messages",
    seriesId: "guest-messages",
    speaker: "Jackson Bowman",
    date: "2026-02-22",
    passage: "Luke 8",
    book: "Luke",
  },
  {
    id: "gw-3",
    youtubeId: "b8QmPi42yHk",
    title: "Embracing Our Work",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-02-15",
    passage: "Nehemiah 3; Romans 16",
    passages: ["Nehemiah 3", "Romans 16", "Nehemiah 4:6", "Ephesians 2:8-10", "Ephesians 4:29"],
    book: "Nehemiah",
  },
  {
    id: "gw-1",
    youtubeId: "mswliqGNPBI",
    title: "Burdens and a Big Prayer",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-01-19",
    passage: "Psalm 90:12–17",
    passages: ["Psalm 90:12-17", "Acts 2", "Acts 9"],
    book: "Psalms",
  },
  {
    id: "gw-2",
    youtubeId: "VLzTn8WEdAA",
    title: "Growing in Our Closeness",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-02-08",
    passage: "Philippians 1:1–11",
    passages: ["John 13:1", "John 15", "Mark 10:21", "John 21", "1 Thessalonians 3:12"],
    book: "Philippians",
  },
  {
    id: "gw-bridge",
    youtubeId: "Gl6AahtL4zk",
    title: "At His Feet, Listening to His Word",
    series: "God's Work | Our Work",
    seriesId: "gods-work-our-work",
    speaker: "Curtis Hill",
    date: "2026-01-25",
    passage: "Luke 10:38–42",
    passages: ["Luke 10:38-42"],
    book: "Luke",
  },
  {
    id: "gw-guest-0111",
    youtubeId: "lhClPOh1EHw",
    title: "Psalm 8",
    series: "Guest Messages",
    seriesId: "guest-messages",
    speaker: "Micah Frink",
    date: "2026-01-11",
    passage: "Psalm 8",
    book: "Psalms",
  },

];

// ── Series metadata ───────────────────────────────────────────────────────────

export const SERIES_META: Record<string, {
  description: string
  passage?: string
}> = {
  "behind-the-scenes": {
    description: "The book of Esther never mentions God by name — yet every scene is saturated with his providence. In this series we trace the unseen hand of God working through ordinary people caught in an extraordinary moment.",
    passage: "Esther",
  },
  "prayer-that-shapes-us": {
    description: "A verse-by-verse walk through the Lord's Prayer in Matthew 6. What does it look like to pray in a way that actually reshapes how you see God, yourself, and the world around you?",
    passage: "Matthew 6",
  },
  "ot-revisited": {
    description: "Three figures from the Old Testament — Elijah, Hezekiah, and Saul — each offer a window into the human condition and the grace of God that meets us there.",
    passage: "Selected OT passages",
  },
  "complete-in-christ": {
    description: "Paul's letter to the Colossians confronts anything that competes with Christ. This series works through the whole letter, making the case that Jesus is enough — completely enough.",
    passage: "Colossians",
  },
  "gods-work-our-work": {
    description: "What does it look like to be a church on mission together? This series roots our collective work in the character and purposes of God.",
  },
  "guest-messages": {
    description: "Standalone messages from guest speakers.",
  },
}

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
