import Link from "next/link";
import ScriptureRef from "@/components/beliefs/ScriptureRef";

export const metadata = {
  title: "Membership — Brainerd Baptist Church",
  description:
    "What membership means at Brainerd Baptist Church — being changed, gathered, and called together — and how to take the next step toward joining.",
};

// ── Thin-line SVG icons (matches /beliefs) ───────────────────────────
function IconSeed() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeWidth="1.75" style={{ stroke: "var(--accent)" }} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 36V20" />
      <path d="M20 20C20 11 13 8 7 8c0 8 4 13 13 13Z" />
      <path d="M20 20c0-7 5-10 11-10 0 7-3 11-11 11Z" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeWidth="1.75" style={{ stroke: "var(--accent)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="12" r="4" />
      <circle cx="26" cy="12" r="4" />
      <path d="M4 34c0-7 4-12 10-12h12c6 0 10 5 10 12" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeWidth="1.75" style={{ stroke: "var(--accent)" }} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="15" />
      <path d="M26 14l-4 10-10 4 4-10z" />
    </svg>
  );
}

// ── Three-pillar data (anchors only — not the full class) ───────────
const PILLARS = [
  {
    icon: <IconSeed />,
    title: "Changed",
    body: "Brainerd is a family of people who have been — and are being — changed by Jesus. Personal repentance and faith in what God has done through Christ's life, death, resurrection, and rule is at the heart of it. Baptism follows that change as a believer's public profession of faith.",
    verse: "Acts 16:31 · Ephesians 2:8–9 · Romans 6:1–4",
  },
  {
    icon: <IconPeople />,
    title: "Gathered",
    body: "We gather because we need each other, and because we need shepherding. That happens in layers — Sunday worship, Life Groups, and the everyday rhythms of serving and caring for one another — with pastors, deacons, staff, and teams all playing a part.",
    verse: "John 13:34–35 · Ephesians 4:11–16 · 1 Peter 5",
  },
  {
    icon: <IconCompass />,
    title: "Called",
    body: "Membership isn't signing up for benefits, like a club or a rewards program. It's committing to the calling God has placed on this church — a calling with a redemptive nature, a clear direction, a neighborly-to-global location, and a unity we only find together.",
    verse: "2 Corinthians 1 · Colossians 1 · Galatians 6",
  },
];

const STATS = [
  { value: "12", label: "families currently serving overseas" },
  { value: "50+", label: "global partners we support" },
  { value: "109", label: "members sent on a trip last year" },
];

const READING = [
  "Why Should I Join a Church?",
  "How Can I Serve My Church?",
  "Why Should I Be Baptized?",
];

