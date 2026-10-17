"use client";

import { useState } from "react";
import Link from "next/link";
import { CHILD_CARE } from "@/lib/constants";
import VideoHero from "@/components/visit/VideoHero";
import BibleAppLink from "@/components/visit/BibleAppLink";
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
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 text-sm">
            <div id="service-times">
              <dt className="text-fg font-semibold">Services</dt>
              <dd className="text-fg-muted">
                8:30 AM Choir &amp; Orchestra<br />
                11:00 AM Band-Led<br />
                About 60 minutes, with the same message at both (about 35 minutes)
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Where</dt>
              <dd className="text-fg-muted">
                The sanctuary of the main building, the one with the steeple.<br />
                300 Brookfield Ave, Chattanooga<br />
                <a href="https://maps.google.com/?q=300+Brookfield+Ave+Chattanooga+TN+37411" target="_blank" rel="noopener noreferrer" className="text-accent-text underline underline-offset-2">Open in Maps</a> · <a href="/map" className="text-accent-text underline underline-offset-2">Campus map</a>
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Parking</dt>
              <dd className="text-fg-muted">
                Free. The Red lot is across from the front entrance, and the Orange lot on Mayfair Ave is there if the Red fills up.
              </dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Kids</dt>
              <dd className="text-fg-muted">Check-in at the Kids entrance off Albemarle Ave.<br /><a href="/map?to=f-kids-checkin" className="text-accent-text underline underline-offset-2">Show me the way</a></dd>
            </div>
            <div>
              <dt className="text-fg font-semibold">Life Groups</dt>
              <dd className="text-fg-muted">
                9:45 AM, between services. Small-group Bible study for all ages.<br />
                <Link href="/life-groups" className="text-accent-text underline underline-offset-2">See how Life Groups work</Link>
              </dd>
            </div>
            <div id="sunday-walkthrough">
              <dt className="text-fg font-semibold">In the service</dt>
              <dd className="text-fg-muted">
                We sing together, then hear a message that works through a book of the Bible. Bring a Bible, or use one from the pew or the free <BibleAppLink>Bible app</BibleAppLink>. Free coffee is just inside the sanctuary doors and by the elevator.
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

      {/* ── First-timer orientation content — collapsed for returning visitors ── */}
      {!returning && (
        <>
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
