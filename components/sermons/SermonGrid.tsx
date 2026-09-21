"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/sermons";

// Normalised sermon shape — works for both static and Sanity data
export interface GridSermon {
  id: string;
  youtubeId: string;
  title: string;
  slug: string;          // empty string when coming from static data
  series: string;
  seriesId: string;
  seriesAccent?: string; // overrides default palette when set in Sanity
  seriesBg?: string;
  speaker: string;
  date: string;
  passage: string;
  book: string;
  duration?: string;
}

interface Props {
  sermons: GridSermon[];
  allSeries: { id: string; name: string }[];
  allSpeakers: string[];
  allYears: string[];
}

function thumbnailUrl(youtubeId: string): string {
  if (!youtubeId) return "";
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

function watchUrl(id: string, youtubeId: string, slug: string): string {
  if (slug) return `/sermons/${slug}`;
  if (id)   return `/sermons/${id}`;
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  return "/sermons";
}

// Parses "38:12" / "38" / "38 min" into seconds. Falls back to 3600 (60 min)
// only when duration is missing entirely — matches ContinueListeningShelf's
// parseDurationSecs so progress bars agree everywhere they appear.
function parseDurationSecs(dur?: string): number {
  if (!dur) return 3600;
  const clean = dur.replace(/[^0-9:]/g, "");
  const parts = clean.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  const n = parseFloat(clean);
  if (!isNaN(n) && n > 0) return n * 60;
  return 3600;
}

const SERIES_COLORS: Record<string, { bg: string; accent: string }> = {
  "behind-the-scenes":    { bg: "#1a0d2e", accent: "#a78bfa" },
  "prayer-that-shapes-us":{ bg: "#0f2040", accent: "#00abc9" },
  "ot-revisited":         { bg: "#1c1209", accent: "#f59e0b" },
  "complete-in-christ":   { bg: "#0d2618", accent: "#34d399" },
  "gods-work-our-work":   { bg: "#00205B", accent: "#00abc9" },
  "guest-messages":       { bg: "#111827", accent: "#94a3b8" },
};
const DEFAULT_COLOR = { bg: "#00205B", accent: "#00abc9" };

function seriesColor(seriesId: string) {
  return SERIES_COLORS[seriesId] ?? DEFAULT_COLOR;
}

export default function SermonGrid({ sermons, allSeries, allSpeakers, allYears }: Props) {
  const searchParams = useSearchParams();
  const [query, setQuery]     = useState(() => searchParams.get("q") ?? "");
  const [series, setSeries]   = useState(() => searchParams.get("series") ?? "all");
  const [speaker, setSpeaker] = useState("all");
  const [year, setYear]       = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return sermons.filter((s) => {
      if (series !== "all" && s.seriesId !== series) return false;
      if (speaker !== "all" && s.speaker !== speaker) return false;
      if (year !== "all" && s.date.slice(0, 4) !== year) return false;
      if (q && ![s.title, s.series, s.speaker, s.passage, s.book].some((f) =>
        f?.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [sermons, query, series, speaker, year]);

  const hasFilters = query || series !== "all" || speaker !== "all" || year !== "all";

  function clearAll() {
    setQuery("");
    setSeries("all");
    setSpeaker("all");
    setYear("all");
  }

  return (
    <div>
      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 mb-10">
        <div className="max-w-5xl mx-auto">
          {/* Search */}
          <div className="relative mb-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by title, passage, or book…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-raised border border-border-strong rounded-xl pl-11 pr-4 py-3.5 text-fg placeholder-[#00205B]/30 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all shadow-sm"
            />
          </div>

          {/* Dropdowns row */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={series}  onChange={setSeries}  label="Series"  options={[{ value: "all", label: "All Series" },  ...allSeries.map((s) => ({ value: s.id, label: s.name }))]} />
            <Select value={speaker} onChange={setSpeaker} label="Speaker" options={[{ value: "all", label: "All Speakers" }, ...allSpeakers.map((s) => ({ value: s, label: s }))]} />
            <Select value={year}    onChange={setYear}    label="Year"    options={[{ value: "all", label: "All Years" },    ...allYears.map((y) => ({ value: y, label: y }))]} />

            <div className="ml-auto flex items-center gap-4">
              <span className="text-fg-muted text-xs tabular-nums">
                {filtered.length === sermons.length
                  ? `${sermons.length} sermons`
                  : `${filtered.length} of ${sermons.length}`}
              </span>
              {hasFilters && (
                <button onClick={clearAll} className="text-accent-text text-xs font-semibold hover:text-[#0090a8] transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sermon list ──────────────────────────────────────────────── */}
      <section className="pb-24 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-fg-subtle text-lg mb-2">No sermons match your search.</p>
              <button onClick={clearAll} className="text-accent-text text-sm font-semibold hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sermon, i) => (
                <SermonCard key={sermon.id} sermon={sermon} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Individual sermon card ────────────────────────────────────────────────────

function SermonCard({ sermon, index }: { sermon: GridSermon; index: number }) {
  const thumb = thumbnailUrl(sermon.youtubeId);
  const url   = watchUrl(sermon.id, sermon.youtubeId, sermon.slug);
  const defaultColor = seriesColor(sermon.seriesId);
  const color = {
    bg:     sermon.seriesBg     ?? defaultColor.bg,
    accent: sermon.seriesAccent ?? defaultColor.accent,
  };
  const isInternal = !!(sermon.slug || sermon.id);

  const [positionSecs] = useState<number | null>(() => {
    try {
      const key = `bbc-ap-${sermon.slug || sermon.id}`;
      const saved = localStorage.getItem(key);
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });
  const durationSecs = parseDurationSecs(sermon.duration);
  const progressPct = positionSecs !== null ? (positionSecs / durationSecs) * 100 : null;

  return (
    <a
      href={url}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      className="group relative flex gap-0 rounded-2xl overflow-hidden border border-border hover:border-accent/30 bg-surface-raised hover:shadow-md transition-all duration-200"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Thumbnail */}
      <div
        className="relative hidden sm:flex flex-shrink-0 w-[140px] md:w-[180px] items-center justify-center overflow-hidden"
        style={{ background: color.bg }}
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={sermon.title}
            fill
            className="object-cover opacity-70 group-hover:opacity-85 transition-opacity"
            sizes="180px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${color.bg} 0%, ${color.accent}22 100%)`
          }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: color.accent + "cc", boxShadow: `0 4px 20px ${color.accent}44` }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: color.accent }}>
              {sermon.series}
            </span>
            <span className="text-fg-subtle text-[10px]">·</span>
            {sermon.passage ? (
              <a
                href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=CSB`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-fg-muted text-[10px] font-medium hover:text-accent-text transition-colors"
              >
                {sermon.passage}
              </a>
            ) : null}
          </div>
          <h3
            className="text-fg font-semibold text-base md:text-lg leading-snug mb-1.5 group-hover:text-accent-text transition-colors"
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

        <div className="hidden sm:flex shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold text-fg-muted group-hover:text-accent-text transition-colors">
            {sermon.youtubeId ? "Watch" : "Listen"}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="2" className="text-fg-subtle group-hover:text-accent-text transition-colors"
          >
            <path d="M3 7h8M8 4l3 3-3 3"/>
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      {positionSecs !== null && positionSecs > 5 && progressPct !== null && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden" style={{ background: "rgba(0,32,91,0.06)" }}>
          <div className="h-full rounded-b-2xl transition-[width] duration-500"
            style={{ width: `${Math.min(100, progressPct)}%`, background: color.accent }} />
        </div>
      )}
    </a>
  );
}

// ── Reusable select ───────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface-raised border border-border-strong text-fg-muted text-xs font-semibold rounded-lg pl-3 pr-7 py-2.5 cursor-pointer hover:border-border-strong focus:outline-none focus:border-accent transition-all shadow-sm"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
        width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  );
}
