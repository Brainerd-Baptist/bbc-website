import Link from "next/link";
import Section from "@/components/ui/Section";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Where do I park?",
    a: "Pull into the Red lot on Brookfield Ave, across from the front doors (the Orange lot on Mayfair Ave is close too). Volunteers and signs will guide you. If you're bringing young children, use the Purple lot on Albemarle Ave. We suggest arriving 10–15 minutes early.",
  },
  {
    q: "Is there a dress code?",
    a: "No. Wear what you'd wear on a Saturday. You'll see jeans, shorts, dresses, and a few suits, and nobody is thinking about what you're wearing.",
  },
  {
    q: "What happens on a Sunday?",
    a: "We have two services, at 8:30 and 11:00, and they run about 60 minutes. The 8:30 is led by our choir and orchestra and the 11:00 is led by a band. The church sings together, we pray, and we hear a sermon (a talk of about 35 minutes that works through a passage of the Bible). It's the same sermon at both.",
  },
  {
    q: "Is there coffee?",
    a: "Yes. Coffee is available just inside the sanctuary doors and at the coffee station by the elevator in the main building. Grab a cup and take it into the service with you.",
  },
  {
    q: "What do I do with my kids?",
    a: "From the nursery through 5th grade, your kids are cared for and taught while you worship. Check-in is at the Albemarle Ave entrance (Purple lot) and opens 30 minutes before each service. Every volunteer is background-checked and trained.",
  },
  {
    q: "Am I expected to give when I visit?",
    a: "No. Giving is for people who call Brainerd home. As a guest, simply receive. If you ever want to give, there are blue giving boxes in the lobby, or you can give online.",
  },
  {
    q: "What are Life Groups?",
    a: (
      <>
        Small groups of people who meet weekly to talk through the Sunday passage, pray, and get to
        know each other. On Sundays they meet at 9:45, between the two services. You don&apos;t need to
        think about it your first week.{" "}
        <Link href="/life-groups" className="text-accent-text font-semibold underline underline-offset-2">
          See how they work
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I take communion?",
    a: "Communion is a regular part of our worship. A small piece of bread and a cup are passed through the rows. It's for adults who have repented of their sin, confessed Christ as Lord, and been baptized. If that's not you yet, you're welcome to simply let the tray pass, and we'd love to talk with you about what that step means.",
  },
  {
    q: "Is your campus wheelchair accessible?",
    a: "Yes. The Red Lot, across from the front doors on Brookfield Ave, has 14 accessible spaces, and the Purple Lot on Albemarle Ave has 4 plus a covered drop-off at the Kids entrance. The Sanctuary's front doors have one step up. The step-free way in is the small ramp at the left (west) end of the front porch, or the ramp down to the lobby's side door from the courtyard. The BX has accessible spaces at its front doors and an elevator. If you'd like someone to meet you, tell us on the form above, or ask any greeter.",
  },
  {
    q: "How do I find my way around?",
    a: "Our Welcome Team is at the front doors, under the steeple on Brookfield Ave, and there is a Guest Services desk just inside. Ask anyone. We'll walk you to your room.",
  },
  {
    q: "Do I have to be a member to come, or to serve?",
    a: "No. You're welcome to attend and to serve without being a member. Our hope is that everyone who calls Brainerd home will take the next step and commit to membership, and we're glad to talk about what that means whenever you're ready.",
  },
  {
    q: "Can I watch a service before I visit?",
    a: (
      <>
        Yes. Services stream live on Sundays and the latest sermon is always available{" "}
        <Link href="/live" className="text-accent-text font-semibold underline underline-offset-2">
          here
        </Link>
        .
      </>
    ),
  },
];

export default function VisitFAQ() {
  return (
    <Section className="py-24 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow text-center mb-4">Good Questions</p>
        <h2 className="text-fg text-center mb-12 h-hero">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border p-5 open:bg-surface-raised">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-condensed font-800 text-fg" style={{ fontSize: "1.2rem" }}>
                {f.q}
                <span aria-hidden="true" className="text-accent-text transition group-open:rotate-180">⌄</span>
              </summary>
              <p className="text-fg-muted text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
