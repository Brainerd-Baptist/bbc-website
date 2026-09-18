import Link from "next/link";

export const metadata = {
  title: "Sermons — Brainerd Baptist Church",
  description:
    "Listen to sermons from Brainerd Baptist Church. Expository preaching through books of the Bible.",
};

// Phase 3: pull from PCO Publishing / Sanity CMS
const SERMONS = [
  { id: "1", series: "Grace Upon Grace", title: "The God Who Keeps His Promises", speaker: "Curtis Hill", date: "September 14, 2026", passage: "Romans 8:28–39", duration: "42 min" },
  { id: "2", series: "Grace Upon Grace", title: "Justified by Faith", speaker: "Curtis Hill", date: "September 7, 2026", passage: "Romans 5:1–11", duration: "38 min" },
  { id: "3", series: "Grace Upon Grace", title: "No Condemnation", speaker: "Curtis Hill", date: "August 31, 2026", passage: "Romans 8:1–11", duration: "45 min" },
  { id: "4", series: "Grace Upon Grace", title: "The Spirit of Adoption", speaker: "Curtis Hill", date: "August 24, 2026", passage: "Romans 8:12–17", duration: "40 min" },
  { id: "5", series: "Psalms of Ascent", title: "Our Help Comes From the Lord", speaker: "Curtis Hill", date: "August 17, 2026", passage: "Psalm 121", duration: "36 min" },
  { id: "6", series: "Psalms of Ascent", title: "Unless the Lord Builds the House", speaker: "Curtis Hill", date: "August 10, 2026", passage: "Psalm 127", duration: "41 min" },
];

export default function SermonsPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}>
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Hear from God&apos;s Word</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Sermons
          </h1>
          <p className="text-white/55 text-lg leading-relaxed">
            Every sermon works through a book of the Bible verse by verse. Listen
            wherever you are, whenever you need it.
          </p>
        </div>
      </div>

      {/* Filter bar (Phase 3 — functional search/filter) */}
      <div className="px-6 mb-8">
        <div className="max-w-5xl mx-auto glass rounded-xl px-5 py-3 flex flex-wrap gap-3 items-center">
          <span className="text-white/30 text-xs font-semibold tracking-widest uppercase">Filter</span>
          {["All Series", "All Speakers", "All Topics", "All Passages"].map((f) => (
            <button
              key={f}
              className="text-white/50 text-xs font-semibold tracking-wide uppercase hover:text-gold transition-colors border border-white/10 rounded-full px-3 py-1.5"
            >
              {f}
            </button>
          ))}
          <span className="text-white/20 text-xs ml-auto">Search — coming in Phase 3</span>
        </div>
      </div>

      {/* Sermon list */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {SERMONS.map((s) => (
            <div key={s.id} className="glass rounded-2xl overflow-hidden group hover:bg-white/10 transition-all">
              <div className="grid sm:grid-cols-[80px_1fr] items-stretch">
                {/* Play zone */}
                <div
                  className="hidden sm:flex items-center justify-center min-h-[80px]"
                  style={{ background: "rgba(201,168,76,0.08)" }}
                >
                  <div className="w-10 h-10 rounded-full bg-gold/80 group-hover:bg-gold flex items-center justify-center transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-1">{s.series}</p>
                    <h3 className="font-condensed font-700 text-white text-lg leading-tight">{s.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/40 text-xs mt-1">
                      <span>{s.speaker}</span>
                      <span>{s.date}</span>
                      <span>{s.passage}</span>
                      <span>{s.duration}</span>
                    </div>
                  </div>
                  <button className="sm:self-center shrink-0 font-condensed font-700 tracking-wide uppercase text-xs border border-white/15 hover:border-gold/40 text-white/60 hover:text-gold px-4 py-2 rounded-full transition-all">
                    Listen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Podcast CTA */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-3">Subscribe</p>
          <h2 className="font-condensed font-800 text-white text-2xl md:text-3xl mb-4">
            Listen Anywhere
          </h2>
          <p className="text-white/55 text-sm mb-6">
            The Brainerd Baptist sermon podcast is available wherever you listen.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Apple Podcasts", "Spotify", "Pocket Casts"].map((p) => (
              <button
                key={p}
                className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-gold/40 text-white/70 hover:text-gold px-5 py-2.5 rounded-full transition-all glass"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
