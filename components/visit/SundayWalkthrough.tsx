import Link from "next/link";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import BibleAppLink from "@/components/visit/BibleAppLink";

// What a Sunday looks like, as facts a visitor can plan around. The welcome
// itself isn't described here: people experience it rather than being told.
// Kids check-in lives in the Kids section below, not here.
const STEPS: { num: string; label: string; heading: string; body: React.ReactNode }[] = [
  {
    num: "01",
    label: "Choose a service",
    heading: "8:30 or 11:00",
    body: (
      <>
        Both meet in the sanctuary of the main building, the one with the steeple, and the message is the
        same at both (about 35 minutes). Both center on congregational singing. The difference is who
        leads up front: a choir and orchestra at 8:30, a band at 11:00.
      </>
    ),
  },
  {
    num: "02",
    label: "Park",
    heading: "Red or Orange lot",
    body: (
      <>
        The Red Lot is across from the front entrance. The Orange Lot is on Mayfair Ave if the Red fills
        up. All lots are free. Accessible spaces and the step-free ways in are on the{" "}
        <Link href="/map" className="text-accent-text underline underline-offset-2">campus map</Link>.
      </>
    ),
  },
  {
    num: "03",
    label: "Come in",
    heading: "Coffee's on us",
    body: "Grab a free coffee just inside the sanctuary doors, or at the coffee station by the elevator.",
  },
  {
    num: "04",
    label: "The service",
    heading: "About 60 minutes",
    body: (
      <>
        We sing together, then hear a message that works through a book of the Bible verse by verse. Bring
        a Bible, or use one from the pew or the free <BibleAppLink>Bible app</BibleAppLink>.
      </>
    ),
  },
];

export default function SundayWalkthrough() {
  return (
    <Section className="py-24 px-6" id="sunday-walkthrough">
      <div className="max-w-5xl mx-auto">
        <p className="eyebrow text-center mb-4">Your First Sunday</p>
        <h2 className="text-fg text-center mb-14 h-hero">What Sunday Is Like</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {STEPS.map((s) => (
            <Card key={s.num} className="rounded-2xl p-7">
              <p className="eyebrow mb-2">
                {s.num} · {s.label}
              </p>
              <p className="font-condensed font-800 text-fg mb-2" style={{ fontSize: "1.35rem" }}>
                {s.heading}
              </p>
              <p className="text-fg-muted text-sm leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
