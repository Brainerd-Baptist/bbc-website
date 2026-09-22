import { notFound } from "next/navigation";
import Image from "next/image";
import { SERMONS, ALL_SERIES, SERIES_META, formatDate } from "@/lib/sermons";
import { IDENTITY } from "@/lib/identity-colors";

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

// The identity hues live in lib/identity-colors.ts. `accent` stays a 6-digit
// HEX on purpose: alpha is string-concatenated onto it below (`${accent}22`,
// `accent + "cc"`), and `var(--accent)22` is not a colour. `ink` is the
// accessible text pair for the same hue — every one of these fails AA as text
// on a light surface — for any site that reads rather than decorates.
type SeriesColor = { bg: string; accent: string; ink: { light: string; dark: string } };

const SERIES_COLORS: Record<string, SeriesColor> = {
  "behind-the-scenes":     { bg: "#1a0d2e", accent: IDENTITY.violet.hue,  ink: IDENTITY.violet },
  "prayer-that-shapes-us": { bg: "#0f2040", accent: "#00abc9",            ink: { light: "var(--accent-text)", dark: "var(--accent-text)" } },
  "ot-revisited":          { bg: "#1c1209", accent: IDENTITY.amber.hue,   ink: IDENTITY.amber },
  "complete-in-christ":    { bg: "#0d2618", accent: IDENTITY.emerald.hue, ink: IDENTITY.emerald },
  "gods-work-our-work":    { bg: "#00205B", accent: "#00abc9",            ink: { light: "var(--accent-text)", dark: "var(--accent-text)" } },
  "standalone-messages":        { bg: "#111827", accent: IDENTITY.slate.hue,   ink: IDENTITY.slate },
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
  const color: SeriesColor =
    SERIES_COLORS[seriesId] ?? { bg: "#00205B", accent: "#00abc9", ink: { light: "var(--accent-text)", dark: "var(--accent-text)" } };

  const sermons = SERMONS
    .filter((s) => s.seriesId === seriesId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Dark gradient hero strip ──────────────────────────────────── */}
      <div
        className="pt-28 pb-16 px-6"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-4xl mx-auto">
          <a
            href="/sermons"
            className="inline-flex items-center gap-2 text-fg-on-dark-muted hover:text-fg-on-dark text-sm transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3" />
            </svg>
            All Sermons
          </a>

          {/* Accent bar */}
          <div className="w-12 h-1 rounded-full mb-5" style={{ background: color.accent }} />

          {/* Series label. This and the passage below sit on var(--brand-band),
              a permanently dark ground, so the ink must not invert and
              .identity-ink is the wrong tool: its light value reads 2.5-2.6:1
              here. The RAW hue is the accessible value on this ground —
              4.75:1 (#00abc9) to 6.77:1 (emerald) against the band's lightest
              stop #0a2d6e — so these two deliberately keep it, exactly like the
              full-brand-cyan note in app/ministries/page.tsx. `color.ink` is
              for the light surfaces below. See docs/token-mapping-rules.md. */}
          <p className="label-micro mb-3" style={{ color: color.accent }}>
            Series
          </p>

          <h1
            className="text-fg-on-dark mb-4"
            style={{
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            {series.name}
          </h1>

          {meta?.passage && (
            /* Raw hue, same dark-ground reasoning as the Series label above. */
            <p className="text-sm font-medium mb-4" style={{ color: color.accent }}>
              {meta.passage}
            </p>
          )}

          {meta?.description && (
            <p className="text-fg-on-dark-body text-base leading-relaxed max-w-2xl mb-6">
              {meta.description}
            </p>
          )}

          <p className="text-fg-on-dark-muted text-xs tabular-nums">
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
                className="group flex gap-0 rounded-2xl overflow-hidden border border-border hover:border-accent/30 bg-surface-raised hover:shadow-md transition duration-200"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                {/* Thumbnail */}
                <div
                  className="relative hidden sm:flex flex-shrink-0 w-[140px] md:w-[160px] items-center justify-center overflow-hidden"
                  style={{ background: color.bg }}
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={sermon.title}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-85 transition-opacity"
                      sizes="160px"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${color.bg} 0%, ${color.accent}22 100%)` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  <div
                    className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: color.accent + "cc", boxShadow: `0 4px 20px ${color.accent}44` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" style={{ fill: "var(--fg-on-accent)" }}>
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 px-5 md:px-7 py-5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-fg-muted text-[10px] font-medium tabular-nums">
                      Ep {sermons.length - i}
                    </span>
                    {sermon.passage && (
                      <>
                        <span className="text-fg-subtle text-[10px]">·</span>
                        <span className="text-fg-muted text-[10px] font-medium">{sermon.passage}</span>
                      </>
                    )}
                  </div>
                  <h3
                    className="text-fg font-semibold text-base leading-snug mb-1.5 group-hover:text-accent-text transition-colors"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {sermon.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-fg-muted text-xs">
                    <span>{sermon.speaker}</span>
                    <span>{formatDate(sermon.date)}</span>
                    {sermon.duration && <span>{sermon.duration}</span>}
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex shrink-0 items-center pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className="text-accent-text"
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
          className="inline-flex items-center gap-2 text-fg-muted hover:text-accent-text text-sm transition-colors"
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
