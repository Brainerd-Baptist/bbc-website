import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Get in Touch — Brainerd Baptist Church" };

export default function GeneralContactPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Get in Touch"
        title="Send Us a Message"
        description="Have a general question or comment? Send it our way and someone will get back to you."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SimpleContactForm
            endpoint="/api/contact/general"
            submitLabel="Send Message"
            successTitle="Message sent!"
            successBody="Thanks for reaching out. Someone from our team will get back to you soon."
          />
        </div>
      </Section>
    </div>
  );
}
