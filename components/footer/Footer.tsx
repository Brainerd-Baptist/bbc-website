import Link from "next/link";
import Image from "next/image";
import { SITE, FOOTER_LINKS, HISPANIC_MINISTRY } from "@/lib/constants";

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://facebook.com/brainerdbaptist",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/brainerdbaptist",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@brainerdbaptist",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "Podcast",
    href: "/podcast",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm3.5-5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0-6C6.253 2 2 6.253 2 12s4.253 10 10 10 10-4.253 10-10S17.747 2 12 2zm0 1.5c4.694 0 8.5 3.806 8.5 8.5S16.694 20.5 12 20.5 3.5 16.694 3.5 12 7.306 3.5 12 3.5z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#00205B" }} className="text-white">
      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#00abc9]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              {/* Logo — white version */}
              <Image
                src="/logo-white.png"
                alt="Brainerd Baptist Church"
                width={140}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-[220px]">
              A church in Chattanooga, TN where every person can experience the grace of Jesus Christ.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/8 hover:bg-[#00abc9] text-white/60 hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {(Object.entries(FOOTER_LINKS) as [string, { label: string; href: string }[]][]).map(([groupLabel, links]) => (
            <div key={groupLabel}>
              <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
                {groupLabel}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Visit column */}
          <div>
            <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-4">
              Visit
            </p>
            <p className="font-condensed font-700 text-white text-base mb-0.5">300 Brookfield Ave</p>
            <p className="text-white/50 text-sm mb-4">Chattanooga, TN 37411</p>

            <p className="text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">
              Sunday Services
            </p>
            <p className="text-white/70 text-sm">8:30 AM · Choir & Orchestra</p>
            <p className="text-white/70 text-sm mb-5">11:00 AM · Band-Led</p>
            <p className="text-white/50 text-xs">Life Groups · 9:45 AM</p>

            {/* Hispanic Ministry */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[#00abc9] text-xs font-semibold tracking-widest uppercase mb-2">
                Ministerio Hispano
              </p>
              <p className="text-white/60 text-sm">{HISPANIC_MINISTRY.address}</p>
              <p className="text-white/40 text-sm">{HISPANIC_MINISTRY.serviceTime}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>© {year} {SITE.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
