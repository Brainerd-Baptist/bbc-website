"use client";

import { useState } from "react";
import { SITE } from "@/lib/constants";

const INTEREST_OPTIONS = [
  "I am new and want to learn more",
  "Looking for a Life Group",
  "Interested in Kids Ministry",
  "Interested in Student Ministry",
  "College or Young Adults",
  "Interested in Missions",
  "Prayer request",
  "Other",
];

export default function ConnectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2: wire to Resend API route
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a1628 0%, #07101e 100%)" }}>
      {/* Page header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Reach Out</p>
          <div className="flex justify-center mb-6">
            <div className="gold-divider" />
          </div>
          <h1
            className="font-condensed font-900 text-white mb-4"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Connect With Us
          </h1>
          <p className="text-white/55 text-lg leading-relaxed">
            Whether you are visiting for the first time, looking for community, or
            simply have a question — we want to hear from you.
          </p>
        </div>
      </div>

      {/* Main grid: form + info */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_340px] gap-10">

          {/* Form */}
          <div className="glass-md rounded-2xl p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-12">
                {/* Checkmark */}
                <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-condensed font-800 text-white text-2xl mb-3">
                  We got your message
                </h2>
                <p className="text-white/55 leading-relaxed max-w-sm">
                  Thank you for reaching out. Someone from our team will be in touch
                  within a couple of days.
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-condensed font-800 text-white text-2xl mb-6">
                  Send Us a Note
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Jane Smith"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jane@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                      Phone <span className="normal-case text-white/25">(optional)</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(423) 555-0100"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="interest" className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                      What best describes you?
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                      style={{ color: form.interest ? "white" : "rgba(255,255,255,0.25)" }}
                    >
                      <option value="" style={{ background: "#0a1628" }}>Select one…</option>
                      {INTEREST_OPTIONS.map((o) => (
                        <option key={o} value={o} style={{ background: "#0a1628" }}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                      Message <span className="normal-case text-white/25">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Anything else you'd like us to know…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy py-3.5 rounded-full transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-5">
            {/* Address */}
            <div className="glass rounded-2xl p-6">
              <p className="eyebrow mb-3">Address</p>
              <p className="text-white font-semibold mb-1">Brainerd Baptist Church</p>
              <p className="text-white/55 text-sm leading-relaxed">
                300 Brookfield Ave<br />Chattanooga, TN 37411
              </p>
              <a
                href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-gold hover:text-gold-light transition-colors"
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
                  className="flex items-center gap-3 text-white/55 hover:text-white transition-colors text-sm"
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
                  className="flex items-center gap-3 text-white/55 hover:text-white transition-colors text-sm"
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
                  className="flex items-center gap-3 text-white/55 hover:text-white transition-colors text-sm"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                  </svg>
                  YouTube
                </a>
              </div>
            </div>

            {/* Give */}
            <div className="glass rounded-2xl p-6 border border-gold/20">
              <p className="eyebrow mb-2">Generosity</p>
              <p className="text-white font-semibold mb-2">Give Online</p>
              <p className="text-white/55 text-xs leading-relaxed mb-4">
                Your generosity funds the gospel work at Brainerd and around the world.
              </p>
              <a
                href="/give"
                className="block text-center font-condensed font-700 tracking-wide uppercase text-sm bg-gold hover:bg-gold-light text-navy py-2.5 rounded-full transition-colors"
              >
                Give Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
