import Link from "next/link";
import Countdown from "./Countdown";
import ScrollReveal from "./ScrollReveal";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* ── Background: photo + gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #00205B 0%, #001840 50%, #00abc9 200%)",
        }}
      />
      {/* Photo will go here once loaded — swap the div above for:
          <Image src="/photos/hero.jpg" alt="Worship at Brainerd Baptist" fill className="object-cover" priority />
          and keep the overlay div below */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,20,60,0.92) 0%, rgba(0,20,60,0.55) 50%, rgba(0,20,60,0.20) 100%)",
        }}
      />

      {/* ── Triangle accent (brand motif) ── */}
      <div
        className="absolute top-0 right-0 opacity-10 pointer-events-none"
        style={{ width: "55vw", maxWidth: 700, aspectRatio: "1 / 1" }}
      >
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="300,40 580,520 20,520" fill="#00abc9" />
          {/* Inner white triangle for the BBC "A" motif */}
          <polygon points="300,120 480,460 120,460" fill="#ffffff" />
          <polygon points="300,200 400,390 200,390" fill="#00abc9" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="eyebrow-white mb-4">Sundays in Chattanooga</p>

          {/* Headline */}
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{ fontSize: "clamp(3.2rem, 8vw, 5.5rem)", letterSpacing: "-0.01em" }}
          >
            A place for{" "}
            <span className="text-[#00abc9]">every person.</span>
          </h1>

          {/* Supporting text */}
          <p
            className="text-white/70 leading-relaxed mb-8 max-w-lg"
            style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontStyle: "italic" }}
          >
            &ldquo;Our big prayer is that more and more people would experience
            and enjoy all the grace that God has for them in Jesus Christ.&rdquo;
          </p>

          {/* Service times — quick reference */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00abc9]" />
              <span className="text-white/80 text-sm">8:30 AM · Choir & Orchestra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00abc9]" />
              <span className="text-white/80 text-sm">11:00 AM · Band-Led</span>
            </div>
          </div>

          {/* Countdown */}
          <p className="text-white/40 text-xs tracking-widest uppercase mb-3">
            Next service in
          </p>
          <Countdown />

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/visit" className="btn-primary shadow-lg shadow-[#00abc9]/25">
              Plan Your Visit
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </Link>
            <Link href="/sermons" className="btn-outline-white">
              Watch Sermons
            </Link>
          </div>

          {/* Address */}
          <p className="text-white/35 text-xs mt-8 tracking-wide">
            300 Brookfield Ave · Chattanooga, TN 37411
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
