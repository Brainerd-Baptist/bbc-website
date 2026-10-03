import Link from "next/link";
import ConnectTiles from "@/components/connect/ConnectTiles";
import ConnectSidebar from "@/components/connect/ConnectSidebar";
import Card from "@/components/ui/Card";

export default function ConnectPage() {
  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Reach Out</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-800 text-fg mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Connect With Us
          </h1>
          <p className="text-fg-muted text-lg leading-relaxed">
            Whether you are visiting for the first time, looking for community, or
            simply have a question — tell us what brings you here and we&apos;ll
            get you to the right place.
          </p>
        </div>
      </div>

      {/* Main grid: tiles + info */}
      <section className="pb-24 px-6">
        <div className="relative max-w-5xl mx-auto grid md:grid-cols-[1fr_340px] gap-10">
          <ConnectTiles />
          <ConnectSidebar />
        </div>

        {/* Which form? */}
        <Card className="relative max-w-5xl mx-auto mt-10 rounded-2xl p-6 md:p-8">
          <h2 className="font-condensed font-800 text-fg text-xl mb-1">Not sure which form to use?</h2>
          <p className="text-fg-muted text-sm leading-relaxed mb-4">
            Some forms add you to our church database. Others send a private email to one team.
          </p>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-fg font-semibold">Visiting or just saying hello</dt>
              <dd className="text-fg-muted">
                <Link href="/visit#connect" className="text-accent-text underline underline-offset-2">Introduce yourself</Link>. Adds you to our database.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Registering children for Sunday</dt>
              <dd className="text-fg-muted">
                <Link href="/ministries/kids#pre-register" className="text-accent-text underline underline-offset-2">Kids pre-registration</Link>. Adds your family and each child.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Membership, baptism, groups, serving</dt>
              <dd className="text-fg-muted">
                <Link href="/connect/next-step" className="text-accent-text underline underline-offset-2">Take a next step</Link>. Adds you to our database.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Hospital, grief, hardship</dt>
              <dd className="text-fg-muted">
                <Link href="/connect/care" className="text-accent-text underline underline-offset-2">Care &amp; support</Link>. Private email to our care team.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">A question for one person</dt>
              <dd className="text-fg-muted">
                <Link href="/connect/staff" className="text-accent-text underline underline-offset-2">Contact a staff member</Link>. Email to that person.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Anything else</dt>
              <dd className="text-fg-muted">
                <Link href="/connect/general" className="text-accent-text underline underline-offset-2">General message</Link>. Email to our connect team.
              </dd>
            </div>
          </dl>
        </Card>

        {/* Utility links */}
        <div className="relative max-w-5xl mx-auto mt-10 pt-8 border-t border-border flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link href="/connect/other?category=website-issue" className="text-fg-muted hover:text-accent-text transition-colors">
            Report a website issue
          </Link>
          <Link href="/connect/other?category=building-use" className="text-fg-muted hover:text-accent-text transition-colors">
            Building or event space use
          </Link>
        </div>
      </section>
    </div>
  );
}
