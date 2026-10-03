import { NextRequest, NextResponse } from "next/server";
import { passageToId } from "@/lib/scripture-refs";

const CSB_BIBLE_ID = "a556c5305ee15c3f-01";
const API_BIBLE_BASE = "https://rest.api.bible/v1";

const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(req: NextRequest) {
  const passage = req.nextUrl.searchParams.get("p");
  if (!passage) return NextResponse.json({ error: "missing passage" }, { status: 400 });

  const apiKey = process.env.BIBLE_API_KEY;

  // Try CSB via api.bible
  if (apiKey) {
    const pid = passageToId(passage);
    if (pid) {
      const params = new URLSearchParams({
        "content-type": "text",
        "include-notes": "false",
        "include-titles": "false",
        "include-chapter-numbers": "false",
        "include-verse-numbers": "true",
        "include-verse-spans": "false",
      });
      try {
        const res = await fetch(
          `${API_BIBLE_BASE}/bibles/${CSB_BIBLE_ID}/passages/${encodeURIComponent(pid)}?${params}`,
          { headers: { "api-key": apiKey }, next: { revalidate: 86400 } }
        );
        if (res.ok) {
          const json = await res.json();
          const d = json?.data;
          if (d?.content) {
            const raw: string = d.content.replace(/¶\s*/g, "").trim();
            const chapterNum = parseInt(pid.match(/\.(\d+)\./)?.[1] ?? "1");
            const bookId = pid.split(".")[0];
            const bookName = d.reference?.replace(/\s+\d.*$/, "") ?? passage;
            const verses: { book_id: string; book_name: string; chapter: number; verse: number; text: string }[] = [];
            const parts = raw.split(/\[(\d+)\]/);
            let verse: number | null = null;
            for (const part of parts) {
              if (/^\d+$/.test(part.trim())) {
                verse = parseInt(part);
              } else if (verse !== null && part.trim()) {
                verses.push({ book_id: bookId, book_name: bookName, chapter: chapterNum, verse, text: part.replace(/\s+/g, " ").trim() });
              }
            }
            const result = {
              reference: d.reference ?? passage,
              verses,
              text: raw.replace(/\[\d+\]/g, " ").replace(/\s+/g, " ").trim(),
              translation_id: "csb",
              translation_name: "Christian Standard Bible",
            };
            return NextResponse.json(result, { headers: { "Cache-Control": CACHE } });
          }
        }
      } catch { /* fall through to WEB */ }
    }
  }

  // Fallback: WEB via bible-api.com
  // Note: bible-api.com expects spaces encoded but colons/hyphens raw
  try {
    const encoded = passage.trim().replace(/ /g, "%20");
    const res = await fetch(
      `https://bible-api.com/${encoded}?translation=web`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    const data = await res.json();
    // Normalize response to always include translation label
    return NextResponse.json(
      { ...data, translation_id: "web", translation_name: "World English Bible" },
      { headers: { "Cache-Control": CACHE } }
    );
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
