import Link from "next/link";
import type { Metadata } from "next";
import { IDENTITY, inkVars } from "@/lib/identity-colors";
import { CHURCH_CENTER_CALENDAR_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ministries — Brainerd Baptist Church",
  description:
    "There is a place for every person, at every stage of life. Explore the ministries of Brainerd Baptist Church.",
};

// ── Ministry definitions ─────────────────────────────────────
const MINISTRIES = [
  {
    key: "kids",
    name: "Kids Ministry",
    ages: "Nursery – 5th Grade",
    color: IDENTITY.kids.hue,
    ink: IDENTITY.kids,
    photo: "/carousel/kids-branded-room-wide.jpg",
    href: "/ministries/kids",
    body: "The gospel, taught clearly and creatively. Children through 5th grade participate in age-appropriate environments every Sunday. Midweek ministry runs every Wednesday night during the school year.",
    detail: "Sunday mornings · Wednesday 6:00 PM",
  },
  {
    key: "students",
    name: "Students",
    ages: "Middle & High School",
    color: IDENTITY.students.hue,
    ink: IDENTITY.students,
    photo: "/ministries/students-table-wide.jpg",
    href: "/ministries/students",
    body: "Known, loved, and prayed for. Middle and high schoolers gather Sunday mornings and Wednesday evenings for real community, Scripture, and a faith that holds up under pressure.",
    detail: "Sunday 9:45 AM · Wednesday 6:30 PM at The BX",
  },
  {
    key: "lifegroups",
    name: "Life Groups",
    ages: "All Ages",
    color: "var(--accent)",
    ink: { light: "var(--accent-text)", dark: "var(--accent-text)" },
    photo: "/carousel/life-groups-2026.jpg",
    href: "/life-groups",
    body: "The local church is best experienced in a smaller circle. Life Groups meet weekly — in homes and around tables — for Bible study, prayer, and the kind of community you can't get on Sunday morning alone.",
    detail: "Sunday 9:45 AM · Groups throughout the week",
  },
  {
    key: "missions",
    name: "Missions",
    ages: "Church-wide",
    color: IDENTITY.missions.hue,
    ink: IDENTITY.missions,
    photo: "/carousel/missions-istanbul.jpg",
    href: "/missions",
    body: "From East Ridge to East Africa. Brainerd Baptist partners with missionaries and church-planting networks globally, and engages the Brainerd community locally every week.",
    detail: "Local + global partnerships",
  },
  {
    key: "college",
    name: "College Ministry",
    ages: "College Students",
    color: IDENTITY.college.hue,
    ink: IDENTITY.college,
    photo: "/college/college-group-porch.jpg",
    href: "/ministries/college",
    body: "Whether you're from Chattanooga or find yourself here for college, you don't have to navigate this season alone. Brainerd College Ministry is a place for students from across Chattanooga's campuses to find genuine community, grow in their faith, and build friendships that go beyond Sunday. We gather together on Sundays and meet in smaller groups throughout the week to encourage one another, study God's Word, and learn what it looks like to follow Jesus in college.",
    detail: "Sundays · Weekly small groups",
  },
  {
    key: "youngadults",
    name: "Young Adults",
    ages: "Post-College",
    color: IDENTITY.plum.hue,
    ink: IDENTITY.plum,
    photo: null,
    href: "/ministries/college",
    body: "The years after college can bring a lot of change—new jobs, new friendships, new responsibilities, and new questions about what comes next. Brainerd Young Adults is a place to find community and grow in your faith alongside others who are navigating the same season. We gather for worship and life groups on Sundays, build friendships throughout the week, and seek to live out our faith in the workplace, at home, and in everyday life.",
    detail: "Sundays · Life groups throughout the week",
  },
  {
    key: "adults",
    name: "Adults",
    ages: "Adults",
    color: IDENTITY.adults.hue,
    ink: IDENTITY.adults,
    photo: "/carousel/adults-community-wide.jpg",
    href: "/connect",
    body: "Wherever you are in life, there's a place for you. Adults gather through Bible studies, Sunday classes, and Life Groups, along with men's and women's events like breakfasts and Bible studies throughout the year. See what's coming up on the events page, or ask Ben Hovies, our Director of Adult Discipleship, where you might fit.",
    detail: "Sunday mornings · Wednesday 6:15 PM",
    extraLink: { href: CHURCH_CENTER_CALENDAR_URL, label: "See Upcoming Events", external: true },
  },
  {
    key: "worship",
    name: "Sing or Play",
    ages: "Worship Teams",
    color: IDENTITY.serve.hue,
    ink: IDENTITY.serve,
    photo: "/carousel/choir-orchestra.jpg",
    href: "/connect/next-step?interest=serving",
    body: "If you sing or play an instrument, there are two ways in: our Choir & Orchestra and our Band-Led team. Tell us what you sing or play, and we'll connect you with the people who lead worship.",
    detail: "Choir & Orchestra · Band-Led",
  },
  {
    key: "hispanic",
    name: "Hispanic Ministry",
    ages: "Ministerio Hispano",
    color: IDENTITY.missions.hue,
    ink: IDENTITY.missions,
    photo: null,
    href: "/ministries/hispanic",
    body: "Un servicio en español cada domingo a las 11:00 AM. A Spanish-language service every Sunday at 11:00 AM. The best way to get connected is to join us on a Sunday.",
    detail: "Domingos · Sundays 11:00 AM",
  },
];

