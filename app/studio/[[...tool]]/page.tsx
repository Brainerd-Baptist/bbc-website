/**
 * Sanity Studio embedded at /studio
 * Only BBC staff with a Sanity account can log in.
 *
 * Architecture:
 *   page.tsx (Server Component) → StudioLoader.tsx (Client Component)
 *     → Studio.tsx loaded with ssr:false
 *
 * This keeps sanity.config.ts — which calls React.createContext at
 * module evaluation time — entirely out of the SSR code path.
 */
export { metadata, viewport } from "next-sanity/studio";
export const dynamic = "force-dynamic";

import StudioLoader from "./StudioLoader";

export default function StudioPage() {
  return <StudioLoader />;
}
