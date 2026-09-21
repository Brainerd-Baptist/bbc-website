"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAudio } from "@/lib/audio-context";

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SPEED_LABELS: Record<number, string> = {
  0.75: ".75×", 1: "1×", 1.25: "1.25×", 1.5: "1.5×", 1.75: "1.75×", 2: "2×",
};

function nextSpeed(current: number) {
  const i = SPEEDS.indexOf(current);
  return SPEEDS[(i + 1) % SPEEDS.length];
}

// ── Skip icon with label ────────────────────────────────────────────────────
function SkipIcon({ direction, seconds = 15 }: { direction: "back" | "fwd"; seconds?: number }) {
  const label = String(seconds);
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {direction === "back" ? (
        <>
          <path d="M11 17a5 5 0 1 1 0-10H18" />
          <path d="M15 3l3 4-4 .5" />
        </>
      ) : (
        <>
          <path d="M13 7a5 5 0 1 1 0 10H6" />
          <path d="M9 21l-3-4 4-.5" />
        </>
      )}
      <text
        x="12" y="15.5"
        fontSize={label.length > 2 ? "5.5" : "6"}
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
      >
        {label}
      </text>
    </svg>
  );
}

export default function GlobalAudioPlayer() {
  const {
    track, isPlaying, currentTime, duration, speed,
    bufferedEnd, togglePlay, seek, setSpeed, dismiss,
    nextTrack, upNextCountdown, cancelUpNext,
  } = useAudio();

  const barRef   = useRef<HTMLDivElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [dragPct, setDragPct]     = useState(0);

  const pct        = duration > 0 ? currentTime / duration : 0;
  const bufPct     = duration > 0 ? bufferedEnd / duration : 0;
  const displayPct = dragging ? dragPct : pct;

  // ── Scrubber helpers ──────────────────────────────────────────────────────
  function getPct(e: React.MouseEvent | React.TouchEvent | MouseEvent) {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e
      ? (e as React.TouchEvent).touches[0]?.clientX ?? 0
      : (e as MouseEvent | React.MouseEvent).clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  const onBarClick = (e: React.MouseEvent) => { if (duration) seek(getPct(e) * duration); };
  const onMouseDown = (e: React.MouseEvent) => { if (!duration) return; setDragging(true); setDragPct(getPct(e)); };

  const onTouchStart = (e: React.TouchEvent) => { if (!duration) return; setDragging(true); setDragPct(getPct(e)); };
  const onTouchMove  = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.touches[0]?.clientX ?? 0;
    setDragPct(Math.max(0, Math.min(1, (x - rect.left) / rect.width)));
  }, [dragging]);
  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.changedTouches[0]?.clientX ?? 0;
    if (duration) seek(Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * duration);
    setDragging(false);
  }, [dragging, duration, seek]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setDragPct(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };
    const onUp = (e: MouseEvent) => {
      if (duration) seek(getPct(e) * duration);
      setDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, duration, seek, onTouchMove, onTouchEnd]);

  if (!track) return null;

  const speedLabel = SPEED_LABELS[speed] ?? `${speed}×`;
  const showUpNext = upNextCountdown > 0 && nextTrack;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        background: "rgba(5, 12, 26, 0.97)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* ── Up Next banner ── */}
      {showUpNext && (
        <div
          className="flex items-center gap-3 px-4 py-2"
          style={{
            background: "rgba(0,32,91,0.55)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Countdown ring */}
          <div className="relative flex-shrink-0 w-6 h-6">
            <svg width="24" height="24" viewBox="0 0 24 24" className="absolute inset-0">
              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                cx="12" cy="12" r="10"
                fill="none"
                stroke="#00abc9"
                strokeWidth="2"
                strokeDasharray={`${(upNextCountdown / 5) * 62.8} 62.8`}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
                style={{ transition: "stroke-dasharray 0.9s linear" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums" style={{ color: "#00abc9" }}>
              {upNextCountdown}
            </span>
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <span className="text-white/40 text-[10px]">Up next · </span>
            <span className="text-white/80 text-[10px] font-semibold truncate">{nextTrack.title}</span>
            <span className="text-white/30 text-[10px]"> · {nextTrack.speaker}</span>
          </div>

          {/* Cancel */}
          <button
            onClick={cancelUpNext}
            className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Scrubber — full width, tappable on mobile ── */}
      <div
        ref={barRef}
        className="w-full cursor-pointer relative group touch-none"
        style={{ height: 20, marginBottom: -12 }}
        onClick={onBarClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        aria-label="Seek"
        role="slider"
        aria-valuenow={Math.round(displayPct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* visible track — centered vertically */}
        <div className="absolute inset-x-0" style={{ top: 8, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          {/* buffered */}
          <div className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-150"
            style={{ width: `${bufPct * 100}%`, background: "rgba(255,255,255,0.13)" }} />
          {/* played */}
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${displayPct * 100}%`, background: "#00abc9" }} />
          {/* thumb */}
          <div
            className="absolute top-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
            style={{
              left: `${displayPct * 100}%`,
              transform: "translate(-50%, -50%)",
              background: "#00abc9",
              boxShadow: "0 0 8px rgba(0,171,201,0.6)",
            }}
          />
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="flex items-center gap-2 px-3 py-3 sm:px-5 sm:gap-3">

        {/* Track info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${track.accentColor}22`, border: `1px solid ${track.accentColor}44` }}
          >
            <svg width="10" height="12" viewBox="0 0 10 12" fill={track.accentColor}>
              <path d="M0 0l10 6-10 6z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <Link
              href={`/sermons/${track.slug}`}
              className="block text-white text-xs font-semibold leading-tight truncate hover:text-[#00abc9] transition-colors"
              style={{ letterSpacing: "-0.01em" }}
            >
              {track.title}
            </Link>
            <p className="text-white/35 text-[10px] truncate mt-0.5">{track.speaker}</p>
          </div>
        </div>

        {/* Time */}
        <div className="hidden xs:flex sm:flex items-center gap-1 text-[10px] text-white/35 tabular-nums flex-shrink-0">
          <span>{fmt(currentTime)}</span>
          <span className="text-white/15">/</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Skip back 15 */}
        <button
          onClick={() => seek(Math.max(0, currentTime - 15))}
          className="flex-shrink-0 text-white/45 hover:text-white active:scale-95 transition-all"
          aria-label="Skip back 15 seconds"
        >
          <SkipIcon direction="back" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "#00abc9" }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="1" y="0" width="4" height="14" rx="1.5"/>
              <rect x="9" y="0" width="4" height="14" rx="1.5"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white" style={{ marginLeft: 2 }}>
              <path d="M2 1l11 6-11 6z"/>
            </svg>
          )}
        </button>

        {/* Skip forward 15 */}
        <button
          onClick={() => seek(Math.min(duration, currentTime + 15))}
          className="flex-shrink-0 text-white/45 hover:text-white active:scale-95 transition-all"
          aria-label="Skip forward 15 seconds"
        >
          <SkipIcon direction="fwd" />
        </button>

        {/* Speed — mobile: cycle; desktop: row */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setSpeed(nextSpeed(speed))}
            className="md:hidden text-[10px] font-bold px-2 py-1 rounded transition-all"
            style={{ color: speed !== 1 ? "#00abc9" : "rgba(255,255,255,0.4)", background: speed !== 1 ? "rgba(0,171,201,0.12)" : "transparent", minWidth: 34 }}
            aria-label={`Playback speed ${speedLabel}, tap to change`}
          >
            {speedLabel}
          </button>
          <div className="hidden md:flex items-center gap-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded transition-all"
                style={{
                  color: speed === s ? "#00abc9" : "rgba(255,255,255,0.3)",
                  background: speed === s ? "rgba(0,171,201,0.12)" : "transparent",
                }}
              >
                {s === 1 ? "1×" : `${s}×`}
              </button>
            ))}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 text-white/25 hover:text-white/60 transition-colors ml-1"
          aria-label="Close player"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
