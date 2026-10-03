#!/usr/bin/env node
/**
 * scripts/backfill-sermon-notes-candidates.mjs
 *
 * One-off migration: adds the 2 resource candidates found while reading
 * Curtis's 2025/2026 sermon manuscripts for mentions not yet in the Sanity
 * resource catalog (see claude/sermon-resource-backfill-candidates-2026-10-03.md).
 * Both are sermon-level, one-off mentions, approved by Josiah 2026-10-03.
 *
 * No npm dependencies — talks to Sanity's HTTP API directly with native
 * fetch, so it runs with plain `node` and nothing else installed.
 *
 * USAGE (run on a machine that can reach api.sanity.io — NOT through the
 * Claude Cowork device bridge or cloud sandbox, both of which block this
 * host per org network policy):
 *
 *   SANITY_API_TOKEN=<your token> node scripts/backfill-sermon-notes-candidates.mjs
 *       → dry run: prints exactly what it WOULD create/link, writes nothing.
 *
 *   SANITY_API_TOKEN=<your token> node scripts/backfill-sermon-notes-candidates.mjs --apply
 *       → actually creates the 2 resource docs and links them to their sermons.
 *
 * Safe to re-run: resources are created with `createIfNotExists` keyed to a
 * deterministic id derived from the URL (the fixed hash-based scheme from
 * lib/sermon-resources.ts), and sermon patches only ever ADD references
 * (via insert, skipping any id already present), never duplicate ones.
 */

import { createHash } from "node:crypto";

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

// Fixed (hashed) scheme — matches lib/sermon-resources.ts post-fix.
function resourceId(url) {
  return `resource-${createHash("sha256").update(url).digest("hex").slice(0, 40)}`;
}

// ── The 2 approved candidates ────────────────────────────────────────────

const CANDIDATES = [
  {
    date: "2026-09-07",
    titleHint: "Choosing to Remember", // Esther 9-10
    resource: {
      title: "The Only Plane in the Sky: An Oral History of 9/11",
      creator: "Garrett M. Graff",
      type: "book",
      url: "https://www.simonandschuster.com/books/Only-Plane-in-the-Sky/Garrett-M-Graff/9781501182211",
    },
  },
  {
    date: "2026-04-27",
    titleHint: "The Limits of Legalism", // Colossians 2:16-23
    resource: {
      title: "The Grace Awakening",
      creator: "Charles R. Swindoll",
      type: "book",
      url: "https://insight.org/store/product/the-grace-awakening-grahb",
    },
  },
];

// A third candidate was considered and rejected: "Peace and the Word"
// (Colossians 3:12-17, 2026-05-10) quotes Eugene Peterson's "The Message"
// paraphrase of Col 3:16. Reviewed and explicitly declined by Josiah
// 2026-10-03 — a quoted Bible paraphrase, not a resource recommendation.
// Intentionally not in CANDIDATES above.

// ── Step 1: find the 2 sermons ────────────────────────────────────────────

const mutations = [];
const summary = [];

for (const { date, titleHint, resource } of CANDIDATES) {
  const sermon = await sanityQuery(
    `*[_type == "sermon" && date == $date][0]{ _id, title, "resourceIds": resourcesMentioned[]._ref }`,
    { date }
  );
  if (!sermon) {
    console.warn(`⚠ No sermon found for ${date} ("${titleHint}") — skipping.`);
    continue;
  }
  console.log(`${date}  ${sermon.title}  (${sermon._id})`);

  const id = resourceId(resource.url);
  mutations.push({
    createIfNotExists: {
      _id: id,
      _type: "resource",
      title: resource.title,
      creator: resource.creator,
      type: resource.type,
      url: resource.url,
      status: "active",
      needsReview: true, // URL found by web search, not copied from a Curtis-confirmed link
    },
  });

  if (!(sermon.resourceIds ?? []).includes(id)) {
    mutations.push({
      patch: {
        id: sermon._id,
        setIfMissing: { resourcesMentioned: [] },
        insert: {
          after: "resourcesMentioned[-1]",
          items: [{ _type: "reference", _ref: id, _key: `notes-backfill-${id}` }],
        },
      },
    });
  }

  summary.push(`${resource.type.padEnd(8)} ${resource.title} — ${resource.creator}  →  ${sermon.title} (${date})`);
}

// ── Step 2: report, and apply if asked ───────────────────────────────────

console.log(`\n${summary.length} resource(s) to create and link:`);
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
