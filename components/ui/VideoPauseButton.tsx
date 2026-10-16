"use client";

import { useEffect, useState } from "react";

/**
 * Pause/play control for an ambient background video (WCAG 2.2.2: anything
 * that moves on its own for more than 5 seconds needs a way to stop it).
 * Also honors the visitor's "reduce motion" setting by pausing on load.
 */
export default function VideoPauseButton({
  videoRef,
  className = "",
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const sync = () => setPaused(v.paused);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
    }
    sync();
    return () => {
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
    };
  }, [videoRef]);

  return (
    <button
      type="button"
      onClick={() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) void v.play();
        else v.pause();
      }}
      aria-label={paused ? "Play background video" : "Pause background video"}
      className={`items-center justify-center w-10 h-10 rounded-full border border-border-on-dark-strong text-fg-on-dark hover:border-border-on-dark-hover transition-colors ${className}`}
      style={{ background: "var(--scrim-control)", backdropFilter: "blur(4px)" }}
    >
      {paused ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><rect x="2.5" y="1.5" width="3" height="11" rx="0.8" /><rect x="8.5" y="1.5" width="3" height="11" rx="0.8" /></svg>
      )}
    </button>
  );
}
