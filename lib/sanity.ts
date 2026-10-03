import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "3l0knw74",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true, // cached at edge; fine for public sermon data
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SanitySermon {
  _id: string;
  title: string;
  slug: { current: string };
  date: string;
  speaker: string;
  passage: string;
  book: string;
  youtubeId: string;
  duration?: string;
  audioUrl?: string;
  passages?: string[];
  description?: string;
  outline?: unknown[];   // Portable Text
  notes?: unknown[];     // Portable Text
  resourcesMentioned?: SanityResource[];
  series: {
    _id: string;
    title: string;
    slug: { current: string };
    accentColor?: string;
    bgColor?: string;
    resourcesMentioned?: SanityResource[];
  };
}

export interface SanitySeries {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  accentColor?: string;
  bgColor?: string;
  active?: boolean;
  resourcesMentioned?: SanityResource[];
}

export interface SanityResource {
  _id: string;
  title: string;
  creator?: string;
  type: "book" | "article" | "ministry" | "video" | "podcast" | "prayer" | "other";
  url: string;
  blurb?: string;
  topics?: string[];
  relatedPassage?: string;
  status: "active" | "archived";
  featured?: boolean;
  needsReview?: boolean;
  /** Populated client-side when building the catalog — which sermon(s)/series
   * this resource was pulled from, for the "mentioned in" chips. Not part of
   * the Sanity document itself. */
  mentionedIn?: { title: string; slug: string; kind: "sermon" | "series" }[];
}

const RESOURCE_FIELDS = `
  _id, title, creator, type, url, blurb, topics, relatedPassage, status, featured, needsReview
`;

/** Only ever surface active resources on the public site — archived ones stay
 * referenced (so no sermon page link ever 404s) but drop out of search/catalog. */
const ACTIVE_RESOURCE_FILTER = `status != "archived"`;

/**
 * Filters a `resourcesMentioned[]` reference array by a field on the
 * dereferenced resource, BEFORE dereferencing+projecting — `@->status` reads
 * the field off the referenced document while `@` is still the reference.
 *
 * Confirmed 2026-10-03 this is not optional style: the more obvious
 * `resourcesMentioned[]->{ ...fields, status }[status != "archived"]` — filter
 * applied AFTER the `->{...}` projection, against the projected object —
 * reproducibly resolves to `[null]` against this dataset even though `status`
 * is right there in the projected object ("active", not "archived"). Moving
 * the same filter before the dereference, on the reference array itself,
 * resolves correctly every time. Root-caused by comparing
 * `resourcesMentioned[]->{title,status}` (works) against the same query with
 * `[status != "archived"]` appended (returns `[null]`) against api.sanity.io
 * directly — not a CDN or propagation issue, a real difference in how this
 * GROQ version evaluates a post-projection filter on a dereferenced array.
 */
const ACTIVE_RESOURCE_REF_FILTER = `@->status != "archived"`;

// ── Queries ───────────────────────────────────────────────────────────────────

const SERMON_FIELDS = `
  _id,
  title,
  slug,
  date,
  speaker,
  passage,
  book,
  youtubeId,
  duration,
  audioUrl,
  passages,
  description,
  series->{
    _id,
    title,
    slug,
    accentColor,
    bgColor
  }
`;

// Note: this repeats series{...} fully (rather than spreading SERMON_FIELDS)
// because GROQ object projections can't declare the same key ("series")
// twice — the base SERMON_FIELDS' plain series-> block has to be left out
// here and replaced with this richer one instead.
const SERMON_DETAIL_FIELDS = `
  _id, title, slug, date, speaker, passage, book, youtubeId, duration, audioUrl, passages, description,
  outline,
  notes,
  "resourcesMentioned": resourcesMentioned[${ACTIVE_RESOURCE_REF_FILTER}]->{ ${RESOURCE_FIELDS} },
  series->{
    _id, title, slug, accentColor, bgColor,
    "resourcesMentioned": resourcesMentioned[${ACTIVE_RESOURCE_REF_FILTER}]->{ ${RESOURCE_FIELDS} }
  }
`;

