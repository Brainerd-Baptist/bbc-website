import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function ServiceInfo() {
  return (
    <section className="bg-surface py-20 px-6 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Sunday Services */}
            <div className="md:col-span-2">
              <p className="eyebrow mb-3">Sunday Services</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-accent-bg border border-accent/15 p-6">
                  <div className="text-accent-text font-condensed font-900 text-3xl mb-1">8:30 AM</div>
                  <div className="font-semibold text-fg mb-2">Choir & Orchestra</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    Full choir and orchestra. If you grew up singing hymns out of a book,
                    this one will feel familiar.
                  </p>
                </div>
                <div className="rounded-2xl bg-accent-bg border border-accent/15 p-6">
                  <div className="text-accent-text font-condensed font-900 text-3xl mb-1">11:00 AM</div>
                  <div className="font-semibold text-fg mb-2">Band-Led</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    Contemporary band leading worship. Same sermon, same church —
                    different sound.
                  </p>
                </div>
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-4 italic" style={{ fontFamily: "Georgia, serif" }}>
                Both services center on the voices and singing of the congregation.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Life Groups meet at <strong>9:45 AM</strong> between services.
              </p>
            </div>

            {/* Address / Visit CTA */}
            <div className="flex flex-col justify-center">
              <div className="rounded-2xl bg-brand-navy text-white p-7 h-full flex flex-col justify-between">
                <div>
                  <p className="eyebrow-white mb-3">Find Us</p>
                  <p className="font-condensed font-800 text-xl mb-1">300 Brookfield Ave</p>
                  <p className="text-white/60 mb-4">Chattanooga, TN 37411</p>

                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Ministerio Hispano</p>
                    <p className="text-white/70 text-sm">1203 Blocker Lane</p>
                    <p className="text-white/50 text-sm">Domingos · 1:00 PM</p>
                  </div>
                </div>
                <Link
                  href="/visit"
                  className="mt-6 block text-center font-condensed font-700 text-sm uppercase tracking-wide bg-accent-solid hover:bg-accent-solid-hover text-white py-3 rounded-full transition-all"
                >
                  Plan Your Visit
                </Link>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
