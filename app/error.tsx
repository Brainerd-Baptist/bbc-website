"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative overflow-hidden min-h-screen px-6 pt-40 pb-24 flex items-start justify-center">
      <div className="bx-bloom" aria-hidden="true" />
      <div className="relative glass-frost glass-static rounded-2xl p-10 max-w-lg w-full text-center">
        <p className="eyebrow mb-3">Something went wrong</p>
        <h1
          className="font-condensed font-800 text-fg mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
        >
          That didn&rsquo;t load
        </h1>
        <p className="text-fg-muted leading-relaxed mb-8">
          It&rsquo;s on our end, not yours. Try again, or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-7 py-3 rounded-full transition-colors cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-border hover:border-accent text-fg px-7 py-3 rounded-full transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
