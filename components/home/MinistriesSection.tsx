"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// ── All ministry photo cards ───────────────────────────────────────
const ROW_ONE = [
  {
    key: "nursery",
    label: "Little Ones",
    sub: "Birth – Preschool",
    href: "/ministries/kids",
    photo: "/ministries/nursery.jpg",
  },
  {
    key: "kids",
    label: "Brainerd Kids",
    sub: "Elementary · K–5th",
    href: "/ministries/kids",
    photo: "/ministries/kids.jpg",
  },
  {
    key: "students",
    label: "Students",
    sub: "Middle & High School",
    href: "/ministries/students",
    photo: "/ministries/students.jpg",
  },
];

const ROW_TWO = [
  {
    key: "college",
    label: "College & Young Adults",
    sub: "18 – 30s",
    href: "/ministries/college",
    photo: "/ministries/college.jpg",
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

function PhotoCard({
  card,
  delay,
  tall = false,
}: {
  card: (typeof ROW_ONE)[0];
  delay: number;
  tall?: boolean;
}) {
  return (
    <ScrollReveal delay={delay}>
      <Link
        href={card.href}
        className="group block relative overflow-hidden rounded-2xl"
        style={{ minHeight: tall ? "300px" : "240px" }}
      >
        <Image
          src={card.photo}
          alt={card.label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,20,42,0.92) 0%, rgba(0,20,42,0.42) 55%, rgba(0,20,42,0.10) 100%)",
          }}
        />
        {/* Hover ring */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1.5px rgba(0,171,201,0.5)" }}
        />
        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p
            className="font-condensed font-900 text-white mb-0.5 leading-tight"
            style={{ fontSize: "1.35rem", letterSpacing: "-0.02em" }}
          >
            {card.label}
          </p>
          <p className="text-white/50 text-sm font-medium tracking-wide mb-3">
            {card.sub}
          </p>
          <div className="flex items-center gap-1.5 text-[#00abc9] text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Learn more
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M2.5 6h7M6.5 3l3 3-3 3" />
            </svg>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

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

        {/* ── Congregation strip ── */}
        <ScrollReveal>
          <Link
            href="/visit"
            className="group block relative overflow-hidden rounded-2xl mb-4"
            style={{ minHeight: "280px" }}
          >
            <Image
              src="/visit/congregation-hero.jpg"
              alt="Brainerd Baptist congregation in worship"
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
            {/* Subtle vignette — let the photo breathe */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,20,42,0.75) 0%, rgba(0,20,42,0.10) 60%, transparent 100%)",
              }}
            />
            {/* Hover ring */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 1.5px rgba(0,171,201,0.45)" }}
            />
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
              <div>
                <p
                  className="font-condensed font-900 text-white leading-tight"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.02em" }}
                >
                  One church.{" "}
                  <span style={{ color: "#00abc9" }}>Every generation.</span>
                </p>
                <p className="text-white/50 text-sm mt-1">
                  From nursery to seniors — all worshipping together on Sunday.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[#00abc9] text-xs font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 ml-6">
                Plan a visit
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                </svg>
              </div>
            </div>
          </Link>
        </ScrollReveal>

        {/* ── Row 1: youngest → teen ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {ROW_ONE.map((card, i) => (
            <PhotoCard key={card.key} card={card} delay={80 + i * 60} tall />
          ))}
        </div>

        {/* ── Row 2: college → missions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ROW_TWO.map((card, i) => (
            <PhotoCard key={card.key} card={card} delay={260 + i * 60} />
          ))}
        </div>

      </div>
    </section>
  );
}
