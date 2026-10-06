import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ExpandablePhoto from "@/components/ui/ExpandablePhoto";
import { SPEAKERS, speakerFromSlug, getSpeaker, speakerSlug } from "@/lib/speakers";
import { SERMONS } from "@/lib/sermons";
import { getAllSermons } from "@/lib/sanity";

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

  // Collect sermons — Sanity is authoritative once it has any data at all
  // (same "Sanity or fallback", never both, rule as /sermons and
  // /series/[slug]). Previously this merged Sanity sermons with the static
  // SERMONS array, deduped only by comparing a static sermon's internal id
  // (e.g. "acts-1") against a Sanity sermon's slug (a YouTube id) — those
  // never match, so any series migrated into Sanity ended up listed twice
  // on a speaker page: once as its old static card, once as its live Sanity
  // card, each with a different sermon count. See duplicate-series-tiles
  // investigation, 2026-10-03.
  const sanityAll = await getAllSermons().catch(() => []);
  const usingSanity = sanityAll.length > 0;

  type SermonRow = {
    slug: string;
    title: string;
    series: string;
    seriesId: string;
    passage: string;
    date: string;
    youtubeId: string;
    duration?: string;
    accentColor: string;
  };

  const sermons: SermonRow[] = (
    usingSanity
      ? sanityAll
          .filter((s) => s.speaker === name)
          .map((s) => ({
            slug: s.slug?.current ?? "",
            title: s.title,
            series: s.series?.title ?? "",
            seriesId: s.series?.slug?.current ?? "",
            passage: s.passage ?? "",
            date: s.date ?? "",
            youtubeId: s.youtubeId ?? "",
            duration: s.duration,
            accentColor: s.series?.accentColor ?? "#00abc9",
          }))
      : SERMONS.filter((s) => s.speaker === name).map((s) => ({
          slug: s.id,
          title: s.title,
          series: s.series,
          seriesId: s.seriesId,
          passage: s.passage,
          date: s.date,
          youtubeId: s.youtubeId,
          duration: s.duration,
          accentColor: "#00abc9",
        }))
  ).sort((a, b) => (b.date > a.date ? 1 : -1));

  const hasSermons = sermons.length > 0;

  // One card per series this speaker has preached in (newest series first)
  // instead of one long chronological list -- click through to /series/[id]
  // for the full series, same convention as the main /sermons page.
  const seriesCards: { seriesId: string; series: string; count: number; youtubeId: string; accentColor: string }[] = [];
  {
    const map = new Map<string, { seriesId: string; series: string; count: number; youtubeId: string; accentColor: string }>();
    for (const s of sermons) {
      const key = s.seriesId || s.series || "other";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { seriesId: key, series: s.series || "Other", count: 1, youtubeId: s.youtubeId, accentColor: s.accentColor });
      }
    }
    seriesCards.push(...map.values());
  }

  return (
    <div className="min-h-screen">

      {/* ── Dark gradient hero strip ───────────────────────────────────── */}
      <div
        className="pt-28 pb-16 px-5 md:px-8"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-4xl mx-auto">

          {/* Back link */}
          <a
            href="/staff"
            className="inline-flex items-center gap-2 text-fg-on-dark-muted hover:text-white/70 text-sm transition-colors mb-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 7H3M6 4L3 7l3 3"/>
            </svg>
            Our Team
          </a>

          <div className="flex flex-col sm:flex-row items-start gap-7 md:gap-10">

            {/* Photo */}
            {info.photo ? (
              <ExpandablePhoto
                src={`/staff/${info.photo}.jpg`}
                alt={name}
                triggerClassName="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl ring-2 ring-white/10"
              >
                <Image
                  src={`/staff/${info.photo}.jpg`}
                  alt={name}
                  width={144}
                  height={144}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </ExpandablePhoto>
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
              <p className="label-micro mb-2" style={{ color: "var(--accent-text)" }}>
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
              <p className="text-fg-on-dark-muted text-sm">Brainerd Baptist Church</p>
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
                  {/* Routes through the same /connect/staff form every other
                      staff-contact path on the site uses — the visitor's
                      message gets relayed with their address as reply-to,
                      rather than handing out this person's real inbox
                      address via a raw mailto: link the way this used to
                      work. See the "profile vs. contact page" discussion,
                      2026-10-06: one real contact mechanism, reused, not a
                      second one bolted on here. */}
                  <Link
                    href={`/connect/staff?staff=${encodeURIComponent(name)}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                    style={{ color: "var(--accent-text)" }}
                  >
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.75"
                      strokeLinecap="round" strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                    Send {name.split(" ")[0]} a message
                  </Link>
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

            {/* Family photo sidebar — once a bio exists, always show this
                slot: the real photo if we have one, otherwise a visible
                placeholder so it's obvious a photo still needs uploading. */}
            {info.bio && info.bio.length > 0 && (
              <div>
                <p className="eyebrow-muted mb-3">Family</p>
                {info.familyPhoto ? (
                  <ExpandablePhoto
                    src={info.familyPhoto}
                    alt={info.familyPhotoAlt ?? `${name}'s family`}
                    triggerClassName="w-full rounded-2xl overflow-hidden shadow-lg border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={info.familyPhoto}
                      alt={info.familyPhotoAlt ?? `${name}'s family`}
                      className="w-full object-cover object-center"
                    />
                  </ExpandablePhoto>
                ) : (
                  <div
                    className="rounded-2xl flex items-center justify-center text-center px-6 border border-dashed border-border"
                    style={{ aspectRatio: "4/3", background: "var(--surface-sunken)" }}
                  >
                    <p className="text-fg-subtle text-sm">Family photo coming soon</p>
                  </div>
                )}
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
            <p className="eyebrow-muted mb-6">Sermon Series</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {seriesCards.map((card) => {
                const thumbUrl = card.youtubeId
                  ? `https://img.youtube.com/vi/${card.youtubeId}/maxresdefault.jpg`
                  : null;
                return (
                  <a
                    key={card.seriesId}
                    href={`/series/${card.seriesId}`}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-border-on-dark hover:border-border-on-dark-strong transition"
                    style={{ background: "var(--brand-band)" }}
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, var(--brand-band) 0%, ${card.accentColor}33 100%)` }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end p-4">
                      <h3
                        className="text-fg-on-dark font-condensed font-800 leading-tight mb-1"
                        style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
                      >
                        {card.series}
                      </h3>
                      <p className="text-fg-on-dark-muted text-[11px] font-medium tabular-nums">
                        {card.count} sermon{card.count !== 1 ? "s" : ""}
                      </p>
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
