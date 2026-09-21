import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";

export const metadata = { title: "Stay Connected — Brainerd Baptist Church" };

// TODO: Replace this placeholder with the Clearstream embed once Josiah
// supplies the embed snippet/URL currently live on brainerdbaptist.org.
// Slot it in below where the placeholder card is, matching the max-w-2xl
// column width used by the other Connect subpages.
export default function StayConnectedPage() {
  return (
    <div className="min-h-screen bg-white">
      <ConnectSubpageHeader
        eyebrow="Stay Connected"
        title="Get Texts & Emails from Brainerd"
        description="Sign up to receive announcements, event reminders, and updates from Brainerd Baptist."
      />
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-dashed border-[#00205B]/20 p-10 text-center text-[#00205B]/40 text-sm">
            Text/email signup coming soon.
          </div>
        </div>
      </section>
    </div>
  );
}
