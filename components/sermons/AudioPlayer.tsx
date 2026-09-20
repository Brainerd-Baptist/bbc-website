"use client";
import { useEffect, useRef, useState } from "react";
import { useAudio, type AudioTrack } from "@/lib/audio-context";

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SPEEDS = [1, 1.25, 1.5, 1.75];

interface Props {
  track: AudioTrack;
  accentColor?: string;
  /** "dark" = for dark/navy backgrounds (default). "light" = for white/light backgrounds. */
  theme?: "dark" | "light";
}

export default function AudioPlayer({ track, accentColor = "#00abc9", theme = "dark" }: Props) {
  const light = theme === "light";
  const { track: activeTrack, isPlaying, currentTime, duration, speed, bufferedEnd, loadTrack, togglePlay, seek, setSpeed } = useAudio();
  const barRef   = useRef<HTMLDivElement>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const [dragging, setDragging]   = useState(false);
  const [dragPct, setDragPct]     = useState(0);
  const [resumed, setResumed]     = useState<number | null>(null);
  const [showResume, setShowResume] = useState(false);

  const isActive  = activeTrack?.slug === track.slug;
  const activePlaying = isActive && isPlaying;
  const ct     = isActive ? currentTime : 0;
  const dur    = isActive ? duration : 0;
  const bufEnd = isActive ? bufferedEnd : 0;
  const spd    = isActive ? speed : 1;

  const pct    = dur > 0 ? ct / dur : 0;
  const bufPct = dur > 0 ? bufEnd / dur : 0;
  const displayPct = dragging ? dragPct : pct;

  // Check for saved position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bbc-ap-${track.slug}`);
      if (saved) {
        const t = parseFloat(saved);
        if (t > 30) { setResumed(t); setShowResume(true); }
      }
    } catch {}
  }, [track.slug]);

  function getBarPct(e: React.MouseEvent) {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  function fireEvent(event: "start" | "half" | "complete") {
    const key = `${track.slug}:${event}`;
    if (firedRef.current.has(key)) return;
    firedRef.current.add(key);
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: track.slug, title: track.title, mediaType: "audio", event }),
    }).catch(() => {/* ignore */});
  }

  // Fire half/complete events as time progresses
  useEffect(() => {
    if (!isActive || !dur) return;
    const pctPlayed = ct / dur;
    if (pctPlayed >= 0.5)  fireEvent("half");
    if (pctPlayed >= 0.95) fireEvent("complete");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ct, dur, isActive]);

  function handlePlay() {
    if (!isActive) {
      loadTrack(track);
      fireEvent("start");
      setShowResume(false);
    } else {
      togglePlay();
    }
  }

  function handleBarClick(e: React.MouseEvent) {
    if (!dur) return;
    if (!isActive) { loadTrack(track); return; }
    seek(getBarPct(e) * dur);
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!dur || !isActive) return;
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
      if (dur && isActive && barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * dur);
      }
      setDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, dur, isActive, seek]);

  const bg     = light ? "#f4f6f9"              : "rgba(255,255,255,0.04)";
  const border = light ? "rgba(0,32,91,0.08)"   : "rgba(255,255,255,0.07)";
  const muted  = light ? "rgba(0,32,91,0.35)"   : "rgba(255,255,255,0.35)";
  const dim    = light ? "rgba(0,32,91,0.25)"   : "rgba(255,255,255,0.25)";
  const track_ = light ? "rgba(0,32,91,0.08)"   : "rgba(255,255,255,0.08)";
  const buf    = light ? "rgba(0,32,91,0.12)"   : "rgba(255,255,255,0.14)";
  const strong = light ? "rgba(0,32,91,0.70)"   : "rgba(255,255,255,0.70)";

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {/* Resume banner */}
      {showResume && resumed !== null && !isActive && (
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 text-xs"
          style={{ background: `${accentColor}11`, borderBottom: `1px solid ${border}` }}>
          <span style={{ color: muted }}>Saved position: <span style={{ fontWeight: 600, color: strong }}>{fmt(resumed)}</span></span>
          <div className="flex gap-3">
            <button onClick={() => { loadTrack(track); setShowResume(false); }}
              className="font-semibold transition-colors" style={{ color: accentColor }}>Resume</button>
            <button onClick={() => {
              try { localStorage.removeItem(`bbc-ap-${track.slug}`); } catch {}
              setShowResume(false);
              loadTrack({ ...track });
            }} style={{ color: muted }} className="transition-colors">Start over</button>
          </div>
        </div>
      )}

      <div className="p-5 md:p-6">
        {/* Top: waveform label + time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Animated bars icon */}
            <div className="flex items-end gap-0.5 h-4">
              {[3, 5, 4, 6, 3].map((h, i) => (
                <div key={i} className="w-0.5 rounded-full transition-all duration-150"
                  style={{
                    height: activePlaying ? `${h * (i % 2 === 0 ? 1 : 1.3)}px` : "3px",
                    background: accentColor,
                    opacity: activePlaying ? 0.8 + (i * 0.04) : 0.3,
                    animation: activePlaying ? `eq-bar-${i} 0.8s ease-in-out infinite alternate` : "none",
                    animationDelay: `${i * 0.12}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: muted }}>Audio</span>
          </div>
          <div className="tabular-nums text-xs" style={{ color: muted }}>
            <span style={{ color: strong }}>{fmt(ct)}</span>
            <span className="mx-1">/</span>
            <span>{fmt(dur) !== "0:00" ? fmt(dur) : (track.duration ?? "—")}</span>
          </div>
        </div>

        {/* Scrubber */}
        <div
          ref={barRef}
          className="w-full h-1.5 rounded-full cursor-pointer relative mb-5 group"
          style={{ background: track_ }}
          onClick={handleBarClick}
          onMouseDown={onMouseDown}
        >
          {/* buffered */}
          <div className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-300"
            style={{ width: `${bufPct * 100}%`, background: buf }} />
          {/* played */}
          <div className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${displayPct * 100}%`, background: accentColor }} />
          {/* thumb */}
          <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{ left: `${displayPct * 100}%`, transform: "translate(-50%, -50%)", background: accentColor, boxShadow: `0 0 10px ${accentColor}66` }} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Skip back */}
          <button onClick={() => isActive && seek(Math.max(0, ct - 15))}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors"
            style={{ color: dim }}
            aria-label="Back 15 seconds">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9.5 3A8.5 8.5 0 1 0 18 9.5"/><path d="M9.5 3L7 6l3.5.5"/>
            </svg>
            <span className="text-[9px] font-semibold">15</span>
          </button>

          {/* Play / Pause - center large */}
          <button
            onClick={handlePlay}
            className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg flex-shrink-0"
            style={{ background: accentColor, boxShadow: `0 4px 24px ${accentColor}44` }}
            aria-label={activePlaying ? "Pause" : "Play"}
          >
            {activePlaying ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                <rect x="2" y="1" width="5" height="16" rx="2"/>
                <rect x="11" y="1" width="5" height="16" rx="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white" style={{ marginLeft: 3 }}>
                <path d="M3 1.5l13 7.5-13 7.5z"/>
              </svg>
            )}
          </button>

          {/* Skip fwd */}
          <button onClick={() => isActive && seek(Math.min(dur, ct + 15))}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors"
            style={{ color: dim }}
            aria-label="Forward 15 seconds">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M14.5 3A8.5 8.5 0 1 1 6 9.5"/><path d="M14.5 3L17 6l-3.5.5"/>
            </svg>
            <span className="text-[9px] font-semibold">15</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Speed */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => isActive && setSpeed(s)}
                className="text-[10px] font-bold px-1.5 py-1 rounded-lg transition-all"
                style={{
                  color: (isActive ? spd : 1) === s ? accentColor : dim,
                  background: (isActive ? spd : 1) === s ? `${accentColor}18` : "transparent",
                }}
              >
                {s === 1 ? "1×" : `${s}×`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes eq-bar-0 { from { height: 3px } to { height: 8px } }
        @keyframes eq-bar-1 { from { height: 3px } to { height: 12px } }
        @keyframes eq-bar-2 { from { height: 3px } to { height: 9px } }
        @keyframes eq-bar-3 { from { height: 3px } to { height: 14px } }
        @keyframes eq-bar-4 { from { height: 3px } to { height: 7px } }
      `}</style>
    </div>
  );
}
