import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import AMarkLight from "./AMarkLight";
import { LEAD_PASTOR } from "@/lib/constants";

export default function ConnectBand() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--color-brand-navy)" }}>
      <div className="bx-bloom" aria-hidden="true" />
      {/* Logo-mark watermark, top right.
          The comment here used to say mix-blend-mode: screen "leaves only the
          white logo lines visible" — but the asset has no white lines. Every
          opaque pixel in it is pure black, and screen(0, b) = b, so this
          watermark rendered nothing at all. Masking the same artwork and
          painting it with --fg-on-dark makes it appear, and needs no blend
          mode to do it. */}
      <div
        className="absolute top-0 right-0 pointer-events-none select-none text-fg-on-dark"
        style={{ width: "40vw", maxWidth: 460 }}
      >
        <div className="relative">
          <span className="bbc-a-mark block w-full" style={{ opacity: 0.09 }} aria-hidden="true" />
          {/* Light that runs along one random line at a time */}
          <AMarkLight />
        </div>
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
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/25 shrink-0">
                  <Image
                    src="/staff/hill_curtis_leadpastor.jpg"
                    alt={LEAD_PASTOR.name}
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                  />
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
                },
                {
                  label: "Life Groups",
                  desc: "Find a small group where you can belong and grow.",
                  href: "/life-groups",
                },
                {
                  label: "Serve",
                  desc: "Use your gifts to make a difference in Chattanooga and beyond.",
                  href: "/connect/next-step?interest=serving",
                },
                {
                  label: "Give",
                  desc: "Support the work of Brainerd Baptist.",
                  href: "/give",
                },
              ].map((item, i) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-5 glass-on-dark rounded-xl px-6 py-5 border-l-2 border-l-transparent hover:border-l-accent transition-colors"
                >
                  <span className="font-condensed font-700 text-accent/70 text-sm tracking-widest w-6 shrink-0" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-condensed font-900 text-white text-2xl leading-tight">{item.label}</p>
                    <p className="text-fg-on-dark-muted text-sm leading-snug mt-1">{item.desc}</p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-fg-on-dark-muted group-hover:text-accent group-hover:translate-x-1 transition shrink-0" aria-hidden="true">
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
