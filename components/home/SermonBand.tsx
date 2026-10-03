import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import ListenButton from "./ListenButton";
import { getLatestSermon, formatSermonDate } from "@/lib/sermon";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";

import Card from "@/components/ui/Card";
export default async function SermonBand() {
  const sermon = await getLatestSermon();

  const { title, passage, speaker, series, part, summary, watchUrl, watchUrlIsInternal, thumbnail } = sermon;
  const date = formatSermonDate(sermon.date);
  const seriesLabel = series ? (part ? `${series} · ${part}` : series) : "Latest";

  // When we found the sermon's own /sermons/[slug] page, send people there —
  // it has the inline player, outline, and notes tabs. That page doesn't
  // exist until this sermon is entered in Sanity (or the static fallback),
  // which lags the live Drive/YouTube feed by however long it takes someone
  // to add it. Rather than bouncing people out to YouTube in that gap, send
  // them to the general sermons list — still on-site, and it'll pick up the
  // real page itself the moment the sermon is cataloged.
  const WatchLink = Link;
  const watchLinkProps = { href: watchUrlIsInternal ? watchUrl : "/sermons" };

  // Audio ("Listen") option, straight from the podcast feed — independent of
  // whether this sermon has a /sermons/[slug] page yet. Falls back to the
  // day before in case the episode published a little early/late relative
  // to the sermon date (same lookup the old per-sermon notes page used).
  let audioUrl = "";
  try {
    const podcastMap = await getPodcastAudioMap();
    const key = dateToKey(sermon.date);
    const d = new Date(sermon.date + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    const prevKey = dateToKey(d.toISOString().slice(0, 10));
    audioUrl = podcastMap[key] || podcastMap[prevKey] || "";
  } catch {
    // Podcast feed unreachable — just omit the Listen option.
  }

  return (
    <section className="section-pad">
      <div className="relative max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">Latest Sermon</p>
              <div className="blue-divider" />
            </div>
            <Link
              href="/sermons"
              className="text-sm font-semibold text-accent-text hover:underline flex items-center gap-1.5 shrink-0"
            >
              All sermons
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {/* Featured sermon card */}
        <ScrollReveal delay={100}>
          <Card lift className="rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">

              {/* Thumbnail / Play */}
              <div className="md:col-span-2 min-h-[240px] relative flex items-center justify-center bg-brand-navy">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className="object-cover opacity-70"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    unoptimized
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-navy-deep) 100%)" }}
                  />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-brand-navy/40" />

                {/* Series chip */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="label-micro text-accent bg-black/30 border border-accent/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    {seriesLabel}
                  </span>
                </div>

                {/* Play button */}
                <WatchLink
                  {...watchLinkProps}
                  className="relative z-10"
                  aria-label={`Watch ${title}`}
                >
                  <div className="w-16 h-16 rounded-full bg-accent hover:bg-accent-solid-hover flex items-center justify-center cursor-pointer transition shadow-lg shadow-accent/40 hover:scale-105">
                    <svg width="22" height="22" viewBox="0 0 24 24" style={{ fill: "var(--fg-on-accent)" }}>
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </WatchLink>
              </div>

              {/* Info panel */}
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                <h3
                  className="font-condensed font-800 text-fg text-2xl md:text-3xl leading-tight mb-4"
                  style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                >
                  {title}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-fg-muted text-sm mb-6">
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    {speaker || "Curtis Hill"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {date}
                  </span>
                  {passage && (
                    <span className="flex items-center gap-1.5 text-accent-text">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                      {passage}
                    </span>
                  )}
                </div>
                {summary && (
                  <p className="text-fg-muted text-sm leading-relaxed mb-6 line-clamp-3">
                    {summary}
                  </p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <WatchLink {...watchLinkProps} className="btn-primary text-sm">
                    Watch Now
                  </WatchLink>
                  {audioUrl && (
                    <ListenButton
                      className="btn-outline-navy text-sm inline-flex items-center gap-1.5"
                      track={{
                        title,
                        speaker: speaker || "Curtis Hill",
                        series: series || "",
                        audioUrl,
                        youtubeId: sermon.youtubeId ?? undefined,
                        // No Sanity slug yet for a sermon this fresh — key the
                        // saved-position/dedup logic off the YouTube id instead.
                        slug: `latest-${sermon.youtubeId || sermon.date}`,
                        accentColor: "var(--accent)",
                      }}
                    />
                  )}
                  <Link
                    href="/sermons"
                    className="btn-outline-navy text-sm"
                  >
                    Browse All Series
                  </Link>
                </div>
              </div>

            </div>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
}
