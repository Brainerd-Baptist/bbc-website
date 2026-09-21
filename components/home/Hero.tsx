"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";

// ── Cloudflare Stream (same asset as Visit page) ───────────────────
const CF_CUSTOMER = "customer-4oim3t3sdsmhrdq9";
const CF_STREAM   = "c0a6915dae68d8fa78626b273768e44c";
const CF_HLS  = `https://${CF_CUSTOMER}.cloudflarestream.com/${CF_STREAM}/manifest/video.m3u8`;
const CF_MP4  = `https://${CF_CUSTOMER}.cloudflarestream.com/${CF_STREAM}/downloads/default.mp4`;
const CF_POSTER = `https://${CF_CUSTOMER}.cloudflarestream.com/${CF_STREAM}/thumbnails/thumbnail.jpg?width=1920&height=1080&time=4s`;

// ── Time-aware content ─────────────────────────────────────────────

interface HeroContent {
  eyebrow: string;
  headline: React.ReactNode;
  sub: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  showCountdown: boolean;
}

// ── Eastern-time helpers ───────────────────────────────────────────
// Uses Intl.DateTimeFormat with America/New_York so DST is handled
// automatically year-round. Never uses getHours()/getDay() which
// would reflect the visitor's local timezone instead.

function getEasternParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",   // "Sun", "Mon", …
    hour: "numeric",    // 0–23
    minute: "numeric",  // 0–59
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(parts.weekday);
  const hour = parseInt(parts.hour, 10);   // 0–23
  const minute = parseInt(parts.minute, 10);
  return { day, hour, minute };
}

function getHeroContent(): HeroContent {
  const now = new Date();
  const { day, hour, minute } = getEasternParts(now);
  // day: 0=Sun … 6=Sat, hour: 0–23 in Eastern time (ET), DST-aware

  // Sunday morning — service is happening or imminent (7am–1pm ET)
  if (day === 0 && hour >= 7 && hour < 13) {
    const totalMinutes = hour * 60 + minute;
    const minutesUntil830 = (8 * 60 + 30) - totalMinutes;
    const minutesUntil1100 = (11 * 60) - totalMinutes;
    let serviceMsg = "Services at 8:30 and 11:00 this morning.";
    if (minutesUntil830 > 0 && minutesUntil830 <= 90) {
      serviceMsg = `8:30 service starts in ${minutesUntil830} minutes.`;
    } else if (minutesUntil1100 > 0 && minutesUntil1100 <= 90) {
      serviceMsg = `11:00 service starts in ${minutesUntil1100} minutes.`;
    } else if (hour >= 9 && hour < 11) {
      serviceMsg = "Life Groups are meeting right now. Service at 11:00.";
    }
    return {
      eyebrow: "Good morning — we're glad you're here",
      headline: <>We&rsquo;re live<br /><span className="text-accent-text">this morning.</span></>,
      sub: serviceMsg + " 300 Brookfield Ave, Chattanooga.",
      primaryLabel: "Get Directions",
      primaryHref: "https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411",
      secondaryLabel: "What to Expect",
      secondaryHref: "/visit",
      showCountdown: false,
    };
  }

  // Saturday evening — build anticipation (4pm–midnight ET)
  if (day === 6 && hour >= 16) {
    return {
      eyebrow: "See you tomorrow",
      headline: <>Sundays at<br /><span className="text-accent-text">Brainerd Baptist.</span></>,
      sub: "Services at 8:30 AM and 11:00 AM. Life Groups at 9:45. Come as you are.",
      primaryLabel: "Plan Your Visit",
      primaryHref: "/visit",
      secondaryLabel: "Watch Online",
      secondaryHref: "/sermons",
      showCountdown: true,
    };
  }

  // Default — rest of week
  return {
    eyebrow: "Sundays in Chattanooga",
    headline: <>Welcome to<br /><span className="text-accent-text">Brainerd.</span></>,
    sub: "“Our big prayer is that more and more people would experience and enjoy all the grace that God has for them in Jesus Christ.”",
    primaryLabel: "Plan Your Visit",
    primaryHref: "/visit",
    secondaryLabel: "Sermons",
    secondaryHref: "/sermons",
    showCountdown: true,
  };
}

