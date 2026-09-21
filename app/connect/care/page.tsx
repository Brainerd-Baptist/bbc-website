import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

export const metadata = { title: "Care & Support — Brainerd Baptist Church" };

export default function CarePage() {
  return (
    <div className="min-h-screen bg-white">
      <ConnectSubpageHeader
        eyebrow="Care & Support"
        title="We're Here for You"
        description="Hospital visits, grief, financial hardship, a family crisis — whatever you're walking through, this goes straight to our care team and stays private. No one else sees it."
      />
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SimpleContactForm
            endpoint="/api/contact/care"
            showPhone
            messageLabel="What's going on?"
            messagePlaceholder="Share as much or as little as you'd like — we just want to know how to help."
            submitLabel="Send to Care Team"
            successTitle="We've received this."
            successBody="Someone from our care team will reach out soon, personally and privately."
          />
        </div>
      </section>
    </div>
  );
}
