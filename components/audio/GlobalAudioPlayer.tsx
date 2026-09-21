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

// ── Skip icon ────────────────────────────────────────────────────────────────
function SkipIcon({ direction, seconds = 15, size = 22 }: { direction: "back" | "fwd"; seconds?: number; size?: number }) {
  const label = String(seconds);
  // Scale the label font proportionally
  const fontSize = size <= 24 ? 9 : 13;
  return (
    <span className="flex flex-col items-center leading-none" style={{ gap: size > 24 ? 3 : 1 }}>
      <svg width={size} height={size * 0.72} viewBox="0 0 24 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === "back" ? (
          <>
            {/* CCW arc */}
            <path d="M17.5 2.5A9 9 0 1 0 20 9" />
            {/* Arrowhead pointing left/CCW */}
            <path d="M17.5 2.5L14 1M17.5 2.5L19 6" />
          </>
        ) : (
          <>
            {/* CW arc */}
            <path d="M6.5 2.5A9 9 0 1 1 4 9" />
            {/* Arrowhead pointing right/CW */}
            <path d="M6.5 2.5L10 1M6.5 2.5L5 6" />
          </>
        )}
      </svg>
      <span style={{ fontSize, fontWeight: 600, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
        {label}
      </span>
    </span>
  );
}

