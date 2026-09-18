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

export async function fetchScripture(passage: string): Promise<ScriptureResult | null> {
  if (!passage) return null;
  try {
    const url = `https://bible-api.com/${encodeURIComponent(passage)}?translation=web`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as ScriptureResult;
  } catch {
    return null;
  }
}
