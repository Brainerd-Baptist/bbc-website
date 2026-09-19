"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// ── All ministry photo cards ───────────────────────────────────────
const TOP_CARDS = [
  {
    key: "nursery",
    label: "Little Ones",
    sub: "Birth – Preschool",
    href: "/ministries/kids",
    photo: "/ministries/nursery.jpg",
    span: "lg:col-span-1",
  },
  {
    key: "kids",
    label: "Brainerd Kids",
    sub: "Elementary · K–5th",
    href: "/ministries/kids",
    photo: "/ministries/kids.jpg",
    span: "lg:col-span-2",
  },
];

const BOTTOM_CARDS = [
  {
    key: "students",
    label: "Students",
    sub: "Middle & High School",
    href: "/ministries/students",
    photo: "/ministries/students.jpg",
  },
  {
    key: "lifegroups",
    label: "Life Groups",
    sub: "Every age · All week",
    href: "/life-groups",
    photo: "/ministries/life-groups.jpg",
  },
  {
    key: "missions",
    label: "Missions",
    sub: "Local & Global",
    href: "/ministries/missions",
    photo: "/ministries/missions.jpg",
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

        {/* ── Top row photo cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {TOP_CARDS.map((card, i) => (
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
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,20,42,0.88) 0%, rgba(0,20,42,0.30) 50%, transparent 100%)",
                  }}
                />
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

        {/* ── Bottom row photo cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BOTTOM_CARDS.map((card, i) => (
            <ScrollReveal key={card.key} delay={160 + i * 60}>
              <Link href={card.href} className="group block relative overflow-hidden rounded-2xl"
                style={{ minHeight: "220px" }}>
                <Image
                  src={card.photo}
                  alt={card.label}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Stronger gradient for smaller cards */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,20,42,0.92) 0%, rgba(0,20,42,0.45) 55%, rgba(0,20,42,0.15) 100%)",
                  }}
                />
                {/* Hover ring */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 0 1.5px rgba(0,171,201,0.45)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p
                    className="font-condensed font-900 text-white mb-0.5 leading-tight"
                    style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
                  >
                    {card.label}
                  </p>
                  <p className="text-white/50 text-sm font-medium tracking-wide mb-3">{card.sub}</p>
                  <div className="flex items-center gap-1.5 text-[#00abc9] text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                      className="transition-transform duration-200 group-hover:translate-x-0.5">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
}
