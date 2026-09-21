"use client";

import { useState } from "react";
import Image from "next/image";
import { STAFF_ROSTER, getSpeaker } from "@/lib/speakers";
import SimpleContactForm from "@/components/connect/SimpleContactForm";

export default function StaffContactClient() {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    const info = getSpeaker(selected);
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
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
              <Image src={`/staff/${info.photo}.jpg`} alt={selected} fill className="object-cover" />
            </div>
          )}
          <div>
            <p className="font-semibold text-fg text-lg">{selected}</p>
            <p className="text-fg-muted text-sm">{info.title}</p>
          </div>
        </div>
        <SimpleContactForm
          endpoint="/api/contact/staff"
          extraFields={{ staffName: selected }}
          messagePlaceholder={`What would you like to ask ${selected.split(" ")[0]}?`}
          submitLabel="Send Message"
          successTitle="Message sent!"
          successBody={`${selected.split(" ")[0]} will get back to you soon.`}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {STAFF_ROSTER.map((name) => {
        const info = getSpeaker(name);
        return (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border hover:border-accent/40 hover:shadow-sm transition text-center group"
          >
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-brand-navy/5 flex-shrink-0">
              {info.photo ? (
                <Image src={`/staff/${info.photo}.jpg`} alt={name} fill className="object-cover" />
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
