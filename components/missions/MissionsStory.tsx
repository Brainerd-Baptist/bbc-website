"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IDENTITY } from "@/lib/identity-colors";

// ── Scroll-reveal editorial narrative ──────────────────────────────
// Each "beat" pairs one short line of copy with one photo that bleeds
// off the edge of the viewport, running partway behind the text
// column. As a beat scrolls into view its line fades/slides in and
// the photo drifts in slightly slower than the page (a soft parallax),
// so the image feels like it's sliding out from behind the words
// rather than sitting in a boxed gallery. The two paragraphs of copy
// Josiah provided are broken apart into these fragments; the copy
// itself is unchanged, just re-paced across the scroll instead of
// sitting in one dense block.
const BEATS = [
  {
    src: "/missions/story/beat-1-road.jpg",
    alt: "Sunset over a rural road",
    side: "right" as const,
    lines: [
      "Every nation.",
      "Every tribe.",
      "Every language.",
      "Every people — gathered before Jesus.",
    ],
  },
  {
    src: "/missions/story/beat-2-rainbow.jpg",
    alt: "Rainbow over ancient ruins",
    side: "left" as const,
    lines: [
      "There are still unreached peoples in the world.",
      "We see it as our mission — and our joy —",
      "to take the gospel to the ends of the earth.",
    ],
  },
  {
    src: "/missions/story/beat-3-hongkong.jpg",
    alt: "City skyline from a hillside at dusk",
    side: "right" as const,
    lines: [
      "We send Brainerd members",
      "on short-term and long-term teams,",
    ],
  },
  {
    src: "/missions/story/beat-4-acropolis.jpg",
    alt: "Ancient ruins lit at night beneath a hillside city",
    side: "left" as const,
    lines: [
      "and support trusted partners in",
      "Central & South America, Africa,",
      "Asia, and the Middle East —",
      "trusting God to draw people to Christ.",
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
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const imageOnLeft = beat.side === "left";

  return (
    <div
      ref={ref}
      className="relative flex items-center py-24 md:py-36 px-6 md:px-0 overflow-hidden"
      style={{ minHeight: "70vh" }}
    >
      {/* Photo — bleeds past the content column toward one edge of the
          viewport, sitting behind the text at the point of overlap. */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-[1400ms] ease-out ${
          visible ? "opacity-100" : "opacity-0"
        } ${imageOnLeft ? "left-0" : "right-0"}`}
        style={{
          width: "min(62vw, 780px)",
          transform: `translateY(-50%) translateX(${
            visible ? "0" : imageOnLeft ? "-40px" : "40px"
          })`,
        }}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={beat.src}
            alt={beat.alt}
            fill
            sizes="(max-width: 768px) 90vw, 60vw"
            className="object-cover"
          />
          {/* Scrim on the side the text overlaps, so the words that
              cross onto the photo stay legible. --scrim-side is defined
              dark-to-light left-to-right; mirror it with scaleX for the
              photos on the left, so the dark end always sits under the
              text regardless of which edge the photo bleeds toward. */}
          <div
            className="absolute inset-0"
            style={{
              background: "var(--scrim-side)",
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
            className="font-condensed font-800 text-fg-on-dark leading-tight transition-all duration-700 ease-out"
            style={{
              fontSize: "clamp(1.5rem, 3.4vw, 2.4rem)",
              letterSpacing: "-0.01em",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transitionDelay: `${150 + i * 140}ms`,
            }}
          >
            {line}
          </p>
        ))}
        {index === BEATS.length - 1 && (
          <p
            className="mt-6 text-sm font-semibold tracking-widest uppercase transition-all duration-700 ease-out"
            style={{
              color: IDENTITY.missions.hue,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transitionDelay: `${150 + beat.lines.length * 140}ms`,
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
    <div
      className="relative"
      style={{ background: "var(--brand-ink)" }}
    >
      {BEATS.map((beat, i) => (
        <Beat key={i} beat={beat} index={i} />
      ))}
    </div>
  );
}
