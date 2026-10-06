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

// Tag group categories worth surfacing as Life Groups filters, named exactly
// as they appear in PCO admin (Groups → Settings → Tags — Josiah sent
// screenshots of the real list, 2026-10-06). That same screen also has
// Group Attributes, Other Languages, Bible Study Material, Parts, Serving
// Needs, Music, and Length of Group tag groups — all real, all scoped out
// (see the "bigger filter option" addendum in
// claude/life-groups-page-rebuild-scope-2026-10-05.md for why each one
// was or wasn't worth building).
const SURFACED_TAG_GROUP_NAMES = ["Stage of Life", "Gender-Specific"];

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
  /**
   * Stage-of-life tag names this group carries, e.g. ["Married", "With
   * Kids", "30s"] — a group can carry several (confirmed against the real
   * PCO admin tag list, 2026-10-06). Empty when the group has none, or when
   * tag resolution fails for any reason — never blocks the group from
   * showing.
   */
  stageOfLifeTags: string[];
  /** "Men Only" or "Women Only" when the group carries one of those two tags; undefined for the (vast majority of) mixed/co-ed groups. */
  genderSpecific?: string;
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
  relationships?: {
    tags?: { data: { id: string }[] };
  };
}

interface PcoTagGroupRecord {
  id: string;
  attributes?: { name?: string };
}

interface PcoTagRecord {
  id: string;
  type: string;
  attributes: { name: string };
  relationships?: { tag_group?: { data: { id: string } | null } };
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
    if (!res.ok) {
      console.error(`[pco-groups] events fetch failed: ${res.status} ${res.statusText} — ${await res.text().catch(() => "")}`);
      return result;
    }

    const data: {
      data?: { attributes?: { starts_at?: string }; relationships?: { group?: { data?: { id: string } | null } } }[];
    } = await res.json();

    const rawEvents = data.data ?? [];
    let withGroupId = 0;

    for (const event of rawEvents) {
      // Defensive: not every event in the response necessarily carries a
      // `relationships.group` object (confirmed in production, 2026-10-06 —
      // some entries have no `relationships` key at all, which crashed this
      // loop before this guard existed). Skip those rather than throw.
      const groupId = event.relationships?.group?.data?.id;
      const startsAt = event.attributes?.starts_at;
      if (!groupId || !startsAt) continue;
      withGroupId++;
      if (result.has(groupId)) continue; // first (earliest) occurrence per group wins
      const day = new Intl.DateTimeFormat("en-US", { timeZone: CHURCH_TIME_ZONE, weekday: "long" }).format(
        new Date(startsAt),
      );
      result.set(groupId, day);
    }

    if (result.size === 0) {
      console.error(
        `[pco-groups] events fetch succeeded with ${rawEvents.length} raw events, ${withGroupId} had a usable group id + starts_at, resolved 0 group days. ` +
          `If rawEvents.length is 0, where[group_type_id]=${ADULT_LIFE_GROUPS_TYPE_ID} is likely not a valid filter on this endpoint for this credential. ` +
          `If rawEvents.length is >0 but withGroupId is 0, the "group" relationship (or "starts_at" attribute) isn't coming back the way this code expects.`,
      );
    }
  } catch (err) {
    console.error("[pco-groups] events fetch threw:", err);
    return new Map();
  }

  return result;
}

