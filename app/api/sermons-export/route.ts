/**
 * TEMPORARY diagnostic/export route — added 2026-10-05 so Josiah can pull a
 * full, exact snapshot of every sermon's metadata out of Sanity (title,
 * date, speaker, series, passage, book, youtubeId) into a spreadsheet for a
 * manual cell-by-cell audit. Returns plain JSON, no API keys. Delete this
 * file once the export has been pulled — it is not meant to ship long-term.
 */

import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";

export async function GET() {
  const sermons = await sanityClient.fetch(
    `*[_type == "sermon"] | order(date desc) {
      _id,
      title,
      "slug": slug.current,
      date,
      speaker,
      "series": series->title,
      "seriesId": series->_id,
      passage,
      book,
      youtubeId,
      duration
    }`,
    {},
    { cache: "no-store" }
  );

  const series = await sanityClient.fetch(
    `*[_type == "series"] | order(startDate desc) {
      _id, title, "slug": slug.current, startDate, endDate, active
    }`,
    {},
    { cache: "no-store" }
  );

  return NextResponse.json({ sermonCount: sermons.length, sermons, series });
}
