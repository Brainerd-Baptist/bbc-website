"use client";

import { usePathname } from "next/navigation";

/**
 * "Send us a note" for visitors. Opens the note form on Brainerd HQ with this page filled in.
 * The visitor confirms their email before anyone on the team sees the note.
 */
const FORM = "https://brainerdhq.app/website-note";

export default function VisitorNote() {
  const pathname = usePathname() || "/";
  return (
    <a
      href={`${FORM}?page=${encodeURIComponent(pathname)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white/60 transition-colors"
    >
      Share website feedback
    </a>
  );
}
