// Anonymous search logging. We want to learn which searches fail so we can add
// the missing words or pages. Never logs IPs, and scrubs anything that looks
// like an email, phone number or long number. Pastoral / crisis searches are
// logged by category only, never by text. View in Vercel runtime logs: filter
// for "[search]".

export function scrubQuery(q: string): string {
  return q
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[number]")
    .replace(/\d{4,}/g, "[number]")
    .slice(0, 120);
}

export function logSearch(entry: {
  q: string;
  care: "crisis" | "pastoral" | null;
  source: "lexical" | "ai" | "none" | "care";
  ids: string[];
  sermons: number;
}): void {
  console.log(
    "[search]",
    JSON.stringify({
      q: entry.care ? `[${entry.care}]` : scrubQuery(entry.q),
      source: entry.source,
      top: entry.ids.slice(0, 3),
      sermons: entry.sermons,
      miss: entry.source === "none" && entry.sermons === 0,
    }),
  );
}
