import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PortableText } from "@portabletext/react";
import fs from "fs/promises";
import path from "path";
import {
  getSermonBySlug,
  getAllSermons,
  formatDate,
} from "@/lib/sanity";
import { SERMONS, formatDate as staticFormatDate } from "@/lib/sermons";
import ShareButton from "@/components/sermons/ShareButton";
import RelatedSermons from "@/components/sermons/RelatedSermons";
import SermonTabPlayer from "@/components/sermons/SermonTabPlayer";
import SpeakerCard from "@/components/sermons/SpeakerCard";
import GiveCTA from "@/components/sermons/GiveCTA";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";
import { getSermonNotesByDate, parseOutline } from "@/lib/sermon";

// ── Sermon notes helpers ──────────────────────────────────────────────────────

const NOTES_DIR = path.join(process.cwd(), "content", "sermon-notes");

/** Load notes: Drive first, then local .txt fallback (tries date and date-1). */
async function loadSermonNotes(date: string): Promise<{
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
  highlights: string[];
}> {
  // 1. Try Drive
  const drive = await getSermonNotesByDate(date);
  if (drive) return drive;

  // 2. Fall back to local .txt file
  const candidates = [date];
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  candidates.push(d.toISOString().slice(0, 10));

  for (const candidate of candidates) {
    try {
      const text = await fs.readFile(path.join(NOTES_DIR, `${candidate}.txt`), "utf-8");
      if (text.trim()) {
        const { items: outline, type: outlineType } = parseOutline(text);
        return { outline, outlineType, rawText: text.trim(), highlights: [] };
      }
    } catch {
      // file not found, try next
    }
  }

  return { outline: [], outlineType: "none" as const, rawText: null, highlights: [] };
}

function isCurtisHill(speaker: string): boolean {
  return speaker.toLowerCase().includes("curtis");
}

export const revalidate = 300;

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

