"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  youtubeId: string;
  title: string;
}

// Floating mini-player: when the video scrolls out of view while playing,
// it docks to a small fixed box instead of disappearing. Bottom offset
// clears GlobalAudioPlayer's mini bar (~72px) when that's also showing.
const DOCK_WIDTH = 240;
const DOCK_ASPECT = 9 / 16;

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SermonPlayer({ youtubeId, title }: Props) {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const playerRef     = useRef<unknown>(null);
  const saveTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [resumeFrom, setResumeFrom]       = useState<number | null>(null);
  const [showToast, setShowToast]         = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);

  // ── Floating mini-player state ──────────────────────────────────────────
  const [isPlaying, setIsPlaying]     = useState(false);
  const [isVisible, setIsVisible]     = useState(true);
  const [dismissed, setDismissed]     = useState(false);
  const [placeholderH, setPlaceholderH] = useState<number | null>(null);

  const docked = isPlaying && !isVisible && !dismissed;

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
          "pip",
          "fullscreen",
        ],
        keyboard: { focused: true, global: true },
        hideControls: true,
        resetOnEnd: false,
        disableContextMenu: false,
        ratio: "16:9",
        iconUrl: "/plyr.svg",
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
        setIsPlaying(false);
      });

      // ── Track play state for the floating mini-player ───────────────
      player.on("play",  () => setIsPlaying(true));
      player.on("pause", () => setIsPlaying(false));
    }

    init();

    return () => {
      destroyed = true;
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      const p = playerRef.current as { destroy?: () => void } | null;
      if (p?.destroy) p.destroy();
    };
  }, [youtubeId, storageKey]);

  // ── Watch whether the player is on-screen ───────────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setDismissed(false); // scrolling back resets a manual close
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Reserve layout space while docked so the page doesn't jump ─────────
  useEffect(() => {
    if (docked && wrapperRef.current && placeholderH === null) {
      setPlaceholderH(wrapperRef.current.getBoundingClientRect().height);
    }
    if (!docked && placeholderH !== null) {
      setPlaceholderH(null);
    }
  }, [docked, placeholderH]);

  const closeDock = useCallback(() => {
    const player = playerRef.current as { pause?: () => void } | null;
    player?.pause?.();
    setDismissed(true);
  }, []);

  return (
    <div className="relative" ref={wrapperRef} style={docked && placeholderH ? { minHeight: placeholderH } : undefined}>
      <div
        ref={containerRef}
        className={
          docked
            ? "bbc-plyr rounded-xl overflow-hidden border border-white/12 shadow-2xl"
            : "relative w-full rounded-2xl overflow-hidden border border-white/8 bbc-plyr"
        }
        style={
          docked
            ? {
                position: "fixed",
                zIndex: 50,
                width: DOCK_WIDTH,
                height: DOCK_WIDTH * DOCK_ASPECT,
                bottom: 88, // clears GlobalAudioPlayer's mini bar when it's also showing
                right: 12,
                transition: "box-shadow 0.2s",
              }
            : undefined
        }
      >
        {/* Docked header: title + close — sits above the video, doesn't block Plyr's own controls at the bottom */}
        {docked && (
          <div
            className="absolute top-0 inset-x-0 z-10 flex items-center justify-between gap-2 px-2 py-1"
            style={{ background: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0))" }}
          >
            <span className="text-white/85 text-[10px] font-semibold truncate leading-tight">{title}</span>
            <button
              onClick={closeDock}
              aria-label="Close floating player"
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 1l8 8M9 1L1 9"/>
              </svg>
            </button>
          </div>
        )}

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
