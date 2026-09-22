"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type SermonForShelf = {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  series: string;
  seriesAccent?: string;
  youtubeId: string;
  duration?: string;
};

function parseDurationSecs(dur?: string): number {
  if (!dur) return 3600;
  // "38:12" → 2292s  |  "38" → 2280s  |  "38 min" → 2280s
  const clean = dur.replace(/[^0-9:]/g, "");
  const parts = clean.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  const n = parseFloat(clean);
  if (!isNaN(n) && n > 0) return n * 60;
  return 3600;
}

function formatPos(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface InProgressItem {
  sermon: SermonForShelf;
  urlSlug: string;
  position: number;
  progress: number;
}

export default function ContinueListeningShelf({
  sermons,
}: {
  sermons: SermonForShelf[];
}) {
  const [items, setItems] = useState<InProgressItem[]>([]);

  useEffect(() => {
    const found: InProgressItem[] = [];
    for (const sermon of sermons) {
      const urlSlug = sermon.slug || sermon.id;
      if (!urlSlug) continue;
      try {
        const raw = localStorage.getItem(`bbc-ap-${urlSlug}`);
        if (!raw) continue;
        const pos = parseFloat(raw);
        if (!pos || isNaN(pos) || pos < 30) continue; // skip very beginning
        const durSecs = parseDurationSecs(sermon.duration);
        const progress = Math.min(100, (pos / durSecs) * 100);
        if (progress >= 95) continue; // effectively finished
        found.push({ sermon, urlSlug, position: pos, progress });
      } catch {}
    }
    setItems(found);
  }, [sermons]);

  if (items.length === 0) return null;

  return (
    <section
      className="px-5 md:px-8 py-8"
      style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="label-micro"
            style={{ color: "var(--accent-text)" }}
          >
            Continue Listening
          </span>
          <span
            className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
          >
            {items.length}
          </span>
        </div>

        {/* Horizontal scroll shelf */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
          {items.map(({ sermon, urlSlug, position, progress }) => {
            const thumb = sermon.youtubeId
              ? `https://img.youtube.com/vi/${sermon.youtubeId}/mqdefault.jpg`
              : null;
            const accent = sermon.seriesAccent ?? "#00abc9";

            return (
              <Link
                key={urlSlug}
                href={`/sermons/${urlSlug}`}
                className="flex-shrink-0 snap-start group relative block rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  width: 192,
                  background: "var(--player-sheet)",
                  border: "1px solid var(--border-on-dark)",
                  boxShadow: "var(--shadow-md)",
                  textDecoration: "none",
                }}
              >
                {/* Thumbnail */}
                <div className="relative" style={{ height: 108, background: "var(--media-bg)" }}>
                  {thumb && (
                    <img
                      src={thumb}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.85 }}
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--scrim) 0%, transparent 60%)" }} />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: accent, boxShadow: `0 0 24px ${accent}66` }}
                    >
                      <svg width="10" height="12" viewBox="0 0 10 12" style={{ fill: "var(--fg-on-accent)", marginLeft: 2 }}>
                        <path d="M1 1l8 5-8 5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Time badge */}
                  <div
                    className="absolute bottom-2 right-2 text-[9px] font-semibold tabular-nums"
                    style={{
                      color: "var(--fg-on-dark-body)",
                      background: "var(--scrim)",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    {formatPos(position)}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <p
                    className="label-micro mb-1 truncate"
                    style={{ color: accent, opacity: 0.85 }}
                  >
                    {sermon.series}
                  </p>
                  <p
                    className="text-[11px] font-semibold leading-snug mb-2"
                    style={{
                      color: "var(--fg-on-dark)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {sermon.title}
                  </p>

                  {/* Progress bar */}
                  <div
                    className="h-0.5 rounded-full overflow-hidden"
                    style={{ background: "var(--border-on-dark)" }}
                  >
                    <div
                      className="h-full rounded-full transition"
                      style={{ width: `${progress}%`, background: accent }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
