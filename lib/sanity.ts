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
  description?: string;
  outline?: unknown[];   // Portable Text
  notes?: unknown[];     // Portable Text
  series: {
    _id: string;
    title: string;
    slug: { current: string };
    accentColor?: string;
    bgColor?: string;
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
}

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
  description,
  series->{
    _id,
    title,
    slug,
    accentColor,
    bgColor
  }
`;

const SERMON_DETAIL_FIELDS = `
  ${SERMON_FIELDS},
  outline,
  notes
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
