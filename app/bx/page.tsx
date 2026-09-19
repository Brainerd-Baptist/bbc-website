import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The BX — Brainerd Crossroads Community Center",
  description:
    "Brainerd Crossroads (the BX) is a 54,000 sq ft fitness, recreation, and meeting facility open to the public in Chattanooga's Belvoir neighborhood.",
};

const HOURS = [
  { days: "Mon, Tue, Thu", hours: "6:00 AM – 9:00 PM" },
  { days: "Wed, Fri",       hours: "6:00 AM – 5:00 PM" },
  { days: "Saturday",       hours: "8:00 AM – 3:00 PM" },
  { days: "Sunday",         hours: "Closed" },
];

export default function BXPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="pt-32 pb-20 px-6"
        style={{
          background: "linear-gradient(135deg, #00142a 0%, #00205B 60%, #0a2d6e 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "#00abc9" }}>
            Brainerd Crossroads
          </p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)", letterSpacing: "-0.02em" }}
          >
            The{" "}
            <span style={{ color: "#00abc9" }}>BX.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A 54,000 square foot fitness, recreation, and meeting facility in the
            Belvoir community — operated by Brainerd Baptist Church and open to
            everyone.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#room-reservations"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors"
              style={{ background: "#00abc9", color: "white" }}
            >
              Reserve a Room
            </a>
            <a
              href="tel:4236434978"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/30 text-white px-6 py-3 rounded-full hover:border-white/60 transition-colors"
            >
              (423) 643-4978
            </a>
          </div>
        </div>
      </div>

      {/* ── Overview + Hours ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">

          {/* Overview */}
          <div>
            <p className="eyebrow mb-3">Open to the Public</p>
            <h2
              className="font-condensed font-900 text-[#00205B] mb-5"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Fitness, recreation, and community.
            </h2>
            <p className="text-[#00205B]/60 leading-relaxed mb-4">
              The BX offers many of the amenities found at a quality fitness center
              alongside meeting spaces that accommodate groups from 5 to 500. Free
              parking and easy access to I-24.
            </p>
            <p className="text-[#00205B]/60 leading-relaxed">
              We&apos;re located in the Belvoir neighborhood at 4011 Austin St. —
              just off Brainerd Road.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://maps.google.com/?q=4011+Austin+St+Chattanooga+TN+37411"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#00abc9" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-8-6.5-8-12a8 8 0 0 1 16 0c0 5.5-8 12-8 12z" /><circle cx="12" cy="9" r="2.5" />
                </svg>
                4011 Austin St., Chattanooga, TN 37411
              </a>
            </div>
          </div>

          {/* Hours card */}
          <div className="rounded-2xl p-8 border border-[#00205B]/08" style={{ background: "#f4f6f9" }}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,171,201,0.12)", color: "#00abc9" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                </svg>
              </div>
              <h3 className="font-condensed font-800 text-[#00205B]" style={{ fontSize: "1.2rem" }}>
                Hours of Operation
              </h3>
            </div>
            <div className="space-y-3">
              {HOURS.map(({ days, hours }) => (
                <div
                  key={days}
                  className="flex justify-between items-center py-2 border-b border-[#00205B]/06 last:border-0"
                >
                  <span className="text-sm text-[#00205B]/65">{days}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: hours === "Closed" ? "#00205B" + "60" : "#00205B" }}
                  >
                    {hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Room Reservations ────────────────────────────────── */}
      <section id="room-reservations" className="py-24 px-6" style={{ background: "#f4f6f9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="eyebrow mb-3">Events &amp; Meetings</p>
            <h2
              className="font-condensed font-900 text-[#00205B]"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Reserve a room.
            </h2>
            <p className="text-[#00205B]/60 mt-4 max-w-xl leading-relaxed">
              Schedule your next corporate meeting, birthday party, or reception at
              the BX. Spaces accommodate groups from 5 to 500.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                  </svg>
                ),
                label: "Tables & Chairs",
                body: "Banquet tables and chairs included with every reservation.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                  </svg>
                ),
                label: "Free Wi-Fi",
                body: "High-speed Wi-Fi available throughout the entire facility.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2M8 12h8M8 16h5" />
                  </svg>
                ),
                label: "A/V Available",
                body: "Microphones, projectors, and screens available for an additional fee.",
              },
            ].map(({ icon, label, body }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-[#00205B]/08">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(0,171,201,0.10)", color: "#00abc9" }}
                >
                  {icon}
                </div>
                <h3 className="font-condensed font-800 text-[#00205B] mb-2" style={{ fontSize: "1.1rem" }}>
                  {label}
                </h3>
                <p className="text-[#00205B]/55 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Reservation details */}
          <div className="bg-white rounded-2xl p-8 border border-[#00205B]/08 mb-8">
            <h3 className="font-condensed font-800 text-[#00205B] mb-5" style={{ fontSize: "1.2rem" }}>
              Before you book
            </h3>
            <ul className="space-y-3 text-sm text-[#00205B]/60 leading-relaxed">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                Reservations are subject to availability. No Saturday or Sunday reservations.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                Approved events will be contacted for confirmation with full payment and a signed proposal.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                Canceled events may be refunded with a 25% cancellation fee.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                After-hours fees may apply to evening events.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                A credit card will be held for security and damage deposit.
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00abc9] shrink-0 mt-1.5" />
                Organizations are required to submit a certificate of insurance.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeKiTsMOeUMVXhV0nXiyZLVg-PvjmSgGebU0JvoViqreq0FVg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3.5 rounded-full transition-colors"
              style={{ background: "#00abc9", color: "white" }}
            >
              Room Reservation Request
            </a>
            <a
              href="tel:4236434978"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-[#00205B]/20 text-[#00205B] px-7 py-3.5 rounded-full hover:border-[#00205B]/40 transition-colors"
            >
              Call Us: (423) 643-4978
            </a>
          </div>
        </div>
      </section>

      {/* ── Food Pantry callout ───────────────────────────────── */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-3" style={{ color: "#00abc9" }}>Every Month</p>
          <h2
            className="font-condensed font-800 text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
          >
            Community Food Pantry
          </h2>
          <p className="text-white/55 leading-relaxed mb-8 max-w-md mx-auto">
            Each month the BX hosts a free community food pantry open to anyone
            in the neighborhood. No paperwork required — just show up.
          </p>
          <a
            href="/community"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/25 text-white px-8 py-3.5 rounded-full hover:border-white/50 transition-colors inline-block"
          >
            Learn More
          </a>
        </div>
      </section>

    </div>
  );
}
