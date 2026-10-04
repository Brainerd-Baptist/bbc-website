/**
 * GET /api/live-status
 *
 * Combines the pure Sunday-schedule clock (lib/live-schedule.ts) with a
 * real YouTube live-broadcast check (lib/youtube-live.ts), so a special,
 * non-Sunday livestream (a Christmas Eve service, a conference, etc.) is
 * recognized too — not just the two regular Sunday windows. See
 * lib/youtube-live.ts's doc comment for why this is a separate check
 * rather than something folded into getEasternState() itself.
 *
 * The schedule check runs first and is trusted on its own whenever it
 * says anything other than "off" — zero extra network calls during a
 * normal Sunday service, exactly like before this existed. Only when the
 * schedule says "off" do we also ask YouTube whether the channel happens
 * to be live anyway.
 *
 * `special: true` on the response tells a caller the "live" state came
 * from this off-schedule YouTube check rather than one of the two regular
 * services — there's no matching `service` window for it, by definition.
 */

import { NextResponse } from "next/server";
import { getEasternState } from "@/lib/live-schedule";
import { isChannelLive } from "@/lib/youtube-live";

export async function GET() {
  const schedule = getEasternState(new Date());

  if (schedule.state !== "off") {
    return NextResponse.json({ ...schedule, special: false });
  }

  const live = await isChannelLive();
  if (live) {
    return NextResponse.json({ state: "live", service: null, minutesUntil: 0, special: true });
  }

  return NextResponse.json({ ...schedule, special: false });
}
