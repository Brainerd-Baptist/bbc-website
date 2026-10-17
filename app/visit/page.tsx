import VisitExperience from "@/components/visit/VisitExperience";
import { CHURCH_PHONE } from "@/lib/search-catalog";

const TITLE = "Visit — Brainerd Baptist Church";
const DESCRIPTION =
  "Plan your visit to Brainerd Baptist in Chattanooga. Sunday services at 8:30 and 11:00 AM, location, parking, kids check-in, and what to expect.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
};

// Structured data so search engines can show address, phone, and Sunday
// service times. Facts here must match the glance box on the page.
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://home.brainerdhq.app").replace(/\/$/, "");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: "Brainerd Baptist Church",
  url: SITE,
  telephone: CHURCH_PHONE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "300 Brookfield Ave",
    addressLocality: "Chattanooga",
    addressRegion: "TN",
    postalCode: "37411",
    addressCountry: "US",
  },
  event: [
    { "@type": "Event", name: "Sunday Worship (Choir & Orchestra)", eventSchedule: { "@type": "Schedule", byDay: "https://schema.org/Sunday", startTime: "08:30:00", repeatFrequency: "P1W", scheduleTimezone: "America/New_York" } },
    { "@type": "Event", name: "Sunday Worship (Band-Led)", eventSchedule: { "@type": "Schedule", byDay: "https://schema.org/Sunday", startTime: "11:00:00", repeatFrequency: "P1W", scheduleTimezone: "America/New_York" } },
  ],
};

export default function VisitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VisitExperience />
    </>
  );
}
