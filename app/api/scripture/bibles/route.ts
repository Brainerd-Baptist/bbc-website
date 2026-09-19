import { NextResponse } from "next/server";

// Diagnostic endpoint — lists all Bibles available on this api.bible account
// Visit /api/scripture/bibles to see available Bible IDs
export async function GET() {
  const apiKey = process.env.BIBLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No BIBLE_API_KEY set" }, { status: 503 });

  const res = await fetch("https://rest.api.bible/v1/bibles", {
    headers: { "api-key": apiKey },
  });

  if (!res.ok) return NextResponse.json({ error: `api.bible returned ${res.status}` }, { status: 502 });

  const data = await res.json();
  // Return just id + name + abbreviation for easy scanning
  const bibles = (data.data as Array<{ id: string; name: string; abbreviation: string; language: { name: string } }>)
    ?.filter((b) => b.language?.name === "English")
    .map((b) => ({ id: b.id, name: b.name, abbreviation: b.abbreviation }));

  return NextResponse.json(bibles);
}
