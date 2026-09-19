import { NextRequest, NextResponse } from "next/server";

const CSB_BIBLE_ID = "06125adad2d5898a-01";
const API_BIBLE_BASE = "https://rest.api.bible/v1";

const BOOK_MAP: Record<string, string> = {
  genesis: "GEN", gen: "GEN", exodus: "EXO", exod: "EXO", ex: "EXO",
  leviticus: "LEV", lev: "LEV", numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deut: "DEU", joshua: "JOS", josh: "JOS",
  judges: "JDG", judg: "JDG", ruth: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1sam": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2sam": "2SA", "2 sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1kgs": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2kgs": "2KI",
  "1 chronicles": "1CH", "1chr": "1CH", "2 chronicles": "2CH", "2chr": "2CH",
  ezra: "EZR", nehemiah: "NEH", neh: "NEH", esther: "EST", esth: "EST",
  job: "JOB", psalm: "PSA", psalms: "PSA", ps: "PSA", psa: "PSA",
  proverbs: "PRO", prov: "PRO", ecclesiastes: "ECC", eccl: "ECC",
  "song of solomon": "SNG", "song of songs": "SNG", song: "SNG",
  isaiah: "ISA", isa: "ISA", jeremiah: "JER", jer: "JER",
  lamentations: "LAM", lam: "LAM", ezekiel: "EZK", ezek: "EZK",
  daniel: "DAN", dan: "DAN", hosea: "HOS", hos: "HOS",
  joel: "JOL", joe: "JOL", amos: "AMO", obadiah: "OBA", obad: "OBA",
  jonah: "JON", jon: "JON", micah: "MIC", mic: "MIC",
  nahum: "NAH", nah: "NAH", habakkuk: "HAB", hab: "HAB",
  zephaniah: "ZEP", zeph: "ZEP", haggai: "HAG", hag: "HAG",
  zechariah: "ZEC", zech: "ZEC", malachi: "MAL", mal: "MAL",
  matthew: "MAT", matt: "MAT", mt: "MAT", mark: "MRK", mk: "MRK",
  luke: "LUK", lk: "LUK", john: "JHN", jn: "JHN", acts: "ACT",
  romans: "ROM", rom: "ROM",
  "1 corinthians": "1CO", "1cor": "1CO", "2 corinthians": "2CO", "2cor": "2CO",
  galatians: "GAL", gal: "GAL", ephesians: "EPH", eph: "EPH",
  philippians: "PHP", phil: "PHP", colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "1thess": "1TH", "2 thessalonians": "2TH", "2thess": "2TH",
  "1 timothy": "1TI", "1tim": "1TI", "2 timothy": "2TI", "2tim": "2TI",
  titus: "TIT", philemon: "PHM", phlm: "PHM", hebrews: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "1pet": "1PE", "2 peter": "2PE", "2pet": "2PE",
  "1 john": "1JN", "1jn": "1JN", "2 john": "2JN", "2jn": "2JN",
  "3 john": "3JN", "3jn": "3JN", jude: "JUD", revelation: "REV", rev: "REV",
};

function passageToId(passage: string): string | null {
  const s = passage.trim().toLowerCase();
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[–\-](\d+))?)?$/);
  if (!m) return null;
  const [, bookRaw, ch, vs, ve] = m;
  const bookId = BOOK_MAP[bookRaw.trim()];
  if (!bookId) return null;
  if (vs) return ve ? `${bookId}.${ch}.${vs}-${bookId}.${ch}.${ve}` : `${bookId}.${ch}.${vs}`;
  return `${bookId}.${ch}`;
}

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
