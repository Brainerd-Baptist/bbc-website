import Link from "next/link";
import Image from "next/image";
import { CHILD_CARE, HISPANIC_MINISTRY } from "@/lib/constants";
import VideoHero from "@/components/visit/VideoHero";
import SundayWalkthrough from "@/components/visit/SundayWalkthrough";
import SundayPlanner from "@/components/visit/SundayPlanner";
import ConnectForm from "@/components/connect/ConnectForm";

export const metadata = {
  title: "Visit — Brainerd Baptist Church",
  description:
    "Plan your visit to Brainerd Baptist. Service times, location, child care, and what to expect on Sunday.",
};

const EXPECT_ITEMS = [
  {
    num: "01",
    title: "About 75 Minutes",
    desc: "Time in God's Word, prayer, and congregational worship. Never rushed — never dragged out.",
  },
  {
    num: "02",
    title: "Congregational Worship",
    desc: "You will hear the church sing — not just a band perform. We prioritize the voices of the room.",
  },
  {
    num: "03",
    title: "Expository Preaching",
    desc: "Every sermon works through a book of the Bible verse by verse. Bring your Bible, or use the pew Bibles.",
  },
  {
    num: "04",
    title: "Come as You Are",
    desc: "We're not thinking about what you're wearing — we're eager to learn your name and hear your story.",
  },
];

