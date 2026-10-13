import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Accessibility — Brainerd Baptist Church",
  description:
    "How we're working to make this website usable for everyone, and how to tell us when something gets in your way.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-32 pb-16 px-6" style={{ background: "var(--brand-band)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-4" style={{ color: "var(--accent)" }}>
            Brainerd Baptist Church
          </p>
          <h1 className="text-fg-on-dark mb-5 h-display">Accessibility</h1>
          <p className="text-fg-on-dark-muted text-lg leading-relaxed max-w-xl mx-auto">
            Everyone should be able to use this website.
          </p>
        </div>
      </div>

      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-6 text-fg-muted leading-relaxed">
          <p>
            We want every visitor to be able to find service times, plan a visit, watch a
            service, give, and reach us, whether you use a screen reader, a keyboard instead of
            a mouse, larger text, or captions.
          </p>
          <p>
            We check our pages with automated accessibility tools and keep improving them. That
            includes a link to skip straight to the main content, labeled form fields, a menu you
            can use with the keyboard, and a pause button on the background videos. We have not
            had the site reviewed by an outside accessibility expert yet, so some things may still
            get in your way.
          </p>
          <h2 className="font-condensed font-800 text-fg pt-2" style={{ fontSize: "1.5rem" }}>
            Tell us what&apos;s not working
          </h2>
          <p>
            If something on this site is hard to use, or you need information in another format,
            please tell us and we&apos;ll work on it. Call the church office at{" "}
            <a href={`tel:${SITE.phone.replace(/[^0-9]/g, "")}`} className="text-accent-text underline underline-offset-2">
              {SITE.phone}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${SITE.email}`} className="text-accent-text underline underline-offset-2">
              {SITE.email}
            </a>
            . Tell us the page and what happened, and we&apos;ll get back to you.
          </p>
          <p>
            <Link href="/connect" className="text-accent-text underline underline-offset-2">
              Or use our contact form.
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
