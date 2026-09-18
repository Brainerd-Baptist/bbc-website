"use client";

/**
 * Client-only wrapper so next/dynamic with ssr:false is legal here.
 * page.tsx (Server Component) renders this; this renders Studio.tsx
 * via dynamic import, keeping sanity.config out of the SSR path.
 */
import nextDynamic from "next/dynamic";

const Studio = nextDynamic(() => import("./Studio"), { ssr: false });

export default function StudioLoader() {
  return <Studio />;
}
