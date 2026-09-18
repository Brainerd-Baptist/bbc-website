import { ImageResponse } from "next/og";
import { getSermonBySlug } from "@/lib/sanity";
import { SERMONS } from "@/lib/sermons";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SERIES_COLORS: Record<string, { bg: string; accent: string }> = {
  "behind-the-scenes":     { bg: "#1a0d2e", accent: "#a78bfa" },
  "prayer-that-shapes-us": { bg: "#0f2040", accent: "#00abc9" },
  "ot-revisited":          { bg: "#1c1209", accent: "#f59e0b" },
  "complete-in-christ":    { bg: "#0d2618", accent: "#34d399" },
  "gods-work-our-work":    { bg: "#00205B", accent: "#00abc9" },
  "guest-messages":        { bg: "#111827", accent: "#94a3b8" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let title    = "Sermon";
  let series   = "";
  let speaker  = "";
  let passage  = "";
  let seriesId = "";

  // Try Sanity first, fall back to static
  const sanity = await getSermonBySlug(slug).catch(() => null);
  if (sanity) {
    title    = sanity.title ?? "Sermon";
    series   = sanity.series?.title ?? "";
    speaker  = sanity.speaker ?? "";
    passage  = sanity.passage ?? "";
    seriesId = sanity.series?.slug?.current ?? "";
  } else {
    const s = SERMONS.find((x) => x.id === slug);
    if (s) {
      title    = s.title;
      series   = s.series;
      speaker  = s.speaker;
      passage  = s.passage;
      seriesId = s.seriesId;
    }
  }

  const color = SERIES_COLORS[seriesId] ?? { bg: "#00205B", accent: "#00abc9" };
  const titleSize = title.length > 40 ? "56px" : title.length > 28 ? "68px" : "80px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(140deg, ${color.bg} 0%, #07101e 100%)`,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Church name top-left */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "auto",
          }}
        >
          BRAINERD BAPTIST CHURCH
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: "52px",
            height: "4px",
            background: color.accent,
            borderRadius: "2px",
            marginBottom: "22px",
          }}
        />

        {/* Series + passage */}
        {series && (
          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: color.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "18px",
            }}
          >
            {series}
            {passage ? ` · ${passage}` : ""}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            marginBottom: "36px",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {/* Speaker */}
        {speaker && (
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
            }}
          >
            {speaker}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
