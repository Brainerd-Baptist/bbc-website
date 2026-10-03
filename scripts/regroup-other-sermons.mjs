#!/usr/bin/env node
/**
 * scripts/regroup-other-sermons.mjs
 *
 * One-off migration: binds the 15 sermons Josiah identified from the
 * catch-all "Other" series grouping into their real series — 3 new series
 * (Word Centered: A Series in Psalms, Repeat the Sounding Joy, Bookmark),
 * 1 new annual one-off banner (Easter), and 1 sermon that already belongs
 * to an existing series (God's Work | Our Work) but was never linked.
 *
 * See claude/sermon-series-regrouping-2026-10-03.md for the full decision
 * log this implements.
 *
 * No npm dependencies — talks to Sanity's HTTP API directly with native
 * fetch, so it runs with plain `node` and nothing else installed.
 *
 * USAGE (run on a machine that can reach api.sanity.io — NOT through the
 * Claude Cowork device bridge or cloud sandbox, both of which block this
 * host per org network policy):
 *
 *   SANITY_API_TOKEN=<your token> node scripts/regroup-other-sermons.mjs
 *       → dry run: prints exactly what it WOULD create/set, writes nothing.
 *
 *   SANITY_API_TOKEN=<your token> node scripts/regroup-other-sermons.mjs --apply
 *       → actually creates the new series docs and sets each sermon's
 *         `series` reference.
 *
 * Safe to re-run: new series are created with createIfNotExists keyed to a
 * deterministic slug-based id, and each sermon patch is a `set` (not
 * insert) on its single `series` reference field, so re-running just
 * re-confirms the same end state.
 */

const PROJECT = "3l0knw74";
const DATASET = "production";
const API_VERSION = "2024-01-01";
const QUERY_URL = `https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;
const MUTATE_URL = `https://${PROJECT}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

const TOKEN = process.env.SANITY_API_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!TOKEN) {
  console.error("Missing SANITY_API_TOKEN in the environment. See the usage note at the top of this file.");
  process.exit(1);
}

async function sanityQuery(query, params = {}) {
  const url = new URL(QUERY_URL);
  url.searchParams.set("query", query);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`Query failed: ${res.status} ${res.statusText}\n${await res.text()}`);
  return (await res.json()).result;
}

