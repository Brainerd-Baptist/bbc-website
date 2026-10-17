"use client";

// Free Bible app (YouVersion). The fallback page picks the right store itself;
// on tap we go straight to the store for the visitor's phone when we can tell.
const FALLBACK = "https://www.bible.com/app";

export default function BibleAppLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={FALLBACK}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-text underline underline-offset-2"
      onClick={(e) => {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) e.currentTarget.href = "https://app.bible.com/app-ios";
        else if (/Android/i.test(ua)) e.currentTarget.href = "https://app.bible.com/app-android";
      }}
    >
      {children}
    </a>
  );
}