/** All sermons, newest first */
export async function getAllSermons(): Promise<SanitySermon[]> {
  return sanityClient.fetch(
    `*[_type == "sermon"] | order(date desc) { ${SERMON_FIELDS} }`,
    {},
    { next: { revalidate: 300 } } // refresh every 5 minutes
  );
}

/** Single sermon by slug */
export async function getSermonBySlug(slug: string): Promise<SanitySermon | null> {
  return sanityClient.fetch(
    `*[_type == "sermon" && slug.current == $slug][0] { ${SERMON_DETAIL_FIELDS} }`,
    { slug },
    { next: { revalidate: 300 } }
  );
}

/** All series */
export async function getAllSeries(): Promise<SanitySeries[]> {
  return sanityClient.fetch(
    `*[_type == "series"] | order(startDate desc) {
      _id, title, slug, description, accentColor, bgColor, active
    }`,
    {},
    { next: { revalidate: 3600 } }
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function thumbnailUrl(youtubeId: string): string {
  if (!youtubeId) return "";
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function watchUrl(youtubeId: string, slug?: string): string {
  if (slug) return `/sermons/${slug}`;
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  return "/sermons";
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Fallback (used while Sanity has no content yet) ───────────────────────────
// Remove this once sermons are entered in Sanity Studio

export { SERMONS as FALLBACK_SERMONS } from "./sermons";

/** All sermons for a specific series slug */
export async function getSermonsBySeries(seriesSlug: string): Promise<SanitySermon[]> {
  return sanityClient.fetch(
    `*[_type == "sermon" && series->slug.current == $seriesSlug] | order(date asc) { ${SERMON_FIELDS} }`,
    { seriesSlug },
    { next: { revalidate: 300 } }
  );
}

/**
 * Standalone sermons — no series assigned at all. The browse grid groups
 * these under a synthetic "Other" card (SermonGrid.tsx: seriesId falls back
 * to "other" when a sermon has no series), which links to /series/other.
 * There is no real Sanity `series` document for that card, so the series
 * page needs this separate lookup rather than getSermonsBySeries (which only
 * matches a real series reference and would 404 on "other").
 */
export async function getStandaloneSermons(): Promise<SanitySermon[]> {
  return sanityClient.fetch(
    `*[_type == "sermon" && !defined(series)] | order(date asc) { ${SERMON_FIELDS} }`,
    {},
    { next: { revalidate: 300 } }
  );
}

/** All sermons for a specific book of the Bible, newest first */
export async function getSermonsByBook(book: string): Promise<SanitySermon[]> {
  return sanityClient.fetch(
    `*[_type == "sermon" && book == $book] | order(date desc) { ${SERMON_FIELDS} }`,
    { book },
    { next: { revalidate: 300 } }
  );
}

/** Single series by slug */
export async function getSeriesBySlug(slug: string): Promise<SanitySeries | null> {
  return sanityClient.fetch(
    `*[_type == "series" && slug.current == $slug][0] {
      _id, title, slug, description, accentColor, bgColor, active,
      "resourcesMentioned": resourcesMentioned[${ACTIVE_RESOURCE_REF_FILTER}]->{ ${RESOURCE_FIELDS} }
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  );
}

/** Every active resource, for the /resources catalog — with the sermon(s)
 * and series it's referenced from, for the "mentioned in" chips. A resource
 * with no reference anywhere (orphaned — e.g. its one sermon reference got
 * removed) is left out, since it'd have nothing to link to. */
export async function getAllResources(): Promise<SanityResource[]> {
  return sanityClient.fetch(
    `*[_type == "resource" && ${ACTIVE_RESOURCE_FILTER}] | order(title asc) {
      ${RESOURCE_FIELDS},
      "mentionedIn": [
        ...*[_type == "sermon" && references(^._id)]{ "title": title, "slug": slug.current, "kind": "sermon" },
        ...*[_type == "series" && references(^._id)]{ "title": title, "slug": slug.current, "kind": "series" }
      ]
    }[count(mentionedIn) > 0]`,
    {},
    { next: { revalidate: 3600 } }
  );
}
