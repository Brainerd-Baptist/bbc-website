import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getSeriesBySlug,
  getSermonsBySeriesWithResources,
  getStandaloneSermons,
  getAllSeries,
  formatDate,
} from "@/lib/sanity";
import type { SanityResource } from "@/lib/sanity";
import { ALL_SERIES as FALLBACK_SERIES, SERMONS as FALLBACK_SERMONS } from "@/lib/sermons";
import { inkOn, inkVarsFor } from "@/lib/identity-colors";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import ResourcesMentioned from "@/components/sermons/ResourcesMentioned";
export const revalidate = 300;

// Pre-generate series slugs at build time
export async function generateStaticParams() {
  const sanitySeries = await getAllSeries().catch(() => []);
  const sanityParams  = sanitySeries.map((s) => ({ slug: s.slug.current }));
  const staticParams  = FALLBACK_SERIES.map((s) => ({ slug: s.id }));
  return [...sanityParams, ...staticParams, { slug: "other" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "other") {
    return {
      title: "Other Sermons — Brainerd Baptist Church",
      description: "Standalone sermons that aren't part of a series.",
    };
  }
  const series = await getSeriesBySlug(slug).catch(() => null);
  if (!series) return { title: "Series — Brainerd Baptist Church" };
  return {
    title: `${series.title} — Brainerd Baptist Church`,
    description: series.description ?? `Sermon series: ${series.title}`,
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isOther = slug === "other";

  // Try Sanity first, fall back to static data. "other" is a synthetic
  // grouping (SermonGrid.tsx) for sermons with no series at all — there's no
  // Sanity `series` document for it, so it's fetched separately rather than
  // through getSermonsBySeries (which matches a real series reference).
  const [seriesData, sanitySermons] = await Promise.all([
    isOther ? Promise.resolve(null) : getSeriesBySlug(slug).catch(() => null),
    isOther ? getStandaloneSermons().catch(() => []) : getSermonsBySeriesWithResources(slug).catch(() => []),
  ]);

  // If Sanity has no series, try fallback
  const fallbackSeries = FALLBACK_SERIES.find((s) => s.id === slug);
  if (!isOther && !seriesData && !fallbackSeries) notFound();

  const seriesTitle       = isOther ? "Other Sermons" : (seriesData?.title       ?? fallbackSeries?.name ?? slug);
  const seriesDescription = isOther ? "Standalone sermons that aren't part of a series." : (seriesData?.description ?? null);
  const accentColor       = seriesData?.accentColor ?? "#00abc9";
  const bgColor           = seriesData?.bgColor     ?? "#00205B";

  const sermons =
    sanitySermons.length > 0
      ? sanitySermons.map((s) => ({
          id:       s._id,
          slug:     s.slug?.current ?? "",
          title:    s.title,
          speaker:  s.speaker,
          date:     s.date,
          passage:  s.passage ?? "",
          duration: s.duration,
          youtubeId: s.youtubeId ?? "",
        }))
      : FALLBACK_SERMONS.filter((s) => s.seriesId === slug).map((s) => ({
          id:       s.id,
          slug:     "",
          title:    s.title,
          speaker:  s.speaker,
          date:     s.date,
          passage:  s.passage,
          duration: s.duration,
          youtubeId: s.youtubeId,
        }));

  const heroThumb = sermons[sermons.length - 1]?.youtubeId
    ? `https://img.youtube.com/vi/${sermons[sermons.length - 1].youtubeId}/maxresdefault.jpg`
    : null;

  // Every resource mentioned anywhere in this series — each sermon's own
  // resourcesMentioned plus the series' own (the ones auto-promoted after
  // 3+ consecutive weeks, per lib/sermon-resources.ts) — deduped by id.
  // Not shown on "other" (no real series doc, so nothing to aggregate).
  // Mirrors dedupeResources() in app/sermons/[slug]/page.tsx.
  const seriesResources: SanityResource[] = (() => {
    if (isOther) return [];
    const seen = new Set<string>();
    const out: SanityResource[] = [];
    for (const r of [...sanitySermons.flatMap((s) => s.resourcesMentioned ?? []), ...(seriesData?.resourcesMentioned ?? [])]) {
      if (!r || seen.has(r._id)) continue;
      seen.add(r._id);
      out.push(r);
    }
    return out;
  })();

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden" style={{ background: bgColor }}>
        {/* Blurred art from last sermon thumbnail */}
        {heroThumb && (
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src={heroThumb}
              alt=""
              fill
              className="object-cover opacity-15 blur-sm scale-110"
              unoptimized
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bgColor}cc 0%, ${bgColor} 100%)` }} />
          </div>
        )}

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Back link */}
          <Link
            href="/sermons"
            className="inline-flex items-center gap-1.5 text-fg-on-dark-muted hover:text-white/70 text-xs font-semibold tracking-wide uppercase mb-8 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2L4 6l4 4"/>
            </svg>
            All Sermons
          </Link>

          {/* Series eyebrow */}
          <p
            className="label-micro mb-4"
            style={{ color: inkOn(accentColor, bgColor) }}
          >
            Series
          </p>

          <div className="flex justify-center mb-5">
            <div className="h-px w-12" style={{ background: accentColor, opacity: 0.4 }} />
          </div>

          <h1
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)", letterSpacing: "-0.025em", lineHeight: 0.95 }}
          >
            {seriesTitle}
          </h1>

          {seriesDescription && (
            <p className="text-white/55 text-base md:text-lg leading-relaxed mt-5 max-w-xl mx-auto">
              {seriesDescription}
            </p>
          )}

          <p className="mt-6 text-fg-on-dark-muted text-sm">
            {sermons.length} sermon{sermons.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Sermon list ───────────────────────────────────────────────── */}
      <Section className="px-5 md:px-8 py-14">
        <div className="max-w-3xl mx-auto space-y-3">
          {sermons.length === 0 && (
            <p className="text-center text-fg-muted py-20">No sermons yet in this series.</p>
          )}
          {sermons.map((sermon, i) => {
            const url = sermon.slug
              ? `/sermons/${sermon.slug}`
              : sermon.id
              ? `/sermons/${sermon.id}`
              : `https://www.youtube.com/watch?v=${sermon.youtubeId}`;
            const isInternal = !!(sermon.slug || sermon.id);
            const thumb = sermon.youtubeId
              ? `https://img.youtube.com/vi/${sermon.youtubeId}/hqdefault.jpg`
              : null;

            return (
              <Card
                key={sermon.id}
                lift lite className="group flex gap-0 rounded-2xl overflow-hidden transition duration-200"
              >
                {/* Episode number + thumbnail — links to sermon.
                    Kept (smaller) on mobile instead of hidden: the series
                    art is how people recognize the message, not just a
                    density optimization. */}
                <a
                  href={url}
                  target={isInternal ? undefined : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  className="relative flex flex-shrink-0 w-[76px] sm:w-[130px] md:w-[160px] items-center justify-center overflow-hidden"
                  style={{ background: bgColor }}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={sermon.title}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                      sizes="(max-width: 640px) 76px, 160px"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  <div
                    className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[9px] sm:text-[10px] font-bold tabular-nums text-white/60 bg-black/30 rounded-md px-1 sm:px-1.5 py-0.5"
                  >
                    {i + 1}
                  </div>
                  <div className="relative z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: accentColor + "cc", boxShadow: `0 4px 16px ${accentColor}44` }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" className="sm:w-[11px] sm:h-[11px]" style={{ fill: "var(--fg-on-accent)" }}>
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </a>

                {/* Info */}
                <div className="flex-1 px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {sermon.passage && (
                        <a
                          href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold hover:underline identity-ink"
                          style={inkVarsFor(accentColor)}
                        >
                          {sermon.passage}
                        </a>
                      )}
                    </div>
                    <a
                      href={url}
                      target={isInternal ? undefined : "_blank"}
                      rel={isInternal ? undefined : "noopener noreferrer"}
                      className="block text-fg font-semibold text-base leading-snug mb-1 group-hover:text-accent-text transition-colors"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {sermon.title}
                    </a>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-fg-muted text-xs">
                      <span>{sermon.speaker}</span>
                      <span>{formatDate(sermon.date)}</span>
                      {sermon.duration && <span>{sermon.duration}</span>}
                    </div>
                  </div>

                  <div className="hidden sm:flex shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
                      strokeWidth="2" className="text-accent-text"
                    >
                      <path d="M3 7h8M8 4l3 3-3 3"/>
                    </svg>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ── Resources from this series ───────────────────────────────── */}
      {seriesResources.length > 0 && (
        <Section className="px-5 md:px-8 pb-14">
          <div className="max-w-3xl mx-auto">
            <ResourcesMentioned resources={seriesResources} accentColor={accentColor} />
          </div>
        </Section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section
        className="py-14 px-6 border-t border-border"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow-white mb-3">More from BBC</p>
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-6 py-3 rounded-full transition"
          >
            Browse All Sermons
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 2l4 4-4 4"/>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
