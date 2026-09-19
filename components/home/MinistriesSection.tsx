"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// ── Photo cards (real church photos) ──────────────────────────────
const PHOTO_CARDS = [
  {
    key: "kids",
    label: "Brainerd Kids",
    sub: "Nursery · Preschool · K–5th",
    href: "/ministries/kids",
    photo: "/ministries/kids.jpg",
    span: "lg:col-span-2",
  },
  {
    key: "nursery",
    label: "Little Ones",
    sub: "Nursery & Preschool",
    href: "/ministries/kids",
    photo: "/ministries/nursery.jpg",
    span: "lg:col-span-1",
  },
];

// ── Gradient cards (ministries without dedicated photos yet) ───────
const GRADIENT_CARDS = [
  {
    key: "students",
    label: "Students",
    sub: "Middle & High School",
    href: "/ministries/students",
    bg: "linear-gradient(135deg, #00205B 0%, #001540 100%)",
    accent: "#00abc9",
  },
  {
    key: "lifegroups",
    label: "Life Groups",
    sub: "Every age · All week",
    href: "/life-groups",
    bg: "linear-gradient(135deg, #003f6b 0%, #00205B 100%)",
    accent: "#00abc9",
  },
  {
    key: "missions",
    label: "Missions",
    sub: "Local & Global",
    href: "/ministries/missions",
    bg: "linear-gradient(135deg, #00142a 0%, #00205B 100%)",
    accent: "#00abc9",
  },
];

export default function MinistriesSection() {
  return (
    <section className="bg-[#00142a] py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p
                className="font-condensed font-700 tracking-widest uppercase text-xs mb-3"
                style={{ color: "#00abc9" }}
              >
                Get Involved
              </p>
              <h2
                className="font-condensed font-900 text-white"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.2rem)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1,
                }}
              >
                There&apos;s a place{" "}
                <span style={{ color: "#00abc9" }}>for everyone.</span>
              </h2>
            </div>
            <Link
              href="/ministries"
              className="font-condensed font-700 tracking-wide uppercase text-xs px-5 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-[#00abc9]/60 hover:text-[#00abc9] transition-all shrink-0"
            >
              All Ministries →
            </Link>
          </div>
        </ScrollReveal>

        {/* ── Photo cards (top row) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {PHOTO_CARDS.map((card, i) => (
            <ScrollReveal key={card.key} delay={i * 80} className={card.span}>
              <Link href={card.href} className="group block relative overflow-hidden rounded-2xl"
                style={{ minHeight: "340px" }}>
                <Image
                  src={card.photo}
                  alt={card.label}
                  fill
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 66vw, 800px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,20,42,0.88) 0%, rgba(0,20,42,0.30) 50%, transparent 100%)",
                  }}
                />
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p
                    className="font-condensed font-900 text-white mb-1 leading-tight"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
                  >
                    {card.label}
                  </p>
                  <p className="text-white/55 text-sm font-medium tracking-wide">{card.sub}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[#00abc9] text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Gradient cards (bottom row) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GRADIENT_CARDS.map((card, i) => (
            <ScrollReveal key={card.key} delay={160 + i * 60}>
              <Link
                href={card.href}
                className="group block relative rounded-2xl overflow-hidden p-7 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: card.bg, minHeight: "190px" }}
              >
                {/* Subtle teal glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(0,171,201,0.3)" }}
                />

                {/* Large faint number */}
                <span
                  className="absolute bottom-4 right-5 font-condensed font-900 select-none pointer-events-none"
                  style={{
                    fontSize: "5rem",
                    lineHeight: 1,
                    color: "rgba(0,171,201,0.07)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <p
                  className="font-condensed font-900 text-white mb-1 leading-tight relative"
                  style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}
                >
                  {card.label}
                </p>
                <p className="text-white/45 text-sm mb-5 relative">{card.sub}</p>

                <div
                  className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase relative"
                  style={{ color: card.accent }}
                >
                  Learn more
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                    className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3"/>
                  </svg>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
