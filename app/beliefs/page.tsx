import Link from "next/link";
import BeliefQuestion from "@/components/beliefs/BeliefQuestion";
import ScriptureRef from "@/components/beliefs/ScriptureRef";

export const metadata = {
  title: "What We Believe — Brainerd Baptist Church",
  description:
    "What Brainerd Baptist Church believes about Scripture, the Gospel, worship, baptism, communion, community, and missions.",
};

// ── Thin-line SVG icons ──────────────────────────────────────
function IconBook() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 32V10a2 2 0 0 1 2-2h10v24H10a2 2 0 0 1-2-2Z" />
      <path d="M20 8h10a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H20V8Z" />
      <path d="M20 8v24" />
      <path d="M12 14h4M12 18h4M12 22h4" />
      <path d="M24 14h4M24 18h4M24 22h4" />
    </svg>
  );
}

function IconCross() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round">
      <path d="M20 6v28M10 14h20" />
    </svg>
  );
}

function IconTrinity() {
  // Classic Trinity symbol — three circles with heavy overlap (Borromean rings style)
  // r=12, centers ~10.5 apart so each pair overlaps by ~13.5px (>half diameter)
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="15" r="12" />
      <circle cx="14.5" cy="24" r="12" />
      <circle cx="25.5" cy="24" r="12" />
    </svg>
  );
}

function IconWorship() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* building / gathering */}
      <path d="M6 34h28" />
      <path d="M10 34V18l10-10 10 10v16" />
      <path d="M16 34v-8h8v8" />
      <path d="M20 8v-4" />
    </svg>
  );
}

function IconWater() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6C20 6 10 18 10 25a10 10 0 0 0 20 0C30 18 20 6 20 6Z" />
      <path d="M14 28c1 2 3.5 4 6 4" />
    </svg>
  );
}

function IconCup() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {/* Chalice */}
      <path d="M3 9h16" />
      <path d="M3 9c1 12 4 16 8 16s7-4 8-16" />
      <path d="M11 25v7M7 32h8" />
      {/* Bread piece */}
      <rect x="21" y="11" width="16" height="14" rx="4" />
      <path d="M25 14v8M29 11v14" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="13" r="4" />
      <circle cx="26" cy="13" r="4" />
      <path d="M6 34c0-6 3.6-10 8-10h12c4.4 0 8 4 8 10" />
      <circle cx="20" cy="11" r="4" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="14" />
      <path d="M6 20h28" />
      <path d="M20 6c-4 4-6 9-6 14s2 10 6 14" />
      <path d="M20 6c4 4 6 9 6 14s-2 10-6 14" />
    </svg>
  );
}

