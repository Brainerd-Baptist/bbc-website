import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import FormRouteNote from "@/components/connect/FormRouteNote";
import ConnectForm, { INTEREST_ID_BY_SLUG } from "@/components/connect/ConnectForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Take a Next Step — Brainerd Baptist Church" };

export default async function NextStepPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  // Nav drawer links for Baptism and Serving (components/nav/Navbar.tsx)
  // both land here — this is one general intake form, not separate pages
  // per interest — but previously gave no indication which track someone
  // clicked from (found during the 2026-10-04 nav/footer audit: they even
  // had the exact same href). ?interest=baptism|serving now pre-checks
  // the matching box below instead.
  const { interest } = await searchParams;
  const preselectedId = interest ? INTEREST_ID_BY_SLUG[interest] : undefined;

  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Take a Next Step"
        title="Ready to Go Deeper?"
        description="Membership, baptism, a Life Group, or serving — tell us what you're interested in and we'll follow up."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FormRouteNote className="mb-6" href="/ministries/kids#pre-register" linkLabel="Pre-register your kids instead.">
            This adds you to our church database so a pastor can follow up. Registering children for Sunday?
          </FormRouteNote>
          <p className="text-sm text-fg-muted leading-relaxed mb-6">
            Thinking about baptism? It&apos;s simply the next step after being
            changed by Jesus — a public profession of faith, not a program.
            Check the Baptism box below and a pastor will reach out to walk
            through it with you.
          </p>
          <ConnectForm
            showMembershipOption
            initialInterestIds={preselectedId ? [preselectedId] : undefined}
          />
        </div>
      </Section>
    </div>
  );
}
