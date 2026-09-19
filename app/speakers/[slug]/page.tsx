import { notFound } from "next/navigation";
import Image from "next/image";
import { SPEAKERS, speakerFromSlug, getSpeaker, speakerSlug } from "@/lib/speakers";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getAllSermons } from "@/lib/sanity";
import EmailButton from "@/components/ui/EmailButton";

export const revalidate = 300;

export async function generateStaticParams() {
  return Object.keys(SPEAKERS).map((name) => ({ slug: speakerSlug(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = speakerFromSlug(slug);
  if (!name) return {};
  const info = getSpeaker(name);
  return {
    title: `${name} — Brainerd Baptist Church`,
    description: `${info.title} at Brainerd Baptist Church. Sermons and messages from ${name}.`,
  };
}

export default async function SpeakerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = speakerFromSlug(slug);
  if (!name) notFound();

  const info = getSpeaker(name);

  // Collect sermons — Sanity first, then fill in static ones not already covered
  const sanityAll = await getAllSermons().catch(() => []);
  const sanityBySpeaker = sanityAll.filter((s) => s.speaker === name);

  const staticBySpeaker = SERMONS.filter((s) => s.speaker === name);

  // Normalise to a common shape
  type SermonRow = {
    slug: string;
    title: string;
    series: string;
    passage: string;
    date: string;
    youtubeId: string;
    duration?: string;
    accentColor: string;
  };

  const sanityRows: SermonRow[] = sanityBySpeaker.map((s) => ({
    slug: s.slug?.current ?? "",
    title: s.title,
    series: s.series?.title ?? "",
    passage: s.passage ?? "",
    date: s.date ?? "",
    youtubeId: s.youtubeId ?? "",
    duration: s.duration,
    accentColor: s.series?.accentColor ?? "#00abc9",
  }));

  const sanitySlugSet = new Set(sanityRows.map((r) => r.slug));

  const staticRows: SermonRow[] = staticBySpeaker
    .filter((s) => !sanitySlugSet.has(s.id))
    .map((s) => ({
      slug: s.id,
      title: s.title,
      series: s.series,
      passage: s.passage,
      date: s.date,
      youtubeId: s.youtubeId,
      duration: s.duration,
      accentColor: "#00abc9",
    }));

  const sermons: SermonRow[] = [...sanityRows, ...staticRows].sort(
    (a, b) => (b.date > a.date ? 1 : -1)
  );

  const hasSermons = sermons.length > 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}
    >
      {/* ── Back link ─────────────────────────────────────────────────── */}
      <div className="pt-24 pb-0 px-5 md:px-8">
        <div className="max-w-4xl mx-auto">
          <a
            href="/sermons"
            className="inline-flex items-center gap-2 text-white/35 hover:text-white/60 text-sm transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            All Sermons
          </a>
        </div>
      </div>

      {/* ── Speaker header ────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-7 md:gap-10">

            {/* Photo */}
            {info.photo ? (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl">
                <Image
                  src={`/staff/${info.photo}.jpg`}
                  alt={name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            ) : (
              <div
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl font-bold"
                style={{ background: "rgba(0,171,201,0.12)", color: "#00abc9" }}
              >
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
            )}

            {/* Name / title / bio */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#00abc9] mb-2">
                {info.title}
              </p>
              <h1
                className="text-white mb-1"
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                {name}
              </h1>
              <p className="text-white/30 text-sm mb-4">Brainerd Baptist Church</p>

              {info.email && (
                <div className="mb-5">
                  <EmailButton email={info.email} name={name} />
                </div>
              )}

              {info.bio && info.bio.length > 0 && (
                <div className="space-y-3 max-w-2xl">
                  {info.bio.map((para, i) => (
                    <p key={i} className="text-white/60 text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {hasSermons && (
                <p className="text-white/25 text-xs mt-5 font-medium">
                  {sermons.length} sermon{sermons.length !== 1 ? "s" : ""} at Brainerd Baptist
                </p>
              )}
            </div>
          </div>

          {/* Family photo */}
          {info.familyPhoto && (
            <div className="mt-10 max-w-2xl">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25 mb-4">
                Family
              </p>
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "420px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.familyPhoto}
                  alt={info.familyPhotoAlt ?? `${name}'s family`}
                  className="w-full object-cover object-center"
                  style={{ maxHeight: "420px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sermons ───────────────────────────────────────────────────── */}
      {hasSermons && (
        <div className="px-5 md:px-8 pb-24 border-t border-white/6 pt-10">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-6">
              Sermons
            </p>

            <div className="space-y-2">
              {sermons.map((s) => {
                const thumbUrl = s.youtubeId
                  ? `https://img.youtube.com/vi/${s.youtubeId}/maxresdefault.jpg`
                  : null;

                return (
                  <a
                    key={s.slug || s.date}
                    href={s.slug ? `/sermons/${s.slug}` : "#"}
                    className="group flex items-center gap-4 p-3 rounded-xl border border-white/5 hover:border-white/12 hover:bg-white/3 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {thumbUrl && (
                        <img
                          src={thumbUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-white text-sm font-semibold leading-snug truncate group-hover:text-white transition-colors"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {s.title}
                      </p>
                      <p className="text-white/35 text-xs mt-0.5 truncate">
                        {s.series && <span style={{ color: s.accentColor + "cc" }}>{s.series}</span>}
                        {s.series && s.passage && <span className="text-white/20 mx-1.5">·</span>}
                        {s.passage}
                      </p>
                    </div>

                    {/* Date + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white/25 text-xs hidden sm:block">
                        {s.date ? formatDate(s.date) : ""}
                      </span>
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className="text-white/15 group-hover:text-white/40 transition-colors"
                        stroke="currentColor" strokeWidth="1.5"
                      >
                        <path d="M2 6h8M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No-sermons state */}
      {!hasSermons && (
        <div className="px-5 md:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <p className="text-white/25 text-sm">No sermons on record yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
