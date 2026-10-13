import ConnectSubpageHeader from "@/components/connect/ConnectSubpageHeader";
import Link from "next/link";
import ClearstreamForm from "./ClearstreamForm";

import Section from "@/components/ui/Section";
export const metadata = { title: "Stay Connected — Brainerd Baptist Church" };

export default function StayConnectedPage() {
  return (
    <div className="min-h-screen">
      <ConnectSubpageHeader
        eyebrow="Stay Connected"
        title="Get Texts & Emails from Brainerd"
        description="Sign up to receive announcements, event reminders, and updates from Brainerd Baptist."
      />
      <Section className="pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-fg-muted leading-relaxed mb-6">
            This is only for church newsletter texts and emails. It doesn&apos;t add you to our
            church database or register your kids. Visiting?{" "}
            <Link href="/visit#connect" className="text-accent-text font-semibold underline underline-offset-2">
              Introduce yourself
            </Link>
            . Bringing children?{" "}
            <Link href="/ministries/kids#pre-register" className="text-accent-text font-semibold underline underline-offset-2">
              Pre-register them
            </Link>
            .
          </p>
          <ClearstreamForm />
        </div>
      </Section>
    </div>
  );
}
