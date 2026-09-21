import Link from "next/link";
import ConnectTiles from "@/components/connect/ConnectTiles";
import ConnectSidebar from "@/components/connect/ConnectSidebar";

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Reach Out</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-800 text-[#00205B] mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Connect With Us
          </h1>
          <p className="text-[#00205B]/60 text-lg leading-relaxed">
            Whether you are visiting for the first time, looking for community, or
            simply have a question — tell us what brings you here and we&apos;ll
            get you to the right place.
          </p>
        </div>
      </div>

      {/* Main grid: tiles + info */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_340px] gap-10">
          <ConnectTiles />
          <ConnectSidebar />
        </div>

        {/* Utility links */}
        <div className="max-w-5xl mx-auto mt-10 pt-8 border-t border-[#00205B]/08 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link href="/connect/other?category=website-issue" className="text-[#00205B]/45 hover:text-[#00abc9] transition-colors">
            Report a website issue
          </Link>
          <Link href="/connect/other?category=building-use" className="text-[#00205B]/45 hover:text-[#00abc9] transition-colors">
            Building or event space use
          </Link>
        </div>
      </section>
    </div>
  );
}