// ── Parallax hook ──────────────────────────────────────────────────

function useParallax(speed = 0.35) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable on mobile — portrait screens don't benefit
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return ref;
}

// ── Component ──────────────────────────────────────────────────────

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const parallaxRef = useParallax(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load video source on desktop only — avoids downloading a large asset on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = CF_HLS; // Safari — native HLS
    }
    video.play().catch(() => {}); // autoplay blocked — poster still shows
  }, []);

  // Hydrate content client-side so SSR doesn't mismatch
  useEffect(() => {
    setContent(getHeroContent());
    // Update every minute in case of boundary crossing
    const id = setInterval(() => setContent(getHeroContent()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Server/first-render fallback
  const c = content ?? {
    eyebrow: "Sundays in Chattanooga",
    headline: <>Welcome to <span className="text-accent-text">Brainerd.</span></>,
    sub: "“Our big prayer is that more and more people would experience and enjoy all the grace that God has for them in Jesus Christ.”",
    primaryLabel: "Plan Your Visit",
    primaryHref: "/visit",
    secondaryLabel: "Sermons",
    secondaryHref: "/sermons",
    showCountdown: true,
  };

  const isSundayMorning = content
    ? (() => {
        const { day, hour } = getEasternParts(new Date());
        return day === 0 && hour >= 7 && hour < 13;
      })()
    : false;

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* ── Parallax background ── */}
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{ top: "-15%", height: "115%", background: "var(--scrim-solid)" }}
      >
        {/* Mobile: static photo — landscape video crops badly on portrait screens */}
        <Image
          src="/photos/hero.jpg"
          alt="Congregation worshiping at Brainerd Baptist Church"
          fill
          className="object-cover md:hidden"
          style={{ objectPosition: "center 40%" }}
          priority
        />

        {/* Desktop: ambient looping video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={CF_POSTER}
        >
          <source src={CF_MP4} type="video/mp4" />
        </video>
      </div>

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "var(--scrim-hero)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p
            className="eyebrow-white mb-4 transition duration-700"
            style={{ opacity: content ? 1 : 0, transform: content ? "none" : "translateY(8px)" }}
          >
            {c.eyebrow}
          </p>

          {/* Headline */}
          <h1
            className="font-condensed font-900 text-white leading-none mb-5 transition duration-700"
            style={{
              fontSize: "clamp(3.2rem, 8vw, 5.5rem)",
              letterSpacing: "-0.01em",
              opacity: content ? 1 : 0,
              transitionDelay: "80ms",
            }}
          >
            {c.headline}
          </h1>

          {/* Supporting text */}
          <p
            className="text-white/70 leading-relaxed mb-8 max-w-lg transition duration-700"
            style={{
              fontFamily: isSundayMorning ? "var(--font-barlow), sans-serif" : "Georgia, serif",
              fontSize: "1.1rem",
              fontStyle: isSundayMorning ? "normal" : "italic",
              opacity: content ? 1 : 0,
              transitionDelay: "160ms",
            }}
          >
            {c.sub}
          </p>

          {/* Service times — show on non-Sunday-morning */}
          {!isSundayMorning && (
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-white/80 text-sm">8:30 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-white/80 text-sm">9:45 AM Life Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-white/80 text-sm">11:00 AM</span>
              </div>
            </div>
          )}

          {/* Countdown */}
          {c.showCountdown && (
            <>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-3">
                Next service in
              </p>
              <Countdown />
            </>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href={c.primaryHref}
              className="btn-primary shadow-lg shadow-accent/25"
              {...(c.primaryHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {c.primaryLabel}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </Link>
            <Link href={c.secondaryHref} className="btn-outline-white">
              {c.secondaryLabel}
            </Link>
          </div>

          {/* Address */}
          <p className="text-white/35 text-xs mt-8 mb-16 tracking-wide">
            300 Brookfield Ave · Chattanooga, TN 37411
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
