"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useAudio } from "@/lib/audio-context";
import { useScrollDock, type DockState, type DockRect } from "@/lib/useScrollDock";
import PlayerDebugOverlay from "./PlayerDebugOverlay";

interface Props {
  youtubeId: string;
  title: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Fixed dock/expand geometry. These never change while the page is
// scrolling — only entering/leaving a state recomputes them — so the
// transition CSS below only ever animates between two stable rects.
function getTargetRect(
  state: DockState,
  spacerRect: DockRect | null,
  viewport: { w: number; h: number },
  bottomOffset: number
): DockRect | null {
  if (state === "docked") {
    const width = Math.min(180, viewport.w - 24);
    const height = (width * 9) / 16;
    return {
      width,
      height,
      left: viewport.w - width - 12,
      top: viewport.h - height - 12 - bottomOffset,
    };
  }
  if (state === "expanded") {
    const width = Math.min(viewport.w - 32, 760);
    const height = (width * 9) / 16;
    return {
      width,
      height,
      left: (viewport.w - width) / 2,
      top: Math.max(64, (viewport.h - height) / 2 - 20),
    };
  }
  return spacerRect;
}

export default function SermonPlayer({ youtubeId, title }: Props) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const plyrHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<unknown>(null);

  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [justChangedState, setJustChangedState] = useState(false);

  const storageKey = `bbc-sermon-pos-${youtubeId}`;

  // A video already playing while the site's audio mini-player is also
  // showing (rare, but possible) shouldn't stack on top of it.
  const { track: audioTrack } = useAudio();
  const bottomOffset = audioTrack ? 78 : 0;

  const searchParams = useSearchParams();
  const debug = searchParams?.get("debug") === "1";

