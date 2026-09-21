"use client";

import { useSearchParams } from "next/navigation";
import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

const CATEGORY_COPY: Record<string, { eyebrow: string; title: string; description: string; placeholder: string }> = {
  "website-issue": {
    eyebrow: "Report a Website Issue",
    title: "Something Not Working Right?",
    description: "Broken link, typo, a page that won't load — let us know and we'll get it fixed.",
    placeholder: "What page were you on, and what happened?",
  },
  "building-use": {
    eyebrow: "Building or Event Space Use",
    title: "Looking to Use Our Space?",
    description: "Tell us about your event and we'll follow up with availability and details.",
    placeholder: "What's the event, and when are you hoping to use the space?",
  },
  other: {
    eyebrow: "Other",
    title: "Get in Touch",
    description: "Tell us what's on your mind.",
    placeholder: "How can we help?",
  },
};

export default function OtherContactClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "other";
  const copy = CATEGORY_COPY[category] ?? CATEGORY_COPY.other;

  return (
    <div className="min-h-screen bg-white">
      <ConnectSubpageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <SimpleContactForm
            endpoint="/api/contact/utility"
            extraFields={{ category }}
            messagePlaceholder={copy.placeholder}
            submitLabel="Send"
          />
        </div>
      </section>
    </div>
  );
}
