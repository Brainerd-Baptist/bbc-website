"use client";

import { useEffect, useRef } from "react";

interface Props {
  youtubeId: string;
  title: string;
}

export default function SermonPlayer({ youtubeId, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || !youtubeId) return;

    let destroyed = false;

    async function init() {
      const Plyr = (await import("plyr")).default;
      await import("plyr/dist/plyr.css");

      if (destroyed || !containerRef.current) return;

      const div = containerRef.current.querySelector<HTMLElement>("[data-plyr-provider]");
      if (!div) return;

      playerRef.current = new Plyr(div, {
        provider: "youtube",
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "fullscreen",
        ],
        hideControls: true,
        resetOnEnd: false,
        disableContextMenu: false,
        ratio: "16:9",
        iconUrl: "", // suppress default CDN icon fetch — we inline what we need
      });
    }

    init();

    return () => {
      destroyed = true;
      if (playerRef.current && typeof (playerRef.current as { destroy?: () => void }).destroy === "function") {
        (playerRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [youtubeId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-white/8 bbc-plyr"
    >
      <div
        data-plyr-provider="youtube"
        data-plyr-embed-id={youtubeId}
        aria-label={title}
      />

      {/* BBC Plyr theme overrides */}
      <style>{`
        .bbc-plyr .plyr {
          --plyr-color-main: #00abc9;
          --plyr-video-background: #07101e;
          --plyr-control-radius: 6px;
          --plyr-range-thumb-height: 12px;
          --plyr-range-fill-background: #00abc9;
          --plyr-video-controls-background: linear-gradient(rgba(0,0,0,0), rgba(7,16,30,0.85));
          border-radius: 1rem;
          overflow: hidden;
        }
        .bbc-plyr .plyr__control--overlaid {
          background: rgba(0, 171, 201, 0.9);
          border-radius: 50%;
          width: 64px;
          height: 64px;
          box-shadow: 0 0 40px rgba(0,171,201,0.4);
        }
        .bbc-plyr .plyr__control--overlaid:hover {
          background: #00abc9;
        }
        .bbc-plyr .plyr__control--overlaid svg {
          width: 22px;
          height: 22px;
        }
        .bbc-plyr .plyr--youtube .plyr__poster {
          background-size: cover;
        }
        .bbc-plyr .plyr__progress input[type="range"]::-webkit-slider-thumb {
          background: #00abc9;
        }
      `}</style>
    </div>
  );
}
