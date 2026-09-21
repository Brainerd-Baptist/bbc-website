"use client";

/**
 * Global video-playback context — same idea as audio-context.tsx, but for
 * the sermon video player.
 *
 * The player itself (Plyr instance + the fixed/portal-rendered box it
 * lives in) is owned here, at the root of the app, so it survives
 * client-side navigation instead of being torn down whenever the sermon
 * page that started it unmounts. A per-page <SermonPlayer> just registers
 * a "spacer" element (its slot in that page's normal flow) with this
 * provider; the provider decides whether that page currently owns the
 * active video and, if so, keeps the fixed box's "inline" rect glued to
 * that spacer's position. See registerPage/unregisterPage below.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useAudio } from "./audio-context";
import { useScrollDock, type DockState, type DockRect } from "./useScrollDock";
import PlayerDebugOverlay from "@/components/sermons/PlayerDebugOverlay";

export interface VideoTrack {
  youtubeId: string;
  title: string;
  slug: string;
}

interface RegisterPagePayload extends VideoTrack {
  spacerEl: HTMLElement | null;
  debug?: boolean;
}

interface VideoCtx {
  track: VideoTrack | null;
  isPlaying: boolean;
  state: DockState;
  resumeFrom: number | null;
  showToast: boolean;
  toastDismissed: boolean;
  registerPage: (payload: RegisterPagePayload) => void;
  unregisterPage: (slug: string) => void;
  switchTo: (track: VideoTrack) => void;
  returnToInline: () => void;
  startOver: () => void;
  dismissToast: () => void;
}

const VideoContext = createContext<VideoCtx | null>(null);

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideo must be inside VideoProvider");
  return ctx;
}

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

export function VideoProvider({ children }: { children: ReactNode }) {
  const spacerRef = useRef<HTMLElement | null>(null);
  const plyrHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<unknown>(null);
  // Which page's spacer is currently attached (i.e. "owns" the active video).
  const ownerSlugRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const [track, setTrack] = useState<VideoTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [justChangedState, setJustChangedState] = useState(false);
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [debug, setDebug] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  // Keep the mini-player from stacking on top of the site's audio mini-bar
  // when (rarely) both are showing.
  const { track: audioTrack } = useAudio();
  const bottomOffset = audioTrack ? 78 : 0;

  const { state, rect: spacerRect, setState, pushLog, logRef, suppressAutoDock } = useScrollDock({
    spacerRef,
    enabled: isPlaying,
    debug,
  });

  useEffect(() => setMounted(true), []);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    function onResize() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setJustChangedState(true);
    const t = setTimeout(() => setJustChangedState(false), 360);
    return () => clearTimeout(t);
  }, [state]);

  const dismiss = useCallback(() => {
    const p = playerRef.current as { pause?: () => void } | null;
    p?.pause?.();
    ownerSlugRef.current = null;
    spacerRef.current = null;
    setTrack(null);
    setState("inline");
    setResumeFrom(null);
    setShowToast(false);
    setToastDismissed(false);
    setDebug(false);
    setProgress({ current: 0, duration: 0 });
  }, [setState]);

  // Pause if the tab stays backgrounded for a while. A quick app-switch
  // (checking a text, glancing at another tab) shouldn't interrupt
  // playback, but leaving it backgrounded for real shouldn't keep burning
  // battery/data on a video nobody's watching.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function onVisibility() {
      if (document.hidden) {
        timer = setTimeout(() => {
          const p = playerRef.current as { pause?: () => void; paused?: boolean } | null;
          if (p && !p.paused) {
            p.pause?.();
            pushLog("auto-paused: backgrounded 60s+");
          }
        }, 60_000);
      } else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer) clearTimeout(timer);
    };
  }, [pushLog]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
    setToastDismissed(true);
  }, []);

  const startOver = useCallback(() => {
    if (track) {
      try {
        localStorage.removeItem(`bbc-sermon-pos-${track.youtubeId}`);
      } catch {
        /* no-op */
      }
    }
    const player = playerRef.current as { currentTime?: number } | null;
    if (player) player.currentTime = 0;
    dismissToast();
  }, [track, dismissToast]);

  // ── Plyr init/teardown — keyed on the loaded youtubeId, not on which
  // page is currently registered, so switching pages while the same video
  // is active never reinitializes it. ─────────────────────────────────────
  useEffect(() => {
    if (!mounted || !track || !plyrHostRef.current) return;

    let destroyed = false;
    let savedPos = 0;
    const key = `bbc-sermon-pos-${track.youtubeId}`;
    try {
      const raw = localStorage.getItem(key);
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
          cc_load_policy: 0,
        },
        controls: [
          "play-large", "play", "progress", "current-time", "duration", "mute", "volume", "captions", "fullscreen",
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
        const dur = (player as unknown as { duration: number }).duration;
        setProgress({ current: ct || 0, duration: dur || 0 });
        if (ct && ct > 5) {
          try {
            localStorage.setItem(key, String(ct));
          } catch {
            /* no-op */
          }
        }
      });

      player.on("play", () => { pushLog("plyr: play"); setIsPlaying(true); });
      player.on("pause", () => { pushLog("plyr: pause"); setIsPlaying(false); });
      player.on("ended", () => {
        pushLog("plyr: ended");
        setIsPlaying(false);
        setProgress({ current: 0, duration: 0 });
        try {
          localStorage.removeItem(key);
        } catch {
          /* no-op */
        }
      });
      player.on("error", (e: unknown) => pushLog(`plyr: error ${JSON.stringify(e)}`));
    }

    init();

    return () => {
      destroyed = true;
      const p = playerRef.current as { destroy?: () => void } | null;
      if (p?.destroy) p.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, track?.youtubeId]);

  const registerPage = useCallback((payload: RegisterPagePayload) => {
    setDebug(!!payload.debug);
    setTrack((prev) => {
      if (!prev || prev.slug === payload.slug) {
        // Nothing loaded yet, or this page already owns the active video —
        // (re)attach its spacer as the inline-positioning anchor.
        ownerSlugRef.current = payload.slug;
        spacerRef.current = payload.spacerEl;
        if (!prev) return { youtubeId: payload.youtubeId, title: payload.title, slug: payload.slug };
        return prev;
      }
      // A different video is already active elsewhere — leave it playing;
      // this page shows a "switch to this video" prompt instead (see
      // SermonPlayer.tsx), driven off `track` not matching its own slug.
      return prev;
    });
  }, []);

  const unregisterPage = useCallback((slug: string) => {
    if (ownerSlugRef.current !== slug) return;
    spacerRef.current = null;
    if (isPlayingRef.current) {
      // Still actively playing — keep it floating on screen while the
      // person browses elsewhere, rather than stranding it with nowhere
      // to render inline.
      ownerSlugRef.current = null;
      setState((prev) => (prev === "inline" ? "docked" : prev));
    } else {
      // Never played (or already paused) — no reason to keep a silent
      // video floating around after leaving its page.
      dismiss();
    }
  }, [setState, dismiss]);

  const switchTo = useCallback((newTrack: VideoTrack) => {
    ownerSlugRef.current = newTrack.slug;
    setResumeFrom(null);
    setShowToast(false);
    setToastDismissed(false);
    setState("inline");
    setTrack(newTrack);
  }, [setState]);

  const returnToInline = useCallback(() => {
    const el = spacerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const isVisible = r.bottom > 0 && r.top < window.innerHeight;
      if (!isVisible) {
        suppressAutoDock();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    setState("inline");
  }, [setState, suppressAutoDock]);

  const expand = useCallback(() => setState("expanded"), [setState]);

  const closeDock = useCallback(() => {
    const p = playerRef.current as { pause?: () => void } | null;
    p?.pause?.();
    if (spacerRef.current) {
      // Still on the owning page — just collapse back to its normal slot.
      setState("inline");
    } else {
      // No page to return to — nothing left to keep floating.
      dismiss();
    }
    pushLog("closed via dock X button");
  }, [setState, dismiss, pushLog]);

  const closeExpanded = useCallback(() => {
    const el = spacerRef.current;
    const r = el?.getBoundingClientRect();
    const isVisible = !!r && r.bottom > 0 && r.top < window.innerHeight;
    setState(isVisible ? "inline" : "docked");
  }, [setState]);

  const targetRect = useMemo(
    () => getTargetRect(state, spacerRect, viewport, bottomOffset),
    [state, spacerRect, viewport, bottomOffset]
  );

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const transition = reducedMotion
    ? "none"
    : justChangedState
    ? "top 340ms cubic-bezier(.32,.72,0,1), left 340ms cubic-bezier(.32,.72,0,1), width 340ms cubic-bezier(.32,.72,0,1), height 340ms cubic-bezier(.32,.72,0,1), border-radius 340ms, box-shadow 340ms"
    : "width 200ms, height 200ms, border-radius 200ms, box-shadow 200ms";

  const ctxValue: VideoCtx = {
    track, isPlaying, state, resumeFrom, showToast, toastDismissed,
    registerPage, unregisterPage, switchTo, returnToInline, startOver, dismissToast,
  };

  return (
    <VideoContext.Provider value={ctxValue}>
      {children}

      {mounted && track &&
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
              background: "var(--player-sheet)",
              boxShadow: state === "inline" ? "none" : "var(--shadow-lg)",
              transition,
              visibility: targetRect ? "visible" : "hidden",
            }}
            className="bbc-plyr"
          >
            <div ref={plyrHostRef} className="w-full h-full">
              <div data-plyr-provider="youtube" data-plyr-embed-id={track.youtubeId} aria-label={track.title} />
            </div>

            {state === "docked" && (
              <div
                className="absolute top-0 inset-x-0 flex items-center justify-between px-2 py-1.5 pointer-events-none"
                style={{ background: "linear-gradient(var(--scrim), transparent)" }}
              >
                <span className="text-[10px] font-semibold text-fg-on-dark-body truncate pr-2 pointer-events-auto" onClick={expand}>
                  {track.title}
                </span>
                <button
                  onClick={closeDock}
                  className="pointer-events-auto text-fg-on-dark-muted hover:text-fg-on-dark text-xs w-5 h-5 flex items-center justify-center rounded-full"
                  style={{ background: "var(--scrim)" }}
                  aria-label="Close mini player"
                >
                  ✕
                </button>
              </div>
            )}

            {state === "expanded" && (
              <div
                className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2"
                style={{ background: "linear-gradient(var(--scrim), transparent)" }}
              >
                <span className="text-xs font-semibold text-fg-on-dark-body truncate pr-2">{track.title}</span>
                <button
                  onClick={closeExpanded}
                  className="text-fg-on-dark-muted hover:text-fg-on-dark text-sm w-7 h-7 flex items-center justify-center rounded-full"
                  style={{ background: "var(--scrim)" }}
                  aria-label="Collapse player"
                >
                  ✕
                </button>
              </div>
            )}

            {state === "docked" && (
              <button
                onClick={expand}
                className="absolute inset-0"
                style={{ background: "transparent" }}
                aria-label={`Expand ${track.title}`}
              />
            )}

            {state === "docked" && progress.duration > 0 && (
              <div
                className="absolute bottom-0 inset-x-0 pointer-events-none"
                style={{ height: 3, background: "var(--border-on-dark)" }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (progress.current / progress.duration) * 100)}%`,
                    background: "var(--accent)",
                  }}
                />
              </div>
            )}

            <style>{`
              .bbc-plyr .plyr {
                --plyr-color-main: var(--accent);
                --plyr-video-background: var(--player-sheet);
                --plyr-control-radius: 6px;
                --plyr-range-thumb-height: 12px;
                --plyr-range-fill-background: var(--accent);
                --plyr-video-controls-background: linear-gradient(transparent, var(--scrim));
                width: 100%;
                height: 100%;
                border-radius: 0;
                overflow: hidden;
              }
              .bbc-plyr .plyr__control--overlaid {
                background: color-mix(in srgb, var(--accent) 90%, transparent);
                border-radius: 50%;
                width: 64px;
                height: 64px;
                box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 40%, transparent);
              }
              .bbc-plyr .plyr__control--overlaid:hover { background: var(--accent); }
              .bbc-plyr .plyr__control--overlaid svg { width: 22px; height: 22px; }
              .bbc-plyr .plyr--youtube .plyr__poster { background-size: cover; }
              .bbc-plyr .plyr__progress input[type="range"]::-webkit-slider-thumb { background: var(--accent); }
            `}</style>
          </div>,
          document.body
        )}

      {mounted && debug && track &&
        createPortal(
          <PlayerDebugOverlay state={state} rect={spacerRect} isPlaying={isPlaying} logRef={logRef} pushLog={pushLog} />,
          document.body
        )}
    </VideoContext.Provider>
  );
}
