import Image from "next/image";
import { STAFF_ROSTER, SPEAKERS, speakerSlug } from "@/lib/speakers";

export const metadata = {
  title: "Our Team — Brainerd Baptist Church",
  description: "Meet the pastoral and ministry staff at Brainerd Baptist Church.",
};

export default function StaffPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="pt-28 pb-16 px-5 md:px-8 text-center">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#00abc9" }}
        >
          Our Team
        </p>
        <h1
          className="text-white mb-4"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
          }}
        >
          Meet the Staff
        </h1>
        <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
          People serving Brainerd Baptist Church and the surrounding community.
        </p>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      <div className="px-5 md:px-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {STAFF_ROSTER.map((name) => {
              const info = SPEAKERS[name];
              if (!info) return null;
              return (
                <a key={name} href={`/speakers/${speakerSlug(name)}`} className="group">
                  {/* Photo */}
                  <div
                    className="relative w-full overflow-hidden rounded-2xl mb-3"
                    style={{ aspectRatio: "4/5" }}
                  >
                    {info.photo ? (
                      <Image
                        src={`/staff/${info.photo}.jpg`}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        priority={name === "Curtis Hill"}
                      />
                    ) : (
                      /* Fallback initials avatar */
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/30"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    {/* Subtle gradient at bottom */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(7,16,30,0.55) 0%, transparent 100%)",
                      }}
                    />
                  </div>

                  {/* Name + title */}
                  <p
                    className="text-white font-semibold text-sm leading-snug group-hover:text-white/80 transition-colors"
                    style={{ letterSpacing: "-0.015em" }}
                  >
                    {name}
                  </p>
                  <p className="text-white/35 text-xs mt-0.5">{info.title}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
