import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { SERMONS } from "@/lib/sermons";

export default function SermonBand() {
  // Use the first (most recent) entry from the static sermon library as the
  // source of truth — YouTube uploads are full services, not titled sermons.
  const latest = SERMONS[0];

  const title     = latest.title;
  const videoId   = latest.youtubeId;
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const date      = new Date(latest.date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: "America/New_York",
  });
  const watchUrl  = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <section className="bg-white dark:bg-[#0d1525] section-pad border-b border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">Latest Sermon</p>
              <div className="blue-divider mb-5" />
              <h2 className="h-section text-[#00205B] dark:text-[#c8d4e8]">
                Hear from God&apos;s Word
              </h2>
            </div>
            <Link
              href="/sermons"
              className="text-sm font-semibold text-[#00abc9] hover:text-[#0090a8] transition-colors flex items-center gap-1.5 shrink-0"
            >
              All sermons
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h8M8 4l3 3-3 3"/>
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {/* Featured sermon card */}
        <ScrollReveal delay={100}>
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/8 shadow-lg shadow-black/5 dark:shadow-black/30">
            <div className="grid md:grid-cols-5">

              {/* Thumbnail / Play */}
              <div className="md:col-span-2 min-h-[240px] relative flex items-center justify-center bg-[#00205B]">
                {/* Real YouTube thumbnail */}
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={title}
                    fill
                    className="object-cover opacity-70"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    unoptimized // YouTube URLs bypass Next.js image optimizer
                  />
                ) : (
                  /* Fallback gradient when no thumbnail */
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, #00205B 0%, #001840 100%)" }}
                  />
                )}

                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-[#00205B]/40" />

                {/* Series chip */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[#00abc9] bg-black/30 border border-[#00abc9]/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    Latest
                  </span>
                </div>

                {/* Play button */}
                <a
                  href={watchUrl}
                  target={videoId ? "_blank" : undefined}
                  rel={videoId ? "noopener noreferrer" : undefined}
                  className="relative z-10"
                  aria-label={`Watch ${title} on YouTube`}
                >
                  <div className="w-16 h-16 rounded-full bg-[#00abc9] hover:bg-[#0090a8] flex items-center justify-center cursor-pointer transition-all shadow-lg shadow-[#00abc9]/40 hover:scale-105">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                </a>
              </div>

              {/* Info panel */}
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-[#162030]">
                <h3
                  className="font-condensed font-800 text-[#00205B] dark:text-[#c8d4e8] text-2xl md:text-3xl leading-tight mb-4"
                  style={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                >
                  {title}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-gray-400 dark:text-gray-500 text-sm mb-6">
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Curtis Hill
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {date}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#00abc9]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                    </svg>
                    {latest.passage}
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href={watchUrl}
                    target={videoId ? "_blank" : undefined}
                    rel={videoId ? "noopener noreferrer" : undefined}
                    className="btn-primary text-sm"
                  >
                    Watch Now
                  </a>
                  <Link
                    href="/sermons"
                    className="btn-outline-navy text-sm"
                  >
                    Browse All Series
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
