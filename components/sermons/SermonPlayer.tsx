"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useVideo } from "@/lib/video-context";

interface Props {
  youtubeId: string;
  title: string;
  slug: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Per-page slot for the global video player (see lib/video-context.tsx).
// This component owns no player instance and no Plyr/portal logic — it
// just reserves a spot in this page's layout and registers it as the
// "inline" anchor for the shared player when this page's video is the
// active one. That's what lets playback survive navigating to a different
// page: the actual player lives at the app root and never unmounts.
export default function SermonPlayer({ youtubeId, title, slug }: Props) {
  const spacerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const debug = searchParams?.get("debug") === "1";

  const {
    track,
    state,
    resumeFrom,
    showToast,
    toastDismissed,
    registerPage,
    unregisterPage,
    switchTo,
    returnToInline,
    startOver,
    dismissToast,
  } = useVideo();

  useEffect(() => {
    registerPage({ youtubeId, title, slug, spacerEl: spacerRef.current, debug });
    return () => unregisterPage(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId, slug, debug]);

  const isOwner = track?.slug === slug;
  const showReturnPrompt = isOwner && state !== "inline";
  const showSwitchPrompt = !!track && !isOwner;

  return (
    <div className="relative">
      {/* ── Spacer: the video's slot in normal page flow. Its own height
          never changes with dock state, so the page never reflows when
          the shared player docks/undocks or when this page merely stops
          being the active one. ── */}
      <div
        ref={spacerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-white/8"
        style={{ aspectRatio: "16 / 9", background: "#07101e" }}
      >
        {showReturnPrompt && (
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

        {showSwitchPrompt && track && (
          <button
            onClick={() => switchTo({ youtubeId, title, slug })}
            className="absolute inset-0 group cursor-pointer"
            aria-label={`Play ${title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 group-hover:bg-black/55 transition-colors">
              <span
                className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-active:scale-95"
                style={{ background: "rgba(0,171,201,0.9)", boxShadow: "0 0 40px rgba(0,171,201,0.4)" }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="white" style={{ marginLeft: 3 }}>
                  <path d="M3 1.5l16 9.5-16 9.5z" />
                </svg>
              </span>
              <p className="text-white/70 text-xs px-6 text-center leading-snug">
                Currently playing &ldquo;{track.title}&rdquo; — tap to switch
              </p>
            </div>
          </button>
        )}
      </div>

      {/* ── Resume toast — only meaningful while this page owns the
          video and it's showing inline. ── */}
      {isOwner && state === "inline" && showToast && !toastDismissed && resumeFrom !== null && (
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
    </div>
  );
}
