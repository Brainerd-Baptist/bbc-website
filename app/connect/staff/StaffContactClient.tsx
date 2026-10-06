"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { STAFF_ROSTER, getSpeaker, speakerSlug } from "@/lib/speakers";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

export default function StaffContactClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffParam = searchParams.get("staff");
  // Selection used to live in local useState, so clicking a staff card never
  // touched the URL or browser history: the view re-rendered in place at
  // whatever scroll position the click happened at (the footer, for anyone
  // low in the grid), and the Safari back button had no history entry to
  // undo, so it skipped past this page entirely. Deriving `selected` from
  // the ?staff= query param instead gives every pick a real history entry —
  // back genuinely returns to the grid on this same page — and lets the
  // effect below scroll the new view to the top every time. See the
  // staff-contact scroll/back-button report, 2026-10-06.
  const selected = staffParam && STAFF_ROSTER.includes(staffParam) ? staffParam : null;

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [selected]);

  if (selected) {
    const info = getSpeaker(selected);
    return (
      <div ref={containerRef} className="space-y-6">
        <button
          onClick={() => router.push("/connect/staff")}
          className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg text-sm font-medium transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2L4 6l4 4" />
          </svg>
          Choose someone else
        </button>
        <div className="flex items-center gap-4">
          {info.photo && (
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-brand-navy/5 flex-shrink-0">
              <Image src={`/staff/${info.photo}.jpg`} alt={selected} fill className="object-cover object-top" />
            </div>
          )}
          <div>
            <p className="font-semibold text-fg text-lg">{selected}</p>
            <p className="text-fg-muted text-sm">{info.title}</p>
            <Link
              href={`/speakers/${speakerSlug(selected)}`}
              className="text-accent-text hover:underline text-xs font-medium inline-block mt-1"
            >
              View full profile
            </Link>
          </div>
        </div>
        <SimpleContactForm
          endpoint="/api/contact/staff"
          extraFields={{ staffName: selected }}
          messagePlaceholder={`What would you like to ask ${selected.split(" ")[0]}?`}
          submitLabel="Send Message"
          successTitle="Message sent!"
          successBody={`This went to ${selected.split(" ")[0]}'s inbox, and they'll reply by email.`}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {STAFF_ROSTER.map((name) => {
        const info = getSpeaker(name);
        return (
          <button
            key={name}
            onClick={() => router.push(`/connect/staff?staff=${encodeURIComponent(name)}`)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border hover:border-accent/40 hover:shadow-sm transition text-center group"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-brand-navy/5 flex-shrink-0">
              {info.photo ? (
                <Image src={`/staff/${info.photo}.jpg`} alt={name} fill className="object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-fg-subtle text-xl font-semibold">
                  {name.split(" ").map((n) => n[0]).join("")}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-fg group-hover:text-accent-text transition-colors leading-tight">
                {name}
              </p>
              <p className="text-xs text-fg-muted leading-tight mt-0.5">{info.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
