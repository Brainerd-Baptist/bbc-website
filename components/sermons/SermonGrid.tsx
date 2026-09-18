"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  type Sermon,
  thumbnailUrl,
  watchUrl,
  formatDate,
} from "@/lib/sermons";

interface Props {
  sermons: Sermon[];
  allSeries: { id: string; name: string }[];
  allSpeakers: string[];
  allYears: string[];
}

// Per-series accent colors so each series has a visual identity
const SERIES_COLORS: Record<string, { bg: string; accent: string }> = {
  "gods-work-our-work":   { bg: "#0f2040", accent: "#00abc9" },
  "psalms-of-ascent":     { bg: "#1a1a2e", accent: "#7c6af7" },
  "grace-upon-grace":     { bg: "#0d2618", accent: "#4ade80" },
  "king-and-his-kingdom": { bg: "#2a1100", accent: "#f59e0b" },
};
const DEFAULT_COLOR = { bg: "#00205B", accent: "#00abc9" };

function seriesColor(seriesId: string) {
  return SERIES_COLORS[seriesId] ?? DEFAULT_COLOR;
}

export default function SermonGrid({ sermons, allSeries, allSpeakers, allYears }: Props) {
  const [query, setQuery]           = useState("");
  const [series, setSeries]         = useState("all");
  const [speaker, setSpeaker]       = useState("all");
  const [year, setYear]             = useState("all");

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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
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
              className="w-full bg-white/6 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#00abc9]/50 focus:bg-white/8 transition-all"
            />
          </div>

          {/* Dropdowns row */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={series}
              onChange={setSeries}
              label="Series"
              options={[
                { value: "all", label: "All Series" },
                ...allSeries.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            <Select
              value={speaker}
              onChange={setSpeaker}
              label="Speaker"
              options={[
                { value: "all", label: "All Speakers" },
                ...allSpeakers.map((s) => ({ value: s, label: s })),
              ]}
            />
            <Select
              value={year}
              onChange={setYear}
              label="Year"
              options={[
                { value: "all", label: "All Years" },
                ...allYears.map((y) => ({ value: y, label: y })),
              ]}
            />

            {/* Results count + clear */}
            <div className="ml-auto flex items-center gap-4">
              <span className="text-white/30 text-xs tabular-nums">
                {filtered.length === sermons.length
                  ? `${sermons.length} sermons`
                  : `${filtered.length} of ${sermons.length}`}
              </span>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="text-[#00abc9] text-xs font-semibold hover:text-[#33c1d9] transition-colors"
                >
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
              <p className="text-white/30 text-lg mb-2">No sermons match your search.</p>
              <button onClick={clearAll} className="text-[#00abc9] text-sm font-semibold hover:underline">
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

function SermonCard({ sermon, index }: { sermon: Sermon; index: number }) {
  const thumb = thumbnailUrl(sermon.youtubeId);
  const url   = watchUrl(sermon.youtubeId);
  const color = seriesColor(sermon.seriesId);

  return (
    <a
      href={url}
      target={sermon.youtubeId ? "_blank" : undefined}
      rel={sermon.youtubeId ? "noopener noreferrer" : undefined}
      className="group flex gap-0 rounded-2xl overflow-hidden border border-white/6 hover:border-white/12 bg-white/4 hover:bg-white/7 transition-all duration-200 block"
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
            className="object-cover opacity-60 group-hover:opacity-75 transition-opacity"
            sizes="180px"
            unoptimized
          />
        ) : (
          /* Gradient placeholder when no YouTube ID yet */
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${color.bg} 0%, ${color.accent}22 100%)`
          }} />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        {/* Play icon */}
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
          {/* Series + passage */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: color.accent }}
            >
              {sermon.series}
            </span>
            <span className="text-white/20 text-[10px]">·</span>
            <span className="text-white/35 text-[10px] font-medium">{sermon.passage}</span>
          </div>
          {/* Title */}
          <h3
            className="text-white font-semibold text-base md:text-lg leading-snug mb-1.5 group-hover:text-white transition-colors"
            style={{ letterSpacing: "-0.02em" }}
          >
            {sermon.title}
          </h3>
          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-white/35 text-xs">
            <span>{sermon.speaker}</span>
            <span>{formatDate(sermon.date)}</span>
            {sermon.duration && <span>{sermon.duration}</span>}
          </div>
        </div>

        {/* CTA — desktop only */}
        <div className="hidden sm:flex shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold text-white/50 group-hover:text-white/70 transition-colors">
            {sermon.youtubeId ? "Watch" : "Listen"}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
            strokeWidth="2" className="text-white/30 group-hover:text-white/60 transition-colors"
          >
            <path d="M3 7h8M8 4l3 3-3 3"/>
          </svg>
        </div>
      </div>
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
        className="appearance-none bg-white/6 border border-white/10 text-white/70 text-xs font-semibold rounded-lg pl-3 pr-7 py-2.5 cursor-pointer hover:bg-white/8 hover:border-white/15 focus:outline-none focus:border-[#00abc9]/50 transition-all"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0a1628] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  );
}
