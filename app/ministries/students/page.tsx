import Link from "next/link";
import type { Metadata } from "next";

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
    <div className="min-h-screen bg-white">

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
              "linear-gradient(to bottom, rgba(0,16,48,0.25) 0%, rgba(0,16,48,0.20) 30%, rgba(0,16,48,0.82) 70%, rgba(0,16,48,0.97) 100%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
          <p className="eyebrow-white mb-4">Students</p>
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            A place to{" "}
            <span style={{ color: "#4a7fcb" }}>belong.</span>
          </h1>
          <p
            className="text-white/65 leading-relaxed mb-8 max-w-lg"
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
              style={{ background: "#4a7fcb", color: "white" }}
            >
              When We Meet
            </a>
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/40 text-white px-7 py-3 rounded-full hover:border-white/70 transition-colors"
            >
              Get Connected
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three pillars ──────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#f4f6f9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">What we&apos;re about</p>
            <h2
              className="font-condensed font-900 text-[#00205B]"
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
                className="bg-white rounded-2xl p-8 border border-[#00205B]/8 hover:border-[#4a7fcb]/30 transition-colors"
              >
                <div
                  className="w-1 h-10 rounded-full mb-5"
                  style={{ background: "#4a7fcb" }}
                />
                <h3
                  className="font-condensed font-800 text-[#00205B] mb-3"
                  style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                >
                  {label}
                </h3>
                <p className="text-[#00205B]/60 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schedule ───────────────────────────────────────── */}
      <section id="schedule" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">Find your week</p>
            <h2
              className="font-condensed font-900 text-[#00205B]"
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
                className="rounded-2xl p-8 border border-[#00205B]/8"
                style={{ background: "#f4f6f9" }}
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    className="font-condensed font-800 text-[#4a7fcb]"
                    style={{ fontSize: "1.6rem" }}
                  >
                    {day}
                  </span>
                  <span className="text-[#00205B]/40 text-sm font-medium">{time}</span>
                </div>
                <h3
                  className="font-condensed font-700 text-[#00205B] mb-2"
                  style={{ fontSize: "1.15rem" }}
                >
                  {label}
                </h3>
                <p className="text-[#00205B]/55 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Staff ─────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#f4f6f9" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">Our Team</p>
            <h2
              className="font-condensed font-900 text-[#00205B]"
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
                  style={{ background: "white", border: "1px solid rgba(0,32,91,0.08)" }}
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
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#4a7fcb" strokeWidth="1.75">
                        <circle cx="20" cy="14" r="6" />
                        <path d="M8 36c0-8 5.4-13 12-13s12 5 12 13" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3
                  className="font-condensed font-800 text-[#00205B]"
                  style={{ fontSize: "1.1rem" }}
                >
                  {name}
                </h3>
                <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: "#4a7fcb" }}>
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#00205B" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-3" style={{ color: "#4a7fcb" }}>
            Ready to plug in?
          </p>
          <h2
            className="font-condensed font-900 text-white mb-5"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Bring your student on a Wednesday.
          </h2>
          <p className="text-white/55 leading-relaxed mb-8 max-w-md mx-auto">
            No signup required. Just show up. If you want to connect with a
            leader beforehand, fill out a connect card and we&apos;ll reach out.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-4 rounded-full transition-colors"
              style={{ background: "#4a7fcb", color: "white" }}
            >
              Get Connected
            </Link>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/30 text-white px-8 py-4 rounded-full hover:border-white/50 transition-colors"
            >
              Plan Your Visit
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-8">
            Questions? Email{" "}
            <a
              href="mailto:students@brainerdbaptist.org"
              className="underline underline-offset-2 hover:text-white/50 transition-colors"
            >
              students@brainerdbaptist.org
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