export default function MinistriesPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{
          background: "var(--brand-band)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* On the navy band, cyan must stay FULL brand cyan (5.65:1).
              --accent-text darkens for light surfaces and would read 3.2:1
              here — see docs/token-mapping-rules.md. */}
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>
            At Brainerd Baptist
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="text-fg-on-dark mb-5 h-display"
          >
            Ministries
          </h1>
          <p className="text-fg-on-dark-muted text-lg leading-relaxed max-w-2xl mx-auto">
            There is a place for every person, at every stage of life. Explore
            the ministries that make up the life of our church.
          </p>
        </div>
      </div>

      {/* ── Ministry cards ───────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="relative max-w-5xl mx-auto space-y-6">
          {MINISTRIES.map(({ key, name, ages, color, ink, photo, href, body, detail, extraLink }) => (
            <div key={key} id={key} className="glass-md rounded-2xl overflow-hidden scroll-mt-24">

              {/* Color bar */}
              <div className="h-1" style={{ background: color }} />

              {/* Optional photo banner */}
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={name}
                  className="w-full object-cover"
                  style={{ height: "200px", objectPosition: "center 35%" }}
                />
              )}

              <div className="p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-start">

                {/* Content */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <h2
                      className="font-condensed font-800 text-fg"
                      style={{ fontSize: "1.6rem", letterSpacing: "-0.01em" }}
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
                    className="text-xs font-semibold tracking-widest uppercase mb-4"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {detail}
                  </p>

                  <p className="text-fg-muted text-sm leading-relaxed">
                    {body}
                  </p>
                </div>

                {/* CTA */}
                <div className="shrink-0 self-center">
                  <Link
                    href={href}
                    className="font-condensed font-700 tracking-wide uppercase text-sm border rounded-full px-5 py-2.5 transition inline-flex items-center gap-2 whitespace-nowrap hover:opacity-80 identity-ink identity-border"
                    style={inkVars(ink)}
                  >
                    {href.startsWith("/ministries/") || href === "/life-groups" || href === "/missions"
                      ? "Learn More"
                      : "Get Connected"}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                    </svg>
                  </Link>
                  {extraLink && (
                    <a
                      href={extraLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center text-sm underline underline-offset-2 identity-ink"
                      style={inkVars(ink)}
                    >
                      {extraLink.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ background: "var(--brand-band-deep)" }}
      >
        <div className="bx-bloom" aria-hidden="true" />
        <div className="relative max-w-2xl mx-auto text-center">
          {/* Dark CTA band — full brand cyan, not --accent-text. */}
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
