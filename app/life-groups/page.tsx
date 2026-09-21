import Link from "next/link";

export const metadata = {
  title: "Life Groups — Brainerd Baptist Church",
  description:
    "Life Groups at Brainerd Baptist — small groups meeting weekly for Bible study, prayer, and community.",
};

const WHYS = [
  {
    title: "Know and Be Known",
    body: "Sunday morning is where we gather. Life Groups are where we belong. A smaller circle makes it possible for people to actually know your name and your story.",
  },
  {
    title: "Study God's Word Together",
    body: "Every Life Group meets around Scripture. Groups typically follow the Sunday sermon series, so you go deeper on the same text you heard preached.",
  },
  {
    title: "Pray for One Another",
    body: "We believe prayer is a community act. Life Groups create space to share honestly and carry one another's burdens in prayer.",
  },
  {
    title: "Serve Together",
    body: "Many of our most meaningful service opportunities happen at the Life Group level — neighbors helping neighbors, church family caring for church family.",
  },
];

export default function LifeGroupsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Community</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-800 text-[#00205B] mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Life Groups
          </h1>
          <p className="text-[#00205B]/60 text-lg leading-relaxed">
            Small groups meeting weekly for Bible study, prayer, and genuine community.
            Sunday mornings at 9:45 AM — and throughout the week across Chattanooga.
          </p>
        </div>
      </div>

      {/* Why a Life Group */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-[#00205B] text-3xl mb-8">
            Why a Life Group?
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHYS.map((w) => (
              <div key={w.title} className="glass rounded-2xl p-7">
                <h3 className="font-condensed font-800 text-[#00205B] text-xl mb-2">{w.title}</h3>
                <p className="text-[#00205B]/60 text-sm leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When/where */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-md rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-condensed font-800 text-[#00205B] text-2xl mb-4">When Do They Meet?</h2>
              <div className="space-y-3">
                <div className="glass rounded-xl p-4">
                  <p className="text-brand-cyan text-xs font-semibold tracking-widest uppercase mb-1">Sunday Mornings</p>
                  <p className="font-semibold text-[#00205B]">9:45 AM</p>
                  <p className="text-[#00205B]/60 text-sm">On campus — between services</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-brand-cyan text-xs font-semibold tracking-widest uppercase mb-1">Throughout the Week</p>
                  <p className="font-semibold text-[#00205B]">In Homes Across Chattanooga</p>
                  <p className="text-[#00205B]/60 text-sm">Evenings vary by group</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-condensed font-800 text-[#00205B] text-2xl mb-4">What Happens?</h2>
              <p className="text-[#00205B]/60 text-sm leading-relaxed mb-3">
                Most groups open with some time to catch up, then move into the text — usually 30–40 minutes
                of discussion on the week&apos;s passage. Groups end with prayer.
              </p>
              <p className="text-[#00205B]/60 text-sm leading-relaxed">
                Groups vary by season of life: young married couples, young families, empty nesters,
                singles, and mixed groups. There is likely a group near you that fits your stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-condensed font-800 text-[#00205B] text-3xl mb-4">
            Find a Group
          </h2>
          <p className="text-[#00205B]/60 mb-8 leading-relaxed">
            The best way to find a Life Group is to ask. Fill out a connect card and we
            will help match you with a group near you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/connect"
              className="font-condensed font-700 tracking-wide uppercase text-sm bg-brand-cyan hover:bg-brand-cyan-light text-brand-navy px-8 py-3.5 rounded-full transition-colors"
            >
              Find a Group
            </Link>
            <Link
              href="/visit"
              className="font-condensed font-700 tracking-wide uppercase text-sm border border-white/20 hover:border-white/40 text-[#00205B] px-8 py-3.5 rounded-full transition-colors glass"
            >
              Plan Your Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
