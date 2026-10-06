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
  attributes?: { name?: string };
}

/** Where Chattanooga actually is — used to turn each event's UTC `starts_at` into the weekday a visitor would call it, not whatever day that UTC instant happens to fall on. */
const CHURCH_TIME_ZONE = "America/New_York";

/**
 * fetch() wrapper that retries once on a 429, honoring PCO's `Retry-After`
 * header when present (falling back to a flat 1.5s otherwise). Added
 * 2026-10-06 after a real production build logged "429 Too Many Requests —
 * Rate limit exceeded: 110 of 100 requests per 20 seconds" on the
 * tag_groups call — almost certainly caused by this file's own ~38 PCO
 * requests (36 per-group event fetches + 2-3 tag fetches) bursting
 * alongside other pages' PCO calls during the same build. One retry is
 * enough to ride out a shared-window collision without turning a transient
 * rate limit into a silently empty result.
 */
async function fetchPco(url: string, auth: string): Promise<Response> {
  const headers = { Authorization: auth, "Content-Type": "application/json" };
  const res = await fetch(url, { headers, next: { revalidate: 3600 } });
  if (res.status !== 429) return res;

  const retryAfterSeconds = Number(res.headers.get("Retry-After"));
  const delayMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 1500;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return fetch(url, { headers, next: { revalidate: 3600 } });
}

/** Runs async `fn` over `items` with at most `limit` in flight at once, instead of firing them all in one Promise.all burst — keeps this file's own request volume well under PCO's shared rate limit (100 requests / 20s) even when other pages are hitting the same API concurrently during a build. */
async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/**
 * Fetch each given group's next scheduled Event and return its local
 * weekday, keyed by group id.
 *
 * v1 of this (2026-10-06) tried one batched call across the whole "Adult
 * Life Groups" type (`/groups/v2/events?where[group_type_id]=...`) to avoid
 * 36 separate requests. Production logs that same day showed it came back
 * with 100 events, 0 of which had a usable group relationship + starts_at —
 * the org-wide filter isn't scoping or shaping the response the way that
 * guess assumed. Replaced with one request per group against that group's
 * own events sub-resource, which needs no filter guesswork at all: the
 * group id comes from the URL itself, not from parsing a relationship.
 * More requests (one per group, run in parallel), but each one is a shape
 * PCO's API is far more likely to support consistently — the groups fetch
 * itself already proved out that nested-resource style.
 *
 * Fails soft (skips that one group) on any single request's error — a
 * broken day-of-week lookup should degrade to "no day badge for this
 * group," never take the whole Life Groups page down.
 */
async function fetchNextEventDays(appId: string, secret: string, groupIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const auth = pcoAuth(appId, secret);
  let requestErrors = 0;
  let loggedSamples = 0;

  // "gte" on starts_at, not just "order=starts_at" with no date floor. The
  // first version of this (round 3, 2026-10-06) took the OLDEST event on
  // each group ("per_page=1&order=starts_at" with no floor) and badged
  // several groups with the wrong day — their earliest-ever event reflected
  // an old meeting time from before the group's schedule changed, not its
  // current one. Filtering to today-or-later and keeping ascending order
  // gives the next real occurrence instead of the first one ever created.
  const todayIso = new Date().toISOString();

  // Capped at 6 concurrent requests rather than firing all ~36 at once —
  // see fetchPco/mapWithConcurrency above for why.
  await mapWithConcurrency(groupIds, 6, async (groupId) => {
    try {
      const res = await fetchPco(
        `${PCO_BASE}/groups/v2/groups/${groupId}/events?per_page=1&order=starts_at` +
          `&where[starts_at][gte]=${encodeURIComponent(todayIso)}&fields[Event]=starts_at`,
        auth,
      );
      if (!res.ok) {
        requestErrors++;
        return;
      }
      const data: { data?: { attributes?: { starts_at?: string } }[] } = await res.json();
      const startsAt = data.data?.[0]?.attributes?.starts_at;
      if (!startsAt) return;
      if (loggedSamples < 3) {
        loggedSamples++;
        console.error(`[pco-groups] sample next-event date for group ${groupId}: ${startsAt} (floor was ${todayIso})`);
      }
      const day = new Intl.DateTimeFormat("en-US", { timeZone: CHURCH_TIME_ZONE, weekday: "long" }).format(
        new Date(startsAt),
      );
      result.set(groupId, day);
    } catch {
      requestErrors++;
    }
  });

  if (result.size === 0) {
    console.error(
      `[pco-groups] per-group events fetch resolved 0 days across ${groupIds.length} groups (${requestErrors} request errors). ` +
        `If requestErrors is close to groupIds.length, check credential scope for Groups > Events. If requestErrors is low but result is still 0, check that each group actually has an upcoming event, or that "starts_at" is the right attribute name.`,
    );
  }

  return result;
}

