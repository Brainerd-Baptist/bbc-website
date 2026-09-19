"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/constants";

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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "nav-glass"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-16">
          {/* Logo — white on hero, color on scroll */}
          <Link href="/" className="flex items-center">
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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.filter((l) => l.label !== "Give" && l.label !== "Connect").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  scrolled
                    ? "text-[#00205B]/70 hover:text-[#00205B]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/give"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                scrolled ? "text-[#00abc9] hover:text-[#0090a8]" : "text-white/80 hover:text-white"
              }`}
            >
              Give
            </Link>
            <Link
              href="/visit"
              className="text-sm font-semibold bg-[#00abc9] hover:bg-[#0090a8] text-white px-5 py-2.5 rounded-full transition-all transition-transform hover:-translate-y-0.5"
            >
              Plan a Visit
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className={`w-6 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
            <span className={`w-6 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
            <span className={`w-4 h-0.5 rounded-full transition-colors ${scrolled ? "bg-[#00205B]" : "bg-white"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "#00205B", backdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col h-full px-8 py-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <Image
              src="/logo-white.png"
              alt="Brainerd Baptist Church"
              width={120}
              height={48}
              className="h-9 w-auto"
              priority
            />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-3 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-bold text-2xl text-white hover:text-[#00abc9] transition-colors tracking-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/15">
            <p className="text-white/50 text-sm">300 Brookfield Ave · Chattanooga, TN 37411</p>
            <p className="text-white/50 text-sm mt-1">Sundays · 8:30 AM & 11:00 AM</p>
          </div>
        </div>
      </div>
    </>
  );
}
