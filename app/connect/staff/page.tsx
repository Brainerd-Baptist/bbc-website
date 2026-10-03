import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import StaffContactClient from "./StaffContactClient";

export const metadata = { title: "Contact a Staff Member — Brainerd Baptist Church" };

export default function StaffContactPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Contact a Pastor or Staff Member"
        title="Who Would You Like to Reach?"
        description="Select a pastor or staff member below and send them a message directly."
      />
      <section className="pb-24 px-6 relative overflow-hidden isolate">
        <div className="bx-bloom bx-bloom-under" aria-hidden="true" />
        <div className="max-w-2xl mx-auto">
          <StaffContactClient />
        </div>
      </section>
    </div>
  );
}
