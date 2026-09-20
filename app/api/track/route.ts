import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, title, mediaType, event } = body;

    if (!slug || !mediaType || !event) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const valid = {
      mediaType: ["audio", "video"],
      event:     ["start", "half", "complete"],
    };
    if (!valid.mediaType.includes(mediaType) || !valid.event.includes(event)) {
      return NextResponse.json({ error: "invalid value" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Supabase not configured — silently succeed so the site still works
      return NextResponse.json({ ok: true });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/sermon_plays`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify({ slug, title: title ?? null, media_type: mediaType, event }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never surface errors to client
  }
}
