import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import ConnectForm from "@/components/connect/ConnectForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Take a Next Step — Brainerd Baptist Church" };

export default function NextStepPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Take a Next Step"
        title="Ready to Go Deeper?"
        description="Membership, baptism, a Life Group, or serving — tell us what you're interested in and we'll follow up."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <ConnectForm showMembershipOption />
        </div>
      </Section>
    </div>
  );
}
