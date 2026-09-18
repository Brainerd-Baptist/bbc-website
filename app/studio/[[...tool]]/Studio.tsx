"use client";

/**
 * Actual studio component — imported only client-side (ssr: false).
 * Keeping sanity.config away from the SSR code path fixes the
 * "createContext is not a function" error during `next build`.
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export default function Studio() {
  return <NextStudio config={config} />;
}
