"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CHILD_CARE, HISPANIC_MINISTRY } from "@/lib/constants";
import VideoHero from "@/components/visit/VideoHero";
import SundayWalkthrough from "@/components/visit/SundayWalkthrough";
import PlanVisitForm from "@/components/visit/PlanVisitForm";
import VisitFAQ from "@/components/visit/VisitFAQ";
import ConnectForm from "@/components/connect/ConnectForm";
import VisitorToggle, { type VisitorType } from "@/components/visit/VisitorToggle";
import ReturningVisitorPanel from "@/components/visit/ReturningVisitorPanel";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";

export default function VisitExperience() {
  const [visitorType, setVisitorType] = useState<VisitorType>("first");
  const returning = visitorType === "returning";

  return (
    <div className="min-h-screen">
      {/* Video hero — copy adapts to visitor type */}
      {returning ? (
        <VideoHero
          eyebrow="Welcome Back"
          title={
            <>
              Good to{" "}
              <span style={{ color: "var(--accent)" }}>see you again.</span>
            </>
          }
          subtitle="Here's how to go deeper this season — groups, serving, membership, and more."
          primaryCta={{ label: "What's Next", href: "#next-steps" }}
          secondaryCta={{ label: "Find a Life Group", href: "/life-groups" }}
        />
      ) : (
        <VideoHero />
      )}

      {/* ── Sunday at a glance ──────────────────────────────── */}
      <section id="sunday-at-a-glance" aria-label="Sunday at a glance" className="px-6 pt-10">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-surface-raised p-6 md:p-7">
          <p className="eyebrow mb-4 text-center">Sunday at a glance</p>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-fg font-semibold">Services</dt>
              <dd className="text-fg-muted">8:30 AM Choir &amp; Orchestra<br />11:00 AM Band-Led<br />About 60 minutes</dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Where</dt>
              <dd className="text-fg-muted">
                300 Brookfield Ave, Chattanooga<br />
                <a href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411" target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-2">Open in Maps</a><br />
                <a href="/map" className="text-accent-text underline underline-offset-2">See the campus map</a>
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Kids</dt>
              <dd className="text-fg-muted">Check-in at the Kids entrance off Albemarle Ave.<br /><a href="/map?to=f-kids-checkin" className="text-accent-text underline underline-offset-2">Show me the way</a></dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Parking</dt>
              <dd className="text-fg-muted">
                Free. Red lot is across from the front entrance.<br />
                <a href="#sunday-walkthrough" className="text-accent-text underline underline-offset-2">See the step-by-step</a> · <a href="/map" className="text-accent-text underline underline-offset-2">Campus map</a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Visitor type toggle ─────────────────────────────── */}
      <VisitorToggle value={visitorType} onChange={setVisitorType} />

      {returning && (
        <div id="next-steps">
          <ReturningVisitorPanel />
        </div>
      )}

      {/* ── Service times ──────────────────────────────────── */}
      <section id="service-times" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-center mb-4">Sunday Mornings</p>
          <h2
            className="font-condensed font-900 text-fg text-center mb-4"
            style={{ fontSize: "clamp(3rem, 8vw, 5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            Sunday Services
          </h2>
          <p className="text-fg-muted text-center mb-14 max-w-sm mx-auto">
            Both meet in the sanctuary of the main building, the one with the steeple. The message is the same at both (about 35 minutes), and both center on congregational singing.
          </p>

          {/* Photo service cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 8:30 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
              <Image
                src="/visit/service-830am.jpg"
                alt="8:30 AM service — congregation in the sanctuary"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-condensed font-900 text-fg-on-dark leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
                  8:30 AM
                </p>
                <p className="font-condensed font-700 mt-2" style={{ color: "var(--accent)", fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                  Choir &amp; Orchestra
                </p>
              </div>
            </div>

            {/* 11:00 AM */}
            <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
              <Image
                src="/visit/service-11am.jpg"
                alt="Band-led worship at the 11:00 AM service"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="font-condensed font-900 text-fg-on-dark leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
                  11:00 AM
                </p>
                <p className="font-condensed font-700 mt-2" style={{ color: "var(--accent)", fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                  Band-Led
                </p>
              </div>
            </div>
          </div>

          {/* 9:45 Life Groups — photo banner */}
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 150 }}>
            <Image
              src="/visit/life-groups.jpg"
              alt="Life Groups — people gathered in a circle for Bible study"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            <div className="absolute inset-0" style={{ background: "var(--scrim-side)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-8">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
                9:45 AM · Between Services
              </p>
              <p className="text-fg-on-dark font-condensed font-800 text-2xl">Life Groups</p>
              <p className="text-fg-on-dark-muted text-sm mt-1">
                Small-group Bible study for all ages.{" "}
                <Link href="/life-groups" className="underline underline-offset-2 text-fg-on-dark">See how Life Groups work</Link>.
              </p>
            </div>
          </div>

          {/* Spanish-language service: it's a service, so it sits with the others */}
          <Card className="rounded-2xl p-7 mt-6 border-t-4 border-accent">
            <p className="eyebrow mb-2">Ministerio Hispano · Hispanic Ministry</p>
            <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.35rem" }}>Servicio en Español</p>
            <p className="text-fg-muted text-sm leading-relaxed">
              {HISPANIC_MINISTRY.serviceTime} · {HISPANIC_MINISTRY.locationName} · {HISPANIC_MINISTRY.address}
            </p>
            <p className="text-fg-muted text-sm italic mt-3">
              Bienvenidos a nuestra familia. Un servicio de adoración en español — todos son bienvenidos.
            </p>
          </Card>
        </div>
      </section>

      {/* ── First-timer orientation content — collapsed for returning visitors ── */}
      {!returning && (
        <>
          {/* ── Sunday walkthrough ─────────────────────────────── */}
          <SundayWalkthrough />

          {/* ── Kids: the one place for check-in details ───────── */}
          <Section className="py-24 px-6" id="kids">
            <div className="max-w-5xl mx-auto">
              <p className="eyebrow text-center mb-4">Your Kids Matter Here</p>
              <h2 className="text-fg text-center mb-4 h-hero">Care for Kids</h2>
              <p className="text-fg-muted text-center mb-14 max-w-md mx-auto">
                Safe, age-appropriate care so you can worship fully and your kids love coming.
              </p>
              <div className="grid sm:grid-cols-2 gap-5 mb-10">
                {CHILD_CARE.map((c) => (
                  <Card key={c.age} className="rounded-2xl p-7 border-l-4 border-accent">
                    <p className="font-condensed font-800 text-fg mb-1" style={{ fontSize: "1.35rem" }}>{c.age}</p>
                    <p className="text-fg-muted text-sm">{c.times}</p>
                  </Card>
                ))}
              </div>
              <p className="text-fg-muted text-sm text-center max-w-xl mx-auto leading-relaxed">
                Park in the Purple Lot and use the Kids entrance off Albemarle Ave. Check-in opens 30
                minutes before each service, and your first time, plan to arrive 10–15 minutes early. Each
                of you gets a matching tag for pickup. All volunteers are background-checked and trained.{" "}
                <a href="/map?to=f-kids-checkin" className="text-accent-text underline underline-offset-2">
                  Show me on the map
                </a>
                .
              </p>
            </div>
          </Section>
          {/* ── FAQ ────────────────────────────────────────────── */}
          <VisitFAQ />

          {/* ── Plan a Visit: after the page has shown what Sunday is like ── */}
          <PlanVisitForm />
        </>
      )}

      {/* ── Connect: returning visitors only. First-timers use Plan a Visit above. ── */}
      {returning && (
        <section id="connect" className="py-24 px-6">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <p className="eyebrow mb-4">Take a Next Step</p>
            <h2 className="text-fg mb-4 h-hero">We&apos;d love to hear from you.</h2>
            <p className="text-fg-muted max-w-md mx-auto">
              Longtime member or somewhere in between — our team wants to connect with you.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ConnectForm showMembershipOption />
          </div>
        </section>
      )}

      {/* ── CTA — returning visitors only; first-timers end on the Plan a Visit form ── */}
      {returning && (
        <section className="py-24 px-6 text-center" style={{ background: "var(--color-brand-navy)" }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-fg-on-dark mb-4 h-hero">Ready for a Next Step?</h2>
            <p className="text-fg-on-dark-muted mb-10 max-w-sm mx-auto">
              Let&apos;s get you plugged in — a group, a serving spot, or just a conversation.
            </p>
            <Link
              href="/connect/next-step"
              className="inline-block font-condensed font-700 tracking-wide uppercase text-sm bg-accent-solid hover:bg-accent-solid-hover text-fg-on-accent px-10 py-4 rounded-full transition-colors"
            >
              Take a Next Step
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
