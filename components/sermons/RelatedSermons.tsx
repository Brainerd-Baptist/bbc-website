import Image from "next/image";
import { getSermonsBySeries } from "@/lib/sanity";
import { SERMONS, formatDate } from "@/lib/sermons";
import { inkVarsFor } from "@/lib/identity-colors";

interface Props {
  currentId: string;   // slug of the sermon being viewed
  seriesId: string;    // series slug to match against
  accentColor: string;
}

export default async function RelatedSermons({ currentId, seriesId, accentColor }: Props) {
  if (!seriesId) return null;

  // Try Sanity first
  let related: Array<{
    id: string;
    title: string;
    speaker: string;
    date: string;
    youtubeId: string;
    href: string;
  }> = [];

  try {
    const sanitySermons = await getSermonsBySeries(seriesId);
    related = sanitySermons
      .filter((s) => s.slug?.current && s.slug.current !== currentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
      .map((s) => ({
        id:        s._id,
        title:     s.title,
        speaker:   s.speaker,
        date:      s.date,
        youtubeId: s.youtubeId ?? "",
        href:      `/sermons/${s.slug.current}`,
      }));
  } catch {
    // fall through to static
  }

  // Fall back to static data if Sanity returned nothing
  if (related.length === 0) {
    related = SERMONS
      .filter((s) => s.seriesId === seriesId && s.id !== currentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
      .map((s) => ({
        id:        s.id,
        title:     s.title,
        speaker:   s.speaker,
        date:      s.date,
        youtubeId: s.youtubeId ?? "",
        href:      `/sermons/${s.id}`,
      }));
  }

  if (related.length === 0) return null;

  return (
    <section className="px-5 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-border pt-10 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="label-micro identity-ink"
              style={inkVarsFor(accentColor)}
            >
              More from This Series
            </h2>
            <a
              href={`/series/${seriesId}`}
              className="text-[11px] font-semibold text-fg-muted hover:text-accent-text transition-colors inline-flex items-center gap-1"
            >
              View all
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {related.map((s) => (
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
      </div>
    </section>
  );
}
