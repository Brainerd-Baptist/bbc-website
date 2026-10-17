// npm run test:search
// 1. Every catalog URL resolves to a real route (or a known external host).
// 2. Real, vague, misspelled visitor wording lands on the right destination.
// 3. Pastoral / crisis wording is flagged; ordinary wording is not.
// Add a case whenever a real search in the logs ("[search]" … "miss":true)
// fails, then fix the catalog keywords until it passes.
import { build } from "esbuild";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(tmpdir(), `search-eval-${process.pid}.mjs`);
await build({
  entryPoints: [join(root, "lib/search-match.ts")],
  bundle: true, format: "esm", platform: "node", outfile: out,
  alias: { "@": root }, logLevel: "silent",
});
const m = await import(pathToFileURL(out).href);
const catOut = join(tmpdir(), `search-cat-${process.pid}.mjs`);
await build({ entryPoints: [join(root, "lib/search-catalog.ts")], bundle: true, format: "esm", platform: "node", outfile: catOut, logLevel: "silent" });
const cat = await import(pathToFileURL(catOut).href);

let failed = 0;
const fail = (msg) => { failed++; console.error("FAIL  " + msg); };

// ── 1. URL validity ──────────────────────────────────────────
function routeExists(path) {
  const parts = path.split("/").filter(Boolean);
  let dir = join(root, "app");
  for (const p of parts) {
    const direct = join(dir, p);
    if (existsSync(direct) && statSync(direct).isDirectory()) { dir = direct; continue; }
    const dyn = readdirSync(dir).find((d) => /^\[[^\]]+\]$/.test(d) && statSync(join(dir, d)).isDirectory());
    if (dyn) { dir = join(dir, dyn); continue; }
    return false;
  }
  return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "route.ts"));
}
const mapHtml = join(root, "lib/campus-map/public.html");
const mapSrc = existsSync(mapHtml) ? (await import("node:fs")).readFileSync(mapHtml, "utf8") : "";
const ids = new Set();
for (const e of cat.CATALOG) {
  if (ids.has(e.id)) fail(`duplicate catalog id ${e.id}`);
  ids.add(e.id);
  if (e.url.startsWith("http")) {
    if (!new URL(e.url).hostname.endsWith("churchcenter.com")) fail(`${e.id}: unexpected external host ${e.url}`);
    continue;
  }
  const path = e.url.split(/[?#]/)[0];
  if (!routeExists(path)) fail(`${e.id}: no route for ${e.url}`);
  if (e.mapId && mapSrc && !mapSrc.includes(`"id":"${e.mapId}"`)) fail(`${e.id}: map id ${e.mapId} not found on the campus map`);
  const to = e.url.match(/[?&]to=([\w-]+)/)?.[1];
  if (to && mapSrc && !mapSrc.includes(`"id":"${to}"`)) fail(`${e.id}: map id ${to} not found`);
}

// ── 2. Intent cases: [query, expected id within top 3] ───────
const CASES = [
  ["what time is church", "service-times"],
  ["when are services", "service-times"],
  ["sunday times", "service-times"],
  ["i've never been to church before", "plan-visit"],
  ["first time visiting", "plan-visit"],
  ["we're thinking of visiting this sunday", "plan-visit"],
  ["looking for a new church home", "plan-visit"],
  ["what should i wear", "faq"],
  ["is there a dress code", "faq"],
  ["where do i drop off my kids", "map-kids-checkin"],
  ["where do I check in my children", "map-kids-checkin"],
  ["childcare", "kids"],
  ["do you have a nursery", "kids"],
  ["my toddler", "kids"],
  ["sunday school", "kids"],
  ["where are the bathrooms", "map-restrooms"],
  ["restroom", "map-restrooms"],
  ["where is the sanctuary", "map-sanctuary"],
  ["where do i park", "address"],
  ["address", "address"],
  ["directions to the church", "address"],
  ["wheelchair access", "getting-around"],
  ["do you have an elevator", "getting-around"],
  ["watch online", "live"],
  ["can't make it, can i watch from home", "live"],
  ["livestream", "live"],
  ["past sermons", "sermons"],
  ["listen to the pastor's message", "sermons"],
  ["book recommendations", "resources"],
  ["my teenager", "students"],
  ["youth group", "students"],
  ["middle school", "students"],
  ["college ministry", "college"],
  ["young adults in their 20s", "college"],
  ["servicio en español", "hispanic"],
  ["spanish speaking church", "hispanic"],
  ["i want to make friends", "life-groups"],
  ["small groups", "life-groups"],
  ["bible study for adults", "life-groups"],
  ["we just moved here and don't know anyone", "life-groups"],
  ["how do i get involved", "next-step"],
  ["i want to volunteer", "serve"],
  ["can i join the choir", "serve"],
  ["how do I get baptized", "baptism"],
  ["baptisim", "baptism"],
  ["baby dedication", "baptism"],
  ["how do i become a member", "membership"],
  ["transfer my membership", "membership"],
  ["join the church", "membership"],
  ["newsletter", "stay-connected"],
  ["what events are coming up", "events"],
  ["christmas eve service", "events"],
  ["wednesday night", "wednesday"],
  ["mission trips", "missions"],
  ["rent a room for a party", "bx-reserve"],
  ["can i use the gym", "bx-reserve"],
  ["crossroads community center", "bx"],
  ["what do you believe", "beliefs"],
  ["who can take communion", "beliefs"],
  ["are you southern baptist", "beliefs"],
  ["what bible translation do you use", "beliefs"],
  ["who is jesus", "who-is-jesus"],
  ["i'm not sure i believe in god", "who-is-jesus"],
  ["how do i become a christian", "who-is-jesus"],
  ["church history", "timeline"],
  ["who is the pastor", "staff"],
  ["meet the staff", "staff"],
  ["talk to a pastor", "contact-staff"],
  ["phone number", "contact-staff"],
  ["i lost my jacket", "contact-general"],
  ["how do i give", "give"],
  ["tithe online", "give"],
  ["tax statement for my donations", "give"],
  ["website accessibility", "site-accessibility"],
];
let pass = 0;
for (const [q, want] of CASES) {
  const top = m.matchCatalog(q, 3).matches.map((x) => x.entry.id);
  if (top.includes(want)) pass++; else fail(`"${q}" -> [${top.join(", ")}] expected ${want}`);
}

// ── 3. Care detection ────────────────────────────────────────
const CARE = [
  ["i need prayer", "pastoral"], ["my husband died last week", "pastoral"],
  ["someone in the hospital", "pastoral"], ["can't pay my rent", "pastoral"],
  ["going through a divorce", "pastoral"], ["i feel hopeless", "pastoral"],
  ["i want to kill myself", "crisis"], ["my husband hits me", "crisis"],
  ["I don't want to live anymore", "crisis"],
  ["what time is church", null], ["where is the kids check in", null],
  ["sermon on anxiety", "pastoral"], ["plan a visit", null], ["baptism", null],
];
for (const [q, want] of CARE) {
  const got = m.careLevel(q);
  if (got !== want) fail(`care "${q}" -> ${got} expected ${want}`);
}

// ── 4. Nonsense should not return padded results ─────────────
for (const q of ["asdfgh", "pizza recipe", "bitcoin price", "xyz qwerty"]) {
  const r = m.matchCatalog(q);
  if (r.matches.length) fail(`nonsense "${q}" returned [${r.matches.map((x) => x.entry.id).join(", ")}]`);
}

console.log(`\nintent cases: ${pass}/${CASES.length}   catalog entries: ${cat.CATALOG.length}`);
if (failed) { console.error(`${failed} failure(s)`); process.exit(1); }
console.log("search eval: all good");
