"use client";
import {
  createContext, useContext, useRef, useState,
  useCallback, useEffect, type ReactNode,
} from "react";

export interface AudioTrack {
  title: string;
  speaker: string;
  series: string;
  audioUrl: string;
  youtubeId?: string;
  slug: string;
  accentColor: string;
  duration?: string;
}

interface AudioCtx {
  track: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  bufferedEnd: number;
  // Autoplay next
  nextTrack: AudioTrack | null;
  upNextCountdown: number;
  // Actions
  loadTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  seek: (t: number) => void;
  setSpeed: (s: number) => void;
  dismiss: () => void;
  setNextTrack: (t: AudioTrack | null) => void;
  cancelUpNext: () => void;
}

const AudioContext = createContext<AudioCtx | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be inside AudioProvider");
  return ctx;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const nextTrackRef    = useRef<AudioTrack | null>(null);
  const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const [track, setTrack]               = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [speed, setSpeedState]          = useState(1);
  const [bufferedEnd, setBufferedEnd]   = useState(0);
  const [nextTrack, setNextTrackState]  = useState<AudioTrack | null>(null);
  const [upNextCountdown, setUpNextCountdown] = useState(0);

  const skey = (slug: string) => `bbc-ap-${slug}`;

  // ── loadTrack (stable ref — defined before useEffect that needs it) ──────────
  const loadTrack = useCallback((t: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    // Cancel any in-flight up-next countdown
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setUpNextCountdown(0);
    setTrack(t);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    audio.src = t.audioUrl;
    audio.load();
    let seekTo = 0;
    try {
      const saved = localStorage.getItem(skey(t.slug));
      if (saved) seekTo = parseFloat(saved);
    } catch {}
    const onCanPlay = () => {
      if (seekTo > 5) audio.currentTime = seekTo;
      audio.play().catch(() => {});
      audio.removeEventListener("canplay", onCanPlay);
    };
    audio.addEventListener("canplay", onCanPlay);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (track && audio.currentTime > 5) {
        try { localStorage.setItem(skey(track.slug), String(audio.currentTime)); } catch {}
      }
      if (audio.buffered.length > 0) setBufferedEnd(audio.buffered.end(audio.buffered.length - 1));
    };
    const onDur   = () => setDuration(isNaN(audio.duration) ? 0 : audio.duration);
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (track) { try { localStorage.removeItem(skey(track.slug)); } catch {} }
      // ── Autoplay next countdown ─────────────────────────────────────────────
      const nt = nextTrackRef.current;
      if (nt) {
        let count = 5;
        setUpNextCountdown(count);
        countdownRef.current = setInterval(() => {
          count -= 1;
          setUpNextCountdown(count);
          if (count <= 0) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = null;
            setUpNextCountdown(0);
            const next = nextTrackRef.current;
            if (next) loadTrack(next);
          }
        }, 1000);
      }
    };

    audio.addEventListener("timeupdate",     onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("play",           onPlay);
    audio.addEventListener("pause",          onPause);
    audio.addEventListener("ended",          onEnded);
    return () => {
      audio.removeEventListener("timeupdate",     onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("play",           onPlay);
      audio.removeEventListener("pause",          onPause);
      audio.removeEventListener("ended",          onEnded);
    };
  }, [track, loadTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  }, [track]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = t;
  }, []);

  const setSpeed = useCallback((s: number) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = s;
    setSpeedState(s);
  }, []);

  const dismiss = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ""; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setUpNextCountdown(0);
  }, []);

  const setNextTrack = useCallback((t: AudioTrack | null) => {
    nextTrackRef.current = t;
    setNextTrackState(t);
  }, []);

  const cancelUpNext = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setUpNextCountdown(0);
  }, []);

  return (
    <AudioContext.Provider value={{
      track, isPlaying, currentTime, duration, speed, bufferedEnd,
      nextTrack, upNextCountdown,
      loadTrack, togglePlay, seek, setSpeed, dismiss,
      setNextTrack, cancelUpNext,
    }}>
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
      {children}
    </AudioContext.Provider>
  );
}
