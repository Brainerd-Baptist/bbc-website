"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CalendarEvent } from "@/app/api/pco/calendar/route";

// ── Eastern-time helpers ───────────────────────────────────────────────────

const ET = "America/New_York";

function etWeekday(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    weekday: "short",
  }).format(new Date(iso));
}

function etMonthDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function etTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(iso))
    .toLowerCase()
    .replace(":00", ""); // "8:30 am" → "8:30 am", "11:00 am" → "11 am"
}

// Strip verbose location suffixes like " - 300 Brookfield Ave, Chattanooga, TN 37411"
// to keep cards compact. Show only what comes before " - ".
function shortLocation(loc: string | null): string | null {
  if (!loc) return null;
  const dash = loc.indexOf(" - ");
  return dash > 0 ? loc.slice(0, dash) : loc;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface GroupedDay {
  label: string;   // "Sun · Sep 21"
  events: CalendarEvent[];
}

// ── Group by calendar day (Eastern) ───────────────────────────────────────

function groupByDay(events: CalendarEvent[]): GroupedDay[] {
  const days: Map<string, CalendarEvent[]> = new Map();

  for (const ev of events) {
    // Use the ET date as the grouping key
    const key = new Intl.DateTimeFormat("en-US", {
      timeZone: ET,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ev.starts_at)); // e.g. "09/21/2026"

    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push(ev);
  }

  return Array.from(days.entries()).map(([, evs]) => ({
    label: `${etWeekday(evs[0].starts_at)} · ${etMonthDay(evs[0].starts_at)}`,
    events: evs,
  }));
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ThisWeek() {
  const [events, setEvents]   = useState<CalendarEvent[] | null>(null);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch("/api/pco/calendar")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then(({ events: evs }: { events: CalendarEvent[] }) => {
        setEvents(evs);
      })
      .catch(() => setError(true));
  }, []);

  // Loading skeleton
  if (!events && !error) {
    return (
      <section className="section-pad max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  // Error or no public events — render nothing (don't show empty section)
  if (error || !events || events.length === 0) {
    return null;
  }

  const grouped = groupByDay(events);

  return (
    <section className="py-20 px-6 md:px-12" style={{ background: "var(--surface-sunken)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-3">At Brainerd</p>
            <h2
              className="font-condensed font-800 leading-none"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "var(--fg)",
                letterSpacing: "-0.01em",
              }}
            >
              What&rsquo;s Happening
              <br />
              <span style={{ color: "var(--accent-text)" }}>This Week</span>
            </h2>
          </div>

          <a
            href="https://brainerdbaptist.churchcenter.com/calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-navy text-sm flex-shrink-0"
          >
            Full Calendar
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ marginLeft: "0.35rem" }}
            >
              <path d="M2 6.5h9M8 3l4 3.5L8 10" />
            </svg>
          </a>
        </div>

        {/* Day groups */}
        <div className="space-y-8">
          {grouped.map((day) => (
            <div key={day.label}>
              {/* Day label */}
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--fg-muted)" }}
              >
                {day.label}
              </p>

              {/* Event cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {day.events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Event card ─────────────────────────────────────────────────────────────

function EventCard({ event: ev }: { event: CalendarEvent }) {
  const loc = shortLocation(ev.location);

  return (
    <a
      href={ev.church_center_url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass card-hover-sm flex items-stretch rounded-2xl overflow-hidden group"
      style={{ textDecoration: "none" }}
    >
      {/* Teal left accent bar */}
      <div
        className="w-1 flex-shrink-0 transition-colors duration-200"
        style={{ background: "var(--accent)" }}
      />

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {/* Time */}
        {!ev.all_day_event ? (
          <p
            className="text-xs font-semibold tracking-wide mb-1"
            style={{ color: "var(--accent-text)" }}
          >
            {etTime(ev.starts_at)}
          </p>
        ) : (
          <p
            className="text-xs font-semibold tracking-wide mb-1 uppercase"
            style={{ color: "var(--accent-text)" }}
          >
            All day
          </p>
        )}

        {/* Event name */}
        <p
          className="font-condensed font-700 leading-tight text-base group-hover:text-[#00abc9] transition-colors duration-200"
          style={{ color: "var(--fg)" }}
        >
          {ev.name}
        </p>

        {/* Location (optional) */}
        {loc && (
          <p
            className="text-xs mt-1.5 leading-snug"
            style={{ color: "var(--fg-muted)" }}
          >
            {loc}
          </p>
        )}

        {/* Summary (optional) */}
        {ev.summary && !loc && (
          <p
            className="text-xs mt-1.5 leading-snug line-clamp-2"
            style={{ color: "var(--fg-muted)" }}
          >
            {ev.summary}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          style={{ color: "var(--accent-text)" }}
        >
          <path d="M3 7h8M8 4l3 3-3 3" />
        </svg>
      </div>
    </a>
  );
}
