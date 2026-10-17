"use client";

import { useEffect, useRef } from "react";
import SearchPanel from "./SearchPanel";

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const returnRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      returnRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Search">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "var(--nav-menu-scrim, var(--scrim))", backdropFilter: "blur(10px)" }}
      />
      <div className="relative mx-auto mt-3 sm:mt-24 w-[calc(100%-1.5rem)] max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[80dvh] overflow-y-auto rounded-3xl border border-border bg-surface-raised p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent-text">Search</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 -m-2 rounded-lg text-fg-muted hover:text-fg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <SearchPanel autoFocus onNavigate={onClose} />
      </div>
    </div>
  );
}
