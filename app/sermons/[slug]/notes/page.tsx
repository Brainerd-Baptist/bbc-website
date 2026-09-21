/**
 * /sermons/[slug]/notes — Interactive, type-first sermon notes
 *
 * Server component: resolves sermon data, then hands off to NotesEditor
 * (a client component) which handles typing, localStorage, and PDF export.
 */

import { notFound } from "next/navigation";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getSermonBySlug } from "@/lib/sanity";
import { getSermonNotesByDate } from "@/lib/sermon";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";
import NotesEditor from "./NotesEditor";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticS = SERMONS.find((s) => s.id === slug);
  const title = staticS?.title ?? "Sermon";
  return {
    title: `${title} — Message Notes`,
    robots: "noindex",
  };
}

export default async function SermonNotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const sanitySermon = await getSermonBySlug(slug).catch(() => null);
  let title = "", series = "", passage = "", speaker = "", date = "";

  if (sanitySermon) {
    title   = sanitySermon.title   ?? "";
    series  = sanitySermon.series?.title ?? "";
    passage = sanitySermon.passage ?? "";
    speaker = sanitySermon.speaker ?? "";
    date    = sanitySermon.date    ?? "";
  } else {
    const staticS = SERMONS.find((s) => s.id === slug);
    if (!staticS) notFound();
    title   = staticS.title;
    series  = staticS.series;
    passage = staticS.passage;
    speaker = staticS.speaker;
    date    = staticS.date;
  }

  const notes = date ? await getSermonNotesByDate(date) : null;
  const outline: string[]    = notes?.outline    ?? [];
  const highlights: string[] = notes?.highlights ?? [];
  const outlineType = (notes?.outlineType ?? "none") as "structured" | "scripture" | "none";

  let audioUrl = "";
  if (date) {
    const podcastMap: Record<string, string> = await getPodcastAudioMap().catch(() => ({}));
    const key = dateToKey(date);
    const d = new Date(date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    const prevKey = dateToKey(d.toISOString().slice(0, 10));
    audioUrl = podcastMap[key] || podcastMap[prevKey] || "";
  }

  const formattedDate = date ? formatDate(date) : "";

  return (
    <NotesEditor
      slug={slug}
      title={title}
      series={series}
      passage={passage}
      speaker={speaker}
      formattedDate={formattedDate}
      outline={outline}
      outlineType={outlineType}
      highlights={highlights}
      audioUrl={audioUrl}
    />
  );
}
