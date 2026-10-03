"use client";

import { useEffect, useRef } from "react";

/**
 * When a form swaps to its "you're all set" card the page gets shorter and the
 * browser leaves the reader near the bottom. Attach the returned ref to the
 * success card and it is centered on screen as soon as it appears.
 */
export default function useScrollToSuccess(done: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!done) return;
    const id = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [done]);
  return ref;
}
