import Link from "next/link";
import ThreeCircles from "@/components/jesus/ThreeCircles";

export const metadata = {
  title: "Who Is Jesus — Brainerd Baptist Church",
  description:
    "A simple, honest explanation of who Jesus is and why it matters. Walk through the Three Circles — an interactive guide to the gospel.",
};

export default function WhoIsJesusPage() {
  return (
    <div className="min-h-screen" style={{ background: "#00142a" }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow-white mb-6">The Central Question</p>
          <h1
            className="font-condensed font-900 text-white mb-6"
            style={{
              fontSize: "clamp(3.2rem, 8vw, 6rem)",
              letterSpacing: "-0.02em",
              lineHeight: 0.95,
            }}
          >
            Who Is{" "}
            <span style={{ color: "#00abc9" }}>Jesus?</span>
          </h1>
          <p className="text-white/55 leading-relaxed max-w-lg mx-auto mb-10" style={{ fontSize: "1.1rem" }}>
            Everyone is asking the same questions — just in different words. Here's a way to make sense of them. Walk through the story below and see where you land.
          </p>
          <a
            href="#three-circles"
            className="inline-block font-condensed font-700 tracking-wide uppercase text-sm px-8 py-3.5 rounded-full transition-colors"
            style={{ background: "#00abc9", color: "#00142a" }}
          >
            Start the Story ↓
          </a>
        </div>
      </section>

      {/* ── Three Circles Interactive ──────────────────────────────── */}
      <section id="three-circles" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-8 md:p-12"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <ThreeCircles />
          </div>
        </div>
      </section>

      {/* ── Who Is Jesus (theology) ────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow-white text-center mb-4">More on Jesus</p>
          <h2
            className="font-condensed font-900 text-white text-center mb-16"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            What We Believe About Him
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Fully God",
                body: "Jesus claimed to be God — not just a good teacher or prophet. He forgave sins, accepted worship, and said 'Before Abraham was, I am.' The earliest Christians died for this belief.",
              },
              {
                num: "02",
                title: "Fully Human",
                body: "Jesus was born, grew up, got tired, and wept at a friend's grave. He knows what it means to be human — including suffering and death. He is not distant from our experience.",
              },
              {
                num: "03",
                title: "Risen from the Dead",
                body: "Three days after his crucifixion, Jesus physically rose from the dead — seen by hundreds of eyewitnesses. This is the event on which everything depends. It's either the most important fact in history or the greatest lie ever told.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="rounded-2xl p-7"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="font-condensed font-900 block mb-4"
                  style={{ fontSize: "2.5rem", color: "#00abc9", opacity: 0.3, letterSpacing: "-0.03em", lineHeight: 1 }}
                >
                  {item.num}
                </span>
                <h3
                  className="font-condensed font-800 text-white mb-3"
                  style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}
                >
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Honest questions ──────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14 text-center"
            style={{
              background: "rgba(0,171,201,0.08)",
              border: "1px solid rgba(0,171,201,0.2)",
            }}
          >
            <h2
              className="font-condensed font-900 text-white mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              Still working through it?
            </h2>
            <p className="text-white/55 leading-relaxed mb-10 max-w-md mx-auto">
              Honest questions are welcome here. Our pastors and staff would love to sit down with you — no pressure, no agenda, just a real conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/connect"
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-3.5 rounded-full transition-colors inline-block"
                style={{ background: "#00abc9", color: "#00142a" }}
              >
                Ask a Question
              </Link>
              <Link
                href="/visit"
                className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-3.5 rounded-full border border-white/20 text-white hover:border-white/40 transition-colors inline-block"
              >
                Visit on Sunday
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
