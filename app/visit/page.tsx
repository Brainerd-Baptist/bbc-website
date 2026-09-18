import Link from "next/link";
import Image from "next/image";
import { SERVICES, SERVICE_NOTE, CHILD_CARE, HISPANIC_MINISTRY } from "@/lib/constants";
import VideoHero from "@/components/visit/VideoHero";

export const metadata = {
  title: "Visit — Brainerd Baptist Church",
  description:
    "Plan your visit to Brainerd Baptist. Service times, location, child care, and what to expect on Sunday.",
};

const EXPECT_ITEMS = [
  {
    icon: "clock",
    title: "About 75 Minutes",
    desc: "Our services typically last around an hour and fifteen minutes — time in God's Word, prayer, and congregational worship.",
  },
  {
    icon: "music",
    title: "Congregational Worship",
    desc: "We prioritize the voices of the congregation. You will hear the church sing — not just a band perform.",
  },
  {
    icon: "book",
    title: "Expository Preaching",
    desc: "Every sermon works through a book of the Bible verse by verse. Bring your Bible, or use the pew Bibles.",
  },
  {
    icon: "people",
    title: "Come as You Are",
    desc: "You will find people in everything from jeans to Sunday best. There is no dress code — just come.",
  },
];

export default function VisitPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}>
      {/* Video hero */}
      <VideoHero />

      {/* Service times */}
      <section id="service-times" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-white text-3xl mb-2 text-center">
            Sunday Mornings
          </h2>
          <p className="text-white/50 text-center text-sm mb-10">
            Two worship services, Life Groups in between — all at 300 Brookfield Ave.
          </p>

          {/* Photo service cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 8:30 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
              <Image
                src="/visit/service-830am.jpg"
                alt="8:30 AM service — congregation in the sanctuary"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* dark gradient overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,16,30,0.92) 0%, rgba(7,16,30,0.45) 55%, rgba(7,16,30,0.15) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p
                  className="font-condensed font-900 text-white leading-none"
                  style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
                >
                  8:30 AM
                </p>
                <p className="font-condensed font-700 mt-1" style={{ color: "var(--gold)", fontSize: "1.05rem" }}>
                  Choir &amp; Orchestra
                </p>
              </div>
            </div>

            {/* 11:00 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
              <Image
                src="/visit/service-11am.jpg"
                alt="11:00 AM service — people engaged with open Bibles"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,16,30,0.92) 0%, rgba(7,16,30,0.45) 55%, rgba(7,16,30,0.15) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p
                  className="font-condensed font-900 text-white leading-none"
                  style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)" }}
                >
                  11:00 AM
                </p>
                <p className="font-condensed font-700 mt-1" style={{ color: "var(--gold)", fontSize: "1.05rem" }}>
                  Band-Led Worship
                </p>
              </div>
            </div>
          </div>

          {/* 9:45 Life Groups — photo banner */}
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 140 }}>
            <Image
              src="/visit/life-groups.jpg"
              alt="Life Groups — people gathered in a circle for Bible study"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(7,16,30,0.88) 0%, rgba(7,16,30,0.65) 60%, rgba(7,16,30,0.3) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--gold)" }}>
                9:45 AM · Between Services
              </p>
              <p className="text-white font-condensed font-700 text-xl">Life Groups</p>
              <p className="text-white/65 text-sm mt-1">Small-group Bible study for all ages — the best way to get connected beyond Sunday.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-bleed congregation photo break */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(220px, 35vw, 420px)" }}>
        <Image
          src="/visit/congregation-hero.jpg"
          alt="Congregation worshipping together on Sunday morning"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,16,30,0.55) 0%, rgba(7,16,30,0.15) 40%, rgba(7,16,30,0.15) 60%, rgba(7,16,30,0.65) 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <p className="font-condensed font-800 text-white" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            This is what Sunday looks like.
          </p>
        </div>
      </div>

      {/* What to expect */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-white text-3xl mb-10 text-center">
            What to Expect
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {EXPECT_ITEMS.map((item) => (
              <div key={item.title} className="glass rounded-2xl p-7">
                <h3 className="font-condensed font-700 text-white text-xl mb-2">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Child care */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-md rounded-2xl p-10">
            <h2 className="font-condensed font-800 text-white text-3xl mb-2">
              Child Care
            </h2>
            <div className="gold-divider mb-6" />
            <div className="grid sm:grid-cols-2 gap-4">
              {CHILD_CARE.map((c) => (
                <div key={c.age} className="glass rounded-xl p-5">
                  <p className="font-semibold text-white mb-1">{c.age}</p>
                  <p className="text-white/55 text-sm">{c.times}</p>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm mt-6">
              Our children&apos;s volunteers are background-checked and trained. Check-in opens
              30 minutes before each service.
            </p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-white text-3xl mb-8 text-center">
            Find Us
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Main */}
            <div className="glass rounded-2xl p-7">
              <p className="text-white font-semibold text-lg mb-1">Brainerd Baptist Church</p>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                300 Brookfield Ave<br />Chattanooga, TN 37411
              </p>
              <a
                href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411"
                target="_blank"
                rel="noopener noreferrer"
                className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-5 py-2.5 rounded-full transition-colors inline-block"
              >
                Get Directions
              </a>
            </div>

            {/* Hispanic */}
            <div className="glass rounded-2xl p-7 border-t-4 border-gold">
              <p className="eyebrow mb-3" style={{ color: "var(--gold)" }}>
                Ministerio Hispano · Hispanic Ministry
              </p>
              <p className="text-white font-semibold text-lg mb-1">Servicio en Español</p>
              <p className="text-white/55 text-sm leading-relaxed mb-1">
                {HISPANIC_MINISTRY.address}
              </p>
              <p className="text-white/55 text-sm mb-4">{HISPANIC_MINISTRY.serviceTime}</p>
              <p className="text-white/40 text-sm italic">
                Bienvenidos a nuestra familia. Un servicio de adoración en español — todos son bienvenidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-condensed font-800 text-white text-3xl mb-4">
            Ready to Visit?
          </h2>
          <p className="text-white/55 mb-8">
            Let us know you&apos;re coming — we&apos;d love to welcome you personally.
          </p>
          <Link
            href="/connect"
            className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-8 py-3.5 rounded-full transition-colors"
          >
            Send Us a Note
          </Link>
        </div>
      </section>
    </div>
  );
}
