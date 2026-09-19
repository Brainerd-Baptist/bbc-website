import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wednesday Nights — Brainerd Baptist Church",
  description:
    "Wednesday evenings at Brainerd Baptist bring the whole church together — kids, students, adults, and the arts. Find out where you fit.",
};

// ── Wednesday ministries ─────────────────────────────────────
type Program = {
  key: string; time: string; label: string; ages: string; color: string;
  location: string; href: string | null; body: string; photo?: string;
  icon: React.ReactNode;
};
const PROGRAMS: Program[] = [
  {
    key: "kids",
    time: "6:00 – 7:30 PM",
    label: "Kids Midweek",
    ages: "Ages 2 – 5th Grade",
    color: "#00abc9",
    location: "Kids Area — enter from Albemarle Ave, Purple Lot",
    href: "/ministries/kids",
    photo: "/carousel/kids-midweek.jpg",
    body:
      "Bible stories, worship, games, and small group time for kids from preschool through 5th grade. A mid-week anchor for families during the school year.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 34s-14-8.5-14-18a8 8 0 0 1 14-5.3A8 8 0 0 1 34 16c0 9.5-14 18-14 18z" />
      </svg>
    ),
  },
  {
    key: "students",
    time: "6:30 PM",
    label: "Students",
    ages: "Middle & High School",
    color: "#4a7fcb",
    location: "The BX — enter from the soccer field",
    href: "/ministries/students",
    photo: "/carousel/students-1.jpg",
    body:
      "Games, worship, teaching, and small groups for middle and high school students. Known, loved, and prayed for — led by Paul Christensen and Caroline Bell.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6l12 4v10c0 7-5.5 12.5-12 14C13.5 32.5 8 27 8 20V10l12-4z" />
      </svg>
    ),
  },
  {
    key: "adults",
    time: "6:15 PM",
    label: "Adult Bible Study",
    ages: "Adults",
    color: "#00205B",
    location: "Main Worship Center",
    href: null,
    photo: "/carousel/adult-bible-study.jpg",
    body:
      "Mid-week teaching straight from Scripture. Open to all adults — come expecting to open your Bible, ask questions, and leave with something to chew on the rest of the week.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 32V10a2 2 0 0 1 2-2h10v24H10a2 2 0 0 1-2-2Z" />
        <path d="M20 8h10a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H20V8Z" />
        <path d="M20 8v24M12 15h4M12 19h4M24 15h4M24 19h4" />
      </svg>
    ),
  },
  {
    key: "college",
    time: "Varies by group",
    label: "College & Young Adults",
    ages: "College Age",
    color: "#5b7fa6",
    location: "Off-campus locations",
    href: null,
    body:
      "College-age groups meet throughout the week at off-campus locations around Chattanooga. Get connected and we'll point you to the right group for where you live and go to school.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20l16-8 16 8-16 8z" />
        <path d="M12 24v7c4 3.5 12 3.5 16 0v-7" />
        <path d="M36 20v7" />
      </svg>
    ),
  },
  {
    key: "choir",
    time: "6:00 PM",
    label: "Choir & Orchestra",
    ages: "All ages welcome",
    color: "#8b6fae",
    location: "Choir Room / Worship Center",
    href: null,
    photo: "/carousel/choir-orchestra.jpg",
    body:
      "Our choir and orchestra rehearse together on Wednesday evenings. If you sing or play an instrument, this is how you plug into the music ministry of Brainerd Baptist.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 28a6 6 0 1 0 0-1" />
        <path d="M16 26V10l16-4v16" />
        <path d="M26 28a6 6 0 1 0 0-1" />
      </svg>
    ),
  },
];

export default function WednesdayPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero / Header ──────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{
          background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "#00abc9" }}>
            Every Wednesday
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Wednesday Night{" "}
            <span style={{ color: "#00abc9" }}>at Brainerd.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            From kids to college to choir, Wednesday evening is when the whole
            church fills the building. Find your night below.
          </p>
          <div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3"
            style={{ background: "rgba(0,171,201,0.12)", border: "1px solid rgba(0,171,201,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className="text-white/80 text-sm font-medium">
              Most programs start between <span style={{ color: "#00abc9" }}>6:00 – 6:15 PM</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick-glance time bar ──────────────────────────── */}
      <div
        className="py-5 px-6 border-b border-[#00205B]/08"
        style={{ background: "#f4f6f9" }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2">
          {PROGRAMS.map(({ key, time, label, color }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: color }}
              />
              <span className="font-medium text-[#00205B]/80">{label}</span>
              <span className="text-[#00205B]/40">·</span>
              <span className="text-[#00205B]/55">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Program cards ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {PROGRAMS.map(({ key, time, label, ages, color, location, href, body, icon, photo }) => (
            <div
              key={key}
              className="glass-md rounded-2xl overflow-hidden"
            >
              {/* Color bar */}
              <div className="h-1" style={{ background: color }} />

              {/* Optional photo banner */}
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={label}
                  className="w-full object-cover"
                  style={{ height: "220px", objectPosition: "center 30%" }}
                />
              )}

              <div className="p-8 md:p-10 grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-start">

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <h2
                      className="font-condensed font-800 text-[#00205B]"
                      style={{ fontSize: "1.6rem", letterSpacing: "-0.01em" }}
                    >
                      {label}
                    </h2>
                    <span
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color }}
                    >
                      {ages}
                    </span>
                  </div>

                  {/* Time + location row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4">
                    <span className="text-sm font-medium text-[#00205B]/70">
                      <span className="font-condensed font-700" style={{ color }}>
                        {time}
                      </span>
                    </span>
                    <span className="text-sm text-[#00205B]/45">{location}</span>
                  </div>

                  <p className="text-[#00205B]/55 text-sm leading-relaxed">
                    {body}
                  </p>
                </div>

                {/* CTA */}
                {href && (
                  <div className="shrink-0 self-center">
                    <Link
                      href={href}
                      className="font-condensed font-700 tracking-wide uppercase text-sm border rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-2 whitespace-nowrap"
                      style={{
                        borderColor: `${color}40`,
                        color,
                      }}
                    >
                      Learn More
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">New here?</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h2
            className="font-condensed font-800 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Just show up on a Wednesday.
          </h2>
          <p className="text-white/55 mb-8 leading-relaxed">
            No signup required for most programs. Pull into the parking lot, find
            your age group from the list above, and someone will point you in the
            right direction.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-8 py-3.5 rounded-full transition-colors"
            >
              Plan Your Visit
            </Link>
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-full transition-colors"
            >
              Get Connected
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
