import { Suspense } from "react";
import { getAllSermons, getAllSeries, FALLBACK_SERMONS } from "@/lib/sanity";
import { ALL_SERIES as FALLBACK_SERIES } from "@/lib/sermons";
import SermonGrid from "@/components/sermons/SermonGrid";

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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="pt-32 pb-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow-white mb-4">Hear from God&apos;s Word</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            Sermons
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed mt-5">
            Every sermon works through a book of the Bible verse by verse.
            Search by passage, series, or speaker to find what you need.
          </p>
        </div>
      </div>

      {/* ── Series cards ──────────────────────────────────────────────── */}
      <section className="px-5 md:px-8 mb-14">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase mb-5">Current &amp; Recent Series</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {allSeries.map((sr) => {
              const count = sermons.filter((s) => s.seriesId === sr.id).length;
              const accent = (sermons.find((s) => s.seriesId === sr.id) as { seriesAccent?: string } | undefined)?.seriesAccent;
              const COLORS: Record<string, { bg: string; accent: string }> = {
                "behind-the-scenes":    { bg: "#1a0d2e", accent: "#a78bfa" },
                "prayer-that-shapes-us":{ bg: "#0f2040", accent: "#00abc9" },
                "ot-revisited":         { bg: "#1c1209", accent: "#f59e0b" },
                "complete-in-christ":   { bg: "#0d2618", accent: "#34d399" },
                "gods-work-our-work":   { bg: "#00205B", accent: "#00abc9" },
              };
              const color = COLORS[sr.id] ?? { bg: "#00205B", accent: accent ?? "#00abc9" };
              return (
                <a
                  key={sr.id}
                  href={`/sermons?series=${sr.id}`}
                  className="group flex-shrink-0 snap-start w-48 md:w-56 rounded-2xl overflow-hidden border border-white/8 hover:border-white/18 transition-all"
                  style={{ background: color.bg }}
                >
                  <div className="p-5 h-full flex flex-col justify-between min-h-[120px]">
                    <div
                      className="w-6 h-0.5 mb-3 rounded-full"
                      style={{ background: color.accent }}
                    />
                    <div>
                      <p
                        className="text-white font-bold text-sm leading-snug mb-1.5"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        {sr.name}
                      </p>
                      <p className="text-white/35 text-[11px]">{count} sermon{count !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

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
        className="py-16 px-6 border-t border-white/6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow-white mb-3">Subscribe</p>
          <h2
            className="text-white text-2xl md:text-3xl mb-4"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Listen Anywhere
          </h2>
          <p className="text-white/45 text-sm mb-7">
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
                className="text-xs font-semibold text-white/60 hover:text-white border border-white/12 hover:border-white/25 px-5 py-2.5 rounded-full transition-all"
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