export default function VisitPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Video hero — stays dark by design */}
      <VideoHero />

      {/* ── Service times ──────────────────────────────────── */}
      <section id="service-times" className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Sunday Mornings</p>
          <h2
            className="font-condensed font-900 text-fg text-center mb-4"
            style={{ fontSize: "clamp(3rem, 8vw, 5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            Sunday Services
          </h2>
          <p className="text-fg-muted text-center mb-14 max-w-sm mx-auto">
            Both at 300 Brookfield Ave — Life Groups meet between services at 9:45.
          </p>

          {/* Photo service cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 8:30 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
              <Image
                src="/visit/service-830am.jpg"
                alt="8:30 AM service — congregation in the sanctuary"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,16,30,0.95) 0%, rgba(7,16,30,0.4) 50%, rgba(7,16,30,0.1) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-condensed font-900 text-fg-on-dark leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
                  8:30 AM
                </p>
                <p className="font-condensed font-700 mt-2" style={{ color: "var(--accent)", fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                  Choir &amp; Orchestra
                </p>
              </div>
            </div>

            {/* 11:00 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
              <Image
                src="/visit/service-11am.jpg"
                alt="11:00 AM service — people engaged with open Bibles"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,16,30,0.95) 0%, rgba(7,16,30,0.4) 50%, rgba(7,16,30,0.1) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-condensed font-900 text-fg-on-dark leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
                  11:00 AM
                </p>
                <p className="font-condensed font-700 mt-2" style={{ color: "var(--accent)", fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                  Band Led
                </p>
              </div>
            </div>
          </div>

          {/* 9:45 Life Groups — photo banner */}
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 150 }}>
            <Image
              src="/visit/life-groups.jpg"
              alt="Life Groups — people gathered in a circle for Bible study"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(7,16,30,0.92) 0%, rgba(7,16,30,0.65) 55%, rgba(7,16,30,0.2) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
                9:45 AM · Between Services
              </p>
              <p className="text-fg-on-dark font-condensed font-800 text-2xl">Life Groups</p>
              <p className="text-fg-on-dark-muted text-sm mt-1">Small-group Bible study for all ages — the best way to get connected beyond Sunday.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo collage ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1" style={{ height: "clamp(260px, 36vw, 440px)" }}>
        <div className="relative overflow-hidden">
          <Image src="/visit/congregation-hero.jpg" alt="Congregation on Sunday morning" fill className="object-cover object-center" sizes="25vw" />
        </div>
        <div className="relative overflow-hidden">
          <Image src="/carousel/students-1.jpg" alt="Student ministry worship" fill className="object-cover object-center" sizes="25vw" />
        </div>
        <div className="relative overflow-hidden">
          <Image src="/carousel/music-camp-2.jpg" alt="Brainerd Kids" fill className="object-cover object-center" sizes="25vw" />
        </div>
        <div className="relative overflow-hidden">
          <Image src="/carousel/life-groups-1.jpg" alt="Community at Brainerd Baptist" fill className="object-cover object-top" sizes="25vw" />
        </div>
      </div>

      {/* ── Sunday Planner ─────────────────────────────────── */}
      <SundayPlanner />

      {/* ── Sunday walkthrough ─────────────────────────────── */}
      <SundayWalkthrough />

      {/* ── What to expect ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Before You Arrive</p>
          <h2
            className="font-condensed font-900 text-fg text-center mb-16"
            style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            What to Expect
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {EXPECT_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-5 p-6 rounded-2xl border border-border bg-surface-raised hover:border-accent/30 transition-colors">
                <span
                  className="font-condensed font-900 leading-none flex-shrink-0 mt-0.5"
                  style={{ fontSize: "2.5rem", color: "var(--accent-text)", opacity: 0.35, letterSpacing: "-0.03em" }}
                >
                  {item.num}
                </span>
                <div>
                  <h3 className="font-condensed font-800 text-fg mb-2" style={{ fontSize: "1.35rem", letterSpacing: "-0.01em" }}>
                    {item.title}
                  </h3>
                  <p className="text-fg-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Worship Care of Kids ───────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Your Kids Matter Here</p>
          <h2
            className="font-condensed font-900 text-fg text-center mb-4"
            style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            Worship Care for Kids
          </h2>
          <p className="text-fg-muted text-center mb-14 max-w-md mx-auto">
            Safe, age-appropriate care so you can worship fully and your kids love coming.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {CHILD_CARE.map((c) => (
              <div key={c.age} className="bg-surface-raised rounded-2xl p-7 border-l-4 border-accent shadow-sm">
                <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.35rem" }}>{c.age}</p>
                <p className="text-fg-muted text-sm">{c.times}</p>
              </div>
            ))}
          </div>
          <p className="text-fg-muted text-sm text-center">
            All volunteers are background-checked and trained. Check-in opens 30 minutes before each service.
          </p>
        </div>
      </section>

      {/* ── Find Us ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Getting Here</p>
          <h2
            className="font-condensed font-900 text-fg text-center mb-16"
            style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            Find Us
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 border border-border bg-surface-raised">
              <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.35rem" }}>Brainerd Baptist Church</p>
              <p className="text-fg-muted text-sm leading-relaxed mb-6">
                300 Brookfield Ave<br />Chattanooga, TN 37411
              </p>
              <a
                href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-6 py-3 rounded-full transition-colors"
              >
                Get Directions
              </a>
            </div>

            <div className="rounded-2xl p-8 border-t-4 border-accent border border-border bg-surface-raised">
              <p className="eyebrow mb-3">Ministerio Hispano · Hispanic Ministry</p>
              <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.35rem" }}>Servicio en Español</p>
              <p className="text-fg-muted text-sm leading-relaxed mb-1">{HISPANIC_MINISTRY.address}</p>
              <p className="text-fg-muted text-sm mb-5">{HISPANIC_MINISTRY.serviceTime}</p>
              <p className="text-fg-muted text-sm italic">
                Bienvenidos a nuestra familia. Un servicio de adoración en español — todos son bienvenidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Connect form ───────────────────────────────────── */}
      <section id="connect" className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="eyebrow mb-4">Questions? Reach Out.</p>
          <h2
            className="font-condensed font-900 text-fg mb-4"
            style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            We'd love to hear from you.
          </h2>
          <p className="text-fg-muted max-w-md mx-auto">
            First-time visitor, longtime member, or somewhere in between — our team wants to connect with you.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <ConnectForm />
        </div>
      </section>

      {/* ── CTA — navy close ───────────────────────────────── */}
      <section className="py-24 px-6 text-center" style={{ background: "var(--color-brand-navy)" }}>
        <div className="max-w-xl mx-auto">
          <h2
            className="font-condensed font-900 text-fg-on-dark mb-4"
            style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            Ready to Visit?
          </h2>
          <p className="text-fg-on-dark-muted mb-10 max-w-sm mx-auto">
            Let us know you're coming — we'd love to welcome you personally.
          </p>
          <Link
            href="/connect"
            className="inline-block font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-10 py-4 rounded-full transition-colors"
          >
            Send Us a Note
          </Link>
        </div>
      </section>
    </div>
  );
}
