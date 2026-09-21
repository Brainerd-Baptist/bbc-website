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
      style={{ background: "rgba(0,20,42,0.03)", borderBottom: "1px solid rgba(0,32,91,0.06)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: "var(--accent-text)" }}
          >
            Continue Listening
          </span>
          <span
            className="inline-flex items-center gap-1 text-[9px] font-semibold text-white/50 px-2 py-0.5 rounded-full"
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
                  background: "#07101e",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  textDecoration: "none",
                }}
              >
                {/* Thumbnail */}
                <div className="relative" style={{ height: 108, background: "#0a1628" }}>
                  {thumb && (
                    <img
                      src={thumb}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.85 }}
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,16,30,0.8) 0%, transparent 60%)" }} />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: accent, boxShadow: `0 0 24px ${accent}66` }}
                    >
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="white" style={{ marginLeft: 2 }}>
                        <path d="M1 1l8 5-8 5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Time badge */}
                  <div
                    className="absolute bottom-2 right-2 text-[9px] font-semibold tabular-nums"
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      background: "rgba(0,0,0,0.6)",
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
                    className="text-[9px] font-bold tracking-widest uppercase mb-1 truncate"
                    style={{ color: accent, opacity: 0.85 }}
                  >
                    {sermon.series}
                  </p>
                  <p
                    className="text-[11px] font-semibold leading-snug mb-2"
                    style={{
                      color: "rgba(255,255,255,0.9)",
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
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
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
