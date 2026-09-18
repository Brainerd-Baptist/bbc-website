export interface ScriptureVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ScriptureResult {
  reference: string;
  verses: ScriptureVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

const CSB_BIBLE_ID = "06125adad2d5898a-01";
const API_BIBLE_BASE = "https://api.scripture.api.bible/v1";

const BOOK_MAP: Record<string, string> = {
  genesis: "GEN", gen: "GEN",
  exodus: "EXO", exod: "EXO", ex: "EXO",
  leviticus: "LEV", lev: "LEV",
  numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deut: "DEU",
  joshua: "JOS", josh: "JOS",
  judges: "JDG", judg: "JDG",
  ruth: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1sam": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2sam": "2SA", "2 sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1kgs": "1KI", "1 kgs": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2kgs": "2KI", "2 kgs": "2KI",
  "1 chronicles": "1CH", "1chronicles": "1CH", "1chr": "1CH", "1 chr": "1CH",
  "2 chronicles": "2CH", "2chronicles": "2CH", "2chr": "2CH", "2 chr": "2CH",
  ezra: "EZR",
  nehemiah: "NEH", neh: "NEH",
  esther: "EST", esth: "EST",
  job: "JOB",
  psalm: "PSA", psalms: "PSA", ps: "PSA", psa: "PSA",
  proverbs: "PRO", prov: "PRO", pr: "PRO",
  ecclesiastes: "ECC", eccl: "ECC", eccles: "ECC",
  "song of solomon": "SNG", "song of songs": "SNG", song: "SNG", sos: "SNG",
  isaiah: "ISA", isa: "ISA",
  jeremiah: "JER", jer: "JER",
  lamentations: "LAM", lam: "LAM",
  ezekiel: "EZK", ezek: "EZK", eze: "EZK",
  daniel: "DAN", dan: "DAN",
  hosea: "HOS", hos: "HOS",
  joel: "JOL", joe: "JOL",
  amos: "AMO",
  obadiah: "OBA", obad: "OBA",
  jonah: "JON", jon: "JON",
  micah: "MIC", mic: "MIC",
  nahum: "NAH", nah: "NAH",
  habakkuk: "HAB", hab: "HAB",
  zephaniah: "ZEP", zeph: "ZEP",
  haggai: "HAG", hag: "HAG",
  zechariah: "ZEC", zech: "ZEC",
  malachi: "MAL", mal: "MAL",
  matthew: "MAT", matt: "MAT", mt: "MAT",
  mark: "MRK", mk: "MRK",
  luke: "LUK", lk: "LUK",
  john: "JHN", jn: "JHN",
  acts: "ACT",
  romans: "ROM", rom: "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO", "1cor": "1CO", "1 cor": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO", "2cor": "2CO", "2 cor": "2CO",
  galatians: "GAL", gal: "GAL",
  ephesians: "EPH", eph: "EPH",
  philippians: "PHP", phil: "PHP",
  colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1thess": "1TH", "1 thess": "1TH",
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2thess": "2TH", "2 thess": "2TH",
  "1 timothy": "1TI", "1timothy": "1TI", "1tim": "1TI", "1 tim": "1TI",
  "2 timothy": "2TI", "2timothy": "2TI", "2tim": "2TI", "2 tim": "2TI",
  titus: "TIT", tit: "TIT",
  philemon: "PHM", phlm: "PHM", phm: "PHM",
  hebrews: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "1peter": "1PE", "1pet": "1PE", "1 pet": "1PE",
  "2 peter": "2PE", "2peter": "2PE", "2pet": "2PE", "2 pet": "2PE",
  "1 john": "1JN", "1john": "1JN", "1jn": "1JN", "1 jn": "1JN",
  "2 john": "2JN", "2john": "2JN", "2jn": "2JN", "2 jn": "2JN",
  "3 john": "3JN", "3john": "3JN", "3jn": "3JN", "3 jn": "3JN",
  jude: "JUD",
  revelation: "REV", rev: "REV",
};

/** Convert "John 3:16" or "John 3:16-18" or "Psalm 23" → api.bible passage ID */
function passageToId(passage: string): string | null {
  const s = passage.trim().toLowerCase();
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[–\-](\d+))?)?$/);
  if (!m) return null;
  const [, bookRaw, ch, vs, ve] = m;
  const bookId = BOOK_MAP[bookRaw.trim()];
  if (!bookId) return null;
  if (vs) {
    return ve
      ? `${bookId}.${ch}.${vs}-${bookId}.${ch}.${ve}`
      : `${bookId}.${ch}.${vs}`;
  }
  return `${bookId}.${ch}`;
}

async function fetchCSB(passage: string, apiKey: string): Promise<ScriptureResult | null> {
  const pid = passageToId(passage);
  if (!pid) return null;
  const params = new URLSearchParams({
    "content-type": "text",
    "include-notes": "false",
    "include-titles": "false",
    "include-chapter-numbers": "false",
    "include-verse-numbers": "true",
    "include-verse-spans": "false",
  });
  const url = `${API_BIBLE_BASE}/bibles/${CSB_BIBLE_ID}/passages/${encodeURIComponent(pid)}?${params}`;
  const res = await fetch(url, {
    headers: { "api-key": apiKey },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const d = json?.data;
  if (!d?.content) return null;

  // api.bible text format: "¶[16]Text here [17]More text"
  // Strip paragraph markers and split on verse numbers
  const raw: string = d.content.replace(/¶\s*/g, "").trim();
  const chapterNum = parseInt(pid.match(/\.(\d+)\./)?.[1] ?? "1");

  const verses: ScriptureVerse[] = [];
  const bookName = d.reference?.replace(/\s+\d.*$/, "") ?? passage;
  const bookId = pid.split(".")[0];

  const parts = raw.split(/\[(\d+)\]/);
  let verse: number | null = null;
  for (const part of parts) {
    if (/^\d+$/.test(part.trim())) {
      verse = parseInt(part);
    } else if (verse !== null && part.trim()) {
      verses.push({
        book_id: bookId,
        book_name: bookName,
        chapter: chapterNum,
        verse,
        text: part.replace(/\s+/g, " ").trim(),
      });
    }
  }

  return {
    reference: d.reference ?? passage,
    verses,
    text: raw.replace(/\[\d+\]/g, " ").replace(/\s+/g, " ").trim(),
    translation_id: "csb",
    translation_name: "Christian Standard Bible",
  };
}

async function fetchWEB(passage: string): Promise<ScriptureResult | null> {
  const res = await fetch(
    `https://bible-api.com/${encodeURIComponent(passage)}?translation=web`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error) return null;
  return data as ScriptureResult;
}

export async function fetchScripture(passage: string): Promise<ScriptureResult | null> {
  if (!passage) return null;
  try {
    const apiKey = process.env.BIBLE_API_KEY;
    if (apiKey) {
      const result = await fetchCSB(passage, apiKey);
      if (result) return result;
    }
    return fetchWEB(passage);
  } catch {
    return null;
  }
}