const STEPS = [
  {
    title: "Attend Membership Matters",
    body: "A single evening that walks through what we believe, how we gather, and what it looks like to be called together as a church family.",
  },
  {
    title: "Mark your path",
    body: "Ready to join, have a few questions first, sensing it's time to be baptized, or just not ready yet — all four are welcome, and there's no pressure either way.",
  },
  {
    title: "Membership interview",
    body: "A staff member follows up within the week for an unhurried conversation — not an interrogation — about your story and how God's led you here.",
  },
  {
    title: "Join the family",
    body: "Begin partnering as a covenant member — praying, serving, giving, and gathering alongside this church.",
  },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center" style={{ background: "var(--color-brand-navy)" }}>
        <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>Membership Matters</p>
        <h1
          className="font-condensed font-900 text-fg-on-dark"
          style={{ fontSize: "clamp(3rem, 9vw, 5.5rem)", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          You Belong Here
        </h1>
        <p className="text-fg-on-dark-muted mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          Membership at Brainerd isn&apos;t a formality or a club — it&apos;s a partnership.
          Here&apos;s what that means, and how to take the next step.
        </p>
      </section>

      {/* ── Big Prayer ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-surface-sunken border-b border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">Our Big Prayer</p>
          <p
            className="font-condensed font-700 text-fg leading-snug"
            style={{ fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)", letterSpacing: "-0.01em" }}
          >
            That by the Spirit&apos;s work in us together, more — and more — people
            would experience and enjoy all the grace that God has for them in Jesus.
          </p>
        </div>
      </section>

      {/* ── Three pillars ──────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden isolate">
        <div className="bx-bloom bx-bloom-under" aria-hidden="true" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 max-w-xl mx-auto">
            <p className="eyebrow mb-4">A Family of People</p>
            <h2 className="h-section text-fg">
              Changed. Gathered. Called.
            </h2>
            <p className="text-fg-muted text-sm leading-relaxed mt-4">
              Three ways we describe who we are as a church — and what it means
              to be part of this family.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p) => {
              const refs = p.verse.split(" · ");
              return (
                <div key={p.title} className="p-7 rounded-2xl glass-frost glass-static">
                  <div className="mb-4">{p.icon}</div>
                  <h3
                    className="font-condensed font-800 text-fg mb-3"
                    style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-fg-muted text-sm leading-relaxed mb-4">{p.body}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {refs.map((ref, i) => (
                      <span key={ref} className="flex items-center gap-3">
                        <ScriptureRef reference={ref} />
                        {i < refs.length - 1 && (
                          <span className="text-fg-subtle text-xs select-none">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Called: mission stats ──────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "var(--brand-band)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow-white mb-4">Part of Something Bigger</p>
          <h2 className="h-section text-fg-on-dark mb-10">
            Our calling reaches further than this room
          </h2>
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  className="font-condensed font-900 text-fg-on-dark"
                  style={{ fontSize: "clamp(2rem, 6vw, 3rem)", lineHeight: 1 }}
                >
                  {s.value}
                </p>
                <p className="text-fg-on-dark-muted text-xs mt-2 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What membership is / isn't ─────────────────────── */}
      <section className="py-20 px-6 border-b border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="font-condensed font-700 text-fg leading-snug"
            style={{ fontSize: "clamp(1.3rem, 3vw, 1.7rem)", letterSpacing: "-0.01em" }}
          >
            &ldquo;Membership isn&apos;t signing up for a club, like Costco or the
            YMCA. It isn&apos;t an attempt to earn rewards points over time.
            It&apos;s committing to the calling God has for His church — and
            every member has gifts He wants to use.&rdquo;
          </p>
        </div>
      </section>

      {/* ── Beliefs + Covenant teaser ───────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden isolate">
        <div className="bx-bloom bx-bloom-under" aria-hidden="true" />
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-7 rounded-2xl glass-frost glass-static">
            <h3 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.3rem" }}>
              Core Beliefs
            </h3>
            <p className="text-fg-muted text-sm leading-relaxed mb-4">
              We hold to the Baptist Faith &amp; Message 2000. Christians have
              always had different views on plenty of secondary things, but
              some beliefs are at the center for us — Scripture, the Trinity,
              the person and work of Jesus, the Holy Spirit, God&apos;s design
              for humanity, salvation through Christ alone, and His bodily
              return.
            </p>
            <Link href="/beliefs" className="text-sm font-semibold text-accent-text hover:underline">
              See what we believe →
            </Link>
          </div>
          <div className="p-7 rounded-2xl glass-frost glass-static">
            <h3 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.3rem" }}>
              The Membership Covenant
            </h3>
            <p className="text-fg-muted text-sm leading-relaxed mb-4">
              Members renew a covenant with each other — to walk in love,
              watch over and encourage one another, keep gathering together,
              disciple our kids, bear each other&apos;s burdens, and give
              cheerfully toward the church&apos;s work. We&apos;ll walk through
              the full covenant together at your membership interview.
            </p>
            <Link href="/connect/next-step" className="text-sm font-semibold text-accent-text hover:underline">
              Ask about the covenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Path to membership ──────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-sunken">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">The Process</p>
            <h2 className="h-section text-fg">The Path to Membership</h2>
          </div>
          <ol className="space-y-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-condensed font-800 text-accent-text"
                  style={{ background: "var(--accent-bg)" }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-fg text-base mb-1">{s.title}</h3>
                  <p className="text-fg-muted text-sm leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Suggested reading ───────────────────────────────── */}
      <section className="py-16 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">Want to Go Deeper?</p>
          <p className="text-fg-muted text-sm leading-relaxed mb-6">
            A few short books we hand out at Membership Matters, if you&apos;d
            like to read ahead or go back over it afterward:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {READING.map((title) => (
              <span
                key={title}
                className="text-sm font-medium text-fg px-4 py-2 rounded-full border border-border bg-surface-raised"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: "var(--color-brand-navy)" }}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-condensed font-800 text-fg-on-dark mb-4" style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)" }}>
            Ready to Take the Next Step?
          </h2>
          <p className="text-fg-on-dark-muted text-sm leading-relaxed mb-8">
            Whether you&apos;re ready to join, still have questions, or want to
            talk about baptism first — let us know and someone from our team
            will follow up within the week. Ask at Connect, or reach out below.
          </p>
          <Link href="/connect/next-step" className="btn-primary text-sm inline-block">
            Take the Next Step
          </Link>
        </div>
      </section>

    </div>
  );
}
