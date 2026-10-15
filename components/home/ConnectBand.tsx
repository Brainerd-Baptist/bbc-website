import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import { LEAD_PASTOR } from "@/lib/constants";

export default function ConnectBand() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--tint-band)" }}>
      {/* Subtle top border */}
            <div className="relative max-w-7xl mx-auto section-pad px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Quote / Pastor */}
          <ScrollReveal>
            <div>
              <p className="eyebrow mb-8">From Our Pastor</p>

              <blockquote
                className="text-fg leading-relaxed mb-8"
                style={{
                  fontFamily: "var(--font-source-serif), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
                  lineHeight: 1.65,
                }}
              >
                &ldquo;{LEAD_PASTOR.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border shrink-0">
                  <Image
                    src="/staff/hill_curtis_leadpastor.jpg"
                    alt={LEAD_PASTOR.name}
                    fill
                    sizes="64px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-condensed font-700 text-fg text-base">{LEAD_PASTOR.name}</p>
                  <p className="text-fg-muted text-sm">{LEAD_PASTOR.title}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Connect cards */}
          <ScrollReveal delay={120}>
            <div className="space-y-4">
              <h2
                className="font-condensed font-900 text-fg mb-8"
                style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", lineHeight: 1.1 }}
              >
                Ready to take a next step?
              </h2>

              {[
                {
                  label: "I'm New",
                  desc: "Plan your first visit — get the information you need for your first visit.",
                  href: "/visit",
                },
                {
                  label: "Adults",
                  desc: "Wherever you are in life, there's a place for you.",
                  href: "/ministries#adults",
                },
                {
                  label: "Serve",
                  desc: "Use your gifts to make a difference at Brainerd, in Chattanooga and beyond.",
                  href: "/connect/next-step?interest=serving",
                },
                {
                  label: "Give",
                  desc: "Support the work of Brainerd Baptist.",
                  href: "/give",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-5 card-lift rounded-2xl px-6 py-5 hover:border-border-strong transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-condensed font-900 text-fg text-2xl leading-tight">{item.label}</p>
                    <p className="text-fg-muted text-sm leading-snug mt-1">{item.desc}</p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-fg-muted group-hover:text-fg group-hover:translate-x-1 transition shrink-0" aria-hidden="true">
                    <path d="M3 7h8M8 4l3 3-3 3"/>
                  </svg>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
