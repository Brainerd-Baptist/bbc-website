import Link from "next/link";

export default function ConnectSubpageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="pt-32 pb-16 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/connect"
          className="inline-flex items-center gap-1.5 text-[#00205B]/40 hover:text-[#00205B]/70 text-xs font-semibold tracking-wide uppercase mb-6 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2L4 6l4 4" />
          </svg>
          Connect
        </Link>
        <p className="eyebrow mb-4">{eyebrow}</p>
        <div className="flex justify-center mb-6">
          <div className="gold-divider" />
        </div>
        <h1 className="font-condensed font-800 text-[#00205B] mb-4" style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.5rem)" }}>
          {title}
        </h1>
        {description && <p className="text-[#00205B]/60 text-base leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}
