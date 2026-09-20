"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** "up" (default) | "left" | "right" */
  direction?: "up" | "left" | "right";
}

const dirClass: Record<string, string> = {
  up: "rv",
  left: "rv-left",
  right: "rv-right",
};

export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const base = dirClass[direction] ?? "rv";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already visible (e.g., very tall viewport) — reveal immediately
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("in"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`${base} ${className}`}>
      {children}
    </div>
  );
}
