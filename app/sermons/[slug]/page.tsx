import { notFound } from "next/navigation";
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
import AudioPlayer from "@/components/sermons/AudioPlayer";
import ScriptureInline from "@/components/sermons/ScriptureInline";
import { getPodcastAudioMap, dateToKey } from "@/lib/podcast";
import { getSermonNotesByDate, parseOutline } from "@/lib/sermon";

// ── Sermon notes helpers ──────────────────────────────────────────────────────

const NOTES_DIR = path.join(process.cwd(), "content", "sermon-notes");

/** Load notes: Drive first, then local .txt fallback (tries date and date-1). */
async function loadSermonNotes(date: string): Promise<{
  outline: string[];
  outlineType: "structured" | "scripture" | "none";
  rawText: string | null;
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
        return { outline, outlineType, rawText: text.trim() };
      }
    } catch {
      // file not found, try next
    }
  }

  return { outline: [], outlineType: "none" as const, rawText: null };
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
      <p className="leading-relaxed mb-4" style={{ color: "rgba(0,32,91,0.65)" }}>{children}</p>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-bold text-lg mt-8 mb-3" style={{ color: "#00205B", letterSpacing: "-0.02em" }}>{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="font-semibold mt-5 mb-2" style={{ color: "rgba(0,32,91,0.85)" }}>{children}</h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 pl-5 my-5 italic" style={{ borderColor: "#00abc9", color: "rgba(0,32,91,0.55)" }}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-4 pl-1" style={{ color: "rgba(0,32,91,0.65)" }}>{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-4 pl-1" style={{ color: "rgba(0,32,91,0.65)" }}>{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold" style={{ color: "#00205B" }}>{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    scripture: ({ children, value }: { children?: React.ReactNode; value?: { reference?: string } }) => (
      <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(value?.reference ?? "")}&version=ESV`}
        target="_blank" rel="noopener noreferrer" className="text-[#00abc9] hover:underline font-medium">
        {children}
      </a>
    ),
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-[#00abc9] hover:underline">
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

  const sermonNotes = isCurtisHill(s.speaker) && s.date
    ? await loadSermonNotes(s.date)
    : { outline: [], outlineType: "none" as const, rawText: null };

  const allPassages = [s.passage, ...(s.passages ?? [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Dark gradient hero strip ────────────────────────────────── */}
      <div
        className="pt-28 pb-12 px-5 md:px-8"
        style={{ background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <a href="/sermons"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            All Sermons
          </a>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: accentColor }}>
              {s.series}
            </span>
            {s.passage && (
              <>
                <span className="text-white/20 text-[10px]">·</span>
                <a
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(s.passage)}&version=WEB`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-white/45 text-[10px] font-medium hover:text-[#00abc9] transition-colors"
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

          {/* AUDIO PLAYER */}
          {audioTrack && (
            <AudioPlayer track={audioTrack} accentColor={accentColor} theme="light" />
          )}

          {/* SCRIPTURE PASSAGES */}
          {allPassages.length > 0 && (
            <div className="space-y-3">
              {allPassages.map((p) => (
                <ScriptureInline key={p} passage={p} accentColor={accentColor} theme="light" />
              ))}
            </div>
          )}

          {/* TABBED PLAYER — Video / Outline / Notes */}
          {s.youtubeId && (
            <SermonTabPlayer
              youtubeId={s.youtubeId}
              title={s.title}
              outline={sermonNotes.outline}
              outlineType={sermonNotes.outlineType}
              rawText={sermonNotes.rawText}
              accentColor={accentColor}
            />
          )}

          {/* Action row */}
          <div>
            <div className="flex flex-wrap gap-3 mb-8">
              {s.youtubeId && (
                <a href={`https://www.youtube.com/watch?v=${s.youtubeId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#00205B]/50 hover:text-[#00205B] border border-[#00205B]/12 hover:border-[#00205B]/30 px-4 py-2 rounded-full transition-all">
                  Watch on YouTube
                </a>
              )}
              {s.audioUrl && (
                <a href={s.audioUrl} download
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#00205B]/50 hover:text-[#00205B] border border-[#00205B]/12 hover:border-[#00205B]/30 px-4 py-2 rounded-full transition-all">
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
