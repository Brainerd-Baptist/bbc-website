// The live missions data. The missions team edits it in Brainerd Mail (Missions); this site reads the
// public feed, which has only what they marked public: private countries are not in it at all, and
// hidden people-group names arrive blank. Nothing here ever needs to filter for privacy.
//
// Freshness has two layers, so the page is both instant and safe:
//  1. Brainerd Mail calls /api/revalidate/missions the moment someone saves, which expires the tag
//     below, so the next visitor gets the new data (seconds, not minutes).
//  2. If that call is ever missed, the cached feed still expires on its own after a minute.
// If the feed can't be reached, the last good copy is kept, and the page falls back to the original
// regional map if there has never been one. A missions page is never blank or broken.

export type Level = 1 | 2 | 3;
export const MISSIONS_TAG = "missions-map";

export type FeedCountry = {
  id: string; name: string; level: Level;
  since: string; religion: string; peopleGroup: string; unreachedGroups: string; unreachedPop: string;
};
export type FeedLevel = { level: Level; label: string; blurb: string };
export type MissionsFeed = {
  countries: FeedCountry[];
  levels: FeedLevel[];
  counts: { 1: number; 2: number; 3: number; total: number };
  updatedAt: string;
};

const FEED_URL = process.env.MISSIONS_FEED_URL || "https://mail.brainerdhq.app/api/public/missions";

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const asLevel = (v: unknown): Level | null => (v === 1 || v === 2 || v === 3 ? v : null);

// Trust nothing that crosses the network: rebuild the feed field by field, drop anything malformed.
export function parseFeed(raw: unknown): MissionsFeed | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.countries) || !Array.isArray(r.levels)) return null;
  const countries: FeedCountry[] = [];
  for (const c of r.countries) {
    if (!c || typeof c !== "object") continue;
    const x = c as Record<string, unknown>;
    const level = asLevel(x.level);
    const id = str(x.id).toUpperCase();
    if (!level || !/^[A-Z]{2}$/.test(id) || !str(x.name)) continue;
    countries.push({ id, name: str(x.name), level, since: str(x.since), religion: str(x.religion), peopleGroup: str(x.peopleGroup), unreachedGroups: str(x.unreachedGroups), unreachedPop: str(x.unreachedPop) });
  }
  const levels: FeedLevel[] = ([1, 2, 3] as Level[]).map((l) => {
    const m = (r.levels as unknown[]).find((x) => x && typeof x === "object" && (x as Record<string, unknown>).level === l) as Record<string, unknown> | undefined;
    return { level: l, label: str(m?.label) || `Level ${l}`, blurb: str(m?.blurb) };
  });
  // Count from what we kept, so the numbers can never disagree with the map.
  const counts = { 1: 0, 2: 0, 3: 0, total: countries.length };
  countries.forEach((c) => { counts[c.level]++; });
  return { countries, levels, counts, updatedAt: str(r.updatedAt) };
}

let lastGood: MissionsFeed | null = null;

export async function getMissionsFeed(): Promise<MissionsFeed | null> {
  try {
    const res = await fetch(FEED_URL, {
      headers: { accept: "application/json" },
      next: { revalidate: 60, tags: [MISSIONS_TAG] },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const feed = parseFeed(await res.json());
    if (!feed) throw new Error("feed shape");
    lastGood = feed;
    return feed;
  } catch {
    return lastGood;
  }
}
