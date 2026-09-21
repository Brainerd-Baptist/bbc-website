import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community — Brainerd Baptist Church",
  description:
    "Brainerd Baptist serves the Brainerd neighborhood through the BX Community Center, a monthly food pantry, and community benevolence support.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-surface">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{
          background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "#00abc9" }}>
            Serving Chattanooga
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", letterSpacing: "-0.02em" }}
          >
            Brainerd Baptist in the{" "}
            <span style={{ color: "#00abc9" }}>Community.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            We believe the church exists for the neighborhood. Here&apos;s how
            Brainerd Baptist shows up in the Brainerd community.
          </p>
        </div>
      </div>

      {/* ── BX Community Center ──────────────────────────────── */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="eyebrow mb-3">Open to the Public</p>
              <h2
                className="font-condensed font-900 text-fg mb-5"
                style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
              >
                The BX Community Center.
              </h2>
              <p className="text-fg-muted leading-relaxed mb-6">
                Brainerd Crossroads — the BX — is a 54,000 square foot fitness,
                recreation, and meeting facility operated by Brainerd Baptist Church
                and open to everyone in the community. We&apos;re in the Belvoir
                neighborhood with free parking and easy access to I-24.
              </p>
              <p className="text-fg-muted leading-relaxed mb-8">
                The BX offers quality fitness amenities alongside meeting spaces
                that seat 5 to 500 — banquet tables, chairs, and free Wi-Fi
                included. A/V systems available for an additional fee.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeFrVGqjuNxP0mwbFfGOmXmwGsFPziNnNu985bRY5iXd6rVyg/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-condensed font-700 tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors"
                  style={{ background: "#00abc9", color: "white" }}
                >
                  Room Reservation Request
                </a>
                <a
                  href="tel:4236434978"
                  className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-strong text-fg px-6 py-3 rounded-full hover:border-border-strong transition-colors"
                >
                  (423) 643-4978
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div className="rounded-2xl p-6 border border-border" style={{ background: "var(--surface-sunken)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(0,171,201,0.12)", color: "#00abc9" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s-8-6.5-8-12a8 8 0 0 1 16 0c0 5.5-8 12-8 12z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-fg text-sm mb-1">Address</p>
                    <p className="text-fg-muted text-sm leading-relaxed">
                      4011 Austin St.<br />Chattanooga, TN 37411
                    </p>
                    <a
                      href="https://maps.google.com/?q=4011+Austin+St+Chattanooga+TN+37411"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold mt-2 inline-block"
                      style={{ color: "#00abc9" }}
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="rounded-2xl p-6 border border-border" style={{ background: "var(--surface-sunken)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(0,171,201,0.12)", color: "#00abc9" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-fg text-sm mb-3">Hours of Operation</p>
                    <div className="space-y-1.5">
                      {[
                        { days: "Mon, Tue, Thu", hours: "6:00 AM – 9:00 PM" },
                        { days: "Wed, Fri", hours: "6:00 AM – 5:00 PM" },
                        { days: "Saturday", hours: "8:00 AM – 3:00 PM" },
                        { days: "Sunday", hours: "Closed" },
                      ].map(({ days, hours }) => (
                        <div key={days} className="flex justify-between text-sm">
                          <span className="text-fg-muted">{days}</span>
                          <span className="font-medium text-fg">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room reservation note */}
              <p className="text-xs text-fg-muted px-1">
                Room reservations are subject to availability. No Saturday or Sunday reservations.
                Approved events are contacted for confirmation with full payment and a signed proposal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div className="border-t border-border" />

      {/* ── Food Pantry + Benevolence ────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "var(--surface-sunken)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">Practical Help</p>
            <h2
              className="font-condensed font-900 text-fg"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Showing up when it counts.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Food Pantry */}
            <div className="bg-surface-raised rounded-2xl overflow-hidden border border-border">
              <div className="h-1" style={{ background: "#00abc9" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/carousel/food-pantry-checkin.jpg" alt="Food pantry volunteers helping community members" className="w-full object-cover" style={{ height: "200px", objectPosition: "center 30%" }} />
              <div className="p-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(0,171,201,0.10)", color: "#00abc9" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z" />
                  </svg>
                </div>
                <h3
                  className="font-condensed font-800 text-fg mb-3"
                  style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
                >
                  Monthly Food Pantry
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed mb-6">
                  Each month we host a community food pantry at the BX, open to
                  anyone in the neighborhood who needs it. No membership, no
                  paperwork — just show up.
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#00abc9" }}>
                    3rd Wednesday · 10:00 AM – 12:00 PM
                  </p>
                  <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#00abc9" }}>
                    The BX · 4011 Austin St.
                  </p>
                </div>
              </div>
            </div>

            {/* Benevolence */}
            <div className="bg-surface-raised rounded-2xl overflow-hidden border border-border">
              <div className="h-1" style={{ background: "var(--color-brand-navy)" }} />
              <div className="p-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(0,32,91,0.08)", color: "var(--fg)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3
                  className="font-condensed font-800 text-fg mb-3"
                  style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
                >
                  Community Benevolence
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed mb-6">
                  If you&apos;re facing a utility shutoff or similar hardship,
                  Brainerd Baptist may be able to help. Submit a request using
                  the form below — requests are reviewed on a regular basis.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeKiTsMOeUMVXhV0nXiyZLVg-PvjmSgGebU0JvoViqreq0FVg/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-condensed font-700 tracking-wide uppercase text-sm border rounded-full px-5 py-2.5 transition-all"
                  style={{ borderColor: "rgba(0,32,91,0.25)", color: "var(--fg)" }}
                >
                  Submit a Request
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="font-condensed font-800 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Want to get involved?
          </h2>
          <p className="text-white/55 mb-8 leading-relaxed">
            Many of our community programs run on volunteer help. If you want to
            serve at the food pantry or elsewhere, connect with us and we&apos;ll
            point you in the right direction.
          </p>
          <Link
            href="/connect"
            className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-3.5 rounded-full transition-colors inline-block"
            style={{ background: "#00abc9", color: "white" }}
          >
            Get Connected
          </Link>
        </div>
      </section>

    </div>
  );
}
