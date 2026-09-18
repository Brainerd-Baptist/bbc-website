"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  youtubeId: string;
  title: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SermonPlayer({ youtubeId, title }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const playerRef     = useRef<unknown>(null);
  const saveTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [resumeFrom, setResumeFrom]       = useState<number | null>(null);
  const [showToast, setShowToast]         = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  const storageKey = `bbc-sermon-pos-${youtubeId}`;

  const dismissToast = useCallback(() => {
    setShowToast(false);
    setToastDismissed(true);
  }, []);

  const startOver = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* no-op */ }
    const player = playerRef.current as { currentTime?: number } | null;
    if (player) player.currentTime = 0;
    dismissToast();
  }, [storageKey, dismissToast]);

  useEffect(() => {
    if (!containerRef.current || !youtubeId) return;

    let destroyed = false;

    // Read saved position before mounting
    let savedPos = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedPos = parseFloat(raw);
    } catch { /* private mode — ignore */ }

    async function init() {
      const Plyr = (await import("plyr")).default;
      await import("plyr/dist/plyr.css");

      if (destroyed || !containerRef.current) return;

      const div = containerRef.current.querySelector<HTMLElement>("[data-plyr-provider]");
      if (!div) return;

      const player = new Plyr(div, {
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
        iconUrl: "",
      });

      playerRef.current = player;

      // ── On ready: seek to saved position if > 30s ──────────────────
      player.on("ready", () => {
        if (savedPos > 30) {
          (player as unknown as { currentTime: number }).currentTime = savedPos;
          setResumeFrom(savedPos);
          setShowToast(true);
          // Auto-dismiss after 4s
          setTimeout(() => setShowToast(false), 4000);
        }
      });

      // ── Save position every 5s on timeupdate ────────────────────────
      player.on("timeupdate", () => {
        const ct = (player as unknown as { currentTime: number }).currentTime;
        if (ct && ct > 5) {
          try { localStorage.setItem(storageKey, String(ct)); } catch { /* no-op */ }
        }
      });

      // ── Clear position on ended ─────────────────────────────────────
      player.on("ended", () => {
        try { localStorage.removeItem(storageKey); } catch { /* no-op */ }
      });
    }

    init();

    return () => {
      destroyed = true;
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      const p = playerRef.current as { destroy?: () => void } | null;
      if (p?.destroy) p.destroy();
    };
  }, [youtubeId, storageKey]);

  return (
    <div className="relative">
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

      {/* ── Resume toast ─────────────────────────────────────────────── */}
      {showToast && !toastDismissed && resumeFrom !== null && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{
            background: "rgba(7,16,30,0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00abc9" strokeWidth="2.5">
            <path d="M12 2v10l4 2" /><circle cx="12" cy="12" r="10" />
          </svg>
          Resuming from {formatTime(resumeFrom)}
          <button
            onClick={startOver}
            className="ml-1 text-white/40 hover:text-white/70 underline text-xs transition-colors cursor-pointer"
          >
            Start over
          </button>
          <button
            onClick={dismissToast}
            className="ml-1 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
