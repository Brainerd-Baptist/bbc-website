import { Suspense } from "react";
import { getAllSermons, getAllSeries, FALLBACK_SERMONS } from "@/lib/sanity";
import { ALL_SERIES as FALLBACK_SERIES } from "@/lib/sermons";
import SermonGrid from "@/components/sermons/SermonGrid";
import ContinueListeningShelf, { type SermonForShelf } from "@/components/sermons/ContinueListeningShelf";

export const metadata = {
  title: "Sermons — Brainerd Baptist Church",
  description:
    "Listen to sermons from Brainerd Baptist Church. Expository preaching through books of the Bible — searchable by series, speaker, passage, and year.",
};

export const revalidate = 300; // ISR: regenerate every 5 minutes

export default async function SermonsPage() {
  // Try Sanity first; fall back to static file while CMS is being populated
  const [sanitySermons, sanitySeries] = await Promise.all([
    getAllSermons().catch(() => []),
    getAllSeries().catch(() => []),
  ]);

  const usingSanity = sanitySermons.length > 0;

  const sermons = usingSanity
    ? sanitySermons.map((s) => ({
        id: s._id,
        youtubeId: s.youtubeId ?? "",
        title: s.title,
        slug: s.slug?.current ?? "",
        series: s.series?.title ?? "",
        seriesId: s.series?.slug?.current ?? "",
        seriesAccent: s.series?.accentColor,
        seriesBg: s.series?.bgColor,
        speaker: s.speaker,
        date: s.date,
        passage: s.passage ?? "",
        book: s.book ?? "",
        duration: s.duration,
      }))
    : FALLBACK_SERMONS.map((s) => ({
        id: s.id,
        youtubeId: s.youtubeId,
        title: s.title,
        slug: "",
        series: s.series,
        seriesId: s.seriesId,
        seriesAccent: undefined as string | undefined,
        seriesBg: undefined as string | undefined,
        speaker: s.speaker,
        date: s.date,
        passage: s.passage,
        book: s.book,
        duration: s.duration,
      }));

  const allSeries = usingSanity
    ? sanitySeries.map((s) => ({ id: s.slug.current, name: s.title }))
    : FALLBACK_SERIES;

  const allSpeakers = Array.from(new Set(sermons.map((s) => s.speaker)));
  const allYears = Array.from(
    new Set(sermons.map((s) => s.date.slice(0, 4)))
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-14 px-6 text-center"
        style={{ background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow-white mb-4">Hear from God&apos;s Word</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", letterSpacing: "-0.02em", lineHeight: 0.95 }}
          >
            Sermons
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mt-5">
            Every sermon works through a book of the Bible verse by verse.
            Search by passage, series, or speaker to find what you need.
          </p>
        </div>
      </div>

      {/* ── Featured Hero Sermon ──────────────────────────────────────── */}
      {sermons.length > 0 && (() => {
        const hero = sermons[0];
        const slug = hero.slug || hero.id;
        const thumbUrl = `https://img.youtube.com/vi/${hero.youtubeId}/maxresdefault.jpg`;
        return (
          <section className="px-5 md:px-8 pb-12">
            <div className="max-w-5xl mx-auto">
              <a
                href={`/sermons/${slug}`}
                className="group relative block rounded-3xl overflow-hidden"
                style={{ background: "#0f1e38" }}
              >
                {/* Background thumbnail */}
                <div className="absolute inset-0">
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(7,16,30,0.97) 0%, rgba(7,16,30,0.75) 50%, rgba(7,16,30,0.3) 100%)" }} />
                </div>

                <div className="relative z-10 flex items-center justify-between gap-6 p-7 md:p-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1"
                        style={{ background: `${hero.seriesAccent ?? "#00abc9"}22`, color: hero.seriesAccent ?? "#00abc9" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                          style={{ background: hero.seriesAccent ?? "#00abc9" }} />
                        Latest Sermon
                      </span>
                      <span className="text-white/30 text-[10px]">·</span>
                      <span className="text-white/35 text-[10px] font-medium">{hero.series}</span>
                    </div>

                    <h2 className="text-white mb-2"
                      style={{ fontFamily: "var(--font-inter), sans-serif", fontWeight: 800,
                        fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                      {hero.title}
                    </h2>

                    <p className="text-white/45 text-sm mb-5">
                      {hero.speaker} · {hero.passage}
                    </p>

                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: hero.seriesAccent ?? "#00abc9" }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="white" style={{ marginLeft: 1 }}>
                          <path d="M2 1l7 4-7 4z"/>
                        </svg>
                      </span>
                      Listen now
                    </div>
                  </div>

                  {/* Right: thumbnail on desktop */}
                  <div className="hidden md:block w-44 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
                    <img src={thumbUrl} alt={hero.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </a>
            </div>
          </section>
        );
      })()}

      {/* ── Series cards ──────────────────────────────────────────────── */}
      <section className="px-5 md:px-8 mb-14 pt-12">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow-muted mb-5">Current &amp; Recent Series</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {allSeries.map((sr) => {
              const count = sermons.filter((s) => s.seriesId === sr.id).length;
              // Use the most recent sermon's YouTube thumbnail as card artwork
              const firstSermon = sermons.find((s) => s.seriesId === sr.id);
              const thumbUrl = firstSermon?.youtubeId
                ? `https://img.youtube.com/vi/${firstSermon.youtubeId}/maxresdefault.jpg`
                : null;
              return (
                <a
                  key={sr.id}
                  href={`/series/${sr.id}`}
                  className="group flex-shrink-0 snap-start w-48 md:w-56 rounded-2xl overflow-hidden border border-white/8 hover:border-white/18 transition-all relative"
                  style={{ background: "#0a1628" }}
                >
                  {/* Artwork background */}
                  {thumbUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${thumbUrl})` }}
                    />
                  )}
                  {/* Minimal bottom scrim for the count badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Sermon count badge */}
                  <div className="relative p-3 h-full flex flex-col justify-end min-h-[140px]">
                    <p className="text-white/70 text-[10px] font-medium">{count} sermon{count !== 1 ? "s" : ""}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Continue Listening shelf (client — reads localStorage) ─────── */}
      <ContinueListeningShelf
        sermons={sermons.map((s): SermonForShelf => ({
          id:          s.id,
          slug:        s.slug,
          title:       s.title,
          speaker:     s.speaker,
          series:      s.series,
          seriesAccent: s.seriesAccent,
          youtubeId:   s.youtubeId,
          duration:    s.duration,
        }))}
      />

      {/* ── Filter + grid (client component) ─────────────────────────── */}
      <Suspense fallback={null}>
        <SermonGrid
          sermons={sermons}
          allSeries={allSeries}
          allSpeakers={allSpeakers}
          allYears={allYears}
        />
      </Suspense>

      {/* ── Podcast CTA ───────────────────────────────────────────────── */}
      <section
        className="py-16 px-6 border-t border-[#00205B]/06"
        style={{ background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow-white mb-3">Subscribe</p>
          <h2
            className="font-condensed font-800 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.02em" }}
          >
            Listen Anywhere
          </h2>
          <p className="text-white/55 text-sm mb-7">
            The Brainerd Baptist sermon podcast is available wherever you listen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/brainerd-baptist-church-chattanooga/id335490566" },
              { label: "Spotify",        href: "https://open.spotify.com/show/5aLbyd17Yh7voLkDqzrW9I" },
              { label: "Pocket Casts",   href: "https://pocketcasts.com/podcast/brainerd-baptist-church-chattanooga/3a3bda30-88b7-012e-41fa-00163e1b201c" },
            ].map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="text-xs font-semibold text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-5 py-2.5 rounded-full transition-all"
                style={{ letterSpacing: "0.01em" }}
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
