/**
 * /sermons/[slug]/notes — retired
 *
 * This used to be a separate per-outline-point notes editor with its own
 * localStorage key (`bbc-notes-${slug}`, JSON-shaped). It collided with the
 * inline rich-text SermonNotes editor on /sermons/[slug] itself, which uses
 * the SAME key but a different (HTML string) shape — the two silently
 * corrupted each other's saved notes. Rather than maintain two notes
 * systems, this route now just sends anyone who still has it bookmarked or
 * linked back to the one real editor, inline on the sermon page.
 *
 * SermonNotes.tsx's migrateLegacyNotes() recovers any notes that were saved
 * here under the old JSON shape, so nothing already typed is lost.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: "Message Notes",
    robots: "noindex",
    alternates: { canonical: `/sermons/${slug}#notes` },
  };
}

export default async function SermonNotesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/sermons/${slug}#notes`);
}
