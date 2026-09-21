import Link from "next/link";

interface Tile {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TILES: Tile[] = [
  {
    href: "/visit",
    title: "I'm New Here",
    description: "What to expect, parking, kids check-in, and service times.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 11l9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/connect/next-step",
    title: "Take a Next Step",
    description: "Membership, baptism, a Life Group, or serving.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    href: "/connect/staff",
    title: "Contact a Pastor or Staff Member",
    description: "Reach a specific person or ministry area directly.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    ),
  },
  {
    href: "/connect/ask",
    title: "Ask a Quick Question",
    description: "Instant answers on service times, beliefs, and what to expect.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 1.9v.3" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    href: "/connect/care",
    title: "Care & Support",
    description: "Financial assistance, hospital visits, weddings, funerals.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20.8 8.6c0 5.6-8.8 10.9-8.8 10.9S3.2 14.2 3.2 8.6a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9z" />
      </svg>
    ),
  },
  {
    href: "/connect/stay-connected",
    title: "Stay Connected",
    description: "Sign up for text and email updates from Brainerd.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 18h6" />
      </svg>
    ),
  },
  {
    href: "/connect/general",
    title: "Looking for Something Else?",
    description: "Send a message to our team.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
];

export default function ConnectTiles() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {TILES.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="group flex items-start gap-4 rounded-2xl border border-border hover:border-accent/40 bg-surface-raised hover:shadow-md p-6 transition-all duration-200"
        >
          <span
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-accent-text transition-colors"
            style={{ background: "var(--accent-bg)" }}
          >
            {tile.icon}
          </span>
          <div className="min-w-0">
            <p className="text-fg font-semibold text-base mb-1 group-hover:text-accent-text transition-colors" style={{ letterSpacing: "-0.01em" }}>
              {tile.title}
            </p>
            <p className="text-fg-muted text-sm leading-snug">{tile.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
