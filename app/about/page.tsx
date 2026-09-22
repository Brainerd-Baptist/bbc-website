import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About — Brainerd Baptist Church",
  description:
    "Established in 1928, Brainerd Baptist is a multi-generational community in Chattanooga, TN — gathered to worship, sent to serve, and committed to knowing and being known.",
};


const PILLARS = [
  {
    num: "01",
    heading: "Gathered to Worship",
    body: "Every Sunday, the church assembles — not as an audience, but as a congregation. Two services, one Body. We sing together, pray together, and sit under the teaching of God's Word verse by verse.",
  },
  {
    num: "02",
    heading: "Rooted in Community",
    body: "Life Groups meet Sunday mornings and throughout the week — every age and stage. Bible studies, pickleball, fitness, and shared space at the BX. The goal isn't programming. It's people who actually know each other.",
  },
  {
    num: "03",
    heading: "Sent to the Nations",
    body: "Brainerd members partner with churches and missionaries around the world to carry the gospel to the edges of the earth. Every dollar given, every trip taken, every prayer offered — for the glory of Jesus among all peoples.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div
        className="relative pt-32 pb-28 px-6 overflow-hidden"
        style={{ background: "var(--color-brand-navy)" }}
      >
        {/* Faint background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 60% at 60% 40%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 70%)`,
          }}
        />

        <div className="max-w-4xl mx-auto relative">
          <p
            className="font-condensed font-700 tracking-widest uppercase text-xs mb-6"
            style={{ color: "var(--accent)" }}
          >
            About Brainerd Baptist
          </p>
          <h1
            className="font-condensed font-900 text-white mb-6"
            style={{
              fontSize: "clamp(3.2rem, 9vw, 6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Known.{" "}
            <span style={{ color: "var(--accent)" }}>Loved.</span>
            {" "}Prayed&nbsp;for.
          </h1>
          <p
            className="text-white/60 leading-relaxed max-w-xl"
            style={{ fontSize: "1.1rem" }}
          >
            That's the promise — not the slogan. It's what we want for every
            person who walks through these doors: to be genuinely known by
            people, genuinely loved by them, and genuinely prayed for by name.
          </p>
        </div>
      </div>

      {/* ── Founded section ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Image */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src="/about/choir-orchestra-wide.jpg"
                alt="Brainerd Baptist congregation"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Text */}
            <div>
              <p className="eyebrow mb-4">Est. 1928</p>
              <h2
                className="font-condensed font-900 mb-5"
                style={{
                  color: "var(--fg)",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                A church that's been here a while — and plans to stay.
              </h2>
              <p className="text-fg-muted leading-relaxed mb-4">
                Brainerd Baptist has been part of this neighborhood for nearly
                a century. Through generations, the city has changed around us.
                What hasn't changed is the reason we gather: the Word of God,
                the worship of Jesus, and the love of the saints for one
                another.
              </p>
              <p className="text-fg-muted leading-relaxed">
                We're not a campus. We're not a brand. We're a church — a
                multi-generational family of people raising kids, navigating
                hard seasons, and doing life together in the name of Jesus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ──────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: "var(--surface-sunken)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">What We Do Together</p>
          <h2
            className="font-condensed font-900 text-center mb-16"
            style={{
              color: "var(--fg)",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            One purpose.<br />
            <span style={{ color: "var(--accent-text)" }}>Many expressions.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {PILLARS.map((p) => (
              <div key={p.num} className="relative">
                <span
                  className="font-condensed font-900 block mb-4"
                  data-decorative="true"
                  aria-hidden="true"
                  style={{
                    fontSize: "4rem",
                    color: "var(--accent-text)",
                    opacity: 0.12,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {p.num}
                </span>
                <h3
                  className="font-condensed font-800 mb-3"
                  style={{
                    color: "var(--fg)",
                    fontSize: "1.35rem",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {p.heading}
                </h3>
                <p className="text-fg-muted leading-relaxed text-sm">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Purpose statement ──────────────────────────────────── */}
      <section
        className="py-28 px-6"
        style={{ background: "var(--color-brand-navy)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="font-condensed font-700 tracking-widest uppercase text-xs mb-8"
            style={{ color: "var(--accent)" }}
          >
            Why We Exist
          </p>
          <blockquote
            className="font-condensed font-900 text-white"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 3.8rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            "That all the earth may{" "}
            <span style={{ color: "var(--accent)" }}>know and worship</span>{" "}
            at the feet of Jesus."
          </blockquote>
          <p className="text-fg-on-dark-muted mt-6 text-sm">
            Everything we do — Sunday worship, Life Groups, missions — flows from this.
          </p>
        </div>
      </section>

      {/* ── The BX + Sunday snapshot ───────────────────────────── */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Text first on this side */}
            <div className="order-2 md:order-1">
              <p className="eyebrow mb-4">Life Together</p>
              <h2
                className="font-condensed font-900 mb-5"
                style={{
                  color: "var(--fg)",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                A church where people actually know each other.
              </h2>
              <p className="text-fg-muted leading-relaxed mb-4">
                Sunday is the anchor — but the community doesn't stop there.
                Life Groups meet throughout the week across the city. The BX
                is a gathering place for fitness, meetings, and just showing
                up. People here tend to do life together in the ordinary,
                unremarkable ways that actually form community over time.
              </p>
              <p className="text-fg-muted leading-relaxed">
                The goal isn't a great church experience. It's gospel
                community — raising families, navigating hard seasons, and
                staying in it for the long haul.
              </p>
            </div>

            {/* Image */}
            <div
              className="relative rounded-2xl overflow-hidden order-1 md:order-2"
              style={{ aspectRatio: "4/3" }}
            >
              <Image
                src="/about/life-groups-wide.jpg"
                alt="Life Groups at Brainerd Baptist"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pastor quote ───────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "var(--surface-sunken)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <blockquote
            className="font-condensed font-800 mb-6"
            style={{
              color: "var(--fg)",
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            "Our big prayer is that more and more people would experience and
            enjoy all the grace that God has for them in Jesus Christ."
          </blockquote>
          <p
            className="font-condensed font-700 tracking-wide uppercase text-xs"
            style={{ color: "var(--accent-text)" }}
          >
            Curtis Hill · Lead Pastor
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface text-center">
        <div className="max-w-xl mx-auto">
          <p className="eyebrow mb-4">Come See for Yourself</p>
          <h2
            className="font-condensed font-900 mb-4"
            style={{
              color: "var(--fg)",
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Sundays at 8:30 &amp; 11:00 AM
          </h2>
          <p className="text-fg-muted mb-10">
            300 Brookfield Ave · Chattanooga, TN 37411
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition hover:-translate-y-0.5"
              style={{ background: "var(--accent-solid)", color: "var(--fg-on-accent)" }}
            >
              Plan a Visit
            </Link>
            <Link
              href="/beliefs"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition hover:-translate-y-0.5"
              style={{
                border: "2px solid var(--border-strong)",
                color: "var(--fg)",
              }}
            >
              What We Believe
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