async function sanityMutate(mutations) {
  const res = await fetch(MUTATE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`Mutate failed: ${res.status} ${res.statusText}\n${await res.text()}`);
  return await res.json();
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

// ── Series to create (if they don't already exist) ──────────────────────

const NEW_SERIES = [
  "Word Centered: A Series in Psalms",
  "Repeat the Sounding Joy",
  "Bookmark",
  "Easter",
];

// ── The sermon → series assignments ──────────────────────────────────────
// (date is used to look up the sermon; seriesTitle must be one of
// NEW_SERIES above, or "God's Work | Our Work" which must already exist)

const ASSIGNMENTS = [
  // Word Centered: A Series in Psalms
  { date: "2023-04-30", titleHint: "Psalm 19", seriesTitle: "Word Centered: A Series in Psalms" },
  { date: "2023-05-07", titleHint: "Psalm 1", seriesTitle: "Word Centered: A Series in Psalms" },
  { date: "2023-05-14", titleHint: "Psalm 119", seriesTitle: "Word Centered: A Series in Psalms" },
  { date: "2024-06-02", titleHint: "Psalm 16", seriesTitle: "Word Centered: A Series in Psalms" },

  // Repeat the Sounding Joy (Advent 2023)
  { date: "2023-12-03", titleHint: "John 16", seriesTitle: "Repeat the Sounding Joy" },
  { date: "2023-12-10", titleHint: "Psalm 16", seriesTitle: "Repeat the Sounding Joy" },
  { date: "2023-12-17", titleHint: "Isaiah 35", seriesTitle: "Repeat the Sounding Joy" },
  { date: "2023-12-24", titleHint: "Luke 2", seriesTitle: "Repeat the Sounding Joy" },

  // Bookmark (recurring one-off banner, speaker-agnostic)
  { date: "2025-04-06", titleHint: "Isaiah 40 / Bookmark", seriesTitle: "Bookmark" },
  { date: "2025-08-03", titleHint: "Repentance / Psalm 51", seriesTitle: "Bookmark" },
  { date: "2025-10-26", titleHint: "Looking at the Harvest / Matthew 9", seriesTitle: "Bookmark" },
  { date: "2022-11-13", titleHint: "Matthew 5", seriesTitle: "Bookmark" },
  { date: "2025-06-01", titleHint: "2 Corinthians 5:14-21", seriesTitle: "Bookmark" },
  { date: "2022-10-16", titleHint: "Isaiah 6", seriesTitle: "Bookmark" },
  { date: "2022-10-23", titleHint: "Nehemiah 1:1-11", seriesTitle: "Bookmark" },
  { date: "2024-12-29", titleHint: "Isaiah 46 / How Great Is Your God?", seriesTitle: "Bookmark" },

  // Easter (annual one-off banner)
  { date: "2024-03-31", titleHint: "Romans 8 / Easter", seriesTitle: "Easter" },
  { date: "2025-04-20", titleHint: "1 Peter 1:3-9 / The Risen Jesus Transforms You Now", seriesTitle: "Easter" },

  // Already-existing series — just needs linking
  { date: "2022-12-04", titleHint: "Romans 16 / Embracing Our Work", seriesTitle: "God's Work | Our Work" },
];

// ── Step 1: resolve series ids (existing or to-be-created) ──────────────

const allSeriesTitles = [...new Set(ASSIGNMENTS.map((a) => a.seriesTitle))];
const seriesIds = {};
const seriesToCreate = [];

for (const title of allSeriesTitles) {
  const existing = await sanityQuery(`*[_type == "series" && title == $title][0]{ _id, title }`, { title });
  if (existing) {
    seriesIds[title] = existing._id;
    console.log(`✓ Series "${title}" already exists (${existing._id})`);
  } else if (NEW_SERIES.includes(title)) {
    const id = `series-${slugify(title)}`;
    seriesIds[title] = id;
    seriesToCreate.push({ id, title });
    console.log(`+ Series "${title}" will be created (${id})`);
  } else {
    console.error(
      `✗ Series "${title}" not found and is not in NEW_SERIES — refusing to guess. ` +
        `Check the title matches exactly what's in Sanity.`,
    );
    process.exit(1);
  }
}

// ── Step 2: resolve each sermon by date ──────────────────────────────────

const mutations = [];
const summary = [];

for (const { id, title } of seriesToCreate) {
  mutations.push({
    createIfNotExists: {
      _id: id,
      _type: "series",
      title,
      slug: { _type: "slug", current: slugify(title) },
    },
  });
}

for (const { date, titleHint, seriesTitle } of ASSIGNMENTS) {
  const sermon = await sanityQuery(
    `*[_type == "sermon" && date == $date][0]{ _id, title, "currentSeries": series->title }`,
    { date },
  );
  if (!sermon) {
    console.warn(`⚠ No sermon found for ${date} ("${titleHint}") — skipping.`);
    continue;
  }

  const targetId = seriesIds[seriesTitle];
  mutations.push({
    patch: {
      id: sermon._id,
      set: { series: { _type: "reference", _ref: targetId } },
    },
  });

  summary.push(
    `${date}  ${sermon.title.padEnd(45)}  ${(sermon.currentSeries ?? "—").padEnd(20)} → ${seriesTitle}`,
  );
}

// ── Step 3: report, and apply if asked ───────────────────────────────────

console.log(`\n${summary.length} sermon(s) to re-link:`);
for (const line of summary) console.log(`  - ${line}`);

if (mutations.length === 0) {
  console.log("\nNothing to do.");
  process.exit(0);
}

if (!APPLY) {
  console.log(`\nDRY RUN — nothing written. Re-run with --apply to actually create/link these in Sanity.`);
  process.exit(0);
}

console.log(`\nApplying ${mutations.length} mutation(s)...`);
const result = await sanityMutate(mutations);
console.log("Done:", JSON.stringify(result, null, 2));
