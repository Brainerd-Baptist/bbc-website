import { notFound } from "next/navigation";
import Image from "next/image";
import { SPEAKERS, speakerFromSlug, getSpeaker, speakerSlug } from "@/lib/speakers";
import { SERMONS, formatDate } from "@/lib/sermons";
import { getAllSermons } from "@/lib/sanity";
// ClientEmailButton is a "use client" wrapper around EmailButton — it handles the
// dynamic(ssr:false) import internally, which is required because ssr:false is not
// allowed in Server Components. The email address only renders after JS runs in
// the browser, keeping it invisible to scrapers and crawlers.
import ClientEmailButton from "@/components/ui/ClientEmailButton";

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
    <div className="min-h-screen bg-surface">

      {/* ── Dark gradient hero strip ───────────────────────────────────── */}
      <div
        className="pt-28 pb-16 px-5 md:px-8"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <a
            href="/staff"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            Our Team
          </a>

          <div className="flex flex-col sm:flex-row items-start gap-7 md:gap-10">

            {/* Photo */}
            {info.photo ? (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl ring-2 ring-white/10">
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
                style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
              >
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
            )}

            {/* Name / title */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--accent-text)" }}>
                {info.title}
              </p>
              <h1
                className="text-white mb-1"
                style={{
                  fontFamily: "var(--font-barlow-condensed), sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.0,
                }}
              >
                {name}
              </h1>
              <p className="text-white/40 text-sm">Brainerd Baptist Church</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── White content area ────────────────────────────────────────── */}
      <div className="px-5 md:px-8 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">

            {/* Bio column */}
            <div className="md:col-span-2 space-y-6">
              {info.email && (
                <div>
                  <ClientEmailButton email={info.email} name={name} />
                </div>
              )}

              {info.bio && info.bio.length > 0 && (
                <div className="space-y-4">
                  {info.bio.map((para, i) => (
                    <p key={i} className="text-fg-muted leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {!info.bio && (
                <p className="text-fg-muted leading-relaxed">
                  Bio coming soon.
                </p>
              )}
            </div>

            {/* Family photo sidebar */}
            {info.familyPhoto && (
              <div>
                <p className="eyebrow-muted mb-3">Family</p>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={info.familyPhoto}
                    alt={info.familyPhotoAlt ?? `${name}'s family`}
                    className="w-full object-cover object-center"
                  />
                </div>
              </div>
            )}
          </div>

          {hasSermons && (
            <p className="text-fg-subtle text-xs mt-8 font-medium">
              {sermons.length} sermon{sermons.length !== 1 ? "s" : ""} at Brainerd Baptist
            </p>
          )}
        </div>
      </div>

      {/* ── Sermons ───────────────────────────────────────────────────── */}
      {hasSermons && (
        <div className="px-5 md:px-8 pb-24 border-t border-border pt-10" style={{ background: "var(--surface-sunken)" }}>
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow-muted mb-6">Sermons</p>

            <div className="space-y-2">
              {sermons.map((s) => {
                const thumbUrl = s.youtubeId
                  ? `https://img.youtube.com/vi/${s.youtubeId}/maxresdefault.jpg`
                  : null;

                return (
                  <a
                    key={s.slug || s.date}
                    href={s.slug ? `/sermons/${s.slug}` : "#"}
                    className="group flex items-center gap-4 p-3 rounded-xl bg-surface-raised border border-border hover:border-accent/30 hover:shadow-sm transition"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-brand-navy/6">
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
                        className="text-fg text-sm font-semibold leading-snug truncate group-hover:text-accent-text transition-colors"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {s.title}
                      </p>
                      <p className="text-fg-muted text-xs mt-0.5 truncate">
                        {s.series && <span style={{ color: s.accentColor }}>{s.series}</span>}
                        {s.series && s.passage && <span className="text-fg-subtle mx-1.5">·</span>}
                        {s.passage}
                      </p>
                    </div>

                    {/* Date + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-fg-subtle text-xs hidden sm:block">
                        {s.date ? formatDate(s.date) : ""}
                      </span>
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className="text-fg-subtle group-hover:text-accent-text transition-colors"
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

      {!hasSermons && (
        <div className="px-5 md:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <p className="text-fg-subtle text-sm">No sermons on record yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
