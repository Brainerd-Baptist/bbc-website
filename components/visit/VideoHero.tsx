"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const CF_STREAM_ID = "c0a6915dae68d8fa78626b273768e44c";
const CF_CUSTOMER_CODE = "customer-4oim3t3sdsmhrdq9";

// Cloudflare Stream URLs
const HLS_URL = `https://${CF_CUSTOMER_CODE}.cloudflarestream.com/${CF_STREAM_ID}/manifest/video.m3u8`;
const DASH_URL = `https://${CF_CUSTOMER_CODE}.cloudflarestream.com/${CF_STREAM_ID}/manifest/video.mpd`;
const MP4_URL = `https://${CF_CUSTOMER_CODE}.cloudflarestream.com/${CF_STREAM_ID}/downloads/default.mp4`;

export default function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt HLS via native browser support (Safari) or fall back
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari — native HLS
      video.src = HLS_URL;
    } else if (video.canPlayType("application/dash+xml")) {
      // Chromium with DASH support
      video.src = DASH_URL;
    }
    // Otherwise the <source> MP4 fallback in the markup handles it

    video.play().catch(() => {
      // Autoplay blocked — video stays paused, poster still shows
    });
  }, []);

  // Portrait thumbnail — Cloudflare auto-gravity picks a face-friendly frame
  const PORTRAIT_POSTER = `https://${CF_CUSTOMER_CODE}.cloudflarestream.com/${CF_STREAM_ID}/thumbnails/thumbnail.jpg?width=800&height=1200&fit=cover&gravity=auto&time=4s`;
  const LANDSCAPE_POSTER = `https://${CF_CUSTOMER_CODE}.cloudflarestream.com/${CF_STREAM_ID}/thumbnails/thumbnail.jpg?width=1920&height=1080&time=4s`;

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100svh" }}>
      {/* ── Mobile: local photo (Cloudflare thumbnail unavailable until video is uploaded) ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/visit/congregation-hero.jpg"
        alt="Brainerd Baptist Church congregation"
        className="absolute inset-0 w-full h-full object-cover object-center md:hidden"
        aria-hidden="true"
      />

      {/* ── Desktop: video background ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={LANDSCAPE_POSTER}
      >
        {/* MP4 direct download as universal fallback */}
        <source src={MP4_URL} type="video/mp4" />
      </video>

      {/* ── Gradient overlay — dark at bottom, lighter at top ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,16,48,0.45) 0%, rgba(0,16,48,0.30) 40%, rgba(0,16,48,0.80) 75%, rgba(0,16,48,0.96) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-16 md:pb-24">
          <p className="eyebrow-white mb-4">Sundays in Chattanooga</p>

          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            We&apos;d love to{" "}
            <span style={{ color: "var(--gold)" }}>have you.</span>
          </h1>

          <p
            className="text-white/70 leading-relaxed mb-8 max-w-lg"
            style={{ fontSize: "1.05rem" }}
          >
            Here is everything you need to know before you join us Sunday.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#service-times"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors"
              style={{ background: "var(--gold)", color: "#00142a" }}
            >
              Service Times
            </a>
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/40 text-white px-7 py-3 rounded-full hover:border-white/70 transition-colors"
            >
              Let Us Know You&apos;re Coming
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
        <div
          className="w-px bg-white/60"
          style={{
            height: 32,
            animation: "scrollPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 0.8; transform: scaleY(1.2); }
        }
      `}</style>
    </section>
  );
}