// ── Portable Text components (light theme) ────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-relaxed mb-4" style={{ color: "var(--fg-muted)" }}>{children}</p>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-bold text-lg mt-8 mb-3" style={{ color: "var(--fg)", letterSpacing: "-0.02em" }}>{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="font-semibold mt-5 mb-2" style={{ color: "rgba(0,32,91,0.85)" }}>{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 pl-5 my-5 italic" style={{ borderColor: "var(--accent)", color: "var(--fg-muted)" }}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-4 pl-1" style={{ color: "var(--fg-muted)" }}>{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-1" style={{ color: "var(--fg-muted)" }}>{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold" style={{ color: "var(--fg)" }}>{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    scripture: ({ children, value }: { children?: React.ReactNode; value?: { reference?: string } }) => (
      <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(value?.reference ?? "")}&version=ESV`}
        target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline font-medium">
        {children}
      </a>
    ),
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline">
        {children}
      </a>
    ),
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SermonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sanitySermon = await getSermonBySlug(slug).catch(() => null);

  type NormSermon = {
    youtubeId: string;
    title: string;
    series: string;
    seriesSlug: string;
    passage: string;
    passages?: string[];
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
      seriesSlug:  sanitySermon.series?.slug?.current ?? "",
      passage:     sanitySermon.passage ?? "",
      passages:    sanitySermon.passages as string[] | undefined,
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
      seriesSlug:  staticS.seriesId ?? "",
      passage:     staticS.passage,
      passages:    staticS.passages,
      speaker:     staticS.speaker,
      date:        staticS.date,
      duration:    staticS.duration,
      accentColor: "#00abc9",
    };
  }

  const accentColor = s.accentColor;

  if (!s.audioUrl && s.date) {
    const podcastMap = await getPodcastAudioMap();
    const key = dateToKey(s.date);
    if (podcastMap[key]) {
      s.audioUrl = podcastMap[key];
    } else {
      const d = new Date(s.date + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      const prevKey = dateToKey(d.toISOString().slice(0, 10));
      if (podcastMap[prevKey]) s.audioUrl = podcastMap[prevKey];
    }
  }

  const audioTrack = s.audioUrl ? {
    title:      s.title,
    speaker:    s.speaker,
    series:     s.series,
    audioUrl:   s.audioUrl,
    youtubeId:  s.youtubeId,
    slug,
    accentColor,
    duration:   s.duration,
  } : null;

  // ── Resolve next sermon for autoplay ─────────────────────────────────────
  let nextAudioTrack = null;
  try {
    const allSermons = await getAllSermons();
    const sorted = allSermons
      .filter((x) => x.slug?.current && x.date)
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
    const currentIdx = sorted.findIndex(
      (x) => x.slug?.current === slug
    );
    if (currentIdx >= 0 && currentIdx < sorted.length - 1) {
      const nextS = sorted[currentIdx + 1];
      const podcastMap = await getPodcastAudioMap().catch(() => ({} as Record<string,string>));
      const nKey = dateToKey(nextS.date);
      let nextAudioUrl = podcastMap[nKey] ?? "";
      if (!nextAudioUrl) {
        const nd = new Date(nextS.date + "T12:00:00Z");
        nd.setUTCDate(nd.getUTCDate() - 1);
        nextAudioUrl = podcastMap[dateToKey(nd.toISOString().slice(0, 10))] ?? "";
      }
      if (nextAudioUrl) {
        nextAudioTrack = {
          title:      nextS.title ?? "",
          speaker:    nextS.speaker ?? "",
          series:     nextS.series?.title ?? "",
          audioUrl:   nextAudioUrl,
          youtubeId:  nextS.youtubeId ?? "",
          slug:       nextS.slug?.current ?? "",
          accentColor: nextS.series?.accentColor ?? "#00abc9",
          duration:   nextS.duration,
        };
      }
    }
  } catch {
    // next sermon resolution is non-critical
  }

  const sermonNotes = isCurtisHill(s.speaker) && s.date
    ? await loadSermonNotes(s.date)
    : { outline: [], outlineType: "none" as const, rawText: null, highlights: [] };

  const allPassages = [s.passage, ...(s.passages ?? [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Dark gradient hero strip ────────────────────────────────── */}
      <div
        className="pt-28 pb-12 px-5 md:px-8"
        style={{ background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <a href="/sermons"
            className="inline-flex items-center gap-2 text-white/65 hover:text-white text-sm font-semibold transition-colors mb-8 -ml-2 py-2 pl-2 pr-3 rounded-lg hover:bg-white/5 active:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.25">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            All Sermons
          </a>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {s.seriesSlug ? (
              <a
                href={`/series/${s.seriesSlug}`}
                className="text-[10px] font-semibold tracking-widest uppercase hover:opacity-75 transition-opacity"
                style={{ color: accentColor }}
              >
                {s.series}
              </a>
            ) : (
              <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: accentColor }}>
                {s.series}
              </span>
            )}
            {s.passage && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <a
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(s.passage)}&version=CSB`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-white/45 text-[10px] font-medium hover:text-accent-text transition-colors"
                >
                  {s.passage}
                </a>
              </>
            )}
          </div>

          <h1 className="text-white mb-4"
            style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {s.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1 text-white/45 text-sm">
            <span>{s.speaker}</span>
            <span>{s.date ? (sanitySermon ? formatDate(s.date) : staticFormatDate(s.date)) : ""}</span>
            {s.duration && <span>{s.duration}</span>}
          </div>
        </div>
      </div>

      {/* ── White content body ───────────────────────────────────────── */}
      <div className="px-5 md:px-8 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* UNIFIED MEDIA + CONTENT PLAYER */}
          <Suspense fallback={null}>
            <SermonTabPlayer
              slug={slug}
              youtubeId={s.youtubeId}
              title={s.title}
              speaker={s.speaker}
              series={s.series}
              date={s.date}
              passage={s.passage}
              audioTrack={audioTrack}
              nextTrack={nextAudioTrack}
              passages={allPassages}
              accentColor={accentColor}
              outline={sermonNotes.outline}
              outlineType={sermonNotes.outlineType}
              rawText={sermonNotes.rawText}
              highlights={sermonNotes.highlights}
            />
          </Suspense>

          {/* Action row */}
          <div>
            <div className="flex flex-wrap gap-3 mb-8">
              {s.youtubeId && (
                <a href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted hover:text-fg border border-border-strong hover:border-border-strong px-4 py-2 rounded-full transition-all">
                  Watch on YouTube
                </a>
              )}
              {s.audioUrl && (
                <a href={s.audioUrl} download
                  className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted hover:text-fg border border-border-strong hover:border-border-strong px-4 py-2 rounded-full transition-all">
                  Download Audio
                </a>
              )}
              <ShareButton title={s.title} speaker={s.speaker} />
            </div>

            {/* Speaker card */}
            {s.speaker && (
              <div className="max-w-xs">
                <SpeakerCard name={s.speaker} accentColor={accentColor} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── More from this series ──────────────────────────────────── */}
      <RelatedSermons
        currentId={slug}
        seriesId={sanitySermon ? (sanitySermon.series?.slug?.current ?? "") : (SERMONS.find((x) => x.id === slug)?.seriesId ?? "")}
        accentColor={accentColor}
      />

      {/* ── Outline + Notes (Sanity-only) ──────────────────────────── */}
      {(s.outline || s.notes) && (
        <div className="px-5 md:px-8 pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
              {s.outline && (s.outline as unknown[]).length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}>Outline</h2>
                  <div className="text-sm">
                    <PortableText value={s.outline} components={ptComponents} />
                  </div>
                </div>
              )}
              {s.notes && (s.notes as unknown[]).length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold tracking-widest uppercase mb-5"
                    style={{ color: accentColor }}>Notes</h2>
                  <div className="prose-sm">
                    <PortableText value={s.notes} components={ptComponents} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Give CTA ───────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <GiveCTA />
        </div>
      </div>
    </div>
  );
}
