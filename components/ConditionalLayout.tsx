"use client";

/**
 * Wraps Navbar / Footer conditionally.
 * Pages under /sermons/*/notes are standalone printable pages —
 * they get no site chrome.
 */

import { usePathname } from "next/navigation";
import Navbar from "@/components/nav/Navbar";
import Footer from "@/components/footer/Footer";
import GlobalAudioPlayer from "@/components/audio/GlobalAudioPlayer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Standalone printable routes — no nav, no footer
  const isStandalone = /\/sermons\/[^/]+\/notes(\/|$)/.test(pathname ?? "");

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <GlobalAudioPlayer />
    </>
  );
}
