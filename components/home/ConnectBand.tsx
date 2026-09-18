import Link from "next/link";
import { LEAD_PASTOR } from "@/lib/constants";

export default function ConnectBand() {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f2040 0%, #0a1628 100%)" }}
    >
      {/* Decorative circle */}
      <div
        className="absolute -right-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Photo placeholder */}
          <div
            className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #122540 0%, #0a1628 100%)" }}
          >
            <div className="text-white/20 text-xs font-condensed uppercase tracking-widest">
              Pastor Photo
            </div>
            {/* Gold corner accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ background: "linear-gradient(90deg, #c9a84c, transparent)" }}
            />
          </div>

          {/* Text */}
          <div>
            <p className="eyebrow mb-3">We&apos;d Love to Meet You</p>
            <div className="gold-divider mb-6" />
            <h2
              className="font-condensed font-800 text-white leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}
            >
              New to Brainerd Baptist?
            </h2>
            <blockquote className="font-serif italic text-white/65 text-lg leading-relaxed mb-6 border-l-2 border-gold/40 pl-5">
              &ldquo;{LEAD_PASTOR.quote}&rdquo;
            </blockquote>
            <p className="text-white/50 text-sm mb-2">
              <strong className="text-white font-semibold">{LEAD_PASTOR.name}</strong>
              {" "}— {LEAD_PASTOR.title}
            </p>
            <p className="text-white/55 leading-relaxed mb-8">
              Whether you are exploring faith for the first time or looking for a
              church home, we want to know you. Fill out a connect card and someone
              from our team will reach out.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/connect"
                className="font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy px-7 py-3 rounded-full transition-colors"
              >
                Connect With Us
              </Link>
              <Link
                href="/visit"
                className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-white px-7 py-3 rounded-full transition-colors glass"
              >
                Plan Your Visit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