function pcoAuth(appId: string, secret: string): string {
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

/**
 * Fetch PCO's Tag/TagGroup definitions once and build a lookup from tag id
 * to its name + tag-group name, restricted to SURFACED_TAG_GROUP_NAMES
 * above. This is the piece that was blocked when Day of the Week first
 * shipped (2026-10-06) — no MCP tool or credential in the dev sandbox could
 * resolve a tag id to a name. Unblocked the same day once Josiah sent real
 * screenshots of Groups → Settings → Tags confirming the tag group names
 * used here.
 *
 * Still untested against this org's real API response shape (same
 * limitation as fetchNextEventDays below — no live credential in the
 * sandbox this was written in), so this fails soft to an empty map on any
 * error, same reasoning as the rest of this file: a broken lookup just
 * means no stage-of-life/gender badges or filters, never a broken page.
 * Check server logs after deploy to confirm it actually resolves real tag
 * data for this credential.
 */
async function fetchSurfacedTagIndex(
  appId: string,
  secret: string,
): Promise<Map<string, { name: string; tagGroupName: string }>> {
  const result = new Map<string, { name: string; tagGroupName: string }>();
  const auth = pcoAuth(appId, secret);

  try {
    const res = await fetch(`${PCO_BASE}/groups/v2/tag_groups?include=tags&per_page=100`, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[pco-groups] tag_groups fetch failed: ${res.status} ${res.statusText} — ${await res.text().catch(() => "")}`);
      return result;
    }

    const data: { data?: PcoTagGroupRecord[]; included?: PcoTagRecord[] } = await res.json();

    const allTagGroupNames = (data.data ?? []).map((tg) => tg.attributes?.name).filter(Boolean);
    const surfacedTagGroupNameById = new Map<string, string>();
    for (const tagGroup of data.data ?? []) {
      const name = tagGroup.attributes?.name;
      if (name && SURFACED_TAG_GROUP_NAMES.includes(name)) {
        surfacedTagGroupNameById.set(tagGroup.id, name);
      }
    }

    const includedTags = (data.included ?? []).filter((t) => t.type === "Tag");
    for (const tag of includedTags) {
      const tagGroupId = tag.relationships?.tag_group?.data?.id;
      const tagGroupName = tagGroupId ? surfacedTagGroupNameById.get(tagGroupId) : undefined;
      if (!tagGroupName) continue; // not one of the categories we've decided to surface
      result.set(tag.id, { name: tag.attributes.name, tagGroupName });
    }

    if (result.size === 0) {
      console.error(
        `[pco-groups] tag_groups fetch succeeded but resolved 0 tags. ` +
          `Top-level tag groups returned (${(data.data ?? []).length} total): ${JSON.stringify(allTagGroupNames)}. ` +
          `Matched against SURFACED_TAG_GROUP_NAMES (${SURFACED_TAG_GROUP_NAMES.join(", ")}) → ${surfacedTagGroupNameById.size} matches. ` +
          `Sideloaded "included" Tag resources: ${includedTags.length} (of ${(data.included ?? []).length} total included items). ` +
          `If allTagGroupNames is empty, this endpoint path or credential scope is likely wrong. If it has entries but 0 match, the real names differ from what's hardcoded here. ` +
          `If matches > 0 but includedTags is 0, "include=tags" isn't sideloading Tag resources as expected — try "include=tag" or a relationship name other than "tags".`,
      );
    }
  } catch (err) {
    console.error("[pco-groups] tag_groups fetch threw:", err);
    return new Map();
  }

  return result;
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
    `&per_page=100&order=name&include=tags` +
    `&fields[Group]=name,schedule,memberships_count,public_church_center_web_url,listed` +
    `&fields[Tag]=name`;

  try {
    while (pageUrl) {
      const res: Response = await fetch(pageUrl, {
        headers: { Authorization: auth, "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        console.error(`[pco-groups] groups fetch failed: ${res.status} ${res.statusText} — ${await res.text().catch(() => "")}`);
        return [];
      }
      const data: { data?: PcoGroupRecord[]; links?: { next?: string } } = await res.json();
      groups.push(...(data.data ?? []));
      pageUrl = data.links?.next ?? null;
    }
  } catch (err) {
    console.error("[pco-groups] groups fetch threw:", err);
    return [];
  }

  const [dayByGroupId, tagIndex] = await Promise.all([
    fetchNextEventDays(appId, secret),
    fetchSurfacedTagIndex(appId, secret),
  ]);

  return groups
    .filter((g) => g.attributes.listed)
    .map((g) => {
      const tagIds = g.relationships?.tags?.data?.map((t) => t.id) ?? [];
      const stageOfLifeTags: string[] = [];
      let genderSpecific: string | undefined;
      for (const tagId of tagIds) {
        const info = tagIndex.get(tagId);
        if (!info) continue;
        if (info.tagGroupName === "Stage of Life") stageOfLifeTags.push(info.name);
        else if (info.tagGroupName === "Gender-Specific") genderSpecific = info.name;
      }

      return {
        id: g.id,
        name: g.attributes.name,
        schedule: g.attributes.schedule?.trim() || "Contact us for meeting details",
        memberCount: g.attributes.memberships_count ?? 0,
        churchCenterUrl: g.attributes.public_church_center_web_url,
        dayOfWeek: dayByGroupId.get(g.id),
        stageOfLifeTags,
        genderSpecific,
      };
    });
}
