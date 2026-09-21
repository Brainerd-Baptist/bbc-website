"use client";

import { useState } from "react";

interface Props {
  title: string;
  speaker: string;
}

export default function ShareButton({ title, speaker }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${title} — ${speaker}`;

    // Use native share sheet on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // User cancelled or not supported — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing to do
    }
  }

  return (
    <button
      onClick={handleShare}
      /* Theme-following, matching the "Watch on YouTube" and "Download Audio"
           controls it sits beside in the same row. It used on-dark tokens while
           its two siblings used themed ones, on a surface that follows the
           theme — so in light mode it painted near-white text on white and
           measured 1.00:1. That predates the token work (it was text-white/50)
           and the migration reproduced it exactly, which is how an invisible
           control survives a rewrite. */
        className="inline-flex items-center gap-2 text-xs font-semibold text-fg-muted hover:text-fg border border-border-strong px-4 py-2 rounded-full transition"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </>
      )}
    </button>
  );
}
