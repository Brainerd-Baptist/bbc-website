import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BBC Kids — Brainerd Baptist Church",
  description:
    "From the nursery through 5th grade, your kids are cared for and taught God's Word every Sunday at Brainerd Baptist Church.",
};

// ── Age-group icons ──────────────────────────────────────────
function IconHeart() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 34s-14-8.5-14-18a8 8 0 0 1 14-5.3A8 8 0 0 1 34 16c0 9.5-14 18-14 18z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6l3.8 7.7 8.5 1.2-6.1 6 1.4 8.5L20 25.4l-7.6 4 1.4-8.5-6.1-6 8.5-1.2z" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 32V10a2 2 0 0 1 2-2h10v24H10a2 2 0 0 1-2-2Z" />
      <path d="M20 8h10a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H20V8Z" />
      <path d="M20 8v24" />
      <path d="M12 15h4M12 19h4" />
      <path d="M24 15h4M24 19h4" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6l12 4v10c0 7-5.5 12.5-12 14C13.5 32.5 8 27 8 20V10l12-4z" />
      <path d="M14 20l4 4 8-8" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 6H12a2 2 0 0 0-2 2v10l14 14 12-12z" />
      <circle cx="15" cy="15" r="2" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="#00abc9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="13" r="5" />
      <path d="M8 34c0-7.7 5.4-13 12-13s12 5.3 12 13" />
    </svg>
  );
}

// ── Age groups data ──────────────────────────────────────────
const AGE_GROUPS = [
  {
    icon: <IconHeart />,
    label: "Nursery",
    ages: "Birth – 24 months",
    body: "Your baby is held, loved, and cared for by the same volunteers week after week. We know consistency matters at this age — so do you.",
    note: "Parent pagers available",
  },
  {
    icon: <IconStar />,
    label: "Preschool",
    ages: "2 years – Pre-K",
    body: "Songs, play, and a simple Bible story. Big truths for little hearts. Your preschooler will leave knowing they are loved — by you and by God.",
    note: null,
  },
  {
    icon: <IconBook />,
    label: "Kids",
    ages: "Kindergarten – 5th Grade",
    body: "Age-appropriate teaching straight from God's Word, with time to ask questions and talk through what it means. Starting in K, kids join congregational worship before heading to their class.",
    note: "K joins the main service for worship",
  },
];

// ── Check-in steps ───────────────────────────────────────────
const CHECKIN_STEPS = [
  {
    num: "01",
    heading: "Find a check-in kiosk",
    body: "Check-in kiosks are just inside the main entrance. First time? A volunteer will walk you through the whole thing.",
  },
  {
    num: "02",
    heading: "Print matching labels",
    body: "Your child gets a name tag and you get a matching claim tag. No one leaves the kids area without it matching — ever.",
  },
  {
    num: "03",
    heading: "Drop off and go worship",
    body: "A leader will meet your child at the door. If you want a tour first, just ask — we're happy to show you around.",
  },
  {
    num: "04",
    heading: "Secure pickup",
    body: "At the end of service, we match your claim tag before your child goes anywhere. We page you if they need you before then.",
  },
];

