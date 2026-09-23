"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IDENTITY } from "@/lib/identity-colors";

// ── Scroll-reveal editorial narrative ──────────────────────────────
// Each "beat" pairs a fragment of copy with a photo that bleeds off the
// edge of the viewport, running partway behind the text column. As a
// beat scrolls into view its lines fade/slide in and the photo drifts
// in slightly, so it feels like it's sliding out from behind the words
// rather than sitting in a boxed gallery.
//
// The two paragraphs Josiah provided are reproduced here in full,
// split only at natural clause breaks across the beats below — no
// content was cut, just re-paced across the scroll instead of sitting
// in one dense block. (An sr-only copy of the same paragraphs also
// lives on the page for screen readers / search.)
const BEATS = [
  {
    src: "/missions/story/beat-1-road.jpg",
    alt: "Sunset over a rural road",
    side: "right" as const,
    lines: [
      "Brainerd Missions is rooted in the conviction of Scripture —",
      "the picture in Revelation of every nation, tribe, language,",
      "and people gathered before Jesus.",
    ],
  },
  {
    src: "/missions/story/beat-2-rainbow.jpg",
    alt: "Rainbow over ancient ruins",
    side: "left" as const,
    lines: [
      "Because there are still unreached peoples in the world,",
      "we see it as our mission — and our joy —",
      "to take the gospel to the ends of the earth.",
    ],
  },
  {
    src: "/missions/story/beat-3-hongkong.jpg",
    alt: "City skyline from a hillside at dusk",
    side: "right" as const,
    lines: [
      "We do that by sending Brainerd members",
      "on short-term and long-term teams,",
    ],
  },
  {
    src: "/missions/story/beat-4-acropolis.jpg",
    alt: "Ancient ruins lit at night beneath a hillside city",
    side: "left" as const,
    lines: [
      "and by supporting trusted partners in places like",
      "Central & South America, Africa, Asia, and the Middle East —",
      "trusting that God uses these efforts to draw people to Christ.",
    ],
  },
  {
    src: "/missions/story/beat-5-village.jpg",
    alt: "A hillside village at dusk",
    side: "right" as const,
    lines: [
      "At home, we pray and give",
      "in ways that fuel global missions.",
    ],
  },
  {
    src: "/carousel/congregation-standing.jpg",
    alt: "Brainerd Baptist congregation in worship",
    side: "left" as const,
    lines: [
      "We want Brainerd to be a church that equips people to live sent —",
      "whether that's across the street or across the world,",
      "always with a humble dependence on God's guidance and God's strength.",
    ],
  },
];

function Beat({
  beat,
  index,
}: {
  beat: (typeof BEATS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      // Trigger a bit before the beat is centered, and stay lenient
      // near the bottom of the viewport, so the reveal feels tied to
      // the scroll itself rather than popping once mostly on-screen.
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const imageOnLeft = beat.side === "left";
  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      ref={ref}
      className="relative flex items-center py-24 md:py-36 px-6 md:px-0 overflow-hidden"
      style={{ minHeight: "70vh" }}
    >
      {/* Photo — bleeds past the content column toward one edge of the
          viewport, sitting behind the text at the point of overlap. */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 ${
          imageOnLeft ? "left-0" : "right-0"
        }`}
        style={{
          width: "min(62vw, 780px)",
          opacity: visible ? 1 : 0,
          transform: `translateY(-50%) translateX(${
            visible ? "0" : imageOnLeft ? "-24px" : "24px"
          })`,
          transition: `opacity 900ms ${easing}, transform 900ms ${easing}`,
          willChange: "opacity, transform",
        }}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={beat.src}
            alt={beat.alt}
            fill
            sizes="(max-width: 768px) 90vw, 60vw"
            className="object-cover"
            style={{ filter: "brightness(1.12) saturate(1.05)" }}
          />
          {/* Scrim on the side the text overlaps, so the words that
              cross onto the photo stay legible. --scrim-side is defined
              dark-to-light left-to-right; mirror it with scaleX for the
              photos on the left. Dialed down to 55% opacity — legible,
              not a dark filter over the whole photo. */}
          <div
            className="absolute inset-0"
            style={{
              background: "var(--scrim-side)",
              opacity: 0.55,
              transform: imageOnLeft ? "scaleX(-1)" : undefined,
            }}
          />
        </div>
      </div>

      {/* Text column — offset toward the opposite edge so it overlaps
          the tail end of the photo. */}
      <div
        className={`relative z-10 max-w-lg ${
          imageOnLeft ? "ml-auto mr-4 md:mr-24 text-right" : "mr-auto ml-4 md:ml-24"
        }`}
      >
        {beat.lines.map((line, i) => (
          <p
            key={i}
            className="font-condensed font-800 text-fg-on-dark leading-tight"
            style={{
              fontSize: "clamp(1.35rem, 3vw, 2.15rem)",
              letterSpacing: "-0.01em",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 700ms ${easing}, transform 700ms ${easing}`,
              transitionDelay: `${i * 110}ms`,
            }}
          >
            {line}
          </p>
        ))}
        {index === BEATS.length - 1 && (
          <p
            className="mt-6 text-sm font-semibold tracking-widest uppercase"
            style={{
              color: IDENTITY.missions.hue,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 700ms ${easing}, transform 700ms ${easing}`,
              transitionDelay: `${beat.lines.length * 110}ms`,
            }}
          >
            Live sent.
          </p>
        )}
      </div>
    </div>
  );
}

export default function MissionsStory() {
  return (
    <div className="relative" style={{ background: "var(--brand-ink)" }}>
      {BEATS.map((beat, i) => (
        <Beat key={i} beat={beat} index={i} />
      ))}
    </div>
  );
}
