import Link from "next/link";
import type { Metadata } from "next";
import { IDENTITY, inkVars } from "@/lib/identity-colors";

export const metadata: Metadata = {
  title: "Students — Brainerd Baptist Church",
  description:
    "Middle and high school students growing in faith, community, and God's Word at Brainerd Baptist Church.",
};

// ── Pillars ──────────────────────────────────────────────────
const PILLARS = [
  {
    label: "Scripture",
    body: "We open the Bible every time we meet — not topical felt needs, but working through books of the Bible and trusting that students can handle the whole thing.",
  },
  {
    label: "Community",
    body: "Teenagers need people who know them by name. Small groups keep students connected to each other and to adults who are genuinely invested in their lives.",
  },
  {
    label: "Belonging",
    body: "Middle school and high school are different worlds. We keep them intentionally together in some spaces and separate in others — so every student fits somewhere.",
  },
];

// ── What the week looks like ─────────────────────────────────
const SCHEDULE = [
  {
    day: "Sunday",
    time: "9:45 AM",
    label: "Sunday Morning",
    body: "Students gather for teaching and small groups during the 9:45 service hour. [Add room / location detail here.]",
  },
  {
    day: "Wednesday",
    time: "6:30 PM",
    label: "Midweek",
    body: "Games, worship, teaching, and small group time at the BX — enter from the soccer field side. This is the heartbeat of the week for most students.",
  },
];

// ── Page ─────────────────────────────────────────────────────
export default function StudentsPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="relative w-full flex flex-col justify-end overflow-hidden"
        style={{ minHeight: "70vh" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/carousel/students-1.jpg"
          alt="Brainerd Baptist Students"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "var(--scrim-hero)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
          <p className="eyebrow-white mb-4">Students</p>
          <h1
            className="font-condensed font-900 text-fg-on-dark leading-none mb-5"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            A place to{" "}
            {/* Permanently dark hero (photo under a navy scrim), so the ink
                must not invert: this pins the identity pair's DARK value
                instead of using .identity-ink, whose light value would drop
                to 3.75:1 here. See docs/token-mapping-rules.md. */}
            <span style={{ color: IDENTITY.students.dark }}>belong.</span>
          </h1>
          <p
            className="text-fg-on-dark-muted leading-relaxed mb-8 max-w-lg"
            style={{ fontSize: "1.05rem" }}
          >
            Middle and high school students — known, loved, and prayed for.
            A community where teenagers belong and go back out into their
            schools changed.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#schedule"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors"
              style={{ background: IDENTITY.students.solid, color: "var(--fg-on-accent)" }}
            >
              When We Meet
            </a>
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-on-dark-strong text-fg-on-dark px-7 py-3 rounded-full hover:border-border-on-dark-hover transition-colors"
            >
              Get Connected
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three pillars ──────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">What we&apos;re about</p>
            <h2
              className="font-condensed font-900 text-fg"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Built on three things.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map(({ label, body }) => (
              <div
                key={label}
                className="bg-surface-raised rounded-2xl p-8 border border-border hover:border-[var(--pillar-hue)]/30 transition-colors"
                style={{ "--pillar-hue": IDENTITY.students.hue } as React.CSSProperties}
              >
                <div
                  className="w-1 h-10 rounded-full mb-5"
                  style={{ background: IDENTITY.students.hue }}
                />
                <h3
                  className="font-condensed font-800 text-fg mb-3"
                  style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                >
                  {label}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule ───────────────────────────────────────── */}
      <section id="schedule" className="py-24 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">Find your week</p>
            <h2
              className="font-condensed font-900 text-fg"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              When we meet.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SCHEDULE.map(({ day, time, label, body }) => (
              <div
                key={day}
                className="rounded-2xl p-8 border border-border"
                style={{ background: "var(--surface-sunken)" }}
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    className="font-condensed font-800 identity-ink"
                    style={{ ...inkVars(IDENTITY.students), fontSize: "1.6rem" }}
                  >
                    {day}
                  </span>
                  <span className="text-fg-muted text-sm font-medium">{time}</span>
                </div>
                <h3
                  className="font-condensed font-700 text-fg mb-2"
                  style={{ fontSize: "1.15rem" }}
                >
                  {label}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Staff ─────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Team</p>
            <h2
              className="font-condensed font-900 text-fg"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              The people behind it.
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                name: "Paul Christensen",
                title: "Student Pastor",
                photo: "/staff/christensen_paul_studentspastor.jpg",
              },
              {
                name: "Caroline Bell",
                title: "Coordinator",
                photo: null,
              },
            ].map(({ name, title, photo }) => (
              <div key={name} className="text-center" style={{ width: "180px" }}>
                <div
                  className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
                >
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75"
                        className="identity-ink" style={inkVars(IDENTITY.students)}>
                        <circle cx="20" cy="14" r="6" />
                        <path d="M8 36c0-8 5.4-13 12-13s12 5 12 13" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3
                  className="font-condensed font-800 text-fg"
                  style={{ fontSize: "1.1rem" }}
                >
                  {name}
                </h3>
                <p className="text-xs font-semibold tracking-widest uppercase mt-1 identity-ink" style={inkVars(IDENTITY.students)}>
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--color-brand-navy)" }}>
        <div className="max-w-3xl mx-auto text-center">
          {/* Permanently dark navy band. The raw hue reads 3.82:1 on
              #00205b — under AA for text this small — and .identity-ink's
              light value is worse still at 3.09:1, so this pins the pair's
              DARK value (4.74:1). See docs/token-mapping-rules.md. */}
          <p className="eyebrow mb-3" style={{ color: IDENTITY.students.dark }}>
            Ready to plug in?
          </p>
          <h2
            className="font-condensed font-900 text-fg-on-dark mb-5"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Bring your student on a Wednesday.
          </h2>
          <p className="text-fg-on-dark-muted leading-relaxed mb-8 max-w-md mx-auto">
            No signup required. Just show up. If you want to connect with a
            leader beforehand, fill out a connect card and we&apos;ll reach out.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-4 rounded-full transition-colors"
              style={{ background: IDENTITY.students.solid, color: "var(--fg-on-accent)" }}
            >
              Get Connected
            </Link>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-on-dark-strong text-fg-on-dark px-8 py-4 rounded-full hover:border-border-on-dark-hover transition-colors"
            >
              Plan Your Visit
            </Link>
          </div>
          <p className="text-fg-on-dark-muted text-xs mt-8">
            Questions? Email{" "}
            <a
              href="mailto:students@brainerdbaptist.org"
              className="underline underline-offset-2 hover:text-fg-on-dark transition-colors"
            >
              students@brainerdbaptist.org
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
