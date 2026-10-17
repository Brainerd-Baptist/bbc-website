// Lexical matching for the site search. Runs instantly in the browser (no
// network) and again on the server. It handles plurals, small typos, and the
// visitor vocabulary in lib/search-catalog.ts. When it can't tell what
// someone means, the server falls back to a small AI router that may only
// choose from catalog IDs.

import { CATALOG, CARE_ID, type CatalogEntry } from "./search-catalog";

const STOPWORDS = new Set(
  ("a an the and or but if so of to in on at by for with from as is are was were be been am do does did " +
    "i me my mine we us our you your it its this that these those there here can could should would will " +
    "how what where when who whom why which about into out up down over any some get got want wanna need " +
    "looking look find please hi hello hey church bbc brainerd baptist info information page website site " +
    "tell show take go going come").split(" "),
);

function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w;
}

export function normalize(q: string): string {
  return q
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9ñáéíóúü:\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(q: string, keepStop = false): string[] {
  return normalize(q)
    .split(/[\s-]+/)
    .filter((t) => t && (keepStop || !STOPWORDS.has(t)))
    .map(stem);
}

// A few words visitors use that don't appear in any keyword list.
const SYNONYMS: Record<string, string[]> = {
  mom: ["kid", "child"],
  dad: ["kid", "child"],
  parent: ["kid", "child"],
  son: ["kid", "child"],
  daughter: ["kid", "child"],
  grandchild: ["kid", "child"],
  grandkid: ["kid", "child"],
  pastor: ["staff"],
  minister: ["staff"],
  preacher: ["sermon"],
  gospel: ["jesus"],
  christ: ["jesus"],
  bathroom: ["restroom"],
  toilet: ["restroom"],
  wc: ["restroom"],
  attire: ["wear"],
  clothes: ["wear"],
  outfit: ["wear"],
  hour: ["time"],
  open: ["time"],
  bible: ["belief"],
  cost: ["give"],
};

// ── Vocabulary + document frequency (rare words count for more) ──────
interface Indexed {
  entry: CatalogEntry;
  kws: string[][]; // stemmed non-stopword tokens per keyword phrase
  titleToks: Set<string>;
}

const INDEX: Indexed[] = CATALOG.map((entry) => ({
  entry,
  kws: entry.keywords.map((k) => tokens(k)).filter((t) => t.length > 0),
  titleToks: new Set(tokens(entry.title)),
}));

const DF = new Map<string, number>();
for (const ix of INDEX) {
  const seen = new Set<string>();
  for (const kw of ix.kws) for (const t of kw) seen.add(t);
  ix.titleToks.forEach((t) => seen.add(t));
  seen.forEach((t) => DF.set(t, (DF.get(t) ?? 0) + 1));
}
const N = INDEX.length;
const VOCAB = [...DF.keys()];

function idf(t: string): number {
  const df = DF.get(t) ?? 1;
  return Math.log(1 + N / df);
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

/** Query tokens, with typos snapped to the nearest known word and synonyms added. */
function queryTokens(q: string): Set<string> {
  const out = new Set<string>();
  for (const t of tokens(q)) {
    out.add(t);
    if (!DF.has(t) && t.length >= 5 && !/\d/.test(t)) {
      const max = t.length >= 8 ? 2 : 1;
      let best: string | null = null;
      let bestD = max + 1;
      for (const v of VOCAB) {
        if (v.length < 4) continue;
        const d = lev(t, v, max);
        if (d < bestD) { bestD = d; best = v; }
      }
      if (best) out.add(best);
    }
    for (const s of SYNONYMS[t] ?? []) out.add(stem(s));
  }
  return out;
}

export interface Match {
  entry: CatalogEntry;
  score: number;
}

export interface MatchResult {
  matches: Match[];
  /** True when the top result is clearly the right answer. */
  confident: boolean;
}

export function matchCatalog(q: string, limit = 5): MatchResult {
  const qset = queryTokens(q);
  if (qset.size === 0) return { matches: [], confident: false };
  const norm = normalize(q);

  const scored: Match[] = [];
  for (const ix of INDEX) {
    const kwScores: number[] = [];
    for (let i = 0; i < ix.kws.length; i++) {
      const kw = ix.kws[i];
      if (!kw.every((t) => qset.has(t))) continue;
      const base = kw.reduce((s, t) => s + idf(t), 0) * (1 + 0.3 * (kw.length - 1));
      // Whole phrase appearing verbatim is the strongest signal.
      const verbatim = kw.length > 1 && norm.includes(normalize(ix.entry.keywords[i])) ? 1.25 : 1;
      kwScores.push(base * verbatim);
    }
    let score = 0;
    if (kwScores.length) {
      kwScores.sort((a, b) => b - a);
      score = kwScores[0] + 0.3 * kwScores.slice(1, 4).reduce((a, b) => a + b, 0);
    }
    let titleHit = 0;
    ix.titleToks.forEach((t) => { if (qset.has(t)) titleHit += idf(t) * 0.5; });
    score += titleHit;
    if (score > 0) scored.push({ entry: ix.entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  const second = scored[1];
  // Drop weak tails so we never pad the list with unhelpful results.
  const floor = top ? Math.max(1.6, top.score * 0.4) : 0;
  const matches = scored.filter((m) => m.score >= floor).slice(0, limit);
  const confident = !!top && top.score >= 3.2 && (!second || top.score >= second.score * 1.25);
  return { matches, confident };
}

// ── Sensitive / pastoral / crisis handling ───────────────────────────
export type CareLevel = "crisis" | "pastoral" | null;

const CRISIS = [
  /\b(suicid\w*|kill (myself|me)|end (my|it all)|want to die|wanna die|better off dead|dont want to (live|be here)|no reason to live|hurt(ing)? myself|self[- ]?harm|cut(ting)? myself|overdos\w*)\b/,
  /\b(abus(e|ed|ing|ive)|beat(s|ing)? me|hits? me|hit me|afraid of (my|him|her)|domestic violence|not safe at home|unsafe at home|being threatened|rape[d]?|assault(ed)?|molest\w*)\b/,
];

const PASTORAL = [
  /\b(prayer|pray (for|with)|need (a )?prayer|prayers)\b/,
  /\b(grief|grieving|mourning|bereave\w*|passed away|died|death of|lost (my|a) (husband|wife|mom|dad|mother|father|son|daughter|child|baby|friend|spouse|parent|brother|sister)|funeral|memorial service)\b/,
  /\b(hospital|surgery|cancer|terminal|dying|chemo|diagnos\w*|hospice|icu|in the er)\b/,
  /\b(divorc\w*|separat(ed|ion)|affair|cheat(ed|ing)|marriage (is )?(trouble|falling|struggl\w*|problems?)|my marriage)\b/,
  /\b(depress\w*|anxi\w*|panic|hopeless|overwhelmed|lonely|struggling|addict\w*|relapse|alcohol\w*|porn\w*|gambl\w*)\b/,
  /\b(cant|can not|unable to) (pay|afford)\b|\b(eviction|evicted|homeless|utilities|no food|need food|hungry|behind on (rent|bills)|help (with|paying) (rent|bills)|financial (help|assistance|hardship)|benevolence)\b/,
  /\b(pregnan\w*|miscarriage|abortion|infertil\w*)\b/,
  /\b(counsel(ing|or|lor)|therap(y|ist)|pastoral care|home visit)\b/,
];

export function careLevel(q: string): CareLevel {
  const n = normalize(q);
  if (CRISIS.some((r) => r.test(n))) return "crisis";
  if (PASTORAL.some((r) => r.test(n))) return "pastoral";
  return null;
}

export { CARE_ID };
