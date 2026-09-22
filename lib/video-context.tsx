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

// Bare YouTube IFrame API — no Plyr wrapper. This gets us YouTube's own
// player chrome (their button set, their fullscreen, and — critically —
// real native Picture-in-Picture on iOS/Safari, which only shows up when
// Safari sees YouTube's own unmodified iframe rather than a custom-skinned
// player). Plyr is still used for the audio player (see audio-context.tsx)
// — this file only drops it from the video path.
declare global {
  interface Window {
    YT?: {
      Player: new (el: Element, opts: Record<string, unknown>) => YTPlayerInstance;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  destroy(): void;
}

let youTubeApiPromise: Promise<NonNullable<Window["YT"]>> | null = null;

function loadYouTubeIframeApi(): Promise<NonNullable<Window["YT"]>> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youTubeApiPromise) return youTubeApiPromise;

  youTubeApiPromise = new Promise((resolve) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      resolve(window.YT!);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return youTubeApiPromise;
}

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

  // ── YouTube IFrame API init/teardown — keyed on the loaded youtubeId, not
  // on which page is currently registered, so switching pages while the
  // same video is active never reinitializes it. Same contract the old Plyr
  // instance offered the rest of this file (pause(), .paused, .currentTime
  // get/set), so nothing outside this effect had to change. ────────────────
  useEffect(() => {
    if (!mounted || !track || !plyrHostRef.current) return;

    let destroyed = false;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let savedPos = 0;
    const key = `bbc-sermon-pos-${track.youtubeId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) savedPos = parseFloat(raw);
    } catch {
      /* private mode — ignore */
    }

    async function init() {
      const YT = await loadYouTubeIframeApi();
      if (destroyed || !plyrHostRef.current) return;

      const mount = plyrHostRef.current.querySelector<HTMLElement>("[data-yt-mount]");
      if (!mount) return;

      const player = new YT.Player(mount, {
        videoId: track!.youtubeId,
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            pushLog("yt: ready");
            if (savedPos > 30) {
              player.seekTo(savedPos, true);
              setResumeFrom(savedPos);
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }
            // The IFrame API has no native timeupdate event — poll instead.
            pollId = setInterval(() => {
              if (destroyed) return;
              let ct = 0;
              let dur = 0;
              try {
                ct = player.getCurrentTime() || 0;
                dur = player.getDuration() || 0;
              } catch {
                /* not ready yet */
              }
              setProgress({ current: ct, duration: dur });
              if (ct > 5) {
                try {
                  localStorage.setItem(key, String(ct));
                } catch {
                  /* no-op */
                }
              }
            }, 500);
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === YT.PlayerState.PLAYING) { pushLog("yt: play"); setIsPlaying(true); }
            else if (e.data === YT.PlayerState.PAUSED) { pushLog("yt: pause"); setIsPlaying(false); }
            else if (e.data === YT.PlayerState.ENDED) {
              pushLog("yt: ended");
              setIsPlaying(false);
              setProgress({ current: 0, duration: 0 });
              try {
                localStorage.removeItem(key);
              } catch {
                /* no-op */
              }
            }
          },
          onError: (e: unknown) => pushLog(`yt: error ${JSON.stringify(e)}`),
        },
      });

      // Adapt the IFrame API's method-based shape to the small get/pause
      // surface the rest of this file (dismiss, startOver, visibilitychange
      // auto-pause) already expects.
      playerRef.current = {
        pause: () => player.pauseVideo(),
        get paused() {
          try {
            return player.getPlayerState() !== YT.PlayerState.PLAYING;
          } catch {
            return true;
          }
        },
        get currentTime() {
          try {
            return player.getCurrentTime();
          } catch {
            return 0;
          }
        },
        set currentTime(t: number) {
          player.seekTo(t, true);
        },
        destroy: () => player.destroy(),
      };
    }

    init();

    return () => {
      destroyed = true;
      if (pollId) clearInterval(pollId);
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
            className="bbc-yt-player"
          >
            <div ref={plyrHostRef} className="w-full h-full">
              <div data-yt-mount className="w-full h-full" aria-label={track.title} />
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
              .bbc-yt-player iframe {
                width: 100%;
                height: 100%;
                display: block;
                border: 0;
              }
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
