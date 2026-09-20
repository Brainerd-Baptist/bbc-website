/**
 * GET /api/pco/calendar
 *
 * Returns upcoming public-facing PCO Calendar events for the next 14 days.
 * Filters to only events where `visible_in_church_center: true` on the
 * parent Event record — this excludes internal Life Groups, staff meetings, etc.
 *
 * Cached at the edge for 1 hour (ISR revalidate).
 */

import { NextResponse } from "next/server";

const PCO_BASE = "https://api.planningcenteronline.com";

// Next.js Route Segment Config — revalidate every hour
export const revalidate = 3600;

export interface CalendarEvent {
  id: string;
  name: string;
  starts_at: string; // ISO 8601 UTC
  ends_at: string;   // ISO 8601 UTC
  all_day_event: boolean;
  location: string | null;
  church_center_url: string;
  image_url: string | null;
  summary: string | null;
}

export async function GET() {
  const appId  = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  if (!appId || !secret) {
    return NextResponse.json(
      { error: "PCO credentials not configured" },
      { status: 500 }
    );
  }

  const auth = `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;

  // Date range: today → +14 days (UTC)
  const now = new Date();
  const nowIso = now.toISOString();
  const plus14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const params = new URLSearchParams({
    "filter":                     "approved",
    "where[starts_at][gte]":      nowIso,
    "where[starts_at][lte]":      plus14,
    "include":                    "event",
    "per_page":                   "100",
    "order":                      "starts_at",
  });

  let data: {
    data: Array<{
      id: string;
      attributes: {
        name: string;
        starts_at: string;
        ends_at: string;
        all_day_event: boolean;
        location: string | null;
        church_center_url: string;
        image_url: string | null;
      };
      relationships: { event?: { data?: { id: string } } };
    }>;
    included: Array<{
      type: string;
      id: string;
      attributes: {
        visible_in_church_center: boolean;
        name: string;
        summary: string | null;
        image_url: string | null;
      };
    }>;
  };

  try {
    const res = await fetch(
      `${PCO_BASE}/calendar/v2/event_instances?${params}`,
      {
        headers: { Authorization: auth, "Content-Type": "application/json" },
        // Next.js fetch cache — matches the route revalidate above
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("PCO calendar fetch failed:", res.status, text);
      return NextResponse.json(
        { error: "Failed to fetch from Planning Center" },
        { status: 502 }
      );
    }

    data = await res.json();
  } catch (err) {
    console.error("PCO calendar network error:", err);
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }

  // Build map: event id → event attributes
  const eventMap = new Map<
    string,
    { visible_in_church_center: boolean; summary: string | null; image_url: string | null }
  >();
  for (const item of data.included ?? []) {
    if (item.type === "Event") {
      eventMap.set(item.id, {
        visible_in_church_center: item.attributes.visible_in_church_center,
        summary: item.attributes.summary ?? null,
        image_url: item.attributes.image_url ?? null,
      });
    }
  }

  // Filter to public events only, then shape for the frontend
  const events: CalendarEvent[] = (data.data ?? [])
    .filter((inst) => {
      const eventId = inst.relationships?.event?.data?.id;
      if (!eventId) return false;
      return eventMap.get(eventId)?.visible_in_church_center === true;
    })
    .map((inst) => {
      const eventId = inst.relationships.event?.data?.id ?? "";
      const eventData = eventMap.get(eventId);
      return {
        id:               inst.id,
        name:             inst.attributes.name?.trim() ?? "",
        starts_at:        inst.attributes.starts_at,
        ends_at:          inst.attributes.ends_at,
        all_day_event:    inst.attributes.all_day_event,
        location:         inst.attributes.location ?? null,
        church_center_url:inst.attributes.church_center_url,
        image_url:        inst.attributes.image_url ?? eventData?.image_url ?? null,
        summary:          eventData?.summary ?? null,
      };
    });

  return NextResponse.json({ events });
}