function pcoAuth(appId: string, secret: string): string {
  return `Basic ${Buffer.from(`${appId}:${secret}`).toString("base64")}`;
}

/**
 * Fetch PCO's Tag/TagGroup definitions once and build a lookup from tag id
 * to its name + tag-group name, restricted to SURFACED_TAG_GROUP_NAMES
 * above.
 *
 * v1 of this (2026-10-06) tried `/groups/v2/tag_groups?include=tags` to get
 * everything in one request. Production logs that same day showed the
 * top-level tag_groups list came back correctly (all 10 real names,
 * including both "Stage of Life" and "Gender-Specific"), but the
 * `include=tags` sideload produced 0 Tag resources — that include
 * parameter isn't doing what was assumed. Replaced with the same
 * nested-resource pattern used for fetchNextEventDays above: fetch each
 * surfaced tag group's own `/tags` sub-resource directly (2 requests, one
 * per surfaced category, not 1 per tag) instead of guessing at an include
 * relationship name.
 *
 * Fails soft to an empty map on any error — a broken lookup just means no
 * stage-of-life/gender badges or filters, never a broken page.
 */
async function fetchSurfacedTagIndex(
  appId: string,
  secret: string,
): Promise<Map<string, { name: string; tagGroupName: string }>> {
  const result = new Map<string, { name: string; tagGroupName: string }>();
  const auth = pcoAuth(appId, secret);

  let surfacedTagGroups: { id: string; name: string }[] = [];
  try {
    const res = await fetchPco(`${PCO_BASE}/groups/v2/tag_groups?per_page=100&fields[TagGroup]=name`, auth);
    if (!res.ok) {
      console.error(`[pco-groups] tag_groups fetch failed: ${res.status} ${res.statusText} — ${await res.text().catch(() => "")}`);
      return result;
    }
    const data: { data?: PcoTagGroupRecord[] } = await res.json();
    surfacedTagGroups = (data.data ?? [])
      .filter((tg): tg is PcoTagGroupRecord & { attributes: { name: string } } =>
        Boolean(tg.attributes?.name && SURFACED_TAG_GROUP_NAMES.includes(tg.attributes.name)),
      )
      .map((tg) => ({ id: tg.id, name: tg.attributes.name }));
  } catch (err) {
    console.error("[pco-groups] tag_groups fetch threw:", err);
    return result;
  }

  if (surfacedTagGroups.length === 0) {
    console.error(
      `[pco-groups] tag_groups fetch succeeded but none of SURFACED_TAG_GROUP_NAMES (${SURFACED_TAG_GROUP_NAMES.join(", ")}) matched a real tag group name — check PCO admin (Groups → Settings → Tags) for the current exact names.`,
    );
    return result;
  }

  await Promise.all(
    surfacedTagGroups.map(async ({ id: tagGroupId, name: tagGroupName }) => {
      try {
        const res = await fetchPco(`${PCO_BASE}/groups/v2/tag_groups/${tagGroupId}/tags?per_page=100&fields[Tag]=name`, auth);
        if (!res.ok) {
          console.error(
            `[pco-groups] tags sub-resource fetch failed for "${tagGroupName}": ${res.status} ${res.statusText} — ${await res.text().catch(() => "")}`,
          );
          return;
        }
        const data: { data?: PcoTagRecord[] } = await res.json();
        for (const tag of data.data ?? []) {
          if (!tag.attributes?.name) continue;
          result.set(tag.id, { name: tag.attributes.name, tagGroupName });
        }
      } catch (err) {
        console.error(`[pco-groups] tags sub-resource fetch threw for "${tagGroupName}":`, err);
      }
    }),
  );

  if (result.size === 0) {
    console.error(
      `[pco-groups] resolved ${surfacedTagGroups.length} surfaced tag groups but 0 individual tags — check the sub-resource path (/groups/v2/tag_groups/{id}/tags) is right for this org's API version.`,
    );
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
      const res: Response = await fetchPco(pageUrl, auth);
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
    fetchNextEventDays(appId, secret, groups.map((g) => g.id)),
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
