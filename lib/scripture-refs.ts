/**
 * lib/scripture-refs.ts
 *
 * Shared, isomorphic (no Node-only imports — safe in both server routes and
 * client components) Bible-reference recognition. Single source of truth for:
 *   - app/api/scripture/route.ts — resolving one exact reference to a verse ID
 *   - lib/tiptap-scripture-ref.ts — detecting references inside free text
 *     (personal sermon notes) as the user types, so they can be clicked to
 *     read the passage inline instead of looking it up elsewhere.
 */

export const BOOK_MAP: Record<string, string> = {
  genesis: "GEN", gen: "GEN", exodus: "EXO", exod: "EXO", ex: "EXO",
  leviticus: "LEV", lev: "LEV", numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deut: "DEU", joshua: "JOS", josh: "JOS",
  judges: "JDG", judg: "JDG", ruth: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1sam": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2sam": "2SA", "2 sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI", "1kgs": "1KI", "1 kgs": "1KI",
  "2 kings": "2KI", "2kings": "2KI", "2kgs": "2KI", "2 kgs": "2KI",
  "1 chronicles": "1CH", "1chr": "1CH", "1 chr": "1CH", "2 chronicles": "2CH", "2chr": "2CH", "2 chr": "2CH",
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
  "1 corinthians": "1CO", "1cor": "1CO", "1 cor": "1CO", "2 corinthians": "2CO", "2cor": "2CO", "2 cor": "2CO",
  galatians: "GAL", gal: "GAL", ephesians: "EPH", eph: "EPH",
  philippians: "PHP", phil: "PHP", colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "1thess": "1TH", "1 thess": "1TH", "2 thessalonians": "2TH", "2thess": "2TH", "2 thess": "2TH",
  "1 timothy": "1TI", "1tim": "1TI", "1 tim": "1TI", "2 timothy": "2TI", "2tim": "2TI", "2 tim": "2TI",
  titus: "TIT", philemon: "PHM", phlm: "PHM", hebrews: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "1pet": "1PE", "1 pet": "1PE", "2 peter": "2PE", "2pet": "2PE", "2 pet": "2PE",
  "1 john": "1JN", "1jn": "1JN", "2 john": "2JN", "2jn": "2JN",
  "3 john": "3JN", "3jn": "3JN", jude: "JUD", revelation: "REV", rev: "REV",
};

/** Resolves a single, exact "Book chapter[:verse[-verse]]" string (the whole
 * input, nothing else) to an api.bible passage ID. Used by /api/scripture. */
export function passageToId(passage: string): string | null {
  const s = passage.trim().toLowerCase();
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[–\-](\d+))?)?$/);
  if (!m) return null;
  const [, bookRaw, ch, vs, ve] = m;
  const bookId = BOOK_MAP[bookRaw.trim()];
  if (!bookId) return null;
  if (vs) return ve ? `${bookId}.${ch}.${vs}-${bookId}.${ch}.${ve}` : `${bookId}.${ch}.${vs}`;
  return `${bookId}.${ch}`;
}

// Longest-first so multi-word book names ("1 corinthians", "song of
// solomon") win over any shorter key that could also match a prefix of them.
const BOOK_ALTERNATION = Object.keys(BOOK_MAP)
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"))
  .join("|");

/** Matches a book name (full or standard abbreviation) followed by at least
 * a chapter number, optionally a verse or verse range — "John 3:16",
 * "1 Cor 15:3-5", "Ps 23". Global/case-insensitive: built fresh per call
 * since RegExp with the `g` flag is stateful (shared module-level instances
 * would corrupt concurrent callers' lastIndex). */
function buildRefRegex(): RegExp {
  return new RegExp(`\\b(${BOOK_ALTERNATION})\\.?\\s+(\\d{1,3})(?::(\\d{1,3})(?:[–-]\\d{1,3})?)?\\b`, "gi");
}

export interface ScriptureRefMatch {
  ref: string;
  start: number;
  end: number;
}

/** Scans free text (e.g. a user's own sermon notes) for anything that looks
 * like a Bible reference. Intentionally requires a chapter number at
 * minimum — a bare book name alone ("I love John") is never treated as a
 * reference, which keeps this safe to run on ordinary prose. */
export function findScriptureRefs(text: string): ScriptureRefMatch[] {
  const re = buildRefRegex();
  const matches: ScriptureRefMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ ref: m[0].trim(), start: m.index, end: m.index + m[0].length });
  }
  return matches;
}