  const { state, rect: spacerRect, setState, pushLog, logRef } = useScrollDock({
    spacerRef,
    enabled: isPlaying,
    debug,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onResize() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Brief window after any state change where we animate top/left/size;
  // outside that window, "inline" tracking must snap 1:1 with scroll (no
  // transition lag) and docked/expanded are already stationary so it makes
  // no visible difference either way.
  useEffect(() => {
    setJustChangedState(true);
    const t = setTimeout(() => setJustChangedState(false), 360);
    return () => clearTimeout(t);
  }, [state]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
    setToastDismissed(true);
  }, []);

  const startOver = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* no-op */
    }
    const player = playerRef.current as { currentTime?: number } | null;
    if (player) player.currentTime = 0;
    dismissToast();
  }, [storageKey, dismissToast]);

  const returnToInline = useCallback(() => {
    const el = spacerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const isVisible = r.bottom > 0 && r.top < window.innerHeight;
      if (!isVisible) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    setState("inline");
  }, [setState]);

  const closeDock = useCallback(() => {
    const player = playerRef.current as { pause?: () => void } | null;
    player?.pause?.();
    setState("inline");
    pushLog("closed via dock X button (paused)");
  }, [setState, pushLog]);

  const closeExpanded = useCallback(() => {
    const el = spacerRef.current;
    const r = el?.getBoundingClientRect();
    const isVisible = !!r && r.bottom > 0 && r.top < window.innerHeight;
    setState(isVisible ? "inline" : "docked");
  }, [setState]);

  // ── Plyr init ──────────────────────────────────────────────────────────
  // Depends on `mounted`, not just [youtubeId, storageKey]: the player now
  // lives in a portal that only exists in the DOM once `mounted` flips true
  // a tick after first render. Without `mounted` in the deps, this effect's
  // very first run — before the portal has committed — found `plyrHostRef.
  // current` null, bailed out, and (since youtubeId/storageKey never
  // changed again on that page) never got a second chance to attach. Plyr
  // silently never took over, leaving the raw YouTube iframe showing its
  // own default chrome (forced captions, cards, branding) instead of the
  // site's skin — and since docking is driven entirely by Plyr's play/pause
  // events, it also never docked.
  useEffect(() => {
    if (!mounted || !plyrHostRef.current || !youtubeId) return;

    let destroyed = false;
    let savedPos = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) savedPos = parseFloat(raw);
    } catch {
      /* private mode — ignore */
    }

    async function init() {
      const Plyr = (await import("plyr")).default;
      await import("plyr/dist/plyr.css");

      if (destroyed || !plyrHostRef.current) return;

      const div = plyrHostRef.current.querySelector<HTMLElement>("[data-plyr-provider]");
      if (!div) return;

      const player = new Plyr(div, {
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          // Explicitly ask YouTube not to force captions on. This can still
          // be overridden by the viewer's own YouTube/Google account-level
          // "always show captions" accessibility setting — that preference
          // lives on their account, not in the embed, and no embed param
          // can override it. Giving them a real "captions" control below is
          // the honest fix for that case.
          cc_load_policy: 0,
        },
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
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

      player.on("ready", () => {
        pushLog("plyr: ready");
        if (savedPos > 30) {
          (player as unknown as { currentTime: number }).currentTime = savedPos;
          setResumeFrom(savedPos);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      });

      player.on("timeupdate", () => {
        const ct = (player as unknown as { currentTime: number }).currentTime;
        if (ct && ct > 5) {
          try {
            localStorage.setItem(storageKey, String(ct));
          } catch {
            /* no-op */
          }
        }
      });

      player.on("play", () => {
        pushLog("plyr: play");
        setIsPlaying(true);
      });
      player.on("pause", () => {
        pushLog("plyr: pause");
        setIsPlaying(false);
      });
      player.on("ended", () => {
        pushLog("plyr: ended");
        setIsPlaying(false);
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* no-op */
        }
      });
      // Defensive: harmless no-op if Plyr never emits this for a YouTube
      // provider, but if it ever does, we want it in the debug log.
      player.on("error", (e: unknown) => pushLog(`plyr: error ${JSON.stringify(e)}`));
    }

    init();

    return () => {
      destroyed = true;
      const p = playerRef.current as { destroy?: () => void } | null;
      if (p?.destroy) p.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, youtubeId, storageKey]);

  const targetRect = useMemo(
    () => getTargetRect(state, spacerRect, viewport, bottomOffset),
    [state, spacerRect, viewport, bottomOffset]
  );

  const transition = justChangedState
    ? "top 340ms cubic-bezier(.32,.72,0,1), left 340ms cubic-bezier(.32,.72,0,1), width 340ms cubic-bezier(.32,.72,0,1), height 340ms cubic-bezier(.32,.72,0,1), border-radius 340ms, box-shadow 340ms"
    : "width 200ms, height 200ms, border-radius 200ms, box-shadow 200ms";

  return (
    <div className="relative">
      {/* ── Spacer: the video's slot in normal page flow. This box's own
          height NEVER changes with dock state, so the surrounding page
          never reflows when the player docks or undocks — that page-jump
          feedback loop was the root cause of the earlier crashes. ── */}
      <div
        ref={spacerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-white/8"
        style={{ aspectRatio: "16 / 9", background: "#07101e" }}
      >
        {state !== "inline" && (
          <button
            onClick={returnToInline}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/45 text-sm hover:text-white/70 transition-colors cursor-pointer"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
            </svg>
            {state === "docked" ? "Playing in the corner — tap to return" : "Playing fullscreen — tap to return"}
          </button>
        )}
      </div>

      {/* ── Resume toast — only meaningful while inline ── */}
      {state === "inline" && showToast && !toastDismissed && resumeFrom !== null && (
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
            <path d="M12 2v10l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Resuming from {formatTime(resumeFrom)}
          <button onClick={startOver} className="ml-1 text-white/40 hover:text-white/70 underline text-xs transition-colors cursor-pointer">
            Start over
          </button>
          <button onClick={dismissToast} className="ml-1 text-white/30 hover:text-white/60 transition-colors cursor-pointer" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      {/* ── The real player. This is `position: fixed` for its entire
          life, never toggled — only its top/left/width/height change,
          which (since it's already out of normal flow) never forces the
          rest of the page to reflow. ── */}
      {mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              zIndex: state === "expanded" ? 70 : state === "docked" ? 50 : 30,
              top: targetRect?.top ?? -9999,
              left: targetRect?.left ?? -9999,
              width: targetRect?.width ?? 0,
              height: targetRect?.height ?? 0,
              borderRadius: state === "inline" ? 16 : 12,
              overflow: "hidden",
              background: "#07101e",
              boxShadow: state === "inline" ? "none" : "0 12px 40px rgba(0,0,0,0.45)",
              transition,
              visibility: targetRect ? "visible" : "hidden",
            }}
            className="bbc-plyr"
          >
            <div ref={plyrHostRef} className="w-full h-full">
              <div data-plyr-provider="youtube" data-plyr-embed-id={youtubeId} aria-label={title} />
            </div>

            {state === "docked" && (
              <div
                className="absolute top-0 inset-x-0 flex items-center justify-between px-2 py-1.5 pointer-events-none"
                style={{ background: "linear-gradient(rgba(0,0,0,0.6), transparent)" }}
              >
                <span className="text-[10px] font-semibold text-white/80 truncate pr-2 pointer-events-auto" onClick={() => setState("expanded")}>
                  {title}
                </span>
                <button
                  onClick={closeDock}
                  className="pointer-events-auto text-white/70 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                  aria-label="Close mini player"
                >
                  ✕
                </button>
              </div>
            )}

            {state === "expanded" && (
              <div
                className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2"
                style={{ background: "linear-gradient(rgba(0,0,0,0.65), transparent)" }}
              >
                <span className="text-xs font-semibold text-white/85 truncate pr-2">{title}</span>
                <button
                  onClick={closeExpanded}
                  className="text-white/70 hover:text-white text-sm w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                  aria-label="Collapse player"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Tapping the docked box (outside the close button) expands it */}
            {state === "docked" && (
              <button
                onClick={() => setState("expanded")}
                className="absolute inset-0"
                style={{ background: "transparent" }}
                aria-label={`Expand ${title}`}
              />
            )}

            <style>{`
              .bbc-plyr .plyr {
                --plyr-color-main: #00abc9;
                --plyr-video-background: #07101e;
                --plyr-control-radius: 6px;
                --plyr-range-thumb-height: 12px;
                --plyr-range-fill-background: #00abc9;
                --plyr-video-controls-background: linear-gradient(rgba(0,0,0,0), rgba(7,16,30,0.85));
                width: 100%;
                height: 100%;
                border-radius: 0;
                overflow: hidden;
              }
              .bbc-plyr .plyr__control--overlaid {
                background: rgba(0, 171, 201, 0.9);
                border-radius: 50%;
                width: 64px;
                height: 64px;
                box-shadow: 0 0 40px rgba(0,171,201,0.4);
              }
              .bbc-plyr .plyr__control--overlaid:hover { background: #00abc9; }
              .bbc-plyr .plyr__control--overlaid svg { width: 22px; height: 22px; }
              .bbc-plyr .plyr--youtube .plyr__poster { background-size: cover; }
              .bbc-plyr .plyr__progress input[type="range"]::-webkit-slider-thumb { background: #00abc9; }
            `}</style>
          </div>,
          document.body
        )}

      {mounted && debug &&
        createPortal(
          <PlayerDebugOverlay state={state} rect={spacerRect} isPlaying={isPlaying} logRef={logRef} pushLog={pushLog} />,
          document.body
        )}
    </div>
  );
}
