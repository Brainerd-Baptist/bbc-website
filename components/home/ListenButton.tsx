"use client";

import { useAudio, type AudioTrack } from "@/lib/audio-context";

interface Props {
  track: AudioTrack;
  className?: string;
}

/**
 * Homepage "Listen" button — loads straight into the same global drawer
 * player used on /sermons/[slug] (mounted once in ConditionalLayout), rather
 * than opening the raw MP3 in a new tab. Clicking it starts playback and
 * reveals the mini player bar at the bottom of the screen; the visitor stays
 * on whatever page they're on.
 */
export default function ListenButton({ track, className }: Props) {
  const { loadTrack } = useAudio();

  return (
    <button
      type="button"
      onClick={() => loadTrack(track)}
      className={className}
      aria-label={`Listen to ${track.title}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
      Listen
    </button>
  );
}
