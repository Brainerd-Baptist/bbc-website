/**
 * Planning Center Groups — server-side, read-only fetch for the public
 * Life Groups page.
 *
 * Uses the same PCO_APP_ID / PCO_SECRET credential as lib/pco-forms.ts.
 * That credential has not yet been confirmed to carry Groups API scope —
 * getPublicLifeGroups() fails soft (returns an empty array) if the request
 * comes back 401/403, so the page degrades to "browse on Church Center"
 * rather than crashing. Check server logs after the first deploy of this
 * code to see whether that happened.
 *
 * PRIVACY — read this before adding any new field to LifeGroup below:
 * PCO group records carry fields written by lay volunteers for PCO's own
 * admin/Church Center use, not for a public, search-indexed church website.
 * Confirmed on real data (2026-10-05): `contact_email` is a leader's
 * personal email address, `description_as_plain_text` has at least one
 * instance of a leader's personal phone number typed directly into the
 * text, and the group's `Location` relationship can resolve to a literal
 * home street address. None of those three are fetched or exposed here.
 * If a future change wants to surface description text, it needs a human
 * review pass per group first — don't pipe it onto the page unreviewed.
 */

const PCO_BASE = "https://api.planningcenteronline.com";

// "Adult Life Groups" group type — the only group type marked
// church_center_visible among PCO's ~21 group types at Brainerd (confirmed
// 2026-10-05). Everything else (Bible Studies, Membership Matters,
// BrainerdKids, etc.) is internal and must stay out of this fetch.
const ADULT_LIFE_GROUPS_TYPE_ID = "71404";

export interface LifeGroup {
  id: string;
  name: string;
  /** Free-text day/time/location string PCO staff already curate for Church Center, e.g. "Sunday 9:45 a.m. | Sanctuary Building Room 207". Safe to render as-is. */
  schedule: string;
  memberCount: number;
  /** PCO's own already-public group page — full description, contact, and join request live there, not on this site. */
  churchCenterUrl: string | null;
  /**
   * Full weekday name ("Sunday", "Tuesday", ...), derived from the group's
   * next scheduled Event, not parsed out of the free-text `schedule` string
   * above (which is wildly inconsistent — "Sunday 9:45 a.m.", "Meets weekly
   * on Sundays from 9:45-10:45am", and on a couple of groups a literal
   * unfilled "Day, Time (am/pm) | Location" placeholder). Undefined when a
   * group has no upcoming event in the fetched window, or when the events
   * fetch itself failed (see fetchNextEventDays below) — never blocks the
   * group from showing, it just won't have a day badge or match a Day of
   * the Week filter.
   */
  dayOfWeek?: string;
}

interface PcoGroupRecord {
  id: string;
  attributes: {
    name: string;
    schedule: string | null;
    memberships_count: number;
    public_church_center_web_url: string | null;
    listed: boolean;
  };
}

/** Where Chattanooga actually is — used to turn each event's UTC `starts_at` into the weekday a visitor would call it, not whatever day that UTC instant happens to fall on. */
const CHURCH_TIME_ZONE = "America/New_York";

/**
 * Fetch each given group's next scheduled Event and return its local
 * weekday, keyed by group id. One batched call across every group in the
 * "Adult Life Groups" type (not one call per group) — ordering by
 * `starts_at` ascending and keeping the first event seen per group gives
 * each group's next occurrence without needing a date-range filter whose
 * exact bracket syntax (`where[starts_at][gte]` et al.) hasn't been
 * exercised against this org's real credential yet. Every one of the 36
 * active groups meets weekly (confirmed against live data, 2026-10-06), so
 * `per_page=100` comfortably covers at least one occurrence of all of them.
 *
 * Fails soft to an empty map on any error, same reasoning as
 * getPublicLifeGroups() above — a broken day-of-week lookup should degrade
 * the page to "no day badges / no day filter," never take the whole Life
 * Groups page down. Check server logs after the first deploy to see
 * whether this actually resolves real event data for this credential.
 */
async function fetchNextEventDays(appId: string, secret: string): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const auth = pcoAuth(appId, secret);

  try {
    const res = await fetch(
      `${PCO_BASE}/groups/v2/events?where[group_type_id]=${ADULT_LIFE_GROUPS_TYPE_ID}` +
        `&per_page=100&order=starts_at&include=group&fields[Event]=starts_at`,
      {
        headers: { Authorization: auth, "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return result;

    const data: { data?: { attributes: { starts_at: string }; relationships: { group: { data: { id: string } | null } } }[] } =
      await res.json();

    for (const event of data.data ?? []) {
      const groupId = event.relationships.group.data?.id;
      if (!groupId || result.has(groupId)) continue; // first (earliest) occurrence per group wins
      const day = new Intl.DateTimeFormat("en-US", { timeZone: CHURCH_TIME_ZONE, weekday: "long" }).format(
        new Date(event.attributes.starts_at),
      );
      result.set(groupId, day);
    }
  } catch {
    return new Map();
  }

  return result;
}

function pcoAuth(appId: string, secret: string): string {
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

/**
 * Fetch the public Adult Life Groups list. Returns [] (never throws) on
 * missing credentials or a non-2xx response, so the page can fall back to
 * a plain Church Center link instead of breaking.
 */
export async function getPublicLifeGroups(): Promise<LifeGroup[]> {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;
  if (!appId || !secret) return [];

  const auth = pcoAuth(appId, secret);
  const groups: PcoGroupRecord[] = [];
  let pageUrl: string | null =
    `${PCO_BASE}/groups/v2/groups?where[group_type_id]=${ADULT_LIFE_GROUPS_TYPE_ID}` +
    `&per_page=100&order=name` +
    `&fields[Group]=name,schedule,memberships_count,public_church_center_web_url,listed`;

  try {
    while (pageUrl) {
      const res: Response = await fetch(pageUrl, {
        headers: { Authorization: auth, "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return [];
      const data: { data?: PcoGroupRecord[]; links?: { next?: string } } = await res.json();
      groups.push(...(data.data ?? []));
      pageUrl = data.links?.next ?? null;
    }
  } catch {
    return [];
  }

  const dayByGroupId = await fetchNextEventDays(appId, secret);

  return groups
    .filter((g) => g.attributes.listed)
    .map((g) => ({
      id: g.id,
      name: g.attributes.name,
      schedule: g.attributes.schedule?.trim() || "Contact us for meeting details",
      memberCount: g.attributes.memberships_count ?? 0,
      churchCenterUrl: g.attributes.public_church_center_web_url,
      dayOfWeek: dayByGroupId.get(g.id),
    }));
}
