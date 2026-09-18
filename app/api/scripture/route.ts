import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const passage = req.nextUrl.searchParams.get("p");
  if (!passage) return NextResponse.json({ error: "missing passage" }, { status: 400 });
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(passage)}?translation=web`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
