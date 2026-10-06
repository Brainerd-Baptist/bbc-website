import SimpleContactForm from "@/components/connect/SimpleContactForm";

/**
 * The quick "pop off a message" box for a ministry page — one component for
 * every ministry so they all look and behave the same, posting to
 * /api/contact/ministry (which owns the destination mailbox — the page only
 * says WHICH ministry). Carries its own raised surface so it reads correctly
 * on both light and dark page sections, and replaces the raw mailto: links
 * these pages used to print (those exposed the mailbox to scrapers and
 * dropped people into whatever mail app they happened to have configured).
 */
export default function MinistryQuickMessage({
  ministry,
  title,
  blurb,
  id = "quick-message",
}: {
  ministry: "kids" | "students" | "college" | "wednesday" | "bx";
  title: string;
  blurb: string;
  id?: string;
}) {
  return (
    <section id={id} className="py-16 px-6 scroll-mt-24">
      <div className="max-w-xl mx-auto rounded-2xl border border-border bg-surface-raised px-6 py-8 sm:px-8">
        <p className="eyebrow mb-2">Quick message</p>
        <h2 className="font-condensed font-800 text-fg text-2xl mb-2">{title}</h2>
        <p className="text-fg-muted text-sm leading-relaxed mb-6">{blurb}</p>
        <SimpleContactForm
          endpoint="/api/contact/ministry"
          extraFields={{ ministry }}
          messagePlaceholder="What would you like to ask?"
          submitLabel="Send message"
          successTitle="Message sent"
          successBody="Thanks! It went to the team by email, and we sent you a confirmation. Someone will reply soon."
        />
      </div>
    </section>
  );
}
