import { notFound } from "next/navigation";
import Image from "next/image";
import { SERMONS, ALL_SERIES, SERIES_META, formatDate } from "@/lib/sermons";

export const revalidate = 300;

export function generateStaticParams() {
  return ALL_SERIES.map((s) => ({ seriesId: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  const series = ALL_SERIES.find((s) => s.id === seriesId);
  if (!series) return {};
  const meta = SERIES_META[seriesId];
  return {
    title: `${series.name} — Brainerd Baptist Church`,
    description: meta?.description,
  };
}

const SERIES_COLORS: Record<string, { bg: string; accent: string }> = {
  "behind-the-scenes":     { bg: "#1a0d2e", accent: "#a78bfa" },
  "prayer-that-shapes-us": { bg: "#0f2040", accent: "#00abc9" },
  "ot-revisited":          { bg: "#1c1209", accent: "#f59e0b" },
  "complete-in-christ":    { bg: "#0d2618", accent: "#34d399" },
  "gods-work-our-work":    { bg: "#00205B", accent: "#00abc9" },
  "guest-messages":        { bg: "#111827", accent: "#94a3b8" },
};

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = await params;
  const series = ALL_SERIES.find((s) => s.id === seriesId);
  if (!series) notFound();

  const meta  = SERIES_META[seriesId];
  const color = SERIES_COLORS[seriesId] ?? { bg: "#00205B", accent: "#00abc9" };

  const sermons = SERMONS
    .filter((s) => s.seriesId === seriesId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="pt-28 pb-16 px-6"
        style={{
          background: `linear-gradient(160deg, ${color.bg} 0%, #0a1628 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <a
            href="/sermons"
            className="inline-flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3" />
            </svg>
            All Sermons
          </a>

          {/* Accent bar */}
          <div
            className="w-12 h-1 rounded-full mb-5"
            style={{ background: color.accent }}
          />

          {/* Series label */}
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-3"
            style={{ color: color.accent }}
          >
            Series
          </p>

          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
            }}
          >
            {series.name}
          </h1>

          {meta?.passage && (
            <p
              className="text-sm font-medium mb-4"
              style={{ color: color.accent }}
            >
              {meta.passage}
            </p>
          )}

          {meta?.description && (
            <p className="text-white/50 text-base leading-relaxed max-w-2xl mb-6">
              {meta.description}
            </p>
          )}

          <p className="text-white/25 text-xs tabular-nums">
            {sermons.length} sermon{sermons.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Sermon list ──────────────────────────────────────────────────── */}
      <section className="px-5 md:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-3">
          {sermons.map((sermon, i) => {
            const thumb = sermon.youtubeId
              ? `https://i.ytimg.com/vi/${sermon.youtubeId}/hqdefault.jpg`
              : null;
            const url = `/sermons/${sermon.id}`;

            return (
              <a
                key={sermon.id}
                href={url}
                className="group flex gap-0 rounded-2xl overflow-hidden border border-white/6 hover:border-white/14 bg-white/3 hover:bg-white/6 transition-all duration-200 block"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                {/* Episode number + thumbnail */}
                <div
                  className="relative hidden sm:flex flex-shrink-0 w-[140px] md:w-[160px] items-center justify-center overflow-hidden"
                  style={{ background: color.bg }}
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={sermon.title}
                      fill
                      className="object-cover opacity-55 group-hover:opacity-70 transition-opacity"
                      sizes="160px"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${color.bg} 0%, ${color.accent}22 100%)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                  {/* Play icon */}
                  <div
                    className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{
                      background: color.accent + "bb",
                      boxShadow: `0 4px 20px ${color.accent}44`,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 px-5 md:px-7 py-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-white/25 text-[10px] font-medium tabular-nums">
                      Ep {sermons.length - i}
                    </span>
                    {sermon.passage && (
                      <>
                        <span className="text-white/15 text-[10px]">·</span>
                        <span className="text-white/35 text-[10px] font-medium">
                          {sermon.passage}
                        </span>
                      </>
                    )}
                  </div>
                  <h3
                    className="text-white font-semibold text-base leading-snug mb-1.5"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {sermon.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-white/35 text-xs">
                    <span>{sermon.speaker}</span>
                    <span>{formatDate(sermon.date)}</span>
                    {sermon.duration && <span>{sermon.duration}</span>}
                  </div>
                </div>

                {/* Arrow — desktop */}
                <div className="hidden sm:flex shrink-0 items-center pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    width="14" height="14" viewBox="0 0 14 14"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-white/30"
                  >
                    <path d="M3 7h8M8 4l3 3-3 3" />
                  </svg>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Back CTA ────────────────────────────────────────────────────── */}
      <div className="px-6 pb-24 text-center">
        <a
          href="/sermons"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 7H3M6 4L3 7l3 3" />
          </svg>
          Browse all series
        </a>
      </div>
    </div>
  );
}
