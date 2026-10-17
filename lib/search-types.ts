import type { CatalogKind } from "./search-catalog";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  summary: string;
  kind: CatalogKind;
  /** Deep link to the campus map for this thing, when one exists. */
  mapUrl?: string;
}

export interface SearchSermon {
  kind: "sermon" | "series";
  title: string;
  url: string;
  meta: string;
}

export interface SearchResponse {
  results: SearchResult[];
  sermons: SearchSermon[];
  /** Present for pastoral / crisis searches: show phone + care, no AI reply. */
  care?: { level: "crisis" | "pastoral"; phone: string };
  /** True when nothing matched and we are pointing at a person instead. */
  fallback: boolean;
  source: "lexical" | "ai" | "care" | "none";
}
