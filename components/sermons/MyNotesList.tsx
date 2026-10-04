"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export type SermonForNotes = {
  id: string;
  slug: string;
  title: string;
  speaker: string;
  series: string;
  seriesAccent?: string;
  youtubeId: string;
  date: string;
  passage: string;
};

interface SavedNote {
  sermon: SermonForNotes;
  urlSlug: string;
  preview: string;
  wordCount: number;
}

/**
 * Same "every HTML empty state actually means empty" check SermonNotes.tsx
 * uses for its own clear/save logic (saveContent / clearNotes) — a brand
 * new Tiptap editor serializes to "<p></p>", not "". Keeping this in sync
 * with that file matters: diverging here would mean a note that
 * SermonNotes.tsx treats as blank (and so deletes on blur) still shows up
 * in this list, or vice versa.
 */
function isEmptyNotesHtml(html: string | null): boolean {
  return !html || html === "<p></p>";
}

function htmlToPreview(html: string, maxLen = 180): string {
  const text = html
    .replace(/<\/p>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function MyNotesList({ sermons }: { sermons: SermonForNotes[] }) {
  const [notes, setNotes] = useState<SavedNote[] | null>(null);

  useEffect(() => {
    const found: SavedNote[] = [];
    for (const sermon of sermons) {
      const urlSlug = sermon.slug || sermon.id;
      if (!urlSlug) continue;
      try {
        const html = localStorage.getItem(`bbc-notes-${urlSlug}`);
        if (isEmptyNotesHtml(html)) continue;
        found.push({
          sermon,
          urlSlug,
          preview: htmlToPreview(html as string),
          wordCount: countWords(html as string),
        });
      } catch {
        // private mode, or no localStorage — treat as no saved notes
      }
    }
    setNotes(found);
  }, [sermons]);

  // Loading pass (first client render, before the effect runs) — render
  // nothing rather than flash an empty state that then pops in content.
  if (notes === null) return null;

  if (notes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--surface-sunken)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <h2 className="h-section mb-2">No saved notes yet</h2>
        <p className="text-fg-muted text-sm leading-relaxed mb-7 max-w-sm mx-auto">
          Take notes on any sermon — live or on-demand — and they&apos;ll be saved here automatically, right in this browser.
        </p>
        <Link
          href="/sermons"
          className="inline-flex items-center gap-2 font-condensed font-700 tracking-wide uppercase text-sm bg-fg text-surface hover:opacity-90 px-7 py-3 rounded-full transition"
        >
          Browse Sermons
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 pb-24">
      <p className="text-fg-subtle text-xs mb-6">
        {notes.length} sermon{notes.length === 1 ? "" : "s"} with saved notes — stored privately in this browser only.
      </p>
      <div className="space-y-3">
        {notes.map(({ sermon, urlSlug, preview, wordCount }) => {
          const accent = sermon.seriesAccent ?? "var(--accent)";
          return (
            <Link
              key={urlSlug}
              href={`/sermons/${urlSlug}`}
              className="group block rounded-2xl p-5 transition-colors"
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <p className="label-micro mb-1" style={{ color: accent }}>
                    {sermon.series || "Sermon"}
                  </p>
                  <h3 className="text-fg font-semibold text-base leading-snug group-hover:underline decoration-1 underline-offset-2">
                    {sermon.title}
                  </h3>
                </div>
                <span className="text-fg-subtle text-xs flex-shrink-0 mt-0.5 tabular-nums">
                  {formatDate(sermon.date)}
                </span>
              </div>
              <p className="text-fg-muted text-sm mb-3">
                {sermon.speaker}{sermon.passage ? ` · ${sermon.passage}` : ""}
              </p>
              <p className="text-fg-subtle text-sm italic leading-relaxed">
                &ldquo;{preview}&rdquo;
              </p>
              <p className="text-fg-subtle text-[11px] mt-3">
                {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
