"use client";

import type { SanityResource } from "@/lib/sanity";

const TYPE_LABEL: Record<SanityResource["type"], string> = {
  book: "Book",
  article: "Article",
  ministry: "Ministry",
  video: "Video",
  podcast: "Podcast",
  prayer: "Prayer",
  other: "Resource",
};

/**
 * "Resources mentioned in this message" — sits alongside the Scripture chip
 * and notes on the sermon page. Pulls from both the sermon's own
 * resourcesMentioned and its series' resourcesMentioned (series-wide
 * resources, e.g. a commentary used every week) — see
 * claude/sermon-resource-catalog-scope-2026-10-03.md.
 */
export default function ResourcesMentioned({
  resources,
  accentColor,
}: {
  resources: SanityResource[];
  accentColor: string;
}) {
  if (!resources.length) return null;

  return (
    <div
      style={{
        background: "var(--surface-sunken)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1.5rem 1.75rem",
      }}
    >
      <span
        style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--fg-subtle)",
        }}
      >
        Resources Mentioned
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.875rem" }}>
        {resources.map((r) => (
          <a
            key={r._id}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", flexDirection: "column", gap: "0.15rem",
              textDecoration: "none", padding: "0.625rem 0.75rem",
              borderRadius: "0.625rem", border: "1px solid var(--border)",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--hover-subtle)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--fg)" }}>{r.title}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: accentColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {TYPE_LABEL[r.type] ?? "Resource"}
              </span>
            </div>
            {r.creator && (
              <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)" }}>{r.creator}</span>
            )}
            {r.blurb && (
              <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>{r.blurb}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
