/**
 * lib/google-auth.ts
 *
 * Service-account auth for the Google Drive and Sheets APIs, replacing the
 * old bare GOOGLE_API_KEY approach (which only works against files/folders
 * shared "Anyone with the link → Viewer"). Curtis's real sermon-notes
 * folders and the weekly sermon-tagging sheet are shared with named people
 * only, not link-public, so reading them requires an authenticated identity
 * they're explicitly shared with instead. One token works for both APIs —
 * it's scoped to read both Drive files and Sheets values.
 *
 * Setup (one-time, outside this repo):
 *   1. In Google Cloud Console, create (or reuse) a project with the Drive
 *      API enabled, then create a Service Account and a JSON key for it.
 *   2. Share the target Drive folder(s) with that service account's email
 *      (ends in @<project>.iam.gserviceaccount.com) as Viewer.
 *   3. Set GOOGLE_SERVICE_ACCOUNT_KEY in the environment to the *entire*
 *      downloaded JSON key file, as a single-line string.
 *
 * The JWT client below handles token issuance/refresh — callers just await
 * getDriveAccessToken() and use the result as a Bearer token.
 */

import { JWT } from "google-auth-library";

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

let cachedClient: JWT | null = null;

function getClient(): JWT | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    // Logged (not silent): see lib/sermon-tagging.ts's FAILURE_CACHE_MS
    // comment — one silent null here poisons every sermon in that cron run.
    console.error("[google-auth] GOOGLE_SERVICE_ACCOUNT_KEY is not set in this environment");
    return null;
  }

  if (!cachedClient) {
    let creds: { client_email: string; private_key: string };
    try {
      creds = JSON.parse(raw);
    } catch {
      console.error("[google-auth] GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON");
      return null;
    }

    cachedClient = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: [DRIVE_READONLY_SCOPE, SHEETS_READONLY_SCOPE],
    });
  }

  return cachedClient;
}

/**
 * Returns a valid Bearer access token for the Drive API, or null if
 * GOOGLE_SERVICE_ACCOUNT_KEY isn't configured or auth fails. The underlying
 * JWT client caches and auto-refreshes the token itself, so repeated calls
 * are cheap.
 */
export async function getDriveAccessToken(): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const { token } = await client.getAccessToken();
    return token ?? null;
  } catch (err) {
    console.error("[google-auth] Failed to get Drive access token:", err);
    return null;
  }
}
