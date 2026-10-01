import Image from "next/image";
import { getSermonsBySeries, getSermonsByBook } from "@/lib/sanity";
import { SERMONS, formatDate } from "@/lib/sermons";
import { inkVarsFor } from "@/lib/identity-colors";

interface Props {
  currentId: string;   // slug of the sermon being viewed
  seriesId: string;    // series slug to match against
  book?: string;       // book of the Bible, for the cross-series fallback
  accentColor: string;
}

interface RelatedItem {
  id: string;
  title: string;
  speaker: string;
  date: string;
  youtubeId: string;
  href: string;
}

async function seriesMatches(currentId: string, seriesId: string): Promise<RelatedItem[]> {
  if (!seriesId) return [];

  try {
    const sanitySermons = await getSermonsBySeries(seriesId);
    const mapped = sanitySermons
      .filter((s) => s.slug?.current && s.slug.current !== currentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => ({
        id:        s._id,
        title:     s.title,
        speaker:   s.speaker,
        date:      s.date,
        youtubeId: s.youtubeId ?? "",
        href:      `/sermons/${s.slug.current}`,
      }));
    if (mapped.length > 0) return mapped;
  } catch {
    // fall through to static
  }

  return SERMONS
    .filter((s) => s.seriesId === seriesId && s.id !== currentId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => ({
      id:        s.id,
      title:     s.title,
      speaker:   s.speaker,
      date:      s.date,
      youtubeId: s.youtubeId ?? "",
      href:      `/sermons/${s.id}`,
    }));
}

/** Same-book sermons from OTHER series — the "more like this" fallback for
 * when a sermon is a one-off, or near the start/end of its own series and
 * "More from This Series" alone would come up thin or empty. */
async function bookMatches(
  currentId: string,
  book: string | undefined,
  excludeIds: Set<string>
): Promise<RelatedItem[]> {
  if (!book) return [];

  try {
    const sanitySermons = await getSermonsByBook(book);
    const mapped = sanitySermons
      .filter((s) => s.slug?.current && s.slug.current !== currentId && !excludeIds.has(s.slug.current))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => ({
        id:        s._id,
        title:     s.title,
        speaker:   s.speaker,
        date:      s.date,
        youtubeId: s.youtubeId ?? "",
        href:      `/sermons/${s.slug.current}`,
      }));
    if (mapped.length > 0) return mapped;
  } catch {
    // fall through to static
  }

  return SERMONS
    .filter((s) => s.book === book && s.id !== currentId && !excludeIds.has(s.id))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => ({
      id:        s.id,
      title:     s.title,
      speaker:   s.speaker,
      date:      s.date,
      youtubeId: s.youtubeId ?? "",
      href:      `/sermons/${s.id}`,
    }));
}

function SermonCardRow({ items }: { items: RelatedItem[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((s) => (
        <a
          key={s.id}
          href={s.href}
          className="group flex gap-3 rounded-xl overflow-hidden border border-border hover:border-accent/25 bg-surface-raised hover:shadow-sm transition p-3"
        >
          {/* Thumbnail */}
          {s.youtubeId && (
            <div className="relative flex-shrink-0 w-20 h-[52px] rounded-lg overflow-hidden bg-brand-navy/10">
              <Image
                src={`https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`}
                alt={s.title}
                fill
                className="object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                sizes="80px"
                unoptimized
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-fg text-sm font-semibold leading-snug mb-1 line-clamp-2 group-hover:text-accent-text transition-colors"
              style={{ letterSpacing: "-0.015em" }}
            >
              {s.title}
            </p>
            <p className="text-fg-muted text-[11px]">
              {s.speaker} · {formatDate(s.date)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

export default async function RelatedSermons({ currentId, seriesId, book, accentColor }: Props) {
  const seriesAll = await seriesMatches(currentId, seriesId);
  const series = seriesAll.slice(0, 4);

  // Only reach for cross-series, same-book recommendations when the series
  // pool is thin (a one-off message, or near the start/end of its series) —
  // "More from This Series" stays the primary signal when it has enough.
  const needsFallback = series.length < 4;
  const excludeIds = new Set([currentId, ...series.map((s) => s.id)]);
  const bookAll = needsFallback ? await bookMatches(currentId, book, excludeIds) : [];
  const bookRecs = bookAll.slice(0, 4 - series.length);

  if (series.length === 0 && bookRecs.length === 0) return null;

  return (
    <div className="px-5 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {series.length > 0 && (
          <section>
            <div className="border-t border-border pt-10 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="label-micro identity-ink" style={inkVarsFor(accentColor)}>
                  More from This Series
                </h2>
                <a
                  href={`/series/${seriesId}`}
                  className="text-[11px] font-semibold text-fg-muted hover:text-accent-text transition-colors inline-flex items-center gap-1"
                >
                  View all
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7h8M8 4l3 3-3 3" />
                  </svg>
                </a>
              </div>
            </div>
            <SermonCardRow items={series} />
          </section>
        )}

        {bookRecs.length > 0 && (
          <section>
            <div className={series.length > 0 ? "border-t border-border pt-10 mb-6" : "pt-2 mb-6"}>
              <h2 className="label-micro identity-ink" style={inkVarsFor(accentColor)}>
                More in {book}
              </h2>
            </div>
            <SermonCardRow items={bookRecs} />
          </section>
        )}
      </div>
    </div>
  );
}
