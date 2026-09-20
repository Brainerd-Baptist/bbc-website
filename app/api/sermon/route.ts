/**
 * GET /api/sermon
 *
 * Returns the latest sermon metadata parsed from Curtis's Google Drive folder
 * plus the most recent YouTube video ID from the channel RSS feed.
 *
 * ISR-cached for 1 hour at the edge.
 */

import { NextResponse } from "next/server";
import { getLatestSermon } from "@/lib/sermon";

export const revalidate = 3600;

export async function GET() {
  const sermon = await getLatestSermon();
  return NextResponse.json(sermon);
}