// ── Scrubber (shared between mini and expanded) ──────────────────────────────
function Scrubber({
  barRef, displayPct, bufPct, onBarClick, onMouseDown, onTouchStart, duration, currentTime, accent, large,
}: {
  barRef: React.RefObject<HTMLDivElement | null>;
  displayPct: number; bufPct: number;
  onBarClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  duration: number; currentTime: number;
  accent: string; large?: boolean;
}) {
  const h = large ? 28 : 20;
  const trackH = large ? 5 : 4;
  const trackTop = large ? 11 : 8;
  const thumbSize = large ? 18 : 14;

  return (
    <div>
      <div
        ref={barRef}
        className="w-full cursor-pointer relative group touch-none"
        style={{ height: h }}
        onClick={onBarClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        aria-label="Seek"
        role="slider"
        aria-valuenow={Math.round(displayPct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="absolute inset-x-0 rounded-full" style={{ top: trackTop, height: trackH, background: "rgba(255,255,255,0.12)" }}>
          <div className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-150"
            style={{ width: `${bufPct * 100}%`, background: "rgba(255,255,255,0.18)" }} />
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${displayPct * 100}%`, background: accent }} />
          <div
            className="absolute top-1/2 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
            style={{
              left: `${displayPct * 100}%`,
              width: thumbSize, height: thumbSize,
              transform: "translate(-50%, -50%)",
              background: accent,
              boxShadow: `0 0 8px ${accent}99`,
            }}
          />
        </div>
      </div>
      {large && (
        <div className="flex justify-between text-[11px] tabular-nums mt-1 px-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GlobalAudioPlayer() {
  const {
    track, isPlaying, currentTime, duration, speed,
    bufferedEnd, togglePlay, seek, setSpeed, dismiss,
    nextTrack, upNextCountdown, cancelUpNext,
  } = useAudio();

  const barRef        = useRef<HTMLDivElement | null>(null);
  const expandBarRef  = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [dragPct, setDragPct]     = useState(0);
  const [expanded, setExpanded]   = useState(false);
  const [slideIn, setSlideIn]     = useState(false);

  // Touch-to-swipe-down to close
  const touchStartY = useRef(0);

  // Animate in when expanded opens
  useEffect(() => {
    if (expanded) requestAnimationFrame(() => setSlideIn(true));
    else setSlideIn(false);
  }, [expanded]);

  const closeExpanded = useCallback(() => {
    setSlideIn(false);
    setTimeout(() => setExpanded(false), 390);
  }, []);

  const pct        = duration > 0 ? currentTime / duration : 0;
  const bufPct     = duration > 0 ? bufferedEnd / duration : 0;
  const displayPct = dragging ? dragPct : pct;

  const accent = track?.accentColor ?? "#00abc9";

  // ── Shared scrubber helpers ───────────────────────────────────────────────
  function getPctFromEvent(e: React.MouseEvent | React.TouchEvent | MouseEvent, ref: React.RefObject<HTMLDivElement | null>) {
    const bar = ref.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e
      ? (e as React.TouchEvent).touches[0]?.clientX ?? 0
      : (e as MouseEvent | React.MouseEvent).clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  const makeHandlers = (ref: React.RefObject<HTMLDivElement | null>) => ({
    onBarClick: (e: React.MouseEvent) => { if (duration) seek(getPctFromEvent(e, ref) * duration); },
    onMouseDown: (e: React.MouseEvent) => { if (!duration) return; setDragging(true); setDragPct(getPctFromEvent(e, ref)); },
    onTouchStart: (e: React.TouchEvent) => { if (!duration) return; setDragging(true); setDragPct(getPctFromEvent(e, ref)); },
  });

  const miniHandlers   = makeHandlers(barRef);
  const expandHandlers = makeHandlers(expandBarRef);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const activeRef = expanded ? expandBarRef : barRef;
    const bar = activeRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.touches[0]?.clientX ?? 0;
    setDragPct(Math.max(0, Math.min(1, (x - rect.left) / rect.width)));
  }, [dragging, expanded]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!dragging) return;
    const activeRef = expanded ? expandBarRef : barRef;
    const bar = activeRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = e.changedTouches[0]?.clientX ?? 0;
    if (duration) seek(Math.max(0, Math.min(1, (x - rect.left) / rect.width)) * duration);
    setDragging(false);
  }, [dragging, duration, seek, expanded]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const activeRef = expanded ? expandBarRef : barRef;
      const bar = activeRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setDragPct(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };
    const onUp = (e: MouseEvent) => {
      const activeRef = expanded ? expandBarRef : barRef;
      if (duration) seek(getPctFromEvent(e, activeRef) * duration);
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
  }, [dragging, duration, seek, onTouchMove, onTouchEnd, expanded]);

  // Close expanded on Escape
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeExpanded(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  if (!track) return null;

  const speedLabel = SPEED_LABELS[speed] ?? `${speed}×`;
  const showUpNext = upNextCountdown > 0 && nextTrack;

  // ── EXPANDED full-screen overlay ─────────────────────────────────────────
  const expandedView = (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: `linear-gradient(160deg, color-mix(in srgb, ${accent} 18%, #080f1e) 0%, #080f1e 50%, #040a14 100%)`,
        transform: slideIn ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
      onTouchEnd={(e) => {
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (dy > 60) closeExpanded(); // swipe down to close
      }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
        <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-1 pb-2 flex-shrink-0">
        <button
          onClick={closeExpanded}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 active:bg-white/15"
          aria-label="Collapse player"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M5 8l5 5 5-5"/>
          </svg>
        </button>

        <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
          Now Playing
        </p>

        <Link
          href={`/sermons/${track.slug}`}
          onClick={closeExpanded}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          aria-label="Go to sermon"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </Link>
      </div>

      {/* Artwork */}
      <div className="flex justify-center px-10 py-4 flex-shrink-0">
        <div
          className="w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: `0 20px 60px ${accent}30, 0 0 0 1px rgba(255,255,255,0.04)`,
          }}
        >
          {track.youtubeId ? (
            <img
              src={`https://img.youtube.com/vi/${track.youtubeId}/maxresdefault.jpg`}
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fall back to hqdefault if maxres not available
                (e.currentTarget as HTMLImageElement).src =
                  `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`;
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 30%, #0d1a2e) 0%, #0d1a2e 100%)`,
                border: `1px solid ${accent}33`,
              }}
            >
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
                <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5"/>
                <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Track info */}
      <div className="px-7 pb-2 flex-shrink-0">
        <h2 className="text-white font-bold text-xl leading-tight mb-1" style={{ letterSpacing: "-0.02em" }}>
          {track.title}
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          {track.speaker}
          {track.series ? <span style={{ color: "rgba(255,255,255,0.25)" }}> · {track.series}</span> : null}
        </p>
      </div>

      {/* Scrubber */}
      <div className="px-7 pt-3 pb-1 flex-shrink-0">
        <Scrubber
          barRef={expandBarRef}
          displayPct={displayPct}
          bufPct={bufPct}
          onBarClick={expandHandlers.onBarClick}
          onMouseDown={expandHandlers.onMouseDown}
          onTouchStart={expandHandlers.onTouchStart}
          duration={duration}
          currentTime={currentTime}
          accent={accent}
          large
        />
      </div>

      {/* Big controls */}
      <div className="flex items-center justify-center gap-8 px-7 py-4 flex-shrink-0">
        {/* Skip back */}
        <button
          onClick={() => seek(Math.max(0, currentTime - 15))}
          className="text-white/60 hover:text-white active:scale-95 transition-all"
          aria-label="Skip back 15 seconds"
        >
          <SkipIcon direction="back" size={34} />
        </button>

        {/* Play / Pause — giant */}
        <button
          onClick={togglePlay}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg"
          style={{ background: accent, boxShadow: `0 0 30px ${accent}55` }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
              <rect x="2" y="1" width="6" height="20" rx="2"/>
              <rect x="14" y="1" width="6" height="20" rx="2"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="white" style={{ marginLeft: 3 }}>
              <path d="M3 1.5l16 9.5-16 9.5z"/>
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => seek(Math.min(duration, currentTime + 15))}
          className="text-white/60 hover:text-white active:scale-95 transition-all"
          aria-label="Skip forward 15 seconds"
        >
          <SkipIcon direction="fwd" size={34} />
        </button>
      </div>

      {/* Speed + Up Next */}
      <div className="px-7 flex-shrink-0">
        {/* Speed row */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-all"
              style={{
                color: speed === s ? accent : "rgba(255,255,255,0.3)",
                background: speed === s ? `${accent}20` : "transparent",
                border: speed === s ? `1px solid ${accent}44` : "1px solid transparent",
              }}
            >
              {s === 1 ? "1×" : `${s}×`}
            </button>
          ))}
        </div>

        {/* Up Next banner in expanded view */}
        {showUpNext && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-3"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="relative flex-shrink-0 w-7 h-7">
              <svg width="28" height="28" viewBox="0 0 28 28" className="absolute inset-0">
                <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle cx="14" cy="14" r="12" fill="none" stroke={accent} strokeWidth="2"
                  strokeDasharray={`${(upNextCountdown / 5) * 75.4} 75.4`}
                  strokeLinecap="round" transform="rotate(-90 14 14)"
                  style={{ transition: "stroke-dasharray 0.9s linear" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold tabular-nums" style={{ color: accent }}>
                {upNextCountdown}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{nextTrack.title}</p>
              <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{nextTrack.speaker}</p>
            </div>
            <button onClick={cancelUpNext}
              className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full hover:bg-white/10 transition-all"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Dismiss player */}
      <div className="flex-1" />
      <div className="px-7 pb-10 flex-shrink-0">
        <button
          onClick={() => { dismiss(); closeExpanded(); }}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/10 active:bg-white/15"
          style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Close Player
        </button>
      </div>
    </div>
  );

  // ── MINI bar (always visible) ─────────────────────────────────────────────
  return (
    <>
      {/* Expanded overlay */}
      {expanded && expandedView}

      <div
        className="fixed bottom-0 inset-x-0 z-50"
        style={{
          background: "rgba(5, 12, 26, 0.97)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Up Next banner (mini) */}
        {showUpNext && !expanded && (
          <div
            className="flex items-center gap-3 px-4 py-2"
            style={{
              background: "rgba(0,32,91,0.55)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative flex-shrink-0 w-6 h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" className="absolute inset-0">
                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle cx="12" cy="12" r="10" fill="none" stroke="#00abc9" strokeWidth="2"
                  strokeDasharray={`${(upNextCountdown / 5) * 62.8} 62.8`}
                  strokeLinecap="round" transform="rotate(-90 12 12)"
                  style={{ transition: "stroke-dasharray 0.9s linear" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums" style={{ color: "var(--accent-text)" }}>
                {upNextCountdown}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white/40 text-[10px]">Up next · </span>
              <span className="text-white/80 text-[10px] font-semibold truncate">{nextTrack.title}</span>
              <span className="text-white/30 text-[10px]"> · {nextTrack.speaker}</span>
            </div>
            <button onClick={cancelUpNext}
              className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}>
              Cancel
            </button>
          </div>
        )}

        {/* Scrubber — mini */}
        <Scrubber
          barRef={barRef}
          displayPct={displayPct}
          bufPct={bufPct}
          onBarClick={miniHandlers.onBarClick}
          onMouseDown={miniHandlers.onMouseDown}
          onTouchStart={miniHandlers.onTouchStart}
          duration={duration}
          currentTime={currentTime}
          accent={accent}
        />
        {/* offset the scrubber overlap */}
        <div style={{ marginBottom: -12 }} />

        {/* Controls row */}
        <div className="flex items-center gap-2 px-3 py-3 sm:px-5 sm:gap-3">

          {/* Track info — tap to expand */}
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left group"
            aria-label="Expand player"
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform group-active:scale-95"
              style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill={accent}>
                <path d="M0 0l10 6-10 6z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-tight truncate group-hover:text-accent-text transition-colors" style={{ letterSpacing: "-0.01em" }}>
                {track.title}
              </p>
              <p className="text-white/35 text-[10px] truncate mt-0.5">{track.speaker}</p>
            </div>
            {/* Expand chevron hint */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0 mr-1">
              <path d="M2 8L6 4l4 4"/>
            </svg>
          </button>

          {/* Time — hidden on smallest */}
          <div className="hidden xs:flex sm:flex items-center gap-1 text-[10px] text-white/35 tabular-nums flex-shrink-0">
            <span>{fmt(currentTime)}</span>
            <span className="text-white/15">/</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Skip back */}
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
            style={{ background: accent }}
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

          {/* Skip forward */}
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
              style={{ color: speed !== 1 ? accent : "rgba(255,255,255,0.4)", background: speed !== 1 ? `${accent}1e` : "transparent", minWidth: 34 }}
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
                    color: speed === s ? accent : "rgba(255,255,255,0.3)",
                    background: speed === s ? `${accent}1e` : "transparent",
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
    </>
  );
}
