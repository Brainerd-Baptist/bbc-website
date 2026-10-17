// Sermon + series search for the site search. Lexical over title, series,
// speaker, passage, book and description, with optional topic words supplied
// by the AI router ("anxious" -> "worry", "fear", "peace") so a search for
// a feeling still finds the sermon that addresses it.

import { getAllSermons, getAllSeries, formatDate } from "@/lib/sanity";
import { normalize } from "@/lib/search-match";

export interface SermonHit {
  kind: "sermon" | "series";
  title: string;
  url: string;
  meta: string;
}

interface Doc {
  hit: SermonHit;
  strong: string; // title / series / speaker / passage / book
  weak: string;   // description
  date: string;
}

const STOP = new Set(
  "a an the and or of to in on at for with from is are my me i we you your it this that about sermon sermons message messages series preach preached preaching pastor watch listen what when where how".split(" "),
);

let cache: { at: number; docs: Doc[] } | null = null;
const TTL = 10 * 60 * 1000;

async function load(): Promise<Doc[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.docs;
  const [sermons, series] = await Promise.all([
    getAllSermons().catch(() => []),
    getAllSeries().catch(() => []),
  ]);
  const docs: Doc[] = [];
  for (const s of series) {
    if (!s?.slug?.current) continue;
    docs.push({
      hit: { kind: "series", title: s.title, url: `/series/${s.slug.current}`, meta: "Sermon series" },
      strong: normalize(s.title),
      weak: normalize(s.description ?? ""),
      date: "",
    });
  }
  for (const s of sermons) {
    if (!s?.slug?.current) continue;
    const bits = [s.speaker, s.passage, s.series?.title].filter(Boolean).join(" · ");
    docs.push({
      hit: {
        kind: "sermon",
        title: s.title,
        url: `/sermons/${s.slug.current}`,
        meta: [bits, s.date ? formatDate(s.date) : ""].filter(Boolean).join(" · "),
      },
      strong: normalize([s.title, s.series?.title, s.speaker, s.passage, s.book, ...(s.passages ?? [])].filter(Boolean).join(" ")),
      weak: normalize(s.description ?? ""),
      date: s.date ?? "",
    });
  }
  cache = { at: Date.now(), docs };
  return docs;
}

function words(q: string): string[] {
  return normalize(q)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
}

function hasWord(hay: string, w: string): boolean {
  return new RegExp(`(^|\\s)${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\w*`).test(hay);
}

/** True when the query reads like someone looking for sermon content. */
export function sermonIntent(q: string): boolean {
  return /\b(sermons?|messages?|preach\w*|series|teach\w*|study|passage|verse|chapter|book of|romans|genesis|exodus|psalms?|proverbs|isaiah|matthew|mark|luke|john|acts|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|hebrews|james|peter|jude|revelation)\b/i.test(q);
}

export async function searchSermons(q: string, extraTopics: string[] = [], limit = 4): Promise<SermonHit[]> {
  const docs = await load();
  const main = words(q);
  const topics = extraTopics.flatMap((t) => words(t));
  if (!main.length && !topics.length) return [];

  const scored: { doc: Doc; score: number }[] = [];
  for (const doc of docs) {
    let score = 0;
    let mainHits = 0;
    for (const w of main) {
      if (hasWord(doc.strong, w)) { score += 3; mainHits++; }
      else if (hasWord(doc.weak, w)) { score += 1; mainHits++; }
    }
    for (const w of topics) {
      if (hasWord(doc.strong, w)) score += 1.5;
      else if (hasWord(doc.weak, w)) score += 1;
    }
    if (mainHits === 0 && score < 2) continue;
    if (doc.hit.kind === "series") score += 0.5;
    if (score >= 3) scored.push({ doc, score });
  }
  scored.sort((a, b) => b.score - a.score || b.doc.date.localeCompare(a.doc.date));
  return scored.slice(0, limit).map((s) => s.doc.hit);
}
