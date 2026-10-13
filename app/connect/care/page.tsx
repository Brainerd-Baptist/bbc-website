import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import FormRouteNote from "@/components/connect/FormRouteNote";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Care & Prayer — Brainerd Baptist Church" };

export default function CarePage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Care & Prayer"
        title="We're Here for You"
        description="Prayer, hospital visits, grief, financial hardship, a family crisis — whatever you're walking through, this goes straight to our care team and stays private. No one else sees it."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FormRouteNote className="mb-6" href="/connect/general" linkLabel="Send a general message instead.">
            For prayer and care needs: hospital, grief, hardship, family crisis. Just have a question?
          </FormRouteNote>
          <SimpleContactForm
            endpoint="/api/contact/care"
            showPhone
            categoryOptions={["Prayer", "Hospital or home visit", "Financial help", "Grief or family crisis", "Wedding or funeral", "Something else"]}
            messageLabel="What's going on?"
            messagePlaceholder="Share as much or as little as you'd like — we just want to know how to help."
            submitLabel="Send to Care Team"
            successTitle="We've received this."
            successBody="This went only to our care team inbox. Someone will reach out personally and privately by email or phone."
          />
        </div>
      </Section>
    </div>
  );
}
