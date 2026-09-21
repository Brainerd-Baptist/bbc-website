import { SITE } from "@/lib/constants";

export default function ConnectSidebar() {
  return (
    <div className="space-y-5">
      {/* Address */}
      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-3">Address</p>
        <p className="font-semibold text-[#00205B] mb-1">Brainerd Baptist Church</p>
        <p className="text-[#00205B]/60 text-sm leading-relaxed">
          300 Brookfield Ave<br />Chattanooga, TN 37411
        </p>
        <a
          href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-brand-cyan hover:text-brand-cyan-light transition-colors"
        >
          Get Directions
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2.5 6h7M6.5 3l3 3-3 3" />
          </svg>
        </a>
      </div>

      {/* Social */}
      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-4">Follow Along</p>
        <div className="space-y-3">
          <a
            href={SITE.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[#00205B]/60 hover:text-[#00abc9] transition-colors text-sm"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Facebook
          </a>
          <a
            href={SITE.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[#00205B]/60 hover:text-[#00abc9] transition-colors text-sm"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
          </a>
          <a
            href={SITE.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[#00205B]/60 hover:text-[#00abc9] transition-colors text-sm"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
            </svg>
            YouTube
          </a>
        </div>
      </div>

      {/* Give */}
      <div className="glass rounded-2xl p-6 border border-brand-cyan/20">
        <p className="eyebrow mb-2">Generosity</p>
        <p className="font-semibold text-[#00205B] mb-2">Give Online</p>
        <p className="text-[#00205B]/60 text-xs leading-relaxed mb-4">
          Your generosity funds the gospel work at Brainerd and around the world.
        </p>
        <a
          href="/give"
          className="block text-center font-condensed font-700 tracking-wide uppercase text-sm bg-brand-cyan hover:bg-brand-cyan-light text-brand-navy py-2.5 rounded-full transition-colors"
        >
          Give Now
        </a>
      </div>
    </div>
  );
}
