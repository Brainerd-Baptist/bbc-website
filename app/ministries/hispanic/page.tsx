import type { Metadata } from "next";
import Link from "next/link";
import { HISPANIC_MINISTRY, SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ministerio Hispano — Brainerd Baptist Church",
  description:
    "Servicio en español cada domingo a las 11:00 AM. A Spanish-language service every Sunday at 11:00 AM.",
};

const MAPS_URL =
  "https://maps.google.com/?q=1203+Blocker+Lane+Chattanooga+TN";
const PASTOR_EMAIL = "cbetancourt@brainerdbaptist.org";

// Evergreen on purpose: one service time, one address, one person to ask.
// Everything else about this ministry happens by visiting on a Sunday.
export default function HispanicMinistryPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-32 pb-16 px-6" style={{ background: "var(--brand-band)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>
            Ministerio Hispano · Hispanic Ministry
          </p>
          <h1 className="text-fg-on-dark mb-5 h-display">Servicio en español</h1>
          <p className="text-fg-on-dark-muted text-lg leading-relaxed max-w-xl mx-auto">
            Domingos a las 11:00 AM
          </p>
        </div>
      </div>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.6rem" }}>
              Español
            </h2>
            <p className="text-fg-muted leading-relaxed mb-4">
              Nos reunimos cada domingo a las 11:00 AM en {HISPANIC_MINISTRY.address.split(",")[0]}.
              La mejor manera de conocer a nuestra comunidad y conectarte es venir un domingo.
              Allí te podemos hablar de lo que se está haciendo.
            </p>
            <p className="text-fg-muted leading-relaxed">
              ¿Preguntas? Escríbele al Pastor Carlos Betancourt, Pastor Asistente de Ministerio Hispano:{" "}
              <a href={`mailto:${PASTOR_EMAIL}`} className="text-accent-text underline underline-offset-2">
                {PASTOR_EMAIL}
              </a>
              .
            </p>
          </div>
          <div>
            <h2 className="font-condensed font-800 text-fg mb-3" style={{ fontSize: "1.6rem" }}>
              English
            </h2>
            <p className="text-fg-muted leading-relaxed mb-4">
              We meet every Sunday at 11:00 AM at our East Ridge location, 1203 Blocker Lane. The
              best way to meet our community and get connected is to visit on a Sunday. There you
              can hear what is happening.
            </p>
            <p className="text-fg-muted leading-relaxed">
              Questions? Email Pastor Carlos Betancourt, Assistant Pastor for Hispanic Ministry:{" "}
              <a href={`mailto:${PASTOR_EMAIL}`} className="text-accent-text underline underline-offset-2">
                {PASTOR_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 flex flex-wrap justify-center gap-3">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent"
          >
            Abrir en Mapas · Open in Maps
          </a>
          <Link
            href="/ministries"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-border-strong text-fg px-7 py-3 rounded-full"
          >
            All Ministries
          </Link>
        </div>
        <p className="text-center text-fg-muted text-sm mt-6">
          {SITE.phone}
        </p>
      </section>
    </div>
  );
}
