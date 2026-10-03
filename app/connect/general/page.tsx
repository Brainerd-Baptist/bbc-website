import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import FormRouteNote from "@/components/connect/FormRouteNote";
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
          <FormRouteNote className="mb-6" href="/connect" linkLabel="See all the ways to connect.">
            General questions and comments only. Need prayer, care, or a specific person?
          </FormRouteNote>
          <SimpleContactForm
            endpoint="/api/contact/general"
            submitLabel="Send Message"
            successTitle="Message sent!"
            successBody="This went to our connect team inbox. Someone will reply by email. It doesn't add you to our church database, so if you're visiting, use the introduction form on the Visit page too."
          />
        </div>
      </Section>
    </div>
  );
}
