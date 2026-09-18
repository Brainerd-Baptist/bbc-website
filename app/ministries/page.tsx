import Link from "next/link";
import { MINISTRIES } from "@/lib/constants";

export const metadata = {
  title: "Ministries — Brainerd Baptist Church",
  description:
    "Explore the ministries of Brainerd Baptist Church — Kids, Students, Life Groups, Missions, College & Young Adults, and Adults.",
};

const ICONS: Record<string, React.ReactNode> = {
  kids: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  lifegroups: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  missions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  college: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  adults: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

// Extended detail copy per ministry
const DETAIL: Record<string, { tagline: string; body: string }> = {
  kids: {
    tagline: "Loving children well, from the nursery through elementary.",
    body: "Our Children's Ministry is committed to teaching the gospel clearly and creatively. Children through 5th grade participate in age-appropriate environments every Sunday. K and older join their families for congregational worship.",
  },
  students: {
    tagline: "Equipping teenagers to know and love Christ.",
    body: "Middle and high school students gather on Sunday mornings and throughout the week for discipleship, community, and genuine worship. We believe in teaching God's Word directly to the next generation.",
  },
  lifegroups: {
    tagline: "Doing life together in smaller circles.",
    body: "Life Groups meet weekly — in homes and around tables — for Bible study, prayer, and honest community. Sunday mornings at 9:45 AM. We believe the local church is best experienced in a smaller circle where people know your name.",
  },
  missions: {
    tagline: "Carrying the gospel to every corner of the world.",
    body: "Brainerd Baptist partners with missionaries and church-planting networks globally, and engages locally in Chattanooga. From East Ridge to East Africa, we are committed to the spread of the gospel.",
  },
  college: {
    tagline: "Investing in young adults during the formative years.",
    body: "College and young adult years carry enormous spiritual weight. Our College & Young Adults ministry creates space for those 18–30 to study Scripture together, build friendships, and discern the next decade of their lives.",
  },
  adults: {
    tagline: "Serving and encouraging men and women across all seasons.",
    body: "Whether you are newly married, raising teenagers, navigating an empty nest, or entering retirement — there is a community for you at Brainerd Baptist. Adult ministries include men's and women's Bible study, Sunday classes, and seasonal events.",
  },
};

export default function MinistriesPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}>
      {/* Page header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">At Brainerd Baptist</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Ministries
          </h1>
          <p className="text-white/55 text-lg leading-relaxed">
            There is a place for every person, at every stage of life. Explore
            the ministries that make up the life of our church.
          </p>
        </div>
      </div>

      {/* Ministry cards — full detail view */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {MINISTRIES.map((m, i) => (
            <div
              key={m.key}
              className="glass-md rounded-2xl overflow-hidden"
            >
              {/* Colored top bar */}
              <div className="h-1.5 w-full" style={{ background: m.color }} />

              <div className="p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-start">
                {/* Icon column */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${m.color}22`, color: m.color }}
                >
                  {ICONS[m.icon]}
                </div>

                {/* Content column */}
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h2 className="font-condensed font-800 text-white text-2xl md:text-3xl">
                      {m.name}
                    </h2>
                    <span
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: m.color }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <p className="font-serif italic text-white/70 mb-4 text-lg leading-snug">
                    {DETAIL[m.key].tagline}
                  </p>
                  <p className="text-white/55 text-sm leading-relaxed mb-6">
                    {DETAIL[m.key].body}
                  </p>
                  <Link
                    href="/connect"
                    className="inline-flex items-center gap-2 font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-gold/50 text-white hover:text-gold px-5 py-2.5 rounded-full transition-all"
                  >
                    Get Connected
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

      {/* CTA band */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">Not Sure Where to Start?</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h2
            className="font-condensed font-800 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}
          >
            Let Us Help You Find Your Place
          </h2>
          <p className="text-white/55 mb-8 leading-relaxed">
            Fill out a connect card and someone from our team will reach out —
            no pressure, just a conversation about where you might fit.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-8 py-3.5 rounded-full transition-colors"
            >
              Connect With Us
            </Link>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-white px-8 py-3.5 rounded-full transition-colors glass"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
