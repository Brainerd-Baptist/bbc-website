/**
 * Planning Center Online (PCO) API utility for Brainerd Baptist Church
 *
 * Server-side only — never import this from client components.
 * Auth credentials are read from environment variables at call time.
 */

const PCO_BASE_URL = "https://api.planningcenteronline.com";

/**
 * Online giving URL — SecureGive (not PCO Giving).
 */
export const GIVING_URL =
  "https://app.securegive.com/brainerdbaptist/auth/login/sms";

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Authenticated fetch wrapper for the Planning Center API.
 *
 * Prepends the PCO base URL, injects HTTP Basic credentials from environment
 * variables, sets `Content-Type: application/json`, and returns the parsed
 * JSON body. Throws on network errors or non-2xx responses.
 *
 * @param path - API path, e.g. `/groups/v2/groups`
 * @param options - Optional `RequestInit` overrides (method, body, etc.)
 */
export async function pcoFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const appId = process.env.PCO_APP_ID;
  const secret = process.env.PCO_SECRET;

  if (!appId || !secret) {
    throw new Error(
      "PCO_APP_ID and PCO_SECRET environment variables must be set"
    );
  }

  const url = `${PCO_BASE_URL}${path}`;
  const credentials = Buffer.from(`${appId}:${secret}`).toString("base64");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `PCO API error: ${response.status} ${response.statusText} — ${url}`
    );
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types — PCO JSON:API shapes (simplified to fields we actually use)
// ---------------------------------------------------------------------------

interface PcoAttributes {
  [key: string]: unknown;
}

interface PcoRelationship {
  data: { id: string; type: string } | null;
}

interface PcoIncluded {
  id: string;
  type: string;
  attributes: PcoAttributes;
}

interface PcoResource {
  id: string;
  type: string;
  attributes: PcoAttributes;
  relationships?: Record<string, PcoRelationship>;
  links?: { html?: string; [key: string]: string | undefined };
}

interface PcoCollectionResponse {
  data: PcoResource[];
  included?: PcoIncluded[];
}

// ---------------------------------------------------------------------------
// Life Groups
// ---------------------------------------------------------------------------

/** A simplified Life Group record returned by `getLifeGroups()`. */
export interface LifeGroup {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  location: string | null;
  groupType: string | null;
  enrollmentStatus: string | null;
  contactEmail: string | null;
  /** Direct link to the group's page on Planning Center. */
  pcoUrl: string | null;
}

/**
 * Fetches all published Life Groups from Planning Center Groups.
 *
 * Includes group type and location so callers don't need additional requests.
 * Returns a flat array of `LifeGroup` objects.
 */
export async function getLifeGroups(): Promise<LifeGroup[]> {
  const response = await pcoFetch<PcoCollectionResponse>(
    "/groups/v2/groups?include=group_type,location"
  );

  const included = response.included ?? [];

  const findIncluded = (type: string, id: string | null | undefined) =>
    id ? included.find((r) => r.type === type && r.id === id) : undefined;

  return response.data.map((group): LifeGroup => {
    const attrs = group.attributes;
    const rels = group.relationships ?? {};

    const locationId = rels.location?.data?.id ?? null;
    const groupTypeId = rels.group_type?.data?.id ?? null;

    const locationRecord = findIncluded("Location", locationId);
    const groupTypeRecord = findIncluded("GroupType", groupTypeId);

    return {
      id: group.id,
      name: String(attrs.name ?? ""),
      description: attrs.description != null ? String(attrs.description) : null,
      schedule: attrs.schedule != null ? String(attrs.schedule) : null,
      location:
        locationRecord?.attributes.name != null
          ? String(locationRecord.attributes.name)
          : null,
      groupType:
        groupTypeRecord?.attributes.name != null
          ? String(groupTypeRecord.attributes.name)
          : null,
      enrollmentStatus:
        attrs.enrollment_status != null
          ? String(attrs.enrollment_status)
          : null,
      contactEmail:
        attrs.contact_email != null ? String(attrs.contact_email) : null,
      pcoUrl: group.links?.html ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Calendar Events
// ---------------------------------------------------------------------------

/** A simplified upcoming event record returned by `getEvents()`. */
export interface CalendarEvent {
  id: string;
  name: string;
  summary: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  /** Direct link to the event on Planning Center. */
  pcoUrl: string | null;
}

/**
 * Fetches upcoming calendar event instances from Planning Center Calendar.
 *
 * Filters to future instances only. Returns a flat array of `CalendarEvent`
 * objects sorted by start time (earliest first, as returned by the API).
 */
export async function getEvents(): Promise<CalendarEvent[]> {
  const response = await pcoFetch<PcoCollectionResponse>(
    "/calendar/v2/event_instances?filter=future"
  );

  return response.data.map((instance): CalendarEvent => {
    const attrs = instance.attributes;

    return {
      id: instance.id,
      name: String(attrs.name ?? attrs.event_name ?? ""),
      summary: attrs.summary != null ? String(attrs.summary) : null,
      starts_at: attrs.starts_at != null ? String(attrs.starts_at) : null,
      ends_at: attrs.ends_at != null ? String(attrs.ends_at) : null,
      location: attrs.location != null ? String(attrs.location) : null,
      pcoUrl: instance.links?.html ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Connection Form submission
// ---------------------------------------------------------------------------

/** Data collected from the website's connection / contact form. */
export interface ConnectionFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}

/**
 * Submits a connection-card form to Planning Center People.
 *
 * @param formId - The PCO form ID to post to.
 *   TODO: Replace with the actual form ID once the PCO form is created.
 *   Find it in PCO → People → Forms → (your form) → the ID in the URL.
 * @param data - Visitor contact details from the website form.
 */
export async function submitConnectionForm(
  formId: string,
  data: ConnectionFormData
): Promise<void> {
  const payload = {
    data: {
      type: "FormSubmission",
      attributes: {},
      relationships: {
        form_fields: {
          data: buildFormFieldAnswers(data),
        },
      },
    },
  };

  await pcoFetch(`/people/v2/forms/${formId}/form_submissions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Maps connection-form data to PCO JSON:API form field answer objects.
 *
 * PCO form submissions nest answers inside `form_field_values` with a
 * `field_definition_id` referencing each field in the form definition.
 * The shape below follows the standard PCO People form-submission format.
 *
 * TODO: Replace the placeholder `field_definition_id` strings with the
 * real IDs from the PCO form once it is configured. You can retrieve them
 * via GET /people/v2/forms/{formId}/field_definitions.
 */
function buildFormFieldAnswers(
  data: ConnectionFormData
): Array<{ type: string; attributes: { value: string }; relationships: { field_definition: { data: { type: string; id: string } } } }> {
  const fields: Array<{ fieldDefinitionId: string; value: string }> = [
    { fieldDefinitionId: "FIRST_NAME_FIELD_ID", value: data.firstName },
    { fieldDefinitionId: "LAST_NAME_FIELD_ID", value: data.lastName },
    { fieldDefinitionId: "EMAIL_FIELD_ID", value: data.email },
  ];

  if (data.phone) {
    fields.push({ fieldDefinitionId: "PHONE_FIELD_ID", value: data.phone });
  }

  if (data.notes) {
    fields.push({ fieldDefinitionId: "NOTES_FIELD_ID", value: data.notes });
  }

  return fields.map(({ fieldDefinitionId, value }) => ({
    type: "FormFieldValue",
    attributes: { value },
    relationships: {
      field_definition: {
        data: { type: "FieldDefinition", id: fieldDefinitionId },
      },
    },
  }));
}
