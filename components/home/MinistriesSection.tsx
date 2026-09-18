import Link from "next/link";
import { MINISTRIES } from "@/lib/constants";
import ScrollReveal from "./ScrollReveal";

// BBC triangle icon (the "A" brand symbol) used for each ministry
function TriangleIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,2 30,28 2,28" fill={color} opacity="0.15"/>
      <polygon points="16,7 25,24 7,24" fill={color} opacity="0.3"/>
      <polygon points="16,12 22,22 10,22" fill={color}/>
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  kids: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  lifegroups: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  missions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  college: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  adults: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
};

export default function MinistriesSection() {
  return (
    <section className="section-pad bg-[#f7f9fc] border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="eyebrow mb-3">Get Involved</p>
              <div className="blue-divider mb-5" />
              <h2 className="h-section text-[#00205B]">
                There&apos;s a place for everyone.
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
                Whether you&apos;re visiting for the first time or have been coming for years,
                there&apos;s a ministry for wherever you are in life.
              </p>
            </div>
            <Link
              href="/ministries"
              className="btn-outline-navy shrink-0"
            >
              All Ministries
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MINISTRIES.map((m, i) => (
            <ScrollReveal key={m.key} delay={i * 60}>
              <Link
                href={`/ministries/${m.key}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#00abc9]/30 hover:shadow-lg hover:shadow-[#00abc9]/8 transition-all duration-300"
              >
                {/* Top color bar */}
                <div className="h-1 w-full" style={{ background: m.color }} />

                <div className="p-6">
                  {/* Icon circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${m.color}18`, color: m.color }}
                  >
                    {ICONS[m.icon]}
                  </div>

                  <h3
                    className="font-condensed font-700 text-[#00205B] text-xl mb-2 group-hover:text-[#00abc9] transition-colors"
                  >
                    {m.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {m.description}
                  </p>

                  {/* Learn more arrow */}
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-300 group-hover:text-[#00abc9] transition-colors uppercase">
                    Learn more
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
