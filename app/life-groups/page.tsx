import Link from "next/link";
import Image from "next/image";
import { getPublicLifeGroups } from "@/lib/pco-groups";
import { getSpeaker, speakerSlug } from "@/lib/speakers";
import GroupBrowser from "@/components/life-groups/GroupBrowser";

// Same Church Center host used elsewhere (see CHURCH_CENTER_CALENDAR_URL in
// lib/constants.ts) — the groups directory there is the fallback browse
// link if our own live fetch comes back empty (e.g. credential scope).
const CHURCH_CENTER_GROUPS_URL = "https://brainerdbaptist.churchcenter.com/groups";

export const revalidate = 3600;

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

export default async function LifeGroupsPage() {
  const groups = await getPublicLifeGroups();
  const ben = getSpeaker("Benjamin Hovies");
  const benSlug = speakerSlug("Benjamin Hovies");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Community</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-800 text-fg mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Life Groups
          </h1>
          <p className="text-fg-muted text-lg leading-relaxed">
            Small groups meeting weekly for Bible study, prayer, and genuine community.
            Sunday mornings at 9:45 AM — and throughout the week across Chattanooga.
          </p>
        </div>
      </div>

      {/* Why a Life Group */}
      <section className="py-12 px-6">
        <div className="relative max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-fg text-3xl mb-8">
            Why a Life Group?
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHYS.map((w) => (
              <div key={w.title} className="glass rounded-2xl p-7">
                <h3 className="font-condensed font-800 text-fg text-xl mb-2">{w.title}</h3>
                <p className="text-fg-muted text-sm leading-relaxed">{w.body}</p>
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
              <h2 className="font-condensed font-800 text-fg text-2xl mb-4">When Do They Meet?</h2>
              <div className="space-y-3">
                <div className="glass rounded-xl p-4">
                  <p className="text-accent-text text-xs font-semibold tracking-widest uppercase mb-1">Sunday Mornings</p>
                  <p className="font-semibold text-fg">9:45 AM</p>
                  <p className="text-fg-muted text-sm">On campus — between services</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-accent-text text-xs font-semibold tracking-widest uppercase mb-1">Throughout the Week</p>
                  <p className="font-semibold text-fg">In Homes Across Chattanooga</p>
                  <p className="text-fg-muted text-sm">Evenings vary by group</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-condensed font-800 text-fg text-2xl mb-4">What Happens?</h2>
              <p className="text-fg-muted text-sm leading-relaxed mb-3">
                Most groups open with some time to catch up, then move into the text — usually 30–40 minutes
                of discussion on the week&apos;s passage. Groups end with prayer.
              </p>
              <p className="text-fg-muted text-sm leading-relaxed">
                Groups vary by season of life: young married couples, young families, empty nesters,
                singles, and mixed groups. There is likely a group near you that fits your stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where on campus */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-fg text-3xl mb-2">
            Where on Campus, 9:45 AM?
          </h2>
          <p className="text-fg-muted text-sm mb-8 leading-relaxed">
            First time at 9:45? Here&apos;s where each age group meets between services.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="glass rounded-2xl p-7">
              <p className="text-accent-text text-xs font-semibold tracking-widest uppercase mb-2">Main Building</p>
              <h3 className="font-condensed font-800 text-fg text-xl mb-2">Kids &amp; most Adult groups</h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Kids Life Groups and the large majority of adult groups meet in the main building —
                staff and greeters can point you to your specific room.
              </p>
            </div>
            <div className="glass rounded-2xl p-7">
              <p className="text-accent-text text-xs font-semibold tracking-widest uppercase mb-2">The BX</p>
              <h3 className="font-condensed font-800 text-fg text-xl mb-2">Students, College &amp; a few Adult groups</h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Students and College &amp; Young Adult groups meet at the BX, along with a handful of
                adult groups. Not sure which building your group is in? Ask at check-in and we&apos;ll
                walk you there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Group — live data */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-condensed font-800 text-fg text-3xl mb-2">Find Your Group</h2>
          <p className="text-fg-muted text-sm mb-8 leading-relaxed max-w-2xl">
            Browse our current Life Groups below, or skip straight to a personal recommendation —
            whichever is easier for you.
          </p>

          {groups.length > 0 ? (
            <GroupBrowser groups={groups} />
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-fg-muted text-sm leading-relaxed mb-4">
                Our group list isn&apos;t loading here at the moment — you can still browse every
                current Life Group directly on Church Center.
              </p>
              <a
                href={CHURCH_CENTER_GROUPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-condensed font-700 tracking-wide uppercase text-sm bg-brand-cyan hover:bg-brand-cyan-light text-brand-navy px-6 py-3 rounded-full transition-colors inline-block"
              >
                Browse Groups on Church Center
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Talk to a person instead */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-md rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-brand-navy/5 flex-shrink-0 flex items-center justify-center">
              {ben.photo ? (
                <Image src={`/staff/${ben.photo}.jpg`} alt="Benjamin Hovies" fill className="object-cover object-top" />
              ) : (
                <span className="text-fg-subtle text-2xl font-semibold">BH</span>
              )}
            </div>
            <div className="flex-1">
              <p className="eyebrow-muted mb-1 text-xs">Not sure where to start?</p>
              <h3 className="font-condensed font-800 text-fg text-xl mb-2">
                Reach out to Ben Hovies
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed">
                Ben leads our Life Groups ministry and would love to get to know you and help you
                find a group that fits your season of life.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Link
                href="/connect/staff?staff=Benjamin+Hovies"
                className="font-condensed font-700 tracking-wide uppercase text-sm bg-brand-cyan hover:bg-brand-cyan-light text-brand-navy px-6 py-3 rounded-full transition-colors text-center whitespace-nowrap"
              >
                Message Ben
              </Link>
              <Link
                href={`/speakers/${benSlug}`}
                className="text-accent-text hover:underline text-xs text-center"
              >
                View his profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-condensed font-800 text-fg text-2xl mb-4">New Here?</h2>
          <p className="text-fg-muted mb-8 leading-relaxed">
            Life Groups are an easy next step once you&apos;ve had a chance to visit. Plan your
            first Sunday and we&apos;ll help you find a group from there.
          </p>
          <Link
            href="/visit"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-border hover:border-accent text-fg px-8 py-3.5 rounded-full transition-colors glass inline-block"
          >
            Plan Your Visit
          </Link>
        </div>
      </section>
    </div>
  );
}
