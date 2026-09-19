"use client";

/**
 * Renders an email button only on the client — so the address never
 * appears in static HTML and is invisible to scraper bots.
 */
export default function EmailButton({ email, name }: { email: string; name: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
      style={{ color: "#00abc9" }}
      aria-label={`Email ${name}`}
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
      {email}
    </a>
  );
}
