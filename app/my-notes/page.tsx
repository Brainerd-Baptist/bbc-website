import { getAllSermons, FALLBACK_SERMONS } from "@/lib/sanity";
import MyNotesList, { type SermonForNotes } from "@/components/sermons/MyNotesList";

export const metadata = {
  title: "My Notes — Brainerd Baptist Church",
  description: "Notes you've saved while listening to sermons at Brainerd Baptist Church.",
  robots: { index: false }, // personal/local content — nothing here to rank
};

export const revalidate = 300; // ISR: regenerate every 5 minutes

export default async function MyNotesPage() {
  // Same Sanity-first, static-fallback pattern as /sermons — this page just
  // needs every sermon's slug/title/speaker/etc. so the client component
  // can check which ones have a saved `bbc-notes-${slug}` entry in this
  // browser's localStorage (see components/sermons/MyNotesList.tsx).
  const sanitySermons = await getAllSermons().catch(() => []);
  const usingSanity = sanitySermons.length > 0;

  const sermons: SermonForNotes[] = usingSanity
    ? sanitySermons.map((s) => ({
        id: s._id,
        slug: s.slug?.current ?? "",
        title: s.title,
        speaker: s.speaker,
        series: s.series?.title ?? "",
        seriesAccent: s.series?.accentColor,
        youtubeId: s.youtubeId ?? "",
        date: s.date,
        passage: s.passage ?? "",
      }))
    : FALLBACK_SERMONS.map((s) => ({
        id: s.id,
        slug: "",
        title: s.title,
        speaker: s.speaker,
        series: s.series,
        seriesAccent: undefined as string | undefined,
        youtubeId: s.youtubeId,
        date: s.date,
        passage: s.passage,
      }));

  return (
    <div className="min-h-screen">
      <div
        className="pt-32 pb-14 px-6 text-center"
        style={{ background: "var(--brand-band)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow-white mb-4">Your Study</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1 className="text-fg-on-dark mb-4 h-display">My Notes</h1>
          <p className="text-fg-on-dark-body text-base md:text-lg leading-relaxed mt-5">
            Every sermon where you&apos;ve taken notes, all in one place.
          </p>
        </div>
      </div>

      <section className="pt-12">
        <MyNotesList sermons={sermons} />
      </section>
    </div>
  );
}
