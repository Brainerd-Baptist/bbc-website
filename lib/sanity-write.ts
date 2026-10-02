/**
 * lib/sanity-write.ts
 *
 * Write-capable Sanity client — server-only, used by the sermon auto-sync
 * cron route. Separate from lib/sanity.ts (the read client every page uses)
 * because that one is deliberately token-free and CDN-cached; a write
 * client needs the opposite: an Editor-permission token and useCdn: false
 * so it always sees the latest state before deciding what to create.
 *
 * Never import this from a page or client component — SANITY_API_TOKEN
 * must stay server-only.
 */

import { createClient } from "next-sanity";

export const sanityWriteClient = createClient({
  projectId: "3l0knw74",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export function hasSanityWriteToken(): boolean {
  return Boolean(process.env.SANITY_API_TOKEN);
}
