import Image from "next/image";
import Link from "next/link";
import { STAFF_ROSTER, SPEAKERS, speakerSlug } from "@/lib/speakers";

export const metadata = {
  title: "About — Brainerd Baptist Church",
  description:
    "Established in 1928, Brainerd Baptist is a multi-generational community in Chattanooga, TN — gathered to worship, sent to serve, and committed to knowing and being known.",
};


const PILLARS = [
  {
    num: "01",
    heading: "Changed.",
    subheading: "New Creation in Christ",
    body: "Through the cross and resurrection of Jesus, people are changed — guilty to forgiven, death to life, darkness to light, outsider to child of God. Not a one-time decision filed away, but desires, habits, and whole lives remade by the ongoing work of the Holy Spirit. That's why Jesus came, and why Brainerd exists.",
  },
  {
    num: "02",
    heading: "Gathered.",
    subheading: "Known, Loved, and Prayed For",
    body: "Changed people are gathered around Jesus — with each other, not just on Sundays but as a regular part of life. On Sunday mornings that's two services, one Body, singing and praying and sitting under God's Word together. Through the week it's Life Groups, meals, and coffee — the slow, ordinary work of becoming a people who are truly known, loved, and prayed for by name.",
  },
  {
    num: "03",
    heading: "Called.",
    subheading: "Sent to Serve and to the Nations",
    body: "Changed and gathered people are called — not to themselves, but to the work God has for them, here and to the ends of the earth. That's members embracing the work right in front of them at Brainerd and across Chattanooga, and it's Brainerd members partnering with churches and missionaries around the world to carry the gospel to the nations — every dollar given, every trip taken, every prayer offered, for the glory of Jesus among all peoples.",
  },
];

// ── Heritage: what we've been given, organized the way Curtis
// preached it — fellowship/people, neighbors/community,
// property/resources, church planting, global partners. Real,
// specific items, not abstractions — see /about#heritage.
const HERITAGE = [
  {
    heading: "A school full of kids hearing about Jesus",
    body: "Brainerd Baptist School started as a ministry of this church. It's independent now, but its halls are still filled with kids all week — not just on Sunday — hearing about Jesus.",
  },
  {
    heading: "A building used almost every day",
    body: "The BX was built for health, wellness, ministry, and non-profit space. Most church buildings sit empty five or six days a week. Ours doesn't — it's in use almost every day.",
  },
  {
    heading: "A place for those who serve",
    body: "Three mission houses the Lord has provided give missionaries and ministry partners a place to live and work without that cost hanging over them.",
  },
  {
    heading: "Churches planted, not just funded",
    body: "Frawley Road, South Seminole, Salt River Community Church in Tempe, Red Letter Church in Southeast Asia, and North Georgia Fellowship — congregations that exist because this one was willing to send people out, not just grow in place.",
  },
  {
    heading: "Neighbors who worship alongside us",
    body: "Cambodian, Spanish-speaking, Arabic-speaking, and Ukrainian congregations all worship in connection with Brainerd — neighbors from around the world who've found a church home here.",
  },
];

// ── What We Believe: a short teaser, not a restatement of /beliefs.
// Three of the eight categories there — the core of the gospel itself —
// with a link out for anyone who wants the rest.
const BELIEFS_SUMMARY = [
  {
    heading: "Scripture",
    body: "The Bible is God's Word — fully true, fully sufficient, and the final authority for everything we believe and do.",
  },
  {
    heading: "God",
    body: "One God in three persons — Father, Son, and Holy Spirit — equal in nature, distinct in person, unified in purpose.",
  },
  {
    heading: "Salvation",
    body: "Every person is made in God's image and fallen by sin, in need of rescue. Jesus died in our place and rose again. Salvation is by grace through faith in him alone.",
  },
];

// Leadership teaser — pulls live from the same roster /staff uses, so this
// never drifts out of sync. Just the first handful, not the whole team.
const LEADERSHIP_TEASER = STAFF_ROSTER.slice(0, 6);

