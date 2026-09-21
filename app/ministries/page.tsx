import Link from "next/link";
import type { Metadata } from "next";

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
    color: "#c9a84c",
    photo: "/carousel/kids-midweek.jpg",
    href: "/ministries/kids",
    body: "The gospel, taught clearly and creatively. Children through 5th grade participate in age-appropriate environments every Sunday. Midweek ministry runs every Wednesday night during the school year.",
    detail: "Sunday mornings · Wednesday 6:00 PM",
  },
  {
    key: "students",
    name: "Students",
    ages: "Middle & High School",
    color: "#4a7fcb",
    photo: "/carousel/students-1.jpg",
    href: "/ministries/students",
    body: "Known, loved, and prayed for. Middle and high schoolers gather Sunday mornings and Wednesday evenings for real community, Scripture, and a faith that holds up under pressure.",
    detail: "Sunday 9:45 AM · Wednesday 6:30 PM at The BX",
  },
  {
    key: "lifegroups",
    name: "Life Groups",
    ages: "All Ages",
    color: "var(--accent-text)",
    photo: "/carousel/life-groups-1.jpg",
    href: "/life-groups",
    body: "The local church is best experienced in a smaller circle. Life Groups meet weekly — in homes and around tables — for Bible study, prayer, and the kind of community you can't get on Sunday morning alone.",
    detail: "Sunday 9:45 AM · Groups throughout the week",
  },
  {
    key: "missions",
    name: "Missions",
    ages: "Church-wide",
    color: "#e07b54",
    photo: "/carousel/missions-1.jpg",
    href: "/connect",
    body: "From East Ridge to East Africa. Brainerd Baptist partners with missionaries and church-planting networks globally, and engages the Brainerd community locally every week.",
    detail: "Local + global partnerships",
  },
  {
    key: "college",
    name: "College & Young Adults",
    ages: "Ages 18–30",
    color: "#9b6ecc",
    photo: null,
    href: "/connect",
    body: "College and young adult years carry enormous spiritual weight. Groups meet throughout the week around Chattanooga for Scripture, friendship, and figuring out the next chapter together.",
    detail: "Various off-campus locations",
  },
  {
    key: "adults",
    name: "Adults",
    ages: "Adults",
    color: "#4ab8c4",
    photo: "/carousel/adult-bible-study.jpg",
    href: "/connect",
    body: "Whether you are newly married, raising teenagers, navigating an empty nest, or entering retirement — there is a place for you. Adult ministries include Bible studies, Sunday classes, and men's and women's events.",
    detail: "Sunday mornings · Wednesday 6:15 PM",
  },
];

// ── Icons ─────────────────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  kids: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 34s-14-8.5-14-18a8 8 0 0 1 14-5.3A8 8 0 0 1 34 16c0 9.5-14 18-14 18z" />
    </svg>
  ),
  students: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l16-8 16 8-16 8z" /><path d="M12 24v7c4 3.5 12 3.5 16 0v-7" /><path d="M36 20v7" />
    </svg>
  ),
  lifegroups: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="14" r="5" /><circle cx="28" cy="14" r="5" /><path d="M4 34c0-6 4.5-10 10-10h12c5.5 0 10 4 10 10" />
    </svg>
  ),
  missions: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="16" /><line x1="4" y1="20" x2="36" y2="20" />
      <path d="M20 4a24 24 0 0 1 6 16 24 24 0 0 1-6 16 24 24 0 0 1-6-16 24 24 0 0 1 6-16z" />
    </svg>
  ),
  college: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 32V16l12-6 12 6v16" /><path d="M4 20l16-8 16 8" /><path d="M14 22v8M26 22v8M8 32h24" />
    </svg>
  ),
  adults: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 32V10a2 2 0 0 1 2-2h10v24H10a2 2 0 0 1-2-2Z" />
      <path d="M20 8h10a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H20V8Z" />
      <path d="M12 15h4M12 19h4M24 15h4M24 19h4" />
    </svg>
  ),
};

export default function MinistriesPage() {
  return (
    <div className="min-h-screen bg-surface">

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
            className="font-condensed font-900 text-fg-on-dark leading-none mb-5"
            style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", letterSpacing: "-0.02em" }}
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
        <div className="max-w-5xl mx-auto space-y-6">
          {MINISTRIES.map(({ key, name, ages, color, photo, href, body, detail }) => (
            <div key={key} className="glass-md rounded-2xl overflow-hidden">

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

              <div className="p-8 md:p-10 grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-start">

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 9%, transparent)`, color }}
                >
                  {ICONS[key]}
                </div>

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
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color }}
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
                    className="font-condensed font-700 tracking-wide uppercase text-sm border rounded-full px-5 py-2.5 transition-all inline-flex items-center gap-2 whitespace-nowrap hover:opacity-80"
                    style={{ borderColor: `color-mix(in srgb, ${color} 31%, transparent)`, color }}
                  >
                    {href.startsWith("/ministries/") || href === "/life-groups"
                      ? "Learn More"
                      : "Get Connected"}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                    </svg>
                  </Link>
                </div>
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
