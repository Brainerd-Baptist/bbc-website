"use client";

import { useEffect, useRef } from "react";

/**
 * When a form swaps to its "you're all set" card the page gets shorter and the
 * browser leaves the reader near the bottom. Attach the returned ref to the
 * success card and it is centered on screen as soon as it appears.
 *
 * The jump is instant (`behavior: "auto"`), not smooth. On iOS Safari a
 * smooth scroll gives the bottom address-bar chrome time to collapse
 * mid-animation; once scrolling stops, the chrome reappears and shrinks the
 * visible viewport from below, leaving a card centered against the taller,
 * chrome-hidden viewport sitting noticeably above center once the bar comes
 * back. Landing in one frame, before that chrome has a chance to move,
 * keeps the result centered against the viewport the reader actually sees.
 * See the staff-contact success-card centering report, 2026-10-06.
 */
export default function useScrollToSuccess(done: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => {
      ref.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [done]);
  return ref;
}
