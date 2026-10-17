import ScrollReveal from "./ScrollReveal";

import Card from "@/components/ui/Card";
export default function ServiceInfo() {
  return (
    <section className="py-20 px-6">
      <div className="relative max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Sunday Services */}
            <div className="md:col-span-2">
              <p className="eyebrow mb-3">Sunday Services</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-2xl p-6">
                  <div className="text-fg font-condensed font-900 text-3xl mb-1">8:30 AM</div>
                  <div className="font-display text-fg">Choir & Orchestra</div>
                </Card>
                <Card className="rounded-2xl p-6">
                  <div className="text-fg font-condensed font-900 text-3xl mb-1">11:00 AM</div>
                  <div className="font-display text-fg">Band-Led</div>
                </Card>
              </div>
              <p className="text-fg-subtle text-sm mt-4 italic" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
                Both services center on the gathering of believers, raising our voices and singing to our King, and the teaching of God's Word — the same sermon at both services.
              </p>
              <p className="text-fg-muted text-sm mt-1">
                Life Groups (small-group Bible study for all ages) meet at <strong>9:45 AM</strong> between services.
              </p>
            </div>

            {/* Address / Visit CTA */}
            <div className="flex flex-col justify-center">
              <div className="rounded-2xl card-lift text-fg p-7 h-full flex flex-col justify-between">
                <div>
                  <p className="eyebrow mb-3">Find Us</p>
                  <p className="font-condensed font-800 text-xl mb-1">300 Brookfield Ave</p>
                  <p className="text-fg-muted mb-4">Chattanooga, TN 37411</p>

                  <div className="border-t border-border pt-4 mt-4">
                    <p className="text-fg-muted text-xs uppercase tracking-widest mb-1">Ministerio Hispano</p>
                    <p className="text-fg text-sm">1203 Blocker Lane, East Ridge</p>
                    <p className="text-fg-muted text-sm">Domingos · 11:00 AM</p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block text-center font-condensed font-700 text-sm uppercase tracking-wide bg-accent-solid hover:bg-accent-solid-hover text-white py-3 rounded-full transition"
                >
                  Get Directions
                </a>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
