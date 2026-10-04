"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { getNavTreatment } from "@/lib/nav-treatment";
import { CHURCH_CENTER_CALENDAR_URL } from "@/lib/constants";
import { getEasternState, type LiveState } from "@/lib/live-schedule";
import { useSpecialLiveCheck } from "@/lib/use-special-live";

// ── Nav groups shown in the drawer ─────────────────────────────
const NAV_GROUPS = [
  {
    label: "Sunday",
    links: [
      // "Who Is Jesus?" kept first, ahead of Watch Live — it's the one
      // pre-decision, exploratory page for someone who isn't sure about
      // faith yet, so it gets first look rather than being buried under
      // Next Steps, which assumes someone's already decided to get more
      // involved (asked about 2026-10-04).
      { label: "Who Is Jesus?", href: "/who-is-jesus" },
      { label: "Watch Live", href: "/live" },
      { label: "Plan a Visit", href: "/visit" },
      { label: "Sermons", href: "/sermons" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    label: "Ministries",
    links: [
      { label: "All Ministries", href: "/ministries" },
      { label: "Kids Ministry", href: "/ministries/kids" },
      { label: "Students", href: "/ministries/students" },
      { label: "College & Young Adults", href: "/ministries/college" },
      { label: "Life Groups", href: "/life-groups" },
      { label: "Missions", href: "/missions" },
      { label: "Wednesday Night", href: "/wednesday" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Brainerd Baptist in the Community", href: "/community" },
      { label: "The BX Community Center", href: "/bx" },
      // Real destination for "Events" — the site has no /events page of
      // its own; see lib/constants.ts's CHURCH_CENTER_CALENDAR_URL.
      { label: "Events", href: CHURCH_CENTER_CALENDAR_URL },
    ],
  },
  {
    label: "Next Steps",
    links: [
      { label: "Membership", href: "/membership" },
      // Previously both Baptism and Serving pointed at the exact same
      // /connect/next-step URL with nothing distinguishing them (found
      // during the 2026-10-04 nav/footer audit) — same general intake
      // form either way, and a duplicate React key to boot. ConnectForm
      // now reads ?interest= to preselect the right checkbox instead.
      { label: "Baptism", href: "/connect/next-step?interest=baptism" },
      { label: "Life Groups", href: "/life-groups" },
      { label: "Serving", href: "/connect/next-step?interest=serving" },
      { label: "Mission Trips", href: "/missions" },
      { label: "Connect With Us", href: "/connect" },
      { label: "Prayer Request", href: "/connect/care" },
    ],
  },
  {
    label: "More",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Beliefs", href: "/beliefs" },
      { label: "Our History", href: "/about#founded" },
      { label: "Staff", href: "/staff" },
      { label: "Give", href: "/give" },
    ],
  },
];

// ── Sun icon ────────────────────────────────────────────────────
function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// ── Moon icon ───────────────────────────────────────────────────
function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Same Eastern-time clock the live page and homepage banner use — see
  // lib/live-schedule.ts. Drives the pulsing "live" badge on the hamburger
  // trigger itself (not just the drawer row inside it), so it's visible on
  // mobile without opening the menu. "off" the other ~164 hours/week, by
  // construction — see claude/sunday-morning-live-pipeline-audit-2026-10-03.md.
  const [liveState, setLiveState] = useState<LiveState>("off");

  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch — only render theme-aware icons after mount
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const tick = () => setLiveState(getEasternState(new Date()).state);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Special, non-Sunday livestreams (a Christmas Eve service, a
  // conference, etc.) — same YouTube-backed check LivePlayer and the
  // homepage banner use. Only polls while the regular schedule says
  // "off" — see lib/youtube-live.ts and lib/use-special-live.ts.
  const specialLive = useSpecialLiveCheck(liveState === "off");
  const effectiveLiveState: LiveState = liveState === "off" && specialLive ? "live" : liveState;

  const isLiveNow = effectiveLiveState === "live" || effectiveLiveState === "pre";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    // Evaluate once on mount: a reload, a back-navigation or an anchor link can
    // land the page already scrolled, and no scroll event fires to say so.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Use theme as fallback so isDark is correct even if resolvedTheme hasn't resolved yet.
  // NOTE: isDark must never decide a *colour* — only the toggle's own icon and
  // label, which are gated on `mounted`. All nav colours are chosen in CSS from
  // data-chrome below, so the bar paints correctly during SSR and never flashes.
  const isDark = (resolvedTheme ?? theme) === "dark";

  // How this route wants the bar painted. "overlay" routes have a dark hero or
  // photo under the nav and get the transparent treatment; everything else gets
  // the always-legible glass surface. Unlisted routes default to "solid".
  const treatment = getNavTreatment(pathname);

  // The bar is a light glass surface whenever the route is a light one, or once
  // an overlay route has scrolled past its hero. Deliberately theme-independent:
  // `.dark` re-points the same tokens in CSS.
  const chrome = treatment === "solid" || scrolled ? "glass" : "transparent";

  // The button flips the look. If the flip lands on what the device already
  // prefers (iOS/Android light or dark setting), go back to "system" instead
  // of pinning it, so the site keeps following the device. Without this, one
  // tap pinned the theme forever and the site stopped following iOS.
  function toggleTheme() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(next === (systemDark ? "dark" : "light") ? "system" : next);
  }

  return (
    <>
      {/* ── Fixed top bar ──────────────────────────────────────── */}
      <nav
        data-chrome={chrome}
        className={`bbc-nav fixed top-0 left-0 right-0 z-50 transition duration-500 ${
          chrome === "glass" ? "nav-glass" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo — both wordmarks ship and CSS picks one, so the correct mark is
              present in the SSR HTML instead of being chosen by JS after mount. */}
              {/* One mark, painted with --nav-ink — the same value the hamburger
                  uses — so it is correct over a dark hero and over glass, in both
                  themes, with no variants and nothing chosen in JS. */}
              <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
                <span
                  className="bbc-wordmark h-9"
                  role="img"
                  aria-label="Brainerd Baptist Church"
                />
              </Link>

          {/* Right side — Plan a Visit + theme toggle + hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/visit"
              className="hidden sm:inline-flex font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition hover:-translate-y-0.5 bg-accent-solid text-fg-on-accent hover:bg-accent-solid-hover"
            >
              Plan a Visit
            </Link>

            {/* Theme toggle — always in DOM; only the icon is gated on mount.
                Colour comes from --nav-ink in CSS, not from isDark. */}
            <button
              onClick={toggleTheme}
              aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="nav-ctl p-2 rounded-lg transition-colors"
            >
              {!mounted ? <span className="w-5 h-5 block" /> : isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Hamburger button — pulsing dot during the live window so
                mobile visitors see it's live without opening the menu */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label={isLiveNow ? "Open navigation menu — live now" : "Open navigation menu"}
              className="nav-ctl relative flex flex-col gap-1.5 p-2 cursor-pointer rounded-lg transition-colors"
            >
              {isLiveNow && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-solid opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-solid" />
                </span>
              )}
              <span className="nav-bar-line w-6 h-0.5 rounded-full" />
              <span className="nav-bar-line w-6 h-0.5 rounded-full" />
              <span className="nav-bar-line w-4 h-0.5 rounded-full" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[99] transition duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "var(--scrim)", backdropFilter: "blur(6px)" }}
      />

      {/* ── Drawer ─────────────────────────────────────────────── */}
      <aside
        className={`nav-drawer fixed top-3 right-3 bottom-3 z-[100] w-80 max-w-[calc(100vw-1.5rem)] flex flex-col rounded-3xl overflow-hidden transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]"
        }`}
        aria-label="Site navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                {/* Drawer sits on --surface, so the mark follows --fg. */}
                <span
                  className="bbc-wordmark h-8 text-fg"
                  role="img"
                  aria-label="Brainerd Baptist Church"
                />
              </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg transition-colors text-fg hover:bg-hover-subtle"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Grouped links — scrollable */}
        <nav className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
          {NAV_GROUPS.map(({ label, links }) => (
            <div key={label}>
              {/* Group label */}
              <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-fg-muted">
                {label}
              </p>
              <div className="space-y-1">
                {links.map(({ label: linkLabel, href }) => {
                  const isLiveLink = href === "/live" && isLiveNow;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={pathname === href ? "page" : undefined}
                      className={`flex items-center justify-between group w-full px-3 py-2.5 rounded-xl transition-colors hover:bg-hover-subtle ${pathname === href ? "nav-drawer-pill" : ""}`}
                      {...(href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <span className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiveLink ? "text-accent-text" : "text-fg-muted group-hover:text-fg"}`}>
                        {isLiveLink && (
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-solid opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-solid" />
                          </span>
                        )}
                        {isLiveLink && effectiveLiveState === "live" ? "Live Now" : linkLabel}
                      </span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="transition-colors text-fg-subtle group-hover:text-fg-muted"
                      >
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-7 py-6 border-t border-border">
          <Link
            href="/visit"
            onClick={() => setMenuOpen(false)}
            className="w-full font-condensed font-700 tracking-wide uppercase text-sm py-3 rounded-full flex items-center justify-center transition-colors bg-accent-solid text-fg-on-accent hover:bg-accent-solid-hover"
          >
            Plan a Visit
          </Link>
          <p className="text-xs text-center mt-4 leading-relaxed text-fg-muted">
            300 Brookfield Ave · Chattanooga, TN<br />
            Sundays · 8:30 AM &amp; 11:00 AM
          </p>
        </div>
      </aside>
    </>
  );
}
