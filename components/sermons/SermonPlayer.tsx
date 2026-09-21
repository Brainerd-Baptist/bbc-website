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

// Toggling position:fixed on an element containing a live iframe forces a
// reflow/repaint of it — cheap on desktop, but expensive enough on mobile
// Safari that doing it many times a second during momentum scroll can hang
// or crash the render process. Debouncing the dock/undock decision means we
// only flip it once scrolling has actually settled, not on every boundary
// crossing mid-scroll. rootMargin adds a buffer so near-boundary jitter
// doesn't even register as a crossing in the first place.
const DOCK_DEBOUNCE_MS = 350;
const DOCK_ROOT_MARGIN = "-15% 0px -15% 0px";
// Safety net: if something still causes rapid toggling (a page-transition
// interaction, a layout we haven't anticipated, etc.), permanently disable
// docking for this player instance rather than let it spiral.
const MAX_TOGGLES_PER_WINDOW = 8;
const TOGGLE_WINDOW_MS = 3000;

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
  // Captured from the IntersectionObserver entry itself, at the moment the
  // player leaves the viewport — i.e. while it's still in normal flow, before
  // any docked styling is applied. Measuring it any other way (e.g. in a
  // follow-up effect, after the wrapper has already collapsed to 0 height)
  // creates a layout-shift feedback loop: wrapper collapses → page jumps →
  // observer flips back → undocks → page jumps again, forever.
  const dockedHeightRef = useRef(0);
  // Circuit breaker for the toggle-rate safety net below.
  const toggleCountRef      = useRef(0);
  const toggleWindowStartRef = useRef(0);
  const [dockingDisabled, setDockingDisabled] = useState(false);

  const docked = isPlaying && !isVisible && !dismissed && !dockingDisabled;

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

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Capture the wrapper's height *before* it potentially goes fixed —
        // the rect on this entry still reflects normal in-flow layout.
        if (!entry.isIntersecting && entry.boundingClientRect.height > 0) {
          dockedHeightRef.current = entry.boundingClientRect.height;
        }

        // ── Circuit breaker: too many crossings too fast → give up on
        // docking entirely for this player rather than risk another crash.
        const now = Date.now();
        if (now - toggleWindowStartRef.current > TOGGLE_WINDOW_MS) {
          toggleWindowStartRef.current = now;
          toggleCountRef.current = 0;
        }
        toggleCountRef.current += 1;
        if (toggleCountRef.current > MAX_TOGGLES_PER_WINDOW) {
          if (debounceTimer) clearTimeout(debounceTimer);
          setDockingDisabled(true);
          observer.disconnect(); // nothing further to watch — fail safe, not just safe-once
          return;
        }

        // ── Debounce: only commit the visibility change once it's held
        // steady for DOCK_DEBOUNCE_MS — i.e. after scrolling has settled,
        // not mid-scroll.
        const nextVisible = entry.isIntersecting;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          setIsVisible(nextVisible);
          if (nextVisible) setDismissed(false); // scrolling back resets a manual close
        }, DOCK_DEBOUNCE_MS);
      },
      { threshold: 0, rootMargin: DOCK_ROOT_MARGIN }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const closeDock = useCallback(() => {
    const player = playerRef.current as { pause?: () => void } | null;
    player?.pause?.();
    setDismissed(true);
  }, []);

  return (
    <div className="relative" ref={wrapperRef} style={docked && dockedHeightRef.current ? { minHeight: dockedHeightRef.current } : undefined}>
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
