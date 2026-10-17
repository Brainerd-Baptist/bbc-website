import Link from "next/link";
import Section from "@/components/ui/Section";

const NOTES: { title: string; body: React.ReactNode }[] = [
  {
    title: "Come as you are",
    body: "You'll see everything from jeans to Sunday best.",
  },
  {
    title: "Want a peek first?",
    body: (
      <>
        Services stream live on Sundays, and the latest message is always available{" "}
        <Link href="/live" className="text-accent-text font-semibold underline underline-offset-2">
          here
        </Link>
        .
      </>
    ),
  },
];

const DETAILS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How giving works",
    a: (
      <>
        Giving is for people who call Brainerd home. If you&apos;d like to give, there are blue giving
        boxes in the lobby, or you can{" "}
        <Link href="/give" className="text-accent-text font-semibold underline underline-offset-2">
          give online
        </Link>
        .
      </>
    ),
  },
  {
    q: "Communion",
    a: "Communion is a regular part of our worship. A small piece of bread and a cup are passed through the rows. It's for adults who have repented of their sin, confessed Christ as Lord, and been baptized. If that's not you yet, you're welcome to simply let the tray pass, and we'd love to talk with you about what that step means.",
  },
  {
    q: "Getting around",
    a: (
      <>
        Accessible parking, step-free entrances, and elevators are marked on the{" "}
        <Link href="/map" className="text-accent-text font-semibold underline underline-offset-2">
          campus map
        </Link>
        . The Red Lot, across from the front doors on Brookfield Ave, has 14 accessible spaces, and the
        Purple Lot on Albemarle Ave has 4 plus a covered drop-off at the Kids entrance. The step-free way
        into the sanctuary is the small ramp at the left (west) end of the front porch, or the ramp down to
        the lobby&apos;s side door from the courtyard. The BX has accessible spaces at its front doors and an
        elevator. If you&apos;d like someone to meet you, tell us on the form below or call (423) 624-2606.
      </>
    ),
  },
];

export default function VisitFAQ() {
  return (
    <Section className="py-24 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow text-center mb-4">Before You Come</p>
        <h2 className="text-fg text-center mb-12 h-hero">Good to Know</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {NOTES.map((n) => (
            <div key={n.title} className="rounded-2xl border border-border p-5">
              <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.2rem" }}>{n.title}</p>
              <p className="text-fg-muted text-sm leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {DETAILS.map((f) => (
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