// ── Belief data ──────────────────────────────────────────────
// Order follows BF&M 2000: I Scripture · II God · IV Salvation · VI Church · VII Ordinances · XI Missions
const BELIEFS = [
  {
    icon: <IconBook />,
    title: "Scripture",
    // BF&M Article I — 2 Timothy 3:15–17; 2 Peter 1:20–21
    body: "The Bible is God's Word — fully true, fully sufficient, and the final authority for everything we believe and do. Every sermon works through a book of the Bible because we believe every word of it matters.",
    verse: "2 Timothy 3:15–17 · 2 Peter 1:20–21",
  },
  {
    icon: <IconTrinity />,
    title: "God",
    // BF&M Article II — 2 Corinthians 13:14; Matthew 28:19; Genesis 1:1
    body: "We believe in one God who exists in three persons — Father, Son, and Holy Spirit — equal in nature, distinct in person, unified in purpose. He is the creator and sustainer of all things.",
    verse: "Genesis 1:1 · Matthew 28:19 · 2 Corinthians 13:14",
  },
  {
    icon: <IconCross />,
    title: "Salvation",
    // BF&M Article IV — John 3:16; Romans 3:23; Romans 5:8; Ephesians 2:8–9
    body: "Every person is made in God's image and fallen by sin, in need of rescue. Jesus Christ — fully God, fully man — lived without sin, died in our place, and rose from the dead. Salvation is by grace through faith in him alone. Nothing we do earns it.",
    verse: "John 3:16 · Romans 3:23 · Ephesians 2:8–9",
  },
  {
    icon: <IconWorship />,
    title: "Sunday Worship",
    // BF&M Article VI (The Church) + Article VIII (The Lord's Day) — Hebrews 10:24–25; Acts 20:7
    body: "Sunday is when the church gathers — not to watch a performance, but to be the body of Christ together. We sing, we pray for one another, and we sit under the teaching of God's Word. The whole congregation worships, not just the stage.",
    verse: "Hebrews 10:24–25 · Acts 20:7",
  },
  {
    icon: <IconWater />,
    title: "Baptism",
    // BF&M Article VII — Romans 6:3–5; Matthew 28:19–20
    body: "Baptism is for the believer — someone who has trusted Jesus and wants to publicly declare it. We baptize by immersion as a picture of death to the old life and resurrection to the new.",
    verse: "Romans 6:3–5 · Matthew 28:19–20",
  },
  {
    icon: <IconCup />,
    title: "The Lord's Supper",
    // BF&M Article VII — 1 Corinthians 11:23–29; Matthew 26:26–30
    body: "Communion is a regular part of our worship. We take it together as a church, remembering what Jesus did on the cross. It's open to anyone in the room who has committed their life to him.",
    verse: "1 Corinthians 11:23–29 · Matthew 26:26–30",
  },
  {
    icon: <IconPeople />,
    title: "Life Together",
    // BF&M Article VI (The Church) — Acts 2:41–47; Ephesians 4:11–16
    body: "Following Jesus is meant to be done together, not alone. Life Groups are how we do that — small circles of people who study Scripture, pray for one another, and show up for each other's lives.",
    verse: "Acts 2:41–47 · Ephesians 4:11–16",
  },
  {
    icon: <IconGlobe />,
    title: "Missions",
    // BF&M Article XI — Matthew 28:18–20; Acts 1:8; Romans 10:13–15
    body: "Jesus told his disciples to take the gospel to the nations — and we take that seriously. We send people and resources to plant churches and share the gospel across Chattanooga and around the world.",
    verse: "Matthew 28:18–20 · Acts 1:8",
  },
];

// ── Belief card ──────────────────────────────────────────────
function BeliefCard({ icon, title, body, verse }: {
  icon: React.ReactNode;
  title: string;
  body: string;
  verse: string;
}) {
  const refs = verse.split(" · ");
  return (
    <div className="flex gap-6 p-7 rounded-2xl border border-[#00205B]/08 bg-white hover:border-[#00abc9]/25 transition-colors">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h3
          className="font-condensed font-800 text-[#00205B] mb-2"
          style={{ fontSize: "1.4rem", letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
        <p className="text-[#00205B]/60 text-sm leading-relaxed mb-3">{body}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
          {refs.map((ref, i) => (
            <span key={ref} className="flex items-center gap-3">
              <ScriptureRef reference={ref} />
              {i < refs.length - 1 && (
                <span className="text-[#00205B]/20 text-xs select-none">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function BeliefsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center" style={{ background: "#00205B" }}>
        <p className="eyebrow mb-4" style={{ color: "#00abc9" }}>Brainerd Baptist Church</p>
        <h1
          className="font-condensed font-900 text-white"
          style={{ fontSize: "clamp(3.5rem, 10vw, 6rem)", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          What We Believe
        </h1>
        <p className="text-white/45 mt-6 max-w-md mx-auto text-sm leading-relaxed">
          Eight things at the center of who we are — what we teach, how we gather, and why it matters.
        </p>
      </section>

      {/* ── Beliefs grid ───────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5">
            {BELIEFS.map((b) => (
              <BeliefCard key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Question box ────────────────────────────────── */}
      <BeliefQuestion />

      {/* ── BF&M footnote ──────────────────────────────────── */}
      <section className="py-10 px-6 bg-white border-t border-[#00205B]/06">
        <p className="text-center text-[#00205B]/35 text-xs max-w-lg mx-auto leading-relaxed">
          Brainerd Baptist Church holds to the{" "}
          <a
            href="https://bfm.sbc.net/bfm2000/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-[#00205B]/55 transition-colors"
          >
            Baptist Faith &amp; Message 2000
          </a>{" "}
          as our shared confession of faith.
        </p>
      </section>

    </div>
  );
}
