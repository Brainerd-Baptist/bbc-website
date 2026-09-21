import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import ClearstreamForm from "./ClearstreamForm";

export const metadata = { title: "Stay Connected — Brainerd Baptist Church" };

export default function StayConnectedPage() {
  return (
    <div className="min-h-screen bg-surface">
      <ConnectSubpageHeader
        eyebrow="Stay Connected"
        title="Get Texts & Emails from Brainerd"
        description="Sign up to receive announcements, event reminders, and updates from Brainerd Baptist."
      />
      <section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <ClearstreamForm />
        </div>
      </section>
    </div>
  );
}
