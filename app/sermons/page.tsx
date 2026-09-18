import { SERMONS, ALL_SERIES, ALL_SPEAKERS, ALL_YEARS } from "@/lib/sermons";
import SermonGrid from "@/components/sermons/SermonGrid";

export const metadata = {
  title: "Sermons — Brainerd Baptist Church",
  description:
    "Listen to sermons from Brainerd Baptist Church. Expository preaching through books of the Bible — searchable by series, speaker, passage, and year.",
};

export default function SermonsPage() {
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

      {/* ── Filter + grid (client component) ─────────────────────────── */}
      <SermonGrid
        sermons={SERMONS}
        allSeries={ALL_SERIES}
        allSpeakers={ALL_SPEAKERS}
        allYears={ALL_YEARS}
      />

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
              { label: "Apple Podcasts", href: "#" },
              { label: "Spotify",        href: "#" },
              { label: "Pocket Casts",   href: "#" },
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
