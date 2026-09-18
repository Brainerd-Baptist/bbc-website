import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import {
  getSermonBySlug,
  getAllSermons,
  formatDate,
} from "@/lib/sanity";

export const revalidate = 300;

// Pre-render known sermon slugs at build time
export async function generateStaticParams() {
  const sermons = await getAllSermons().catch(() => []);
  return sermons.map((s) => ({ slug: s.slug?.current ?? "" })).filter((s) => s.slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug).catch(() => null);
  if (!sermon) return {};
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
  const sermon = await getSermonBySlug(slug).catch(() => null);
  if (!sermon) notFound();

  const accentColor = sermon.series?.accentColor ?? "#00abc9";

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
      {sermon.youtubeId && (
        <div className="px-5 md:px-8 mb-10">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-white/8"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${sermon.youtubeId}?rel=0&modestbranding=1&color=white`}
                title={sermon.title}
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
              {sermon.series?.title}
            </span>
            {sermon.passage && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <a
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=ESV`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/45 text-[10px] font-medium hover:text-[#00abc9] transition-colors"
                >
                  {sermon.passage}
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
            {sermon.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/40 text-sm mb-6">
            <span>{sermon.speaker}</span>
            <span>{formatDate(sermon.date)}</span>
            {sermon.duration && <span>{sermon.duration}</span>}
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-3">
            {sermon.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded-full transition-all"
              >
                Watch on YouTube
              </a>
            )}
            {sermon.audioUrl && (
              <a
                href={sermon.audioUrl}
                download
                className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-4 py-2 rounded-full transition-all"
              >
                Download Audio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Outline + Notes (two-column on desktop) ────────────────────── */}
      {(sermon.outline || sermon.notes) && (
        <div className="px-5 md:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">

              {/* Outline */}
              {sermon.outline && (sermon.outline as unknown[]).length > 0 && (
                <div>
                  <h2
                    className="text-white text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}
                  >
                    Outline
                  </h2>
                  <div className="text-sm">
                    <PortableText value={sermon.outline as Parameters<typeof PortableText>[0]["value"]} components={ptComponents} />
                  </div>
                </div>
              )}

              {/* Notes */}
              {sermon.notes && (sermon.notes as unknown[]).length > 0 && (
                <div>
                  <h2
                    className="text-white text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}
                  >
                    Notes
                  </h2>
                  <div className="prose-sm">
                    <PortableText value={sermon.notes as Parameters<typeof PortableText>[0]["value"]} components={ptComponents} />
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
