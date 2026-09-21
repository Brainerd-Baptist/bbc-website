import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { LEAD_PASTOR } from "@/lib/constants";

export default function ConnectBand() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-brand-navy)" }}>
      {/* Logo-mark watermark, top right.
          The comment here used to say mix-blend-mode: screen "leaves only the
          white logo lines visible" — but the asset has no white lines. Every
          opaque pixel in it is pure black, and screen(0, b) = b, so this
          watermark rendered nothing at all. Masking the same artwork and
          painting it with --fg-on-dark makes it appear, and needs no blend
          mode to do it. */}
      <div
        className="absolute top-0 right-0 pointer-events-none select-none text-fg-on-dark"
        style={{ width: "40vw", maxWidth: 460, opacity: 0.09 }}
      >
        <span className="bbc-a-mark block w-full" aria-hidden="true" />
      </div>

      {/* Subtle top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto section-pad px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Quote / Pastor */}
          <ScrollReveal>
            <div>
              <p className="eyebrow-white mb-5">From Our Pastor</p>
              <div className="w-10 h-1 rounded-full bg-accent mb-8" />

              <blockquote
                className="text-white/85 leading-relaxed mb-8"
                style={{
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
                  lineHeight: 1.65,
                }}
              >
                &ldquo;{LEAD_PASTOR.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Pastor avatar placeholder — replace with <Image> when photo is ready */}
                <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" style={{ stroke: "var(--accent)" }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <p className="font-condensed font-700 text-white text-base">{LEAD_PASTOR.name}</p>
                  <p className="text-fg-on-dark-muted text-sm">{LEAD_PASTOR.title}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Connect cards */}
          <ScrollReveal delay={120}>
            <div className="space-y-4">
              <h2
                className="font-condensed font-900 text-white mb-8"
                style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", lineHeight: 1.1 }}
              >
                Ready to take a next step?
              </h2>

              {[
                {
                  label: "I'm New",
                  desc: "Plan your first visit — we'll make sure you feel at home.",
                  href: "/visit",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  ),
                },
                {
                  label: "Life Groups",
                  desc: "Find a small group where you can belong and grow.",
                  href: "/groups",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  ),
                },
                {
                  label: "Serve",
                  desc: "Use your gifts to make a difference in Chattanooga and beyond.",
                  href: "/serve",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  ),
                },
                {
                  label: "Give",
                  desc: "Support the work of Brainerd Baptist.",
                  href: "/give",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  ),
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 rounded-xl px-5 py-4 transition duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center text-accent-text shrink-0 group-hover:bg-accent-solid group-hover:text-white transition">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-condensed font-700 text-white text-base">{item.label}</p>
                    <p className="text-fg-on-dark-muted text-sm leading-snug">{item.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-on-dark-muted group-hover:text-accent-text transition-colors shrink-0">
                    <path d="M3 7h8M8 4l3 3-3 3"/>
                  </svg>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
