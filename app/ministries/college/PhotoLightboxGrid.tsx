"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Photo = { src: string; alt: string };

const SWIPE_THRESHOLD = 40;

export default function PhotoLightboxGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, close, prev, next]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mt-8">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setIndex(i)}
            className="relative rounded-lg overflow-hidden cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ aspectRatio: "4 / 3", outlineColor: "var(--accent)" }}
            aria-label={`Expand photo: ${p.alt}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 33vw, 220px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photos[index].alt}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ background: "var(--scrim-solid)" }}
          onClick={close}
          onTouchStart={(e) => {
            const t = e.touches[0];
            setTouchStart({ x: t.clientX, y: t.clientY });
          }}
          onTouchEnd={(e) => {
            if (!touchStart) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            setTouchStart(null);
            if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
            if (dx > 0) prev();
            else next();
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-fg-on-dark hover:opacity-70 transition"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-fg-on-dark hover:opacity-70 transition p-2"
              >
                <svg width="28" height="28" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7.5 3l-3 3 3 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next photo"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-fg-on-dark hover:opacity-70 transition p-2"
              >
                <svg width="28" height="28" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4.5 3l3 3-3 3" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[index].src}
              alt={photos[index].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <p className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-fg-on-dark-muted text-xs sm:text-sm text-center px-4">
            {index + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