export default function AboutPage() {
  return (
    <div className="min-h-screen">

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
            It's what we pray every person who walks through these doors
            experiences: to be genuinely known by people, genuinely loved by
            them, and genuinely prayed for by name.
          </p>
        </div>
      </div>

      {/* ── Founded section ────────────────────────────────────── */}
      {/* id="founded" — the footer's "History" link (lib/constants.ts) points
          here as /about#founded; there's no separate /history page. */}
      <section id="founded" className="py-20 px-6 scroll-mt-24">
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
                Brainerd Baptist has called this corner of Chattanooga home
                since 1928. The city has changed a lot around us in that
                time. What hasn&apos;t changed is the reason we gather: the
                Word of God, the worship of Jesus, and the love of the saints
                for one another.
              </p>
              <p className="text-fg-muted leading-relaxed">
                We're simply a church — a multi-generational family of people
                raising kids, navigating hard seasons, and doing life
                together in the name of Jesus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ──────────────────────────────────────── */}
      <section
        className="py-24 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Our Vision</p>
          <h2
            className="font-condensed font-900 text-center mb-6"
            style={{
              color: "var(--fg)",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Changed.<br />
            <span style={{ color: "var(--accent-text)" }}>Gathered. Called.</span>
          </h2>
          <p className="text-fg-muted leading-relaxed text-center max-w-2xl mx-auto mb-16">
            Jesus changes us, so we gather around him together — and he calls
            every one of us into work only we can do. Here&apos;s what that
            looks like in the ordinary rhythms of this church.
          </p>

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
                  className="font-condensed font-800 mb-1"
                  style={{
                    color: "var(--fg)",
                    fontSize: "1.35rem",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {p.heading}
                </h3>
                <p
                  className="font-condensed font-700 tracking-wide uppercase text-xs mb-3"
                  style={{ color: "var(--accent-text)" }}
                >
                  {p.subheading}
                </p>
                <p className="text-fg-muted leading-relaxed text-sm">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stewarding Our Heritage ─────────────────────────────── */}
      {/* Real, specific evidence underneath the Three Pillars above —
          not a brag reel. See heritage-related sermon material: the
          question isn't "look what we built," it's "what will we do
          with what we were given." */}
      <section id="heritage" className="py-24 px-6 scroll-mt-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="eyebrow mb-4">Stewarding Our Heritage</p>
            <h2
              className="font-condensed font-900 mb-5"
              style={{
                color: "var(--fg)",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              We didn&apos;t invent this. We inherited it.
            </h2>
            <p className="text-fg-muted leading-relaxed">
              Our predecessors didn&apos;t build buildings to solve problems —
              they built to give Brainerd opportunities in the future. Nearly
              a century of faithfulness to the Word, to prayer, and to people
              got handed to us. Here&apos;s some of what that looks like today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
            {HERITAGE.map((h) => (
              <div key={h.heading}>
                <h3
                  className="font-condensed font-800 mb-2"
                  style={{ color: "var(--fg)", fontSize: "1.2rem", letterSpacing: "-0.01em" }}
                >
                  {h.heading}
                </h3>
                <p className="text-fg-muted leading-relaxed text-sm">{h.body}</p>
              </div>
            ))}

            {/* Global partners — reuses /membership's exact figures */}
            <div>
              <h3
                className="font-condensed font-800 mb-2"
                style={{ color: "var(--fg)", fontSize: "1.2rem", letterSpacing: "-0.01em" }}
              >
                A calling that reaches past this room
              </h3>
              <p className="text-fg-muted leading-relaxed text-sm mb-4">
                50+ global partners, a dozen families serving overseas, and a
                steady stream of our own people going out on mission trips
                year after year — supported because the calling God gave us
                was never just for the people who show up on Sunday.
              </p>
            </div>
          </div>

          <p className="text-fg-muted leading-relaxed text-center max-w-2xl mx-auto mt-14 pt-10 border-t border-border">
            None of it was given to us to put on a shelf. The question
            isn&apos;t how we preserve it — it&apos;s how we&apos;ll steward
            this heritage faithfully and fruitfully, for the people who come
            after us.
          </p>
        </div>
      </section>

      {/* ── What We Believe (summary — full detail lives at /beliefs) ── */}
      <section id="beliefs" className="py-24 px-6 scroll-mt-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="eyebrow mb-4">What We Believe</p>
            <h2
              className="font-condensed font-900 mb-5"
              style={{
                color: "var(--fg)",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              A few things we won&apos;t compromise on.
            </h2>
            <p className="text-fg-muted leading-relaxed">
              Everything else flows from these. If you&apos;re new, this is
              the honest place to start — not a sales pitch, just what we
              actually hold to.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {BELIEFS_SUMMARY.map((b) => (
              <div key={b.heading}>
                <h3
                  className="font-condensed font-800 mb-2"
                  style={{ color: "var(--fg)", fontSize: "1.2rem", letterSpacing: "-0.01em" }}
                >
                  {b.heading}
                </h3>
                <p className="text-fg-muted leading-relaxed text-sm">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/beliefs"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition hover:-translate-y-0.5 inline-block"
              style={{ border: "2px solid var(--border-strong)", color: "var(--fg)" }}
            >
              Read the Rest of What We Believe
            </Link>
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
      <section className="py-20 px-6">
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

      {/* ── Leadership teaser — live from the /staff roster ───────── */}
      <section id="leadership" className="py-20 px-6 scroll-mt-24 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="eyebrow mb-4">Who Leads This</p>
            <h2
              className="font-condensed font-900 mb-5"
              style={{
                color: "var(--fg)",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              People you can reach out to.
            </h2>
            <p className="text-fg-muted leading-relaxed">
              Whatever ministry fits where you are, there's a person leading
              it you can actually meet.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-10">
            {LEADERSHIP_TEASER.map((name) => {
              const info = SPEAKERS[name];
              if (!info) return null;
              return (
                <Link key={name} href={`/speakers/${speakerSlug(name)}`} className="group">
                  <div
                    className="relative w-full overflow-hidden rounded-2xl mb-2"
                    style={{ aspectRatio: "4/5" }}
                  >
                    {info.photo ? (
                      <Image
                        src={`/staff/${info.photo}.jpg`}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 33vw, 16vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xl font-bold text-fg-subtle"
                        style={{ background: "var(--surface-sunken)" }}
                      >
                        {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <p className="text-fg text-xs font-semibold leading-snug group-hover:text-accent-text transition-colors">
                    {name}
                  </p>
                  <p className="text-fg-muted text-[11px] mt-0.5">{info.title}</p>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/staff"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition hover:-translate-y-0.5 inline-block"
              style={{ border: "2px solid var(--border-strong)", color: "var(--fg)" }}
            >
              Meet the Whole Team
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pastor quote ───────────────────────────────────────── */}
      <section
        className="py-20 px-6"
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
      <section className="py-24 px-6 text-center">
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
              href="/membership"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition hover:-translate-y-0.5"
              style={{
                border: "2px solid var(--border-strong)",
                color: "var(--fg)",
              }}
            >
              Take a Next Step
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
