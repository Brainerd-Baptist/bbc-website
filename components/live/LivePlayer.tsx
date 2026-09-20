"use client";

/**
 * LivePlayer — client component for the /live page.
 *
 * Determines the current service state based on Eastern Time and
 * renders the appropriate UI:
 *
 *  "pre"    — within PRE_MINUTES before a service (Starting soon…)
 *  "live"   — during a service window
 *  "post"   — within POST_MINUTES after a service ends (Replay loading…)
 *  "off"    — all other times (normal off-hours view)
 *
 * Service schedule (ET):
 *   Sunday 8:30–9:45 AM   (Choir & Orchestra)
 *   Sunday 11:00 AM–12:15 PM  (Band-Led)
 */

import { useState, useEffect, useRef } from "react";
import type { SermonData } from "@/lib/sermon";
import { YOUTUBE_CHANNEL_ID } from "@/lib/sermon";
import { formatSermonDate } from "@/lib/sermon";

// ── Service schedule ──────────────────────────────────────────────────────────

type ServiceWindow = {
  label: string;
  startH: number; startM: number;
  endH: number;   endM: number;
};

const SERVICES: ServiceWindow[] = [
  { label: "8:30 AM Service",   startH: 8,  startM: 30, endH: 9,  endM: 45 },
  { label: "11:00 AM Service",  startH: 11, startM: 0,  endH: 12, endM: 15 },
];

const PRE_MINUTES  = 20; // show "Starting soon" banner X min before
const POST_MINUTES = 45; // show "Watch replay" nudge X min after

type LiveState = "pre" | "live" | "post" | "off";

interface StateInfo {
  state:       LiveState;
  service:     ServiceWindow | null;
  minutesUntil: number; // for "pre" state countdown
}

function getEasternState(now: Date): StateInfo {
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et    = new Date(etStr);
  const dow   = et.getDay();   // 0 = Sunday
  const h     = et.getHours();
  const m     = et.getMinutes();
  const totalMinutes = h * 60 + m;

  // Only active on Sundays
  if (dow !== 0) return { state: "off", service: null, minutesUntil: 0 };

  for (const svc of SERVICES) {
    const startMin = svc.startH * 60 + svc.startM;
    const endMin   = svc.endH   * 60 + svc.endM;

    if (totalMinutes >= startMin && totalMinutes < endMin) {
      return { state: "live", service: svc, minutesUntil: 0 };
    }
    if (totalMinutes >= startMin - PRE_MINUTES && totalMinutes < startMin) {
      return { state: "pre",  service: svc, minutesUntil: startMin - totalMinutes };
    }
    if (totalMinutes >= endMin && totalMinutes < endMin + POST_MINUTES) {
      return { state: "post", service: svc, minutesUntil: 0 };
    }
  }

  return { state: "off", service: null, minutesUntil: 0 };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  sermon: SermonData;
}

