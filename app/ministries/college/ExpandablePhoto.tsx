"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ExpandablePhoto({
  src,
  alt,
  size = 56,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand photo: ${alt}`}
        className="relative rounded-full overflow-hidden shrink-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ width: size, height: size, outlineColor: "var(--accent)" }}
      >
        <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ background: "var(--scrim-solid)" }}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-fg-on-dark hover:opacity-70 transition"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div
            className="relative w-full h-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={src} alt={alt} fill sizes="100vw" className="object-contain" priority />
          </div>
        </div>
      )}
    </>
  );
}
