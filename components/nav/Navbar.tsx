"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

// ── Nav groups shown in the drawer ─────────────────────────────
const NAV_GROUPS = [
  {
    label: "Sunday",
    links: [
      { label: "Watch Live", href: "/live" },
      { label: "Plan a Visit", href: "/visit" },
      { label: "Sermons", href: "/sermons" },
      { label: "Who Is Jesus?", href: "/who-is-jesus" },
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
      { label: "Missions", href: "/connect" },
      { label: "Wednesday Night", href: "/wednesday" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Brainerd Baptist in the Community", href: "/community" },
      { label: "The BX Community Center", href: "/bx" },
    ],
  },
  {
    label: "Connect",
    links: [
      { label: "Staff", href: "/staff" },
      { label: "Connect With Us", href: "/connect" },
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

  const { theme, resolvedTheme, setTheme } = useTheme();

  // Avoid hydration mismatch — only render theme-aware icons after mount
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Use theme as fallback so isDark is correct even if resolvedTheme hasn't resolved yet
  const isDark = (resolvedTheme ?? theme) === "dark";

  // Logo: white unless scrolled in light mode
  const logoSrc = scrolled && !isDark ? "/logo-black.png" : "/logo-white.png";

  // Hamburger bar color: dark navy bars only when scrolled in light mode
  const barColor = scrolled && !isDark ? "bg-[#00205B]" : "bg-white";

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <>
      {/* ── Fixed top bar ──────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "nav-glass" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
            <Image
              src={logoSrc}
              alt="Brainerd Baptist Church"
              width={120}
              height={48}
              className="h-9 w-auto transition-opacity duration-300"
              priority
            />
          </Link>

          {/* Right side — Plan a Visit + theme toggle + hamburger */}
          <div className="flex items-center gap-2">
            <Link
              href="/visit"
              className="hidden sm:inline-flex font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: "#00abc9", color: "white" }}
            >
              Plan a Visit
            </Link>

            {/* Theme toggle — always in DOM; only icon is gated on mount */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-lg transition-colors ${
                scrolled && !isDark
                  ? "text-[#00205B] hover:bg-[#00205B]/06"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {!mounted ? <span className="w-5 h-5 block" /> : isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              className={`flex flex-col gap-1.5 p-2 cursor-pointer rounded-lg transition-colors ${
                scrolled && !isDark ? "hover:bg-[#00205B]/06" : "hover:bg-white/10"
              }`}
            >
              <span className={`w-6 h-0.5 rounded-full transition-colors ${barColor}`} />
              <span className={`w-6 h-0.5 rounded-full transition-colors ${barColor}`} />
              <span className={`w-4 h-0.5 rounded-full transition-colors ${barColor}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[99] transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0, 8, 20, 0.55)", backdropFilter: "blur(4px)" }}
      />

      {/* ── Drawer ─────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[100] w-80 max-w-[90vw] flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: isDark ? "#00205B" : "#ffffff" }}
        aria-label="Site navigation"
      >
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-7 py-5 border-b ${isDark ? "border-white/10" : "border-[#00205B]/08"}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src={isDark ? "/logo-white.png" : "/logo-black.png"}
              alt="Brainerd Baptist Church"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-[#00205B]/06"}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke={isDark ? "white" : "#00205B"} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Grouped links — scrollable */}
        <nav className="flex-1 overflow-y-auto px-7 py-6 space-y-7">
          {NAV_GROUPS.map(({ label, links }) => (
            <div key={label}>
              {/* Group label */}
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: isDark ? "rgba(0,171,201,0.7)" : "rgba(0,32,91,0.40)" }}
              >
                {label}
              </p>
              <div className="space-y-1">
                {links.map(({ label: linkLabel, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between group w-full px-3 py-2.5 rounded-xl transition-colors ${
                      isDark ? "hover:bg-white/08" : "hover:bg-[#00205B]/06"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isDark ? "text-white/80 group-hover:text-white" : "text-[#00205B]/70 group-hover:text-[#00205B]"
                      }`}
                    >
                      {linkLabel}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`transition-colors ${
                        isDark ? "text-white/25 group-hover:text-white/60" : "text-[#00205B]/25 group-hover:text-[#00205B]/60"
                      }`}
                    >
                      <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className={`px-7 py-6 border-t ${isDark ? "border-white/10" : "border-[#00205B]/08"}`}>
          <Link
            href="/visit"
            onClick={() => setMenuOpen(false)}
            className="w-full font-condensed font-700 tracking-wide uppercase text-sm py-3 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#00abc9", color: "white" }}
          >
            Plan a Visit
          </Link>
          <p className={`text-xs text-center mt-4 leading-relaxed ${isDark ? "text-white/35" : "text-[#00205B]/40"}`}>
            300 Brookfield Ave · Chattanooga, TN<br />
            Sundays · 8:30 AM &amp; 11:00 AM
          </p>
        </div>
      </aside>
    </>
  );
}
