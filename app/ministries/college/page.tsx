import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { IDENTITY, inkVars } from "@/lib/identity-colors";
import PhotoLightboxGrid from "./PhotoLightboxGrid";
import ExpandablePhoto from "./ExpandablePhoto";

export const metadata: Metadata = {
  title: "College & Young Adults — Brainerd Baptist Church",
  description:
    "Brainerd College Ministry and Brainerd Young Adults — community, discipleship, and friendship for students and young professionals across Chattanooga.",
};

// ── Sections ─────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "college",
    name: "Brainerd College Ministry",
    ages: "College Students",
    ink: IDENTITY.college,
    detail: "Sundays · Weekly small groups",
    body: "Whether you're from Chattanooga or find yourself here for college, you don't have to navigate this season alone. Brainerd College Ministry is a place for students from across Chattanooga's campuses to find genuine community, grow deep in God's Word together in Men's and Women's Bible studies on campus throughout the semester, and learn what it looks like to live out — and share — your faith on campus. We gather together on Sundays and meet in smaller groups throughout the week to study Scripture, encourage one another, and train together to talk about Jesus with the people around us.",
    schedule: [
      { label: "Life Group", when: "Sundays · 9:45 AM", where: "BX" },
      { label: "Men's & Women's Bible Study", when: "Weekly during the semester", where: "On Campus" },
      { label: "Midweek Gathering", when: "Wednesdays · 6:00 PM", where: "Bobbitt Home" },
      { label: "Monthly Lunch", when: "1st Sunday of the month · 12:30 PM", where: "BX" },
    ],
    leader: {
      name: "Jo & Ada Bobbitt",
      email: "college@brainerdbaptist.org",
      photo: "/college/jo-ada-bobbitt.jpg",
      bio: undefined as string | undefined, // TODO: add once Jo & Ada send a bio
    },
    instagram: "brainerd_college",
    photos: [
      { src: "/college/college-mission-team-rocks.jpg", alt: "College students on a short-term mission trip, gathered on volcanic rock" },
      { src: "/college/college-lifegroup-discussion.jpg", alt: "Students talking together in a life group room" },
      { src: "/college/college-friends-costumes.jpg", alt: "Three friends laughing together in costumes" },
      { src: "/college/college-mission-teaching.jpg", alt: "A student reading Scripture aloud outdoors on a mission trip" },
      { src: "/college/college-group-porch.jpg", alt: "College group photo together on a porch" },
      { src: "/college/college-mission-circle-discussion.jpg", alt: "Students and a local family gathered in conversation on a mission trip" },
      { src: "/college/college-mission-painting.jpg", alt: "Students painting a building's exterior on a mission trip" },
    ],
  },
  {
    key: "youngadults",
    name: "Brainerd Young Adults",
    ages: "Post-College",
    ink: IDENTITY.plum,
    detail: "Sundays · Life groups throughout the week",
    body: "The years after college can bring a lot of change—new jobs, new friendships, new responsibilities, and new questions about what comes next. Brainerd Young Adults is a place to find community and grow in your faith alongside others who are navigating the same season. We gather for worship and life groups on Sundays, build friendships throughout the week, and seek to live out our faith in the workplace, at home, and in everyday life.",
  },
];

export default function CollegeYoungAdultsPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>
            At Brainerd Baptist
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1 className="text-fg-on-dark mb-5 h-display">
            College & Young Adults
          </h1>
          <p className="text-fg-on-dark-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Two seasons of life, each with its own place to land — real
            community, real discipleship, and friendships that carry you
            through what comes next.
          </p>
        </div>
      </div>

      {/* ── Sections ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {SECTIONS.map(({ key, name, ages, ink, detail, body, schedule, leader, instagram, photos }) => (
            <div key={key} className="glass-md rounded-2xl overflow-hidden">
              <div className="h-1" style={{ background: ink.hue }} />
              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <h2
                    className="font-condensed font-800 text-fg"
                    style={{ fontSize: "1.8rem", letterSpacing: "-0.01em" }}
                  >
                    {name}
                  </h2>
                  <span
                    className="text-xs font-semibold tracking-widest uppercase identity-ink"
                    style={inkVars(ink)}
                  >
                    {ages}
                  </span>
                </div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-5"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {detail}
                </p>
                <p className="text-fg-muted leading-relaxed mb-8">{body}</p>

                {schedule && (
                  <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    {schedule.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl p-4 border"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <p
                          className="text-xs font-semibold tracking-widest uppercase mb-1.5 identity-ink"
                          style={inkVars(ink)}
                        >
                          {s.label}
                        </p>
                        <p className="text-fg text-sm font-semibold">{s.when}</p>
                        <p className="text-fg-muted text-sm">{s.where}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-8">
                  <Link
                    href="/connect"
                    className="font-condensed font-700 tracking-wide uppercase text-sm border rounded-full px-6 py-3 transition inline-flex items-center gap-2 hover:opacity-80 identity-ink identity-border"
                    style={inkVars(ink)}
                  >
                    Get Connected
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                    </svg>
                  </Link>
                </div>

                {leader && (
                  <div
                    className="flex items-center gap-4 rounded-xl p-4 border mb-8"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {leader.photo ? (
                      <ExpandablePhoto src={leader.photo} alt={leader.name} size={56} />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full shrink-0 identity-ink identity-border border flex items-center justify-center"
                        style={inkVars(ink)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p
                        className="text-xs font-semibold tracking-widest uppercase mb-1 identity-ink"
                        style={inkVars(ink)}
                      >
                        Ministry Leaders
                      </p>
                      <p className="text-fg text-sm font-semibold">{leader.name}</p>
                      <a
                        href={`mailto:${leader.email}`}
                        className="text-fg-muted text-sm hover:opacity-80 transition"
                      >
                        {leader.email}
                      </a>
                      {leader.bio && (
                        <p className="text-fg-muted text-sm mt-1.5 leading-relaxed">{leader.bio}</p>
                      )}
                    </div>
                  </div>
                )}

                {instagram && (
                  <p className="text-fg-muted text-sm">
                    Stay up to date on events throughout the semester — follow{" "}
                    <a
                      href={`https://www.instagram.com/${instagram}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold identity-ink hover:opacity-80"
                      style={inkVars(ink)}
                    >
                      @{instagram}
                    </a>{" "}
                    on Instagram.
                  </p>
                )}

                {photos && <PhotoLightboxGrid photos={photos} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "var(--brand-band-deep)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>New Here?</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h2
            className="font-condensed font-800 text-fg-on-dark mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Not sure where to start?
          </h2>
          <p className="text-fg-on-dark-muted mb-8 leading-relaxed">
            Fill out a connect card and someone from our team will reach out —
            no pressure, just a conversation about where you might fit.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-8 py-3.5 rounded-full transition-colors"
            >
              Connect With Us
            </Link>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-on-dark-strong hover:border-border-on-dark-hover text-fg-on-dark px-8 py-3.5 rounded-full transition-colors"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
