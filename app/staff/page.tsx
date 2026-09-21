import Image from "next/image";
import { STAFF_ROSTER, SPEAKERS, speakerSlug } from "@/lib/speakers";

export const metadata = {
  title: "Our Team — Brainerd Baptist Church",
  description: "Meet the pastoral and ministry staff at Brainerd Baptist Church.",
};

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="pt-28 pb-16 px-5 md:px-8 text-center">
        <p className="eyebrow mb-4">Our Team</p>
        <h1 className="font-condensed font-800 text-fg mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}>
          Meet the Staff
        </h1>
        <p className="text-fg-muted text-base max-w-md mx-auto leading-relaxed">
          People serving Brainerd Baptist Church and the surrounding community.
        </p>
      </div>

      {/* Grid */}
      <div className="px-5 md:px-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {STAFF_ROSTER.map((name) => {
              const info = SPEAKERS[name];
              if (!info) return null;
              return (
                <a key={name} href={`/speakers/${speakerSlug(name)}`} className="group">
                  {/* Photo */}
                  <div className="relative w-full overflow-hidden rounded-2xl mb-3" style={{ aspectRatio: "4/5" }}>
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
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-fg-subtle"
                        style={{ background: "var(--surface-sunken)" }}>
                        {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                      style={{ background: "var(--scrim-veil)" }} />
                  </div>

                  {/* Name + title */}
                  <p className="text-fg font-semibold text-sm leading-snug group-hover:text-accent-text transition-colors"
                    style={{ letterSpacing: "-0.015em" }}>
                    {name}
                  </p>
                  <p className="text-fg-muted text-xs mt-0.5">{info.title}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
