"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAudio } from "@/lib/audio-context";

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function GlobalAudioPlayer() {
  const { track, isPlaying, currentTime, duration, speed, bufferedEnd, togglePlay, seek, setSpeed, dismiss } = useAudio();
  const barRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPct, setDragPct]   = useState(0);

  const pct = duration > 0 ? currentTime / duration : 0;
  const bufPct = duration > 0 ? bufferedEnd / duration : 0;
  const displayPct = dragging ? dragPct : pct;

  function getBarPct(e: React.MouseEvent | React.TouchEvent) {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function onBarClick(e: React.MouseEvent) {
    if (!duration) return;
    seek(getBarPct(e) * duration);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!duration) return;
    setDragging(true);
    setDragPct(getBarPct(e));
  }

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setDragPct(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };
    const onUp = (e: MouseEvent) => {
      if (duration) seek(Math.max(0, Math.min(1, (e.clientX - barRef.current!.getBoundingClientRect().left) / barRef.current!.getBoundingClientRect().width)) * duration);
      setDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, duration, seek]);

  if (!track) return null;

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
      {/* Scrubber bar — full width, sits at very top of player */}
      <div
        ref={barRef}
        className="w-full h-1 cursor-pointer relative group"
        style={{ background: "rgba(255,255,255,0.08)" }}
        onClick={onBarClick}
        onMouseDown={onMouseDown}
      >
        {/* buffered */}
        <div
          className="absolute top-0 left-0 h-full transition-[width] duration-150"
          style={{ width: `${bufPct * 100}%`, background: "rgba(255,255,255,0.12)" }}
        />
        {/* played */}
        <div
          className="absolute top-0 left-0 h-full"
          style={{ width: `${displayPct * 100}%`, background: "#00abc9" }}
        />
        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${displayPct * 100}%`, transform: "translate(-50%, -50%)", background: "#00abc9", boxShadow: "0 0 8px rgba(0,171,201,0.6)" }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-3.5">

        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Accent dot */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white/80"
            style={{ background: `${track.accentColor}22`, border: `1px solid ${track.accentColor}44` }}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill={track.accentColor}>
              <path d="M0 0l10 6-10 6z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <Link href={`/sermons/${track.slug}`} className="block text-white text-xs font-semibold leading-tight truncate hover:text-[#00abc9] transition-colors" style={{ letterSpacing: "-0.01em" }}>
              {track.title}
            </Link>
            <p className="text-white/35 text-[10px] truncate mt-0.5">{track.speaker} · {track.series}</p>
          </div>
        </div>

        {/* Time */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/35 tabular-nums flex-shrink-0">
          <span>{fmt(currentTime)}</span>
          <span>/</span>
          <span>{fmt(duration)}</span>
        </div>

        {/* Skip back 15 */}
        <button onClick={() => seek(Math.max(0, currentTime - 15))} className="hidden md:flex text-white/40 hover:text-white transition-colors" aria-label="Back 15s">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M11 17a5 5 0 1 1 0-10H18"/><path d="M15 3l3 4-4 .5"/><text x="5" y="15" fontSize="6" fill="currentColor" stroke="none">15</text>
          </svg>
        </button>

        {/* Play / pause */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
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

        {/* Skip fwd 15 */}
        <button onClick={() => seek(Math.min(duration, currentTime + 15))} className="hidden md:flex text-white/40 hover:text-white transition-colors" aria-label="Forward 15s">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M13 7a5 5 0 1 1 0 10H6"/><path d="M9 21l-3-4 4-.5"/>
          </svg>
        </button>

        {/* Speed */}
        <div className="hidden sm:flex items-center gap-1">
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

        {/* Close */}
        <button onClick={dismiss} className="text-white/25 hover:text-white/60 transition-colors ml-1 flex-shrink-0" aria-label="Close player">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
