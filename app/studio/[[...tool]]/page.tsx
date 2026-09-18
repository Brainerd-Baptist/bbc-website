/**
 * Sanity Studio embedded at /studio
 * Only BBC staff with a Sanity account can log in.
 * Sermons and series are managed here.
 *
 * sanity.config.ts calls React.createContext at module evaluation time,
 * which fails in Next.js SSR. Loading with ssr:false keeps it client-only.
 */
import nextDynamic from "next/dynamic";

export { metadata, viewport } from "next-sanity/studio";
export const dynamic = "force-dynamic";

const Studio = nextDynamic(() => import("./Studio"), { ssr: false });

export default function StudioPage() {
  return <Studio />;
}
