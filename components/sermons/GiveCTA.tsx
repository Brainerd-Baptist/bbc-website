export default function GiveCTA() {
  return (
    <section
      className="mt-16 rounded-2xl border border-white/6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-navy-deep) 100%)" }}
    >
      <div className="px-7 py-8 md:flex md:items-center md:justify-between gap-6">
        <div className="mb-5 md:mb-0">
          <p
            className="text-white font-bold text-lg md:text-xl mb-1.5"
            style={{ letterSpacing: "-0.025em", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Support the Work
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm">
            Your generosity makes it possible to keep teaching God&apos;s Word — here and beyond.
          </p>
        </div>
        <a
          href="https://app.securegive.com/brainerdbaptist/auth/login/sms"
          className="inline-flex items-center gap-2 flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm text-plate-fg bg-plate hover:bg-plate/90 transition-colors"
          style={{ letterSpacing: "-0.01em" }}
        >
          Give Online
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
