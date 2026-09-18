/**
 * Sanity Studio embedded at /studio
 * Only BBC staff with a Sanity account can log in.
 * Sermons and series are managed here.
 */
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-dynamic";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
