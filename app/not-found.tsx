import Link from "next/link";

export const metadata = {
  title: "Page not found — Brainerd Baptist Church",
};

export default function NotFound() {
  return (
    <main className="relative overflow-hidden min-h-screen px-6 pt-40 pb-24 flex items-start justify-center">
      <div className="bx-bloom" aria-hidden="true" />
      <div className="relative glass-frost glass-static rounded-2xl p-10 max-w-lg w-full text-center">
        <p className="eyebrow mb-3">404</p>
        <h1
          className="font-condensed font-800 text-fg mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)" }}
        >
          We can&rsquo;t find that page
        </h1>
        <p className="text-fg-muted leading-relaxed mb-8">
          It may have moved, or the link may be old. Try one of these instead.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-7 py-3 rounded-full transition-colors"
          >
            Home
          </Link>
          <Link
            href="/visit"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-border hover:border-accent text-fg px-7 py-3 rounded-full transition-colors"
          >
            Plan a Visit
          </Link>
          <Link
            href="/connect"
            className="font-condensed font-700 tracking-wide uppercase text-sm border border-border hover:border-accent text-fg px-7 py-3 rounded-full transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