// ── Page ─────────────────────────────────────────────────────
export default function KidsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="relative w-full flex flex-col justify-end overflow-hidden"
        style={{ minHeight: "70vh" }}
      >
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/carousel/music-camp-3.jpg"
          alt="BBC Kids"
          className="absolute inset-0 w-full h-full object-cover object-center"
          aria-hidden="true"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,16,48,0.30) 0%, rgba(0,16,48,0.20) 30%, rgba(0,16,48,0.82) 70%, rgba(0,16,48,0.97) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
          <p className="eyebrow-white mb-4">BBC Kids</p>
          <h1
            className="font-condensed font-900 text-white leading-none mb-5"
            style={{
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            A great Sunday{" "}
            <span style={{ color: "#00abc9" }}>starts here.</span>
          </h1>
          <p
            className="text-white/65 leading-relaxed mb-8 max-w-lg"
            style={{ fontSize: "1.05rem" }}
          >
            From the nursery through 5th grade, your kids are cared for and
            taught God&apos;s Word while you worship — and they&apos;ll actually
            want to come back.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://brainerdbaptist.churchcenter.com/people/forms/376960"
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-7 py-3 rounded-full transition-colors"
              style={{ background: "#00abc9", color: "#00142a" }}
            >
              Pre-Register Your Family
            </a>
            <a
              href="#checkin"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/40 text-white px-7 py-3 rounded-full hover:border-white/70 transition-colors"
            >
              What to Expect
            </a>
          </div>
        </div>
      </section>

      {/* ── Age groups ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#f4f6f9" }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-3">Every age, every Sunday</p>
            <h2
              className="font-condensed font-900"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                color: "#00205B",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              Where does my kid go?
            </h2>
            <p className="text-[#00205B]/55 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              Each environment is designed for where kids are developmentally —
              not just what grade they&apos;re in.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {AGE_GROUPS.map(({ icon, label, ages, body, note }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-8 border border-[#00205B]/08 hover:border-[#00abc9]/30 transition-colors"
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(0,171,201,0.08)" }}
                >
                  {icon}
                </div>

                {/* Age label pill */}
                <div className="mb-3">
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase rounded-full px-3 py-1"
                    style={{ background: "rgba(0,171,201,0.10)", color: "#00abc9" }}
                  >
                    {ages}
                  </span>
                </div>

                <h3
                  className="font-condensed font-800 text-[#00205B] mb-3"
                  style={{ fontSize: "1.5rem", letterSpacing: "-0.01em" }}
                >
                  {label}
                </h3>
                <p className="text-[#00205B]/60 text-sm leading-relaxed mb-4">
                  {body}
                </p>
                {note && (
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#00abc9" }}
                  >
                    ↗ {note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Check-in & Safety ─────────────────────────────── */}
      <section id="checkin" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Left — copy */}
            <div>
              <p className="eyebrow mb-3">Your first question, answered</p>
              <h2
                className="font-condensed font-900 text-[#00205B] mb-5"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                We take safety seriously.
              </h2>
              <p className="text-[#00205B]/55 leading-relaxed mb-6">
                Every volunteer is background-checked and trained before they
                ever work with a child. We use a secure check-in and matching
                label system — your child doesn&apos;t leave without it.
              </p>
              <p className="text-[#00205B]/55 leading-relaxed mb-8">
                If this is your first Sunday, arrive 10–15 minutes early. A
                team member will meet you at the kiosk and walk you through
                everything, including a quick look at the room your child will
                be in.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://brainerdbaptist.churchcenter.com/people/forms/376960"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-condensed font-700 tracking-wide uppercase text-sm px-6 py-3 rounded-full transition-colors inline-flex items-center gap-2"
                  style={{ background: "#00205B", color: "white" }}
                >
                  Pre-Register Online
                </a>
                <Link
                  href="/visit"
                  className="font-condensed font-700 tracking-wide uppercase text-sm border border-[#00205B]/20 text-[#00205B] px-6 py-3 rounded-full hover:border-[#00205B]/40 transition-colors"
                >
                  Plan Your Visit
                </Link>
              </div>
            </div>

            {/* Right — steps */}
            <div className="flex flex-col gap-5">
              {CHECKIN_STEPS.map(({ num, heading, body }) => (
                <div key={num} className="flex gap-5 items-start">
                  <div
                    className="flex-shrink-0 font-condensed font-800 text-[#00abc9] opacity-40 mt-0.5"
                    style={{ fontSize: "2rem", lineHeight: 1 }}
                  >
                    {num}
                  </div>
                  <div>
                    <h3
                      className="font-condensed font-700 text-[#00205B] mb-1"
                      style={{ fontSize: "1.15rem" }}
                    >
                      {heading}
                    </h3>
                    <p className="text-[#00205B]/55 text-sm leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we teach ─────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#00205B" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "#00abc9" }}>
            What we teach
          </p>
          <h2
            className="font-condensed font-900 text-white mb-8"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            The same Bible, at their level.
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-left mb-10">
            {[
              {
                icon: <IconBook />,
                title: "Scripture-based",
                body: "We teach directly from the Bible — not just moral lessons or stories. Kids learn to know and trust God&apos;s Word.",
              },
              {
                icon: <IconShield />,
                title: "Gospel-centered",
                body: "Every lesson points back to Jesus. We never let kids leave thinking good behavior earns God&apos;s love.",
              },
              {
                icon: <IconPerson />,
                title: "Relationship-driven",
                body: "The same leaders show up week after week. Kids are known by name, and that consistency matters more than any curriculum.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="glass-dark rounded-2xl p-6"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(0,171,201,0.12)" }}
                >
                  {icon}
                </div>
                <h3
                  className="font-condensed font-700 text-white mb-2"
                  style={{ fontSize: "1.2rem" }}
                >
                  {title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <p className="text-white/45 text-sm max-w-xl mx-auto leading-relaxed">
            We use the{" "}
            <span className="text-white/70">Gospel Project curriculum</span>{" "}
            from LifeWay, which takes kids through the whole Bible every three years —
            starting from Genesis and showing how every story points to Jesus.
          </p>
        </div>
      </section>

      {/* ── Photo strip ───────────────────────────────────── */}
      <section className="py-0 overflow-hidden">
        <div className="flex gap-1" style={{ height: "280px" }}>
          {[
            "/carousel/music-camp-1.jpg",
            "/carousel/music-camp-2.jpg",
            "/carousel/music-camp-4.jpg",
            "/carousel/music-camp-5.jpg",
          ].map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              aria-hidden="true"
              className="flex-1 object-cover object-center"
              style={{ minWidth: 0 }}
            />
          ))}
        </div>
      </section>

      {/* ── First-time CTA ─────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-3">Ready to visit?</p>
          <h2
            className="font-condensed font-900 text-[#00205B] mb-5"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            We&apos;d love to meet your family.
          </h2>
          <p className="text-[#00205B]/55 leading-relaxed mb-8 max-w-md mx-auto">
            Pre-register online and your first check-in takes about 60 seconds.
            Or just show up — we&apos;ll walk you through everything at the kiosk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://brainerdbaptist.churchcenter.com/people/forms/376960"
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed font-700 tracking-wide uppercase text-sm px-8 py-4 rounded-full transition-colors"
              style={{ background: "#00abc9", color: "#00142a" }}
            >
              Pre-Register Your Family
            </a>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-[#00205B]/20 text-[#00205B] px-8 py-4 rounded-full hover:border-[#00205B]/40 transition-colors"
            >
              Plan Your Visit
            </Link>
          </div>

          {/* Contact fallback */}
          <p className="text-[#00205B]/35 text-xs mt-8">
            Questions? Email us at{" "}
            <a
              href="mailto:kids@brainerdbaptist.org"
              className="underline underline-offset-2 hover:text-[#00205B]/55 transition-colors"
            >
              kids@brainerdbaptist.org
            </a>
          </p>
        </div>
      </section>

    </div>
  );
}
