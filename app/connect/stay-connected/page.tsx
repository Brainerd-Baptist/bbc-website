import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import ClearstreamForm from "./ClearstreamForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Stay Connected — Brainerd Baptist Church" };

export default function StayConnectedPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Stay Connected"
        title="Get Texts & Emails from Brainerd"
        description="Sign up to receive announcements, event reminders, and updates from Brainerd Baptist."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <ClearstreamForm />
        </div>
      </Section>
    </div>
  );
}
