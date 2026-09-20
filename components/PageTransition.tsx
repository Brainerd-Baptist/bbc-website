"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Intercepts internal link clicks and wraps router navigation in
 * document.startViewTransition() so the browser animates between pages.
 *
 * Degrades gracefully — browsers without View Transitions API (Firefox)
 * navigate normally with no animation and no errors.
 *
 * Place <PageTransition /> anywhere inside the layout (renders nothing).
 */
export default function PageTransition() {
  const router = useRouter();

  useEffect(() => {
    // View Transitions API not supported — silent no-op
    if (!("startViewTransition" in document)) return;

    const handleClick = (e: MouseEvent) => {
      // Walk up the DOM to find the anchor
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip: external links, mailto/tel, hash-only, download, new-tab
      if (
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        href === "#" ||
        href.startsWith("#") ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank"
      )
        return;

      // Skip if modifier key held (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();

      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
        () => {
          router.push(href);
        }
      );
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [router]);

  return null;
}
