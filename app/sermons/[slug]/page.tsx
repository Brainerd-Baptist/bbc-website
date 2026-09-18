import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import {
  getSermonBySlug,
  getAllSermons,
  formatDate,
} from "@/lib/sanity";
import { SERMONS, formatDate as staticFormatDate } from "@/lib/sermons";
import ShareButton from "@/components/sermons/ShareButton";
import RelatedSermons from "@/components/sermons/RelatedSermons";

export const revalidate = 300;

// Pre-render both Sanity slugs and static sermon ids at build time
export async function generateStaticParams() {
  const sanitySermons = await getAllSermons().catch(() => []);
  const sanityParams  = sanitySermons.map((s) => ({ slug: s.slug?.current ?? "" })).filter((s) => s.slug);
  const staticParams  = SERMONS.map((s) => ({ slug: s.id }));
  return [...sanityParams, ...staticParams];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug).catch(() => null);
  if (!sermon) {
    // Fall back to static data
    const s = SERMONS.find((s) => s.id === slug);
    if (!s) return {};
    return {
      title: `${s.title} — Brainerd Baptist Church`,
      description: s.description ?? `${s.passage} · ${s.speaker}`,
    };
  }
  return {
    title: `${sermon.title} — Brainerd Baptist Church`,
    description: sermon.description ?? `${sermon.passage} · ${sermon.speaker}`,
  };
}

// ── Portable Text components ──────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-white/70 leading-relaxed mb-4">{children}</p>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-white font-bold text-lg mt-8 mb-3" style={{ letterSpacing: "-0.02em" }}>
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-white/90 font-semibold mt-5 mb-2">{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-[#00abc9] pl-5 my-5 text-white/60 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-1.5 text-white/70 mb-4 pl-1">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1.5 text-white/70 mb-4 pl-1">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    scripture: ({ children, value }: { children?: React.ReactNode; value?: { reference?: string } }) => (
      <a
        href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(value?.reference ?? "")}&version=ESV`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#00abc9] hover:underline font-medium"
      >
        {children}
      </a>
    ),
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#00abc9] hover:underline"
      >
        {children}
      </a>
    ),
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SermonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sanitySermon = await getSermonBySlug(slug).catch(() => null);

  // ── Normalise to a common shape ──────────────────────────────────────────
  type NormSermon = {
    youtubeId: string;
    title: string;
    series: string;
    passage: string;
    speaker: string;
    date: string;
    duration?: string;
    audioUrl?: string;
    accentColor: string;
    outline?: Parameters<typeof PortableText>[0]["value"];
    notes?: Parameters<typeof PortableText>[0]["value"];
  };

  let s: NormSermon;

  if (sanitySermon) {
    s = {
      youtubeId:   sanitySermon.youtubeId ?? "",
      title:       sanitySermon.title,
      series:      sanitySermon.series?.title ?? "",
      passage:     sanitySermon.passage ?? "",
      speaker:     sanitySermon.speaker ?? "",
      date:        sanitySermon.date ?? "",
      duration:    sanitySermon.duration,
      audioUrl:    sanitySermon.audioUrl,
      accentColor: sanitySermon.series?.accentColor ?? "#00abc9",
      outline:     sanitySermon.outline as NormSermon["outline"],
      notes:       sanitySermon.notes   as NormSermon["notes"],
    };
  } else {
    const staticS = SERMONS.find((x) => x.id === slug);
    if (!staticS) notFound();
    s = {
      youtubeId:   staticS.youtubeId,
      title:       staticS.title,
      series:      staticS.series,
      passage:     staticS.passage,
      speaker:     staticS.speaker,
      date:        staticS.date,
      duration:    staticS.duration,
      accentColor: "#00abc9",
    };
  }

  const accentColor = s.accentColor;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}
    >
      {/* ── Back link ──────────────────────────────────────────────────── */}
      <div className="pt-24 pb-0 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <a
            href="/sermons"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            All Sermons
          </a>
        </div>
      </div>

      {/* ── Video embed ────────────────────────────────────────────────── */}
      {s.youtubeId && (
        <div className="px-5 md:px-8 mb-10">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/8"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}?rel=0&modestbranding=1&color=white`}
                title={s.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Sermon header ──────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 mb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: accentColor }}
            >
              {s.series}
            </span>
            {s.passage && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <a
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(s.passage)}&version=ESV`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/45 text-[10px] font-medium hover:text-[#00abc9] transition-colors"
                >
                  {s.passage}
                </a>
              </>
            )}
          </div>

          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {s.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/40 text-sm mb-6">
            <span>{s.speaker}</span>
            <span>{s.date ? (sanitySermon ? formatDate(s.date) : staticFormatDate(s.date)) : ""}</span>
            {s.duration && <span>{s.duration}</span>}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-3">
            {s.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded-full transition-all"
              >
                Watch on YouTube
              </a>
            )}
            {s.audioUrl && (
              <a
                href={s.audioUrl}
                download
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded-full transition-all"
              >
                Download Audio
              </a>
            )}
            <ShareButton title={s.title} speaker={s.speaker} />
          </div>
        </div>
      </div>

      {/* ── More from this series ──────────────────────────────────────── */}
      <RelatedSermons currentId={slug} seriesId={sanitySermon ? (sanitySermon.series?.slug?.current ?? "") : (SERMONS.find((x) => x.id === slug)?.seriesId ?? "")} accentColor={accentColor} />

      {/* ── Outline + Notes (two-column on desktop, Sanity-only) ──────── */}
      {(s.outline || s.notes) && (
        <div className="px-5 md:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">

              {/* Outline */}
              {s.outline && (s.outline as unknown[]).length > 0 && (
                <div>
                  <h2
                    className="text-white text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}
                  >
                    Outline
                  </h2>
                  <div className="text-sm">
                    <PortableText value={s.outline} components={ptComponents} />
                  </div>
                </div>
              )}

              {/* Notes */}
              {s.notes && (s.notes as unknown[]).length > 0 && (
                <div>
                  <h2
                    className="text-white text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}
                  >
                    Notes
                  </h2>
                  <div className="prose-sm">
                    <PortableText value={s.notes} components={ptComponents} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