export default function LivePlayer({ sermon }: Props) {
  const [mounted, setMounted]   = useState(false);
  const [info, setInfo]         = useState<StateInfo>({ state: "off", service: null, minutesUntil: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    setInfo(getEasternState(new Date()));

    intervalRef.current = setInterval(() => {
      setInfo(getEasternState(new Date()));
    }, 30_000); // re-evaluate every 30 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // SSR-safe placeholder — matches the off-hours layout to avoid hydration mismatch
  if (!mounted) {
    return <OffHours sermon={sermon} />;
  }

  const { state, service, minutesUntil } = info;

  if (state === "live" || state === "pre") {
    return <LiveEmbed sermon={sermon} state={state} service={service} minutesUntil={minutesUntil} />;
  }
  if (state === "post") {
    return <PostService sermon={sermon} service={service} />;
  }
  return <OffHours sermon={sermon} />;
}

// ── Live / Pre-service embed ──────────────────────────────────────────────────

function LiveEmbed({
  sermon,
  state,
  service,
  minutesUntil,
}: {
  sermon: SermonData;
  state: "live" | "pre";
  service: ServiceWindow | null;
  minutesUntil: number;
}) {
  const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="min-h-screen bg-[#0d1525] text-white flex flex-col">
      {/* Status bar */}
      <div className={`flex items-center justify-center gap-3 py-3 text-sm font-semibold tracking-wide ${
        state === "live" ? "bg-[#00abc9]" : "bg-[#00205B]"
      }`}>
        {state === "live" ? (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            WE&apos;RE LIVE — {service?.label}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#00abc9]" />
            {service?.label} STARTS IN {minutesUntil} MINUTE{minutesUntil !== 1 ? "S" : ""}
          </>
        )}
      </div>

      {/* YouTube embed — fills the viewport */}
      <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 140px)" }}>
        <iframe
          key={state} // remount if state changes
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Brainerd Baptist Live Stream"
        />
      </div>

      {/* Below-fold actions */}
      <div className="flex-1 bg-[#0d1525] py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          {/* Sermon info */}
          <div className="flex-1 text-center md:text-left">
            {sermon.passage && (
              <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-2">
                {sermon.passage}
              </p>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{sermon.title}</h2>
            <p className="text-sm text-[#6b7f9e]">{formatSermonDate(sermon.date)} · Curtis Hill</p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href="https://brainerdbaptist.org/give"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm text-center"
            >
              Give
            </a>
            <a
              href="/connect"
              className="btn-outline-white text-sm text-center"
            >
              Prayer Request
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post-service: replay nudge ────────────────────────────────────────────────

function PostService({
  sermon,
  service,
}: {
  sermon: SermonData;
  service: ServiceWindow | null;
}) {
  return (
    <div className="min-h-screen bg-[#0d1525] text-white flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center gap-2 text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Service just ended — {service?.label}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          The replay will be up soon
        </h1>
        <p className="text-[#6b7f9e] mb-8 leading-relaxed">
          Thanks for worshipping with us today. The full service recording
          typically appears on YouTube within a few minutes.
        </p>
        {sermon.youtubeId && (
          <a
            href={sermon.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Watch on YouTube
          </a>
        )}
        <a
          href="/sermons"
          className="inline-block mt-3 text-sm font-semibold text-[#00abc9] hover:text-white transition-colors"
        >
          Edited sermon uploads available Monday–Tuesday →
        </a>
      </div>
    </div>
  );
}

// ── Off-hours: latest sermon + service times ──────────────────────────────────

function OffHours({ sermon }: { sermon: SermonData }) {
  const date = formatSermonDate(sermon.date);

  return (
    <div className="min-h-screen bg-[#0d1525] text-white">
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0,33,91,0.6) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6b7f9e]" />
            Live Sundays 8:30 &amp; 11:00 AM ET
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Watch Brainerd<br className="hidden sm:block" /> Baptist Live
          </h1>
          <p className="text-[#6b7f9e] text-lg mb-10 leading-relaxed">
            Join us in person or online every Sunday morning.<br className="hidden sm:block" />
            Service recordings are available shortly after each service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={sermon.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch Latest Sermon
            </a>
            <a
              href="/plan-your-visit"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#00abc9] hover:text-white transition-colors"
            >
              Plan a Visit
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Latest sermon card */}
      {sermon.youtubeId && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-5 text-center">
            Most Recent Sermon
          </p>

          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-xl shadow-black/40 bg-[#162030]">
            <div className="grid md:grid-cols-5">
              {/* Thumbnail */}
              <div className="md:col-span-2 relative min-h-[220px] bg-[#00205B] flex items-center justify-center">
                {sermon.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sermon.thumbnail}
                    alt={sermon.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-[#00205B]/50" />
                <a
                  href={sermon.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10"
                  aria-label={`Watch ${sermon.title}`}
                >
                  <div className="w-14 h-14 rounded-full bg-[#00abc9] hover:bg-[#0090a8] flex items-center justify-center transition-all shadow-lg hover:scale-105">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </a>
              </div>

              {/* Info */}
              <div className="md:col-span-3 p-7 md:p-9 flex flex-col justify-center">
                {sermon.passage && (
                  <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-2">
                    {sermon.passage}
                  </p>
                )}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                  {sermon.title}
                </h3>
                <p className="text-sm text-[#6b7f9e] mb-6">
                  {date} · Curtis Hill
                </p>
                <a
                  href={sermon.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm inline-block self-start"
                >
                  Watch Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service times grid */}
      <div className="border-t border-white/5 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6b7f9e] mb-8 text-center">
            Sunday Services — Join Us In Person
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                time: "8:30 AM",
                style: "Choir & Orchestra",
                note: "Traditional format",
              },
              {
                time: "11:00 AM",
                style: "Band-Led Worship",
                note: "Contemporary format",
              },
            ].map((svc) => (
              <div
                key={svc.time}
                className="rounded-xl border border-white/8 bg-white/4 p-6 flex flex-col gap-1"
              >
                <span className="text-2xl font-bold text-white">{svc.time}</span>
                <span className="text-[#00abc9] text-sm font-semibold">{svc.style}</span>
                <span className="text-[#6b7f9e] text-xs">{svc.note}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/plan-your-visit"
              className="text-sm font-semibold text-[#00abc9] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              Get directions &amp; parking info
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
