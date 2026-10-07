import Link from "next/link";
import PillarsTimeline from "@/components/history/PillarsTimeline";

export const metadata = {
  title: "A Hundred Years — Brainerd Baptist Church",
  description:
    "From a tent on Brookfield Avenue in 1928 to today: the beginnings, buildings, church plants and missionaries that shaped Brainerd, and the things the congregation did together to make them happen.",
};

export default function TimelinePage() {
  return (
    <div className="min-h-screen">
      <div className="pt-32 pb-12 px-6" style={{ background: "var(--color-brand-navy)" }}>
        <div className="max-w-4xl mx-auto">
          <p
            className="font-condensed font-700 tracking-widest uppercase text-xs mb-5"
            style={{ color: "var(--accent)" }}
          >
            Brainerd Baptist Church · 1928 – 2028
          </p>
          <h1
            className="font-condensed font-900 text-white mb-5"
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 4.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              textWrap: "balance",
            }}
          >
            The pillars of a hundred years,{" "}
            <span style={{ color: "var(--accent)" }}>from a tent to today</span>
          </h1>
          <p className="text-white/70 leading-relaxed max-w-[60ch]" style={{ fontSize: "1.05rem" }}>
            The beginnings, buildings, church plants and missionaries that shaped Brainerd, and the
            things the congregation did together to make them happen. Every entry is drawn from the
            church&apos;s own anniversary histories, with the source noted.
          </p>
          <p className="mt-6 text-sm text-white/60">
            <Link href="/about#founded" className="underline underline-offset-2 hover:text-white">
              ← Back to About
            </Link>
          </p>
        </div>
      </div>

      <PillarsTimeline />

      <section className="px-6 pb-16">
        <div
          className="max-w-4xl mx-auto border-t pt-6 text-[13px] text-fg-muted space-y-2"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="max-w-[70ch]">
            <strong style={{ color: "var(--fg)" }}>Sources.</strong> Anniversary histories of
            Brainerd Baptist Church: 25th (1953), 50th (1978), 70th (1998, Mary Lynn Wilson, church
            historian), 80th (2008) and 85th (2013); Memorial Fact Book for the New Sanctuary
            (1964). All from the BBC Historical Documents archive.
          </p>
          <p className="max-w-[70ch]">
            Where two histories give different dates for the same event, the entry says so.
          </p>
        </div>
      </section>
    </div>
  );
}
