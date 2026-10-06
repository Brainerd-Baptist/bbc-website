"use client";

import { useMemo, useState } from "react";
import type { SanityResource } from "@/lib/sanity";

const TYPE_LABEL: Record<SanityResource["type"], string> = {
  book: "Book",
  article: "Article",
  ministry: "Ministry / Org",
  video: "Video",
  podcast: "Podcast",
  prayer: "Prayer / Liturgy",
  other: "Other",
};

const TYPE_ORDER: SanityResource["type"][] = ["book", "article", "ministry", "video", "podcast", "prayer", "other"];

/**
 * Client-side search/filter over the resource catalog. Deliberately simple —
 * a plain substring match plus a couple of dropdowns over a few hundred JSON
 * records is plenty at this scale (see
 * claude/sermon-resource-catalog-scope-2026-10-03.md — no need for a search
 * service here).
 */
export default function ResourceCatalog({ resources }: { resources: SanityResource[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    for (const r of resources) for (const t of r.topics ?? []) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (topic !== "all" && !(r.topics ?? []).includes(topic)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.creator ?? "").toLowerCase().includes(q) ||
        (r.blurb ?? "").toLowerCase().includes(q)
      );
    });
  }, [resources, query, type, topic]);

  const selectStyle: React.CSSProperties = {
    fontSize: "0.82rem", fontWeight: 500, padding: "0.5rem 0.75rem",
    borderRadius: "0.625rem", border: "1px solid var(--border)",
    background: "var(--surface-raised)", color: "var(--fg)",
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "1.75rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, or description…"
          style={{
            flex: "1 1 260px", fontSize: "0.85rem", padding: "0.5rem 0.875rem",
            borderRadius: "0.625rem", border: "1px solid var(--border)",
            background: "var(--surface-raised)", color: "var(--fg)",
          }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
          <option value="all">All types</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        {allTopics.length > 0 && (
          <select value={topic} onChange={(e) => setTopic(e.target.value)} style={selectStyle}>
            <option value="all">All topics</option>
            {allTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "var(--fg-subtle)" }}>
          Nothing matches that search yet.
        </p>
      ) : type !== "all" ? (
        // A type is already picked from the dropdown — one flat grid, no
        // need to repeat a section heading for the single type showing.
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map((r) => (
            <ResourceCard key={r._id} resource={r} />
          ))}
        </div>
      ) : (
        // "All types" — grouped into labeled sections (Books, Articles,
        // Ministries, …) in TYPE_ORDER, each still alphabetical within
        // itself since `filtered` already comes in from a title-sorted
        // fetch. Previously one flat alphabetical list mixing every type
        // together, so a book and a podcast with similar titles sat side
        // by side with nothing marking them apart beyond a small label —
        // reported 2026-10-06 as hard to browse. The type dropdown above
        // still works as a jump-straight-to-one-type filter.
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {TYPE_ORDER.map((t) => {
            const group = filtered.filter((r) => r.type === t);
            if (group.length === 0) return null;
            return (
              <div key={t}>
                <h2 style={{
                  fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800,
                  fontSize: "1.1rem", letterSpacing: "-0.01em", color: "var(--fg)",
                  marginBottom: "0.875rem", display: "flex", alignItems: "baseline", gap: "0.5rem",
                }}>
                  {TYPE_LABEL[t]}
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--fg-subtle)" }}>
                    {group.length}
                  </span>
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {group.map((r) => (
                    <ResourceCard key={r._id} resource={r} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Not a single <a> around the whole card: the mentionedIn chips below link
// internally (to the sermon/series page) while the rest of the card links
// out to the resource's own URL — an <a> nested inside an <a> is invalid
// HTML and the inner link won't reliably work, so the two link targets
// have to be siblings. Pulled out of the inline map (2026-10-06) so it can
// be reused by both the flat single-type grid and the grouped-by-type
// sections above.
function ResourceCard({ resource: r }: { resource: SanityResource }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: "0.375rem",
        padding: "1.125rem 1.25rem",
        borderRadius: "0.875rem", border: "1px solid var(--border)",
        background: "var(--surface-sunken)", transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem", textDecoration: "none" }}
      >
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
          {TYPE_LABEL[r.type] ?? "Resource"}
        </span>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg)", lineHeight: 1.3 }}>{r.title}</span>
        {r.creator && <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>{r.creator}</span>}
        {r.blurb && <span style={{ fontSize: "0.82rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>{r.blurb}</span>}
      </a>
      {r.mentionedIn && r.mentionedIn.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.25rem" }}>
          {r.mentionedIn.slice(0, 3).map((m) => (
            <a
              key={`${m.kind}-${m.slug}`}
              href={m.kind === "series" ? `/series/${m.slug}` : `/sermons/${m.slug}`}
              style={{
                fontSize: "0.65rem", fontWeight: 600, color: "var(--fg-subtle)",
                background: "var(--hover-subtle)", borderRadius: "9999px", padding: "0.2rem 0.55rem",
                textDecoration: "none",
              }}
            >
              {m.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
