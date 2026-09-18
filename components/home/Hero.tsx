import Link from "next/link";
import Countdown from "./Countdown";

export default function Hero() {
  return (
    <section className="relative min-h-screen grid md:grid-cols-2">
      {/* Left — text panel */}
      <div
        className="relative flex flex-col justify-end pb-16 pt-32 px-8 md:px-14 lg:px-20"
        style={{ background: "linear-gradient(160deg, #0a1628 60%, #0f2040 100%)" }}
      >
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-gold to-transparent opacity-30" />

        <div className="max-w-lg">
          {/* Eyebrow */}
          <p className="eyebrow mb-4">
            Sundays · 8:30 &amp; 11:00 AM
          </p>

          {/* Headline */}
          <h1
            className="font-condensed font-900 text-white leading-none mb-6"
            style={{ fontSize: "clamp(3rem, 7vw, 5rem)" }}
          >
            A Church Family<br />
            <span
              className="font-serif font-400 italic"
              style={{ color: "var(--gold)", fontSize: "0.85em" }}
            >
              in Chattanooga
            </span>
          </h1>

          {/* Quote */}
          <p className="font-serif italic text-white/70 text-lg leading-relaxed mb-8 max-w-md">
            "Our big prayer is that more and more people would experience and
            enjoy all the grace that God has for them in Jesus Christ."
          </p>

          {/* Countdown */}
          <p className="text-xs text-white/40 tracking-widest uppercase mb-3">
            Next Sunday in
          </p>
          <Countdown />

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-7 py-3 rounded-full transition-colors"
            >
              Plan Your Visit
            </Link>
            <Link
              href="/sermons"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-white px-7 py-3 rounded-full transition-colors glass"
            >
              Watch Sermons
            </Link>
          </div>

          {/* Address */}
          <p className="text-white/35 text-xs mt-8">
            300 Brookfield Ave · Chattanooga, TN 37411
          </p>
        </div>
      </div>

      {/* Right — photo panel */}
      <div
        className="relative min-h-[40vh] md:min-h-0 overflow-hidden"
        style={{ background: "#07101e" }}
      >
        {/* Replace src with your actual photo once images are set up */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-mid to-navy-deep" />
        {/* Photo overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-transparent to-transparent md:from-navy/60" />
        {/* Placeholder — swap with Next/Image once images are in /public */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/20 text-sm font-condensed uppercase tracking-widest">
            Worship Photo
          </p>
        </div>
      </div>
    </section>
  );
}
