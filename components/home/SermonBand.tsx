import Link from "next/link";

// Placeholder — in Phase 3 this pulls from Sanity/PCO Publishing via API
const FEATURED_SERMON = {
  series: "Grace Upon Grace",
  title: "The God Who Keeps His Promises",
  speaker: "Curtis Hill",
  date: "September 14, 2026",
  passage: "Romans 8:28–39",
  duration: "42 min",
};

export default function SermonBand() {
  return (
    <section
      className="py-20 px-6"
      style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow mb-3">Latest Sermon</p>
            <div className="gold-divider mb-6" />
            <h2
              className="font-condensed font-800 text-white"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
            >
              Hear from God&apos;s Word
            </h2>
          </div>
          <Link
            href="/sermons"
            className="text-sm font-semibold text-gold hover:text-gold-light transition-colors flex items-center gap-2 shrink-0"
          >
            All sermons
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7h8M8 4l3 3-3 3"/>
            </svg>
          </Link>
        </div>

        {/* Featured sermon card */}
        <div className="glass-md rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-5">
            {/* Photo placeholder */}
            <div
              className="md:col-span-2 min-h-[220px] relative flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0a1628 0%, #122540 100%)" }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <p className="text-white text-xs font-condensed uppercase tracking-widest">Sermon Photo</p>
              </div>
              {/* Play button */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-gold/90 hover:bg-gold flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center">
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-2">
                {FEATURED_SERMON.series}
              </p>
              <h3 className="font-condensed font-800 text-white text-2xl md:text-3xl leading-tight mb-4">
                {FEATURED_SERMON.title}
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-white/50 text-sm mb-6">
                <span>{FEATURED_SERMON.speaker}</span>
                <span>{FEATURED_SERMON.date}</span>
                <span>{FEATURED_SERMON.passage}</span>
                <span>{FEATURED_SERMON.duration}</span>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/sermons"
                  className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-6 py-2.5 rounded-full transition-colors"
                >
                  Listen
                </Link>
                <Link
                  href="/sermons"
                  className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-white px-6 py-2.5 rounded-full transition-colors"
                >
                  All Series
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
