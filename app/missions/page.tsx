import Link from "next/link";
import type { Metadata } from "next";
import { IDENTITY } from "@/lib/identity-colors";
import WorldReachMap from "@/components/missions/WorldReachMap";
import MissionsContactForm from "@/components/missions/MissionsContactForm";

export const metadata: Metadata = {
  title: "Missions — Brainerd Baptist Church",
  description:
    "Brainerd Missions sends short-term and long-term teams and supports trusted partners around the world, trusting God to draw people to Christ from every nation, tribe, language, and people.",
};

export default function MissionsPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>
            East Ridge to the Ends of the Earth
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1 className="text-fg-on-dark mb-5 h-display">
            Brainerd Missions
          </h1>
          <p className="text-fg-on-dark-muted text-lg leading-relaxed max-w-2xl mx-auto">
            Every nation, tribe, language, and people gathered before Jesus —
            that&apos;s the picture we&apos;re working toward, together.
          </p>
        </div>
      </div>

      {/* ── Copy ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-1 w-16 rounded-full mb-8" style={{ background: IDENTITY.missions.hue }} />
          <p className="text-fg text-lg leading-relaxed">
            Brainerd Missions is rooted in the conviction of Scripture and the
            picture in Revelation of every nation, tribe, language, and
            people gathered before Jesus. Because there are still unreached
            peoples in the world, we see it as our mission and our joy to
            take the gospel to the ends of the earth. We do that by sending
            Brainerd members on short-term and long-term teams and by
            supporting trusted partners in places like Central and South
            America, Africa, Asia, and the Middle East, trusting that God
            uses these efforts to draw people to Christ.
          </p>
          <p className="text-fg text-lg leading-relaxed">
            At home, we pray and give in ways that fuel global missions. We
            want Brainerd to be a church that equips people to live sent,
            whether that&apos;s across the street or across the world, always
            with a humble dependence on God&apos;s guidance and God&apos;s
            strength.
          </p>
        </div>
      </section>

      {/* ── World Reach ──────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-3">Where We Serve</p>
            <h2 className="text-fg h-subsection">Partners around the world.</h2>
          </div>
          <WorldReachMap />
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-3">Get Involved</p>
            <h2 className="text-fg h-subsection mb-4">
              Contact the missions office.
            </h2>
            <p className="text-fg-muted leading-relaxed">
              Interested in joining a short-term team, or want to know more
              about how to support the ongoing work? Reach out — we&apos;d
              love to talk with you.
            </p>
          </div>
          <MissionsContactForm />
          <p className="text-center text-fg-muted text-sm mt-8">
            You can also email us directly at{" "}
            <a
              href="mailto:missions@brainerdbaptist.org"
              className="underline underline-offset-2 identity-ink hover:opacity-80"
              style={{ color: IDENTITY.missions.light }}
            >
              missions@brainerdbaptist.org
            </a>
          </p>
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
            Want to get connected first?
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
