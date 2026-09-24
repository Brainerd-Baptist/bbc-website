import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "The BX — Brainerd Crossroads Community Center",
  description:
    "A photo journal of a real week at the BX — pickleball courts, a strength floor, and a chair fitness class full of regulars.",
};

/* ═══════════════════════════════════════════════════════════════════════
   MOCKUP — "photo journal" direction for /bx, built as its own route
   (app/bx-journal) so the live /bx page is untouched for comparison.
   Not linked from nav. Local only, per standing "mock up here, don't push
   to git" instruction — nothing here is committed.

   Deliberately NOT the hero → grid → card template every other page on
   this site uses. See project doc
   claude/bx-page-photo-and-design-concept-2026-09-24.md for the reasoning.
   ═══════════════════════════════════════════════════════════════════════ */

export default function BXJournalPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Opening: two photos pinned together, not one hero banner ──── */}
      <div className="pt-28 pb-16 px-6" style={{ background: "var(--brand-band)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-4" style={{ color: "var(--accent-text)" }}>
            Brainerd Crossroads
          </p>
          <h1 className="text-white mb-8 h-display">
            A week at the <span style={{ color: "var(--accent-text)" }}>BX.</span>
          </h1>

          {/* Two photos, offset, like they're pinned to a board rather than
              one full-bleed banner. This is the first visual signal that
              this page isn't the standard template. */}
          <div className="relative mt-4 mb-2">
            <div
              className="relative rounded-lg overflow-hidden shadow-2xl"
              style={{
                width: "78%",
                aspectRatio: "3/2",
                transform: "rotate(-0.6deg)",
              }}
            >
              <Image
                src="/bx/pickleball-court-1.jpg"
                alt="Members playing pickleball on the BX courts"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div
              className="absolute rounded-lg overflow-hidden shadow-2xl border-4 hidden sm:block"
              style={{
                borderColor: "var(--surface)",
                width: "34%",
                aspectRatio: "4/5",
                right: 0,
                bottom: "-14%",
                transform: "rotate(1.4deg)",
              }}
            >
              <Image
                src="/bx/weight-rack.jpg"
                alt="Free weight rack on the BX fitness floor"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Intro copy — direct, not brochure copy ─────────────────────── */}
      <section className="pt-24 pb-16 px-6 bg-surface">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-fg text-xl leading-relaxed" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            The BX isn&apos;t a gym you go to. It&apos;s a place you show up to —
            for a rally on the courts, a set of reps, or an hour with people who&apos;ll
            notice if you don&apos;t come. Here&apos;s what a real week there looks like.
          </p>
          <div className="flex justify-center gap-3 mt-10">
            <a
              href="https://guru.gyminsight.com/join/IBvAw4AA1c71Ojt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition-colors"
              style={{ background: "var(--accent-solid)", color: "var(--fg-on-accent)" }}
            >
              Become a Member
            </a>
            <a
              href="#courts"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-strong text-fg px-7 py-3.5 rounded-full hover:border-border-strong transition-colors"
            >
              See What&apos;s Inside
            </a>
          </div>
        </div>
      </section>

      {/* ── Room 1: Pickleball & Courts — full-width moment photo ──────── */}
      <section id="courts" className="px-6 pt-6 pb-4">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-2">Room One</p>
          <h2 className="text-fg mb-6 h-subsection">Pickleball &amp; Courts.</h2>
          <p className="text-fg-muted leading-relaxed max-w-lg mb-10">
            Three courts run most mornings, open play and league nights both —
            no reservation needed, just show up with a paddle. Loaner paddles
            are at the front desk if you&apos;re new to it.
          </p>
        </div>
      </section>
      <section className="px-6 pb-24">
        <div
          className="max-w-6xl mx-auto relative rounded-lg overflow-hidden shadow-xl"
          style={{ aspectRatio: "16/9" }}
        >
          <Image
            src="/bx/pickleball-court-3.jpg"
            alt="Two members mid-rally on a BX pickleball court"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* ── Room 2: Strength & Equipment — small offset photo, more text-led ── */}
      <section className="px-6 py-8" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10 items-center py-16">
          <div className="md:col-span-2">
            <div
              className="relative rounded-lg overflow-hidden shadow-xl"
              style={{ aspectRatio: "4/5", transform: "rotate(-1deg)" }}
            >
              <Image
                src="/bx/weight-rack.jpg"
                alt="Weight rack and equipment on the BX strength floor"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-2">Room Two</p>
            <h2 className="text-fg mb-5 h-subsection">Strength &amp; Equipment.</h2>
            <p className="text-fg-muted leading-relaxed mb-4">
              A full strength floor — free weights, cable stations, and
              cardio — open every hour the BX is open. No orientation
              required, but staff are around if you want one.
            </p>
            <p className="text-fg-muted leading-relaxed">
              This is a working gym floor, not a showroom — the equipment
              gets used, which is exactly the point.
            </p>
          </div>
        </div>
      </section>

      {/* ── Room 3: Group Fitness — the emotional core, given the most room ── */}
      <section className="px-6 pt-24 pb-4">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow mb-2">Room Three</p>
          <h2 className="text-fg mb-6 h-subsection">Group Fitness Classes.</h2>
          <p className="text-fg-muted leading-relaxed max-w-lg mb-4">
            Chair fitness, strength for seniors, and everything in between —
            instructor-led, several times a week, included with membership.
            This is the SilverSneakers chair class on a Tuesday morning.
          </p>
        </div>
      </section>

      {/* Large moment photo, full width */}
      <section className="px-6 pb-4">
        <div
          className="max-w-6xl mx-auto relative rounded-lg overflow-hidden shadow-xl"
          style={{ aspectRatio: "21/9" }}
        >
          <Image
            src="/bx/chair-class-balls-1.jpg"
            alt="Members of the chair fitness class raising exercise balls overhead"
            fill
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
          />
        </div>
      </section>

      {/* Two smaller photos side by side, natural aspect ratios, not forced tiles */}
      <section className="px-6 pt-10 pb-24">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          <div
            className="relative rounded-lg overflow-hidden shadow-lg"
            style={{ aspectRatio: "3/4", transform: "rotate(0.8deg)" }}
          >
            <Image
              src="/bx/chair-class-reach.jpg"
              alt="A member reaching up with a ball during chair fitness class"
              fill
              className="object-cover"
            />
          </div>
          <div
            className="relative rounded-lg overflow-hidden shadow-lg mt-8 sm:mt-0"
            style={{ aspectRatio: "3/4", transform: "rotate(-0.6deg)" }}
          >
            <Image
              src="/bx/chair-class-silversneakers.jpg"
              alt="SilverSneakers chair fitness class, exercise balls raised"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <p className="text-center text-fg-subtle text-xs mt-6 max-w-xs mx-auto">
          SilverSneakers members: your membership covers the BX at no
          additional cost. Ask the front desk to check your eligibility.
        </p>
      </section>

      {/* ── Practical info, kept plain and short — not another card grid ── */}
      <section className="px-6 py-20 bg-surface">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-10">
          <div>
            <h3 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.1rem" }}>
              Hours
            </h3>
            <div className="space-y-1.5 text-sm text-fg-muted">
              <p>Mon, Tue, Thu — 6:00 AM–9:00 PM</p>
              <p>Wed, Fri — 6:00 AM–5:00 PM</p>
              <p>Saturday — 8:00 AM–3:00 PM</p>
              <p>Sunday — Closed</p>
            </div>
          </div>
          <div>
            <h3 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.1rem" }}>
              Find Us
            </h3>
            <p className="text-sm text-fg-muted leading-relaxed mb-2">
              4011 Austin St., Chattanooga, TN 37411 — Belvoir neighborhood,
              just off Brainerd Road with easy I-24 access and free parking.
            </p>
            <a
              href="tel:4236434978"
              className="text-sm font-semibold"
              style={{ color: "var(--accent-text)" }}
            >
              (423) 643-4978
            </a>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-4 bg-surface">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-fg mb-6 h-section">Come see it for yourself.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://guru.gyminsight.com/join/IBvAw4AA1c71Ojt"
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition-colors"
              style={{ background: "var(--accent-solid)", color: "var(--fg-on-accent)" }}
            >
              Become a Member
            </a>
            <a
              href="/bx#reservations"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-strong text-fg px-7 py-3.5 rounded-full hover:border-border-strong transition-colors"
            >
              Reserve a Room
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
