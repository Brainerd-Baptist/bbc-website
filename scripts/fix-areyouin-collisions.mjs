#!/usr/bin/env node
/**
 * scripts/fix-areyouin-collisions.mjs
 *
 * Corrective follow-up to scripts/backfill-areyouin-resources.mjs.
 *
 * That script's (and lib/sermon-resources.ts's, pre-fix) resourceId()
 * derived a Sanity doc _id from a truncated base64 encoding of the URL:
 *   `resource-${Buffer.from(url).toString("base64url").slice(0, 40)}`
 * Base64 preserves prefix equality, so any two URLs sharing a 30+ char
 * common prefix collapsed onto the same id. createIfNotExists then
 * silently no-op'd for every URL after the first with that id, so 5 of
 * the 20 /areyouin resources never got their own document — they were
 * merged into an earlier resource's doc instead:
 *
 *   - All 5 crossway.org/books/... URLs below share a 30+ char prefix and
 *     collapsed onto ONE doc ("Give Me Understanding...", the first one
 *     processed). Disability and the Gospel / The Life We Never Expected /
 *     The Person of Christ / The Deep Things of God never got created.
 *   - Both logos.com/product/... URLs collapsed onto ONE doc (the Bruner
 *     commentary, processed first). The UBS Handbook never got created.
 *
 * This script:
 *   1. Creates the 5 missing resource docs, under NEW ids derived with the
 *      fixed (hashed) scheme from lib/sermon-resources.ts.
 *   2. Overwrites (via a `set` patch, not insert — these arrays are wrong
 *      as they stand and need replacing outright, not appended to) the
 *      resourcesMentioned array on the 2025-04-27 sermon, the 2025-05-04
 *      sermon, and the Gospel of John series, each with its full, correct,
 *      de-duplicated list of resource ids. The 15 resources that did NOT
 *      collide keep their original (old-scheme) ids — those docs are
 *      already correct and are left untouched. The 2025-05-11 sermon was
 *      unaffected by the bug and is not touched.
 *
 * USAGE (run on a machine that can reach api.sanity.io — NOT through the
 * Claude Cowork device bridge or cloud sandbox, both of which block this
 * host per org network policy, same as the original backfill script):
 *
 *   SANITY_API_TOKEN=<your token> node scripts/fix-areyouin-collisions.mjs
 *       → dry run: prints exactly what it WOULD create/set, writes nothing.
 *
 *   SANITY_API_TOKEN=<your token> node scripts/fix-areyouin-collisions.mjs --apply
 *       → actually creates the 5 missing docs and overwrites the 3 arrays.
 *
 * Safe to re-run: the 5 creates use createIfNotExists, and the 3 patches
 * always `set` the same final, correct array, so re-running produces the
 * same end state.
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

// The OLD (buggy) scheme — used ONLY to re-derive the ids of the 15
// resources that did NOT collide and are already correctly stored under
// it. Never used to create anything new.
function oldResourceId(url) {
  return `resource-${Buffer.from(url).toString("base64url").slice(0, 40)}`;
}

// The NEW (fixed) scheme, matching lib/sermon-resources.ts post-fix —
// used for the 5 resources that need to be created for the first time.
function newResourceId(url) {
  return `resource-${createHash("sha256").update(url).digest("hex").slice(0, 40)}`;
}

// ── The 5 resources that never got created, due to the collision ────────

const MISSING = [
  {
    title: "Disability and the Gospel: How God Uses Our Brokenness to Display His Grace",
    creator: "Michael Beates",
    type: "book",
    url: "https://www.crossway.org/books/disability-and-the-gospel-tpb/",
  },
  {
    title: "The Life We Never Expected: Hopeful Reflections on the Challenges of Parenting Children with Special Needs",
    creator: "Andrew and Rachel Wilson",
    type: "book",
    url: "https://www.crossway.org/books/the-life-we-never-expected-tpb/",
  },
  {
    title: "The Person of Christ: An Introduction",
    creator: "Stephen Wellum",
    type: "book",
    url: "https://www.crossway.org/books/the-person-of-christ-tpb/",
  },
  {
    title: "The Deep Things of God: How the Trinity Changes Everything",
    creator: "Fred Sanders",
    type: "book",
    url: "https://www.crossway.org/books/the-deep-things-of-god-2nd-edition-tpb/",
  },
  {
    title: "A Translator's Handbook on the Gospel of John (UBS Handbook Series)",
    creator: "Barclay M. Newman and Eugene A. Nida",
    type: "book",
    url: "https://www.logos.com/product/6555/ubs-handbook-series-new-testament",
  },
];

// ── The 15 resources that are already correct, by their OLD-scheme id ───
// (urls only — just enough to re-derive each one's existing _id)

const ALREADY_CORRECT_URLS = {
  // 2025-04-27 — "Jesus Notices Hurting People"
  theologyOfDisability: "https://www.wheaton.edu/wheaton-center-for-faith-and-disability/resources",
  giveMeUnderstanding: "https://www.crossway.org/books/give-me-understanding-that-i-may-live-tpb", // the crossway "survivor" doc
  joniAndFriends: "https://www.joniandfriends.org",
  youngLifeCapernaum: "https://capernaum.younglife.org/",
  bethesdaPool:
    "https://www.biblicalarchaeology.org/daily/biblical-sites-places/jerusalem/the-bethesda-pool-site-of-one-of-jesus-miracles/",
  // 2025-05-04 — "Father and Son"
  enjoyingJesus: "https://www.thegoodbook.com.au/enjoying-jesus",
  // Gospel of John series — "Primary Commentary Resources"
  bruner: "https://www.logos.com/product/23032/the-gospel-of-john-a-commentary", // the logos "survivor" doc
  carson: "https://en.wikipedia.org/wiki/The_Gospel_According_to_John_(Pillar_New_Testament_Commentary)",
  morris: "https://www.abebooks.com/9780801062292/Reflections-Gospel-John-True-Vine-0801062292/plp",
  harris: "https://www.lifeway.com/en/product/john-P005749574",
  jobes: "https://www.kregel.com/karen-h-jobes/john-through-old-testament-eyes/",
  ryle: "https://banneroftruth.org/us/store/commentaries/expository-thoughts-on-the-gospels-14/",
  csbNotebook: "https://www.bhpublishinggroup.com/product/csb-scripture-notebook-john/",
};

const ids = {};
for (const [key, url] of Object.entries(ALREADY_CORRECT_URLS)) ids[key] = oldResourceId(url);
const missingIds = MISSING.map((r) => newResourceId(r.url));
const [disabilityId, lifeWeNeverExpectedId, personOfChristId, deepThingsId, ubsHandbookId] = missingIds;

// ── Step 1: find the 2 sermons and the series ────────────────────────────

const [april27, may4, seriesRows] = await Promise.all([
  sanityQuery(`*[_type == "sermon" && date == $date][0]{ _id, title, date }`, { date: "2025-04-27" }),
  sanityQuery(`*[_type == "sermon" && date == $date][0]{ _id, title, date }`, { date: "2025-05-04" }),
  sanityQuery(
    `*[_type == "sermon" && date >= $from && date <= $to]{ "seriesId": series->_id, "seriesTitle": series->title }`,
    { from: "2025-04-27", to: "2025-07-27" }
  ),
]);

if (!april27) throw new Error("Could not find the 2025-04-27 sermon in Sanity.");
if (!may4) throw new Error("Could not find the 2025-05-04 sermon in Sanity.");
const seriesIds = [...new Set(seriesRows.map((r) => r.seriesId).filter(Boolean))];
if (seriesIds.length !== 1) {
  throw new Error(`Expected exactly one shared series across 2025-04-27..2025-07-27, found: ${JSON.stringify(seriesIds)}`);
}
const seriesId = seriesIds[0];
const seriesTitle = seriesRows.find((r) => r.seriesId === seriesId)?.seriesTitle;

console.log(`2025-04-27 sermon: ${april27.title} (${april27._id})`);
console.log(`2025-05-04 sermon: ${may4.title} (${may4._id})`);
console.log(`Series: ${seriesTitle} (${seriesId})`);

// ── Step 2: build the mutations ──────────────────────────────────────────

const mutations = [];

console.log(`\n${MISSING.length} resource document(s) to create (new, non-colliding ids):`);
for (const res of MISSING) {
  const id = newResourceId(res.url);
  console.log(`  - ${res.type.padEnd(8)} ${res.title} — ${res.creator}  [${id}]`);
  mutations.push({
    createIfNotExists: {
      _id: id,
      _type: "resource",
      title: res.title,
      creator: res.creator,
      type: res.type,
      url: res.url,
      status: "active",
      needsReview: true,
    },
  });
}

const april27Final = [
  ids.theologyOfDisability,
  ids.giveMeUnderstanding,
  disabilityId,
  lifeWeNeverExpectedId,
  ids.joniAndFriends,
  ids.youngLifeCapernaum,
  ids.bethesdaPool,
];
const may4Final = [personOfChristId, deepThingsId, ids.enjoyingJesus];
const seriesFinal = [
  ids.bruner,
  ids.carson,
  ids.morris,
  ubsHandbookId,
  ids.harris,
  ids.jobes,
  ids.ryle,
  ids.csbNotebook,
];

function setResourcesMentioned(docId, resourceIds, label) {
  console.log(`\n${label} (${docId}) → set resourcesMentioned to ${resourceIds.length} resource(s):`);
  for (const id of resourceIds) console.log(`  - ${id}`);
  mutations.push({
    patch: {
      id: docId,
      set: {
        resourcesMentioned: resourceIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: `areyouin-fix-${id}`,
        })),
      },
    },
  });
}

setResourcesMentioned(april27._id, april27Final, "2025-04-27 sermon");
setResourcesMentioned(may4._id, may4Final, "2025-05-04 sermon");
setResourcesMentioned(seriesId, seriesFinal, `Series (${seriesTitle})`);

// ── Step 3: report, and apply if asked ───────────────────────────────────

if (!APPLY) {
  console.log(`\nDRY RUN — nothing written. Re-run with --apply to actually create the 5 docs and overwrite the 3 arrays.`);
  process.exit(0);
}

console.log(`\nApplying ${mutations.length} mutation(s)...`);
const result = await sanityMutate(mutations);
console.log("Done:", JSON.stringify(result, null, 2));
