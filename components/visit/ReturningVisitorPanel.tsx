import Link from "next/link";

interface NextStepTile {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TILES: NextStepTile[] = [
  {
    href: "/life-groups",
    title: "Find a Life Group",
    description: "Small-group Bible study, every week, between services or another night.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/connect/next-step",
    title: "Membership, Baptism, or Serving",
    description: "Tell us what you're interested in and a pastor or staff member will follow up.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    ),
  },
  {
    href: "/ministries",
    title: "Explore Ministries",
    description: "Kids, students, groups, missions, and more — find where you fit.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
      </svg>
    ),
  },
  {
    href: "/give",
    title: "Give",
    description: "Support the church's mission and ministries online or through the app.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function ReturningVisitorPanel() {
  return (
    <section className="py-20 px-6 relative overflow-hidden isolate">
        <div className="bx-bloom bx-bloom-under" aria-hidden="true" />
      <div className="max-w-5xl mx-auto">
        <p className="eyebrow text-center mb-4">Welcome Back</p>
        <h2 className="text-fg text-center mb-4 h-hero">What&apos;s Next for You?</h2>
        <p className="text-fg-muted text-center mb-14 max-w-md mx-auto">
          You already know where to park. Here&apos;s how to go deeper this season.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex gap-5 p-6 rounded-2xl glass-frost"
            >
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
              >
                {tile.icon}
              </span>
              <div>
                <h3 className="font-condensed font-800 text-fg mb-1.5 group-hover:text-accent-text transition-colors" style={{ fontSize: "1.2rem" }}>
                  {tile.title}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed">{tile.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-fg-subtle text-sm">
          Need the Sunday basics anyway — parking, service times, kids check-in?{" "}
          <a href="#service-times" className="text-accent-text font-semibold hover:underline">
            Jump to that
          </a>
          .
        </p>
      </div>
    </section>
  );
}
