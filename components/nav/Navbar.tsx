"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-navy-deep/95 backdrop-blur-md shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-condensed font-800 text-white text-xl tracking-wide uppercase">
              Brainerd Baptist
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.filter((l) => l.label !== "Give" && l.label !== "Connect").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/75 hover:text-white transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/give"
              className="text-sm font-semibold text-gold hover:text-gold-light transition-colors tracking-wide"
            >
              Give
            </Link>
            <Link
              href="/connect"
              className="text-sm font-semibold bg-gold hover:bg-gold-light text-navy px-5 py-2 rounded-full transition-colors"
            >
              Connect
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="w-6 h-0.5 bg-white rounded-full" />
            <span className="w-6 h-0.5 bg-white rounded-full" />
            <span className="w-4 h-0.5 bg-white rounded-full" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(7,16,30,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col h-full px-8 py-10">
          {/* Close */}
          <div className="flex justify-between items-center mb-12">
            <span className="font-condensed font-800 text-white text-xl tracking-wide uppercase">
              Brainerd Baptist
            </span>
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
          <nav className="flex flex-col gap-6 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-condensed font-700 text-4xl text-white hover:text-gold transition-colors tracking-wide uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-white/50 text-sm">300 Brookfield Ave · Chattanooga, TN 37411</p>
            <p className="text-white/50 text-sm mt-1">Sundays · 8:30 AM & 11:00 AM</p>
          </div>
        </div>
      </div>
    </>
  );
}
