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

  return groups
    .filter((g) => g.attributes.listed)
    .map((g) => ({
      id: g.id,
      name: g.attributes.name,
      schedule: g.attributes.schedule?.trim() || "Contact us for meeting details",
      memberCount: g.attributes.memberships_count ?? 0,
      churchCenterUrl: g.attributes.public_church_center_web_url,
    }));
}
