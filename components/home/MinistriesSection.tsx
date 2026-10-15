"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

// ── All ministry photo cards ───────────────────────────────────────
const ROW_ONE = [
  {
    key: "nursery",
    label: "Little Ones",
    sub: "Nursery care during both services",
    href: "/ministries/kids",
    photo: "/ministries/nursery.jpg",
  },
  {
    key: "kids",
    label: "Elementary",
    sub: "Kindergarten – 5th Grade · Sundays and Midweek",
    href: "/ministries/kids",
    photo: "/ministries/kids.jpg",
  },
  {
    key: "students",
    label: "Students",
    sub: "Middle & high school — Sundays and midweek",
    href: "/ministries/students",
    photo: "/ministries/students.jpg",
  },
];

const ROW_TWO = [
  {
    key: "college",
    label: "College & Young Adults",
    sub: "Community for the 18–30 crowd",
    href: "/ministries/college",
    photo: "/ministries/college.jpg",
  },
  {
    key: "adults",
    label: "Adults",
    sub: "Wherever you are in life, there's a place for you",
    href: "/ministries#adults",
    photo: "/ministries/life-groups.jpg",
  },
];

function PhotoCard({
  card,
  delay,
}: {
  card: (typeof ROW_ONE)[0];
  delay: number;
  tall?: boolean;
}) {
  return (
    <ScrollReveal delay={delay}>
      <Link href={card.href} className="group block overflow-hidden rounded-xl bg-surface-sunken">
        <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
          <Image
            src={card.photo}
            alt={card.label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="px-5 py-4">
          <p className="font-condensed font-900 text-fg leading-tight" style={{ fontSize: "1.25rem" }}>
            {card.label}
          </p>
          <p className="text-fg-muted text-sm mt-0.5">{card.sub}</p>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export default function MinistriesSection() {
  return (
    <section
      className="py-24 px-6"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <ScrollReveal>
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-condensed font-900 text-fg uppercase" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", letterSpacing: "-0.01em" }}>
              Ministries
            </h2>
            <Link
              href="/ministries"
              className="font-condensed font-700 tracking-wide uppercase text-xs px-5 py-2.5 rounded-full border border-border-strong text-fg hover:bg-surface-sunken transition shrink-0"
            >
              All Ministries →
            </Link>
          </div>
        </ScrollReveal>

        {/* ── Congregation strip ── */}
        <ScrollReveal>
          <div className="overflow-hidden rounded-xl mb-4 bg-surface-sunken">
            <div className="relative" style={{ minHeight: "320px" }}>
              <Image
                src="/carousel/congregation-standing.jpg"
                alt="Brainerd Baptist congregation in worship"
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                className="object-cover object-center"
                priority
              />
            </div>
            <p className="px-5 py-4 text-fg-muted text-sm">
              The gathering of saints each Sunday. No matter your stage of life, we gather together to worship.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Row 1: youngest → teen ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {ROW_ONE.map((card, i) => (
            <PhotoCard key={card.key} card={card} delay={80 + i * 60} tall />
          ))}
        </div>

        {/* ── Row 2: college → adults ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROW_TWO.map((card, i) => (
            <PhotoCard key={card.key} card={card} delay={260 + i * 60} />
          ))}
        </div>

      </div>
    </section>
  );
}
