import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import ConnectForm from "@/components/connect/ConnectForm";

export const metadata = { title: "Take a Next Step — Brainerd Baptist Church" };

export default function NextStepPage() {
  return (
    <div className="min-h-screen bg-surface">
      <ConnectSubpageHeader
        eyebrow="Take a Next Step"
        title="Ready to Go Deeper?"
        description="Membership, baptism, a Life Group, or serving — tell us what you're interested in and we'll follow up."
      />
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <ConnectForm showMembershipOption />
        </div>
      </section>
    </div>
  );
}
