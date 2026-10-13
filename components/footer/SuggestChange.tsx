"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * "Suggest a change" for staff. Opens the website change request form on Brainerd HQ with
 * this page already filled in, plus any text that was highlighted just before the click.
 * Visitors who are not staff will simply land on a sign-in screen, so it is kept small.
 */
const FORM = "https://brainerdhq.app/website-requests/new";

export default function SuggestChange() {
  const pathname = usePathname() || "/";
  const picked = useRef("");

  useEffect(() => {
    picked.current = "";
    const onSelect = () => {
      const t = window.getSelection()?.toString().trim() ?? "";
      if (t) picked.current = t.slice(0, 500);
    };
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, [pathname]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const q = new URLSearchParams({ page: pathname });
    if (picked.current) q.set("text", picked.current);
    e.currentTarget.href = `${FORM}?${q.toString()}`;
  };

  return (
    <a
      href={`${FORM}?page=${encodeURIComponent(pathname)}`}
      onClick={go}
      onAuxClick={go}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white/60 transition-colors"
    >
      Staff: request a change
    </a>
  );
}
