import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import StaffContactClient from "./StaffContactClient";

import Section from "@/components/ui/Section";
export const metadata = { title: "Contact a Staff Member — Brainerd Baptist Church" };

export default function StaffContactPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Contact a Pastor or Staff Member"
        title="Who Would You Like to Reach?"
        description="Select a pastor or staff member below and send them a message directly."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <StaffContactClient />
        </div>
      </Section>
    </div>
  );
}
