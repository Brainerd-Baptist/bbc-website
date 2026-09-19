"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Nav groups shown in the drawer ─────────────────────────────
const NAV_GROUPS = [
  {
    label: "Sunday",
    links: [
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
      { label: "Life Groups", href: "/life-groups" },
      { label: "Wednesday Night", href: "/wednesday" },
      { label: "College & Young Adults", href: "/ministries/college" },
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

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
            {scrolled ? (
              <Image
                src="/logo-black.png"
                alt="Brainerd Baptist Church"
                width={120}
                height={48}
                className="h-9 w-auto"
                priority
              />
            ) : (
              <Image
                src="/logo-white.png"
                alt="Brainerd Baptist Church"
                width={120}
                height={48}
                className="h-9 w-auto"
                priority
              />
            )}
          </Link>

          {/* Right side — Plan a Visit + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/visit"
              className="hidden sm:inline-flex font-condensed font-700 tracking-wide uppercase text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: "#00abc9", color: "white" }}
            >
              Plan a Visit
            </Link>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              className={`flex flex-col gap-1.5 p-2 cursor-pointer rounded-lg transition-colors ${
                scrolled ? "hover:bg-[#00205B]/06" : "hover:bg-white/10"
              }`}
            >
              <span className={`w-6 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
              <span className={`w-6 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
              <span className={`w-4 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
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
        style={{ background: "#00205B" }}
        aria-label="Site navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/logo-white.png"
              alt="Brainerd Baptist Church"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
                style={{ color: "rgba(0,171,201,0.7)" }}
              >
                {label}
              </p>
              <div className="space-y-1">
                {links.map(({ label: linkLabel, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between group w-full px-3 py-2.5 rounded-xl transition-colors hover:bg-white/08"
                  >
                    <span
                      className="text-sm font-medium text-white/80 group-hover:text-white transition-colors"
                    >
                      {linkLabel}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-white/25 group-hover:text-white/60 transition-colors"
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
        <div className="px-7 py-6 border-t border-white/10">
          <Link
            href="/visit"
            onClick={() => setMenuOpen(false)}
            className="w-full font-condensed font-700 tracking-wide uppercase text-sm py-3 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#00abc9", color: "white" }}
          >
            Plan a Visit
          </Link>
          <p className="text-white/35 text-xs text-center mt-4 leading-relaxed">
            300 Brookfield Ave · Chattanooga, TN<br />
            Sundays · 8:30 AM &amp; 11:00 AM
          </p>
        </div>
      </aside>
    </>
  );
}
