"use client";

import { useMemo, useState } from "react";
import type { SanityResource } from "@/lib/sanity";
import { RESOURCE_TOPICS, BIBLE_BOOKS } from "@/lib/resource-topics";

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

type View = "series" | "type" | "az";

const VIEWS: { id: View; label: string }[] = [
  { id: "series", label: "By series" },
  { id: "type", label: "By type" },
  { id: "az", label: "A–Z" },
];

/** How many cards a series shelf shows before "Show all". */
const SHELF_PREVIEW = 6;

/** A resource plus everything the browse views derive from its `mentionedIn`. */
interface Item {
  r: SanityResource;
  /** Most recent sermon date this resource came up (YYYY-MM-DD, "" if unknown). */
  latest: string;
  /** Distinct sermons that mention it directly (series-wide counts as 3). */
  mentions: number;
  books: string[];
  topics: string[];
  series: { slug: string; title: string; accent?: string }[];
  /** Name of the most recent series/sermon it was mentioned in, for strip captions. */
  caption: string;
}

function buildItems(resources: SanityResource[]): Item[] {
  return resources.map((r) => {
    const refs = r.mentionedIn ?? [];
    const sermonRefs = refs.filter((m) => m.kind === "sermon");
    const seriesRefs = refs.filter((m) => m.kind === "series");
    const seriesMap = new Map<string, { slug: string; title: string; accent?: string }>();
    for (const m of refs) {
      if (m.seriesSlug && m.seriesTitle && !seriesMap.has(m.seriesSlug)) {
        seriesMap.set(m.seriesSlug, { slug: m.seriesSlug, title: m.seriesTitle, accent: m.seriesAccent });
      }
    }
    const dated = refs.filter((m) => m.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    const books = Array.from(new Set(sermonRefs.map((m) => (m.book ?? "").trim()).filter(Boolean)));
    const topics = Array.from(new Set(r.topics ?? []));
    return {
      r,
      latest: dated[0]?.date ?? "",
      mentions: new Set(sermonRefs.map((m) => m.slug)).size + seriesRefs.length * 3,
      books,
      topics,
      series: Array.from(seriesMap.values()),
      caption: dated[0] ? (dated[0].seriesTitle ?? dated[0].title) : "",
    };
  });
}

function shortDate(d: string): string {
  if (!d) return "";
  const dt = new Date(`${d}T12:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function bookRank(b: string): number {
  const i = (BIBLE_BOOKS as readonly string[]).indexOf(b);
  return i === -1 ? 999 : i;
}

/**
 * Browse-first resource catalog. The default view groups resources into one
 * shelf per sermon series (newest series first) — every resource already
 * knows which sermons/series mention it, so this needs no extra data entry.
 * Above the shelves (only while nothing is searched or filtered) sit three
 * discovery strips: Start here (featured), Latest, and Most recommended.
 * Topics and Bible book are clickable filters; type and A–Z remain as
 * alternate views. Plain client-side filtering is plenty at this scale
 * (see claude/sermon-resource-catalog-scope-2026-10-03.md).
 */
export default function ResourceCatalog({ resources }: { resources: SanityResource[] }) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("series");
  const [type, setType] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [book, setBook] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const items = useMemo(() => buildItems(resources), [resources]);

  // Curated list first (in its own order), then any older free-text topic
  // that exists in the data so nothing already tagged disappears.
  const allTopics = useMemo(() => {
    const inData = new Set<string>();
    for (const it of items) for (const t of it.topics) inData.add(t);
    const curated = (RESOURCE_TOPICS as readonly string[]).filter((t) => inData.has(t));
    const extra = Array.from(inData).filter((t) => !(RESOURCE_TOPICS as readonly string[]).includes(t)).sort((a, b) => a.localeCompare(b));
    return [...curated, ...extra];
  }, [items]);

  const allBooks = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) for (const b of it.books) set.add(b);
    return Array.from(set).sort((a, b) => bookRank(a) - bookRank(b) || a.localeCompare(b));
  }, [items]);

  const seriesLatest = useMemo(() => {
    const m = new Map<string, string>();
    for (const it of items) {
      for (const ref of it.r.mentionedIn ?? []) {
        if (ref.seriesSlug && ref.date && ref.date > (m.get(ref.seriesSlug) ?? "")) m.set(ref.seriesSlug, ref.date);
      }
    }
    return m;
  }, [items]);

  const isFiltering = query.trim() !== "" || type !== "all" || topic !== "all" || book !== "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter(({ r, topics, books }) => {
        if (type !== "all" && r.type !== type) return false;
        if (topic !== "all" && !topics.includes(topic)) return false;
        if (book !== "all" && !books.includes(book)) return false;
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          (r.creator ?? "").toLowerCase().includes(q) ||
          (r.blurb ?? "").toLowerCase().includes(q) ||
          (r.autoSummary ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.r.title.localeCompare(b.r.title));
  }, [items, query, type, topic, book]);

  const pickTopic = (t: string) => setTopic(t);
  const pickBook = (b: string) => setBook(b);
  const clearAll = () => { setQuery(""); setType("all"); setTopic("all"); setBook("all"); };

  const showStrips = view === "series" && !isFiltering;
  const startHere = showStrips ? items.filter((i) => i.r.featured).slice(0, 6) : [];
  const latest = showStrips
    ? [...items].filter((i) => i.latest).sort((a, b) => b.latest.localeCompare(a.latest) || a.r.title.localeCompare(b.r.title)).slice(0, 6)
    : [];
  const mostRecommended = showStrips
    ? [...items].filter((i) => i.mentions >= 2).sort((a, b) => b.mentions - a.mentions || a.r.title.localeCompare(b.r.title)).slice(0, 6)
    : [];

  const seriesShelves = useMemo(() => {
    if (view !== "series") return [];
    const map = new Map<string, { slug: string; title: string; accent?: string; items: Item[] }>();
    const loose: Item[] = [];
    for (const it of filtered) {
      if (it.series.length === 0) { loose.push(it); continue; }
      for (const s of it.series) {
        if (!map.has(s.slug)) map.set(s.slug, { ...s, items: [] });
        map.get(s.slug)!.items.push(it);
      }
    }
    const shelves = Array.from(map.values()).sort(
      (a, b) => (seriesLatest.get(b.slug) ?? "").localeCompare(seriesLatest.get(a.slug) ?? "") || a.title.localeCompare(b.title),
    );
    if (loose.length > 0) shelves.push({ slug: "", title: "Other messages", items: loose });
    return shelves;
  }, [filtered, view, seriesLatest]);

  const selectStyle: React.CSSProperties = {
    fontSize: "0.82rem", fontWeight: 500, padding: "0.5rem 0.75rem",
    borderRadius: "0.625rem", border: "1px solid var(--border)",
    background: "var(--surface-raised)", color: "var(--fg)",
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "var(--font-barlow-condensed), sans-serif", fontWeight: 800,
    fontSize: "1.1rem", letterSpacing: "-0.01em", color: "var(--fg)",
    marginBottom: "0.875rem", display: "flex", alignItems: "baseline", gap: "0.5rem",
  };

  const grid = (list: Item[], captions?: "latest") => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
      {list.map((it) => (
        <ResourceCard
          key={it.r._id}
          item={it}
          caption={captions === "latest" && it.latest ? `${shortDate(it.latest)}${it.caption ? ` · ${it.caption}` : ""}` : undefined}
          activeTopic={topic}
          onTopic={pickTopic}
          onBook={pickBook}
        />
      ))}
    </div>
  );

  const strip = (title: string, hint: string, list: Item[], captions?: "latest") =>
    list.length === 0 ? null : (
      <section>
        <h2 style={headingStyle}>
          {title}
          <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--fg-subtle)" }}>{hint}</span>
        </h2>
        {grid(list, captions)}
      </section>
    );

  return (
    <div>
      {/* Search + view switch */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "0.875rem" }}>
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
        <div role="group" aria-label="Browse by" style={{ display: "flex", gap: "0.25rem", padding: "0.2rem", borderRadius: "0.75rem", border: "1px solid var(--border)", background: "var(--surface-raised)" }}>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              style={{
                fontSize: "0.8rem", fontWeight: 600, padding: "0.35rem 0.8rem", borderRadius: "0.55rem", border: "none", cursor: "pointer",
                background: view === v.id ? "var(--accent)" : "transparent",
                color: view === v.id ? "var(--accent-fg, var(--bg))" : "var(--fg-muted)",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "0.75rem" }}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle} aria-label="Type">
          <option value="all">All types</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        {allBooks.length > 0 && (
          <select value={book} onChange={(e) => setBook(e.target.value)} style={selectStyle} aria-label="Book of the Bible">
            <option value="all">Any book of the Bible</option>
            {allBooks.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
        {isFiltering && (
          <button type="button" onClick={clearAll} style={{ ...selectStyle, cursor: "pointer", color: "var(--accent)" }}>
            Clear filters
          </button>
        )}
      </div>

      {allTopics.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.75rem" }} role="group" aria-label="Topics">
          {allTopics.map((t) => {
            const on = topic === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(on ? "all" : t)}
                style={{
                  fontSize: "0.75rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: "9999px", cursor: "pointer",
                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                  background: on ? "var(--accent)" : "var(--surface-raised)",
                  color: on ? "var(--accent-fg, var(--bg))" : "var(--fg-muted)",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ fontSize: "0.9rem", color: "var(--fg-subtle)" }}>Nothing matches that search yet.</p>
      ) : view === "az" ? (
        grid(filtered)
      ) : view === "type" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {TYPE_ORDER.map((t) => {
            const group = filtered.filter((i) => i.r.type === t);
            if (group.length === 0) return null;
            return (
              <section key={t}>
                <h2 style={headingStyle}>
                  {TYPE_LABEL[t]}
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--fg-subtle)" }}>{group.length}</span>
                </h2>
                {grid(group)}
              </section>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
          {strip("Start here", "Hand-picked first reads", startHere)}
          {strip("Latest", "From recent Sundays", latest, "latest")}
          {strip("Most recommended", "Curtis keeps coming back to these", mostRecommended)}

          {seriesShelves.map((shelf) => {
            const key = shelf.slug || "loose";
            const open = expanded[key] || shelf.items.length <= SHELF_PREVIEW;
            const list = open ? shelf.items : shelf.items.slice(0, SHELF_PREVIEW);
            return (
              <section key={key}>
                <h2 style={{ ...headingStyle, borderLeft: shelf.accent ? `3px solid ${shelf.accent}` : undefined, paddingLeft: shelf.accent ? "0.65rem" : 0 }}>
                  {shelf.slug ? (
                    <a href={`/series/${shelf.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{shelf.title}</a>
                  ) : shelf.title}
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--fg-subtle)" }}>{shelf.items.length}</span>
                </h2>
                {grid(list)}
                {!open && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [key]: true }))}
                    style={{ marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Show all {shelf.items.length}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Not a single <a> around the whole card: the chips below are buttons/links
// to other places while the rest of the card links out to the resource's own
// URL — interactive elements nested inside an <a> are invalid HTML and
// unreliable, so the link targets have to be siblings.
function ResourceCard({
  item, caption, activeTopic, onTopic, onBook,
}: {
  item: Item;
  caption?: string;
  activeTopic: string;
  onTopic: (t: string) => void;
  onBook: (b: string) => void;
}) {
  const r = item.r;
  const description = r.blurb || r.autoSummary;
  const chip: React.CSSProperties = {
    fontSize: "0.65rem", fontWeight: 600, color: "var(--fg-subtle)",
    background: "var(--hover-subtle)", borderRadius: "9999px", padding: "0.2rem 0.55rem",
    textDecoration: "none", border: "none", cursor: "pointer",
  };
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: "0.375rem",
        padding: "1.125rem 1.25rem",
        borderRadius: "0.875rem", border: "1px solid var(--border)",
        background: "var(--surface-sunken)", transition: "border-color 0.15s",
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
          {caption && <span style={{ color: "var(--fg-subtle)", letterSpacing: "0.02em", textTransform: "none", fontWeight: 600 }}> · {caption}</span>}
        </span>
        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--fg)", lineHeight: 1.3 }}>{r.title}</span>
        {r.creator && <span style={{ fontSize: "0.8rem", color: "var(--fg-muted)" }}>{r.creator}</span>}
        {description && (
          <span
            style={{
              fontSize: "0.82rem", color: "var(--fg-muted)", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {description}
          </span>
        )}
      </a>
      {(item.topics.length > 0 || item.books.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.25rem" }}>
          {item.topics.slice(0, 3).map((t) => (
            <button key={t} type="button" onClick={() => onTopic(activeTopic === t ? "all" : t)} style={{ ...chip, color: "var(--accent)" }}>
              {t}
            </button>
          ))}
          {item.books.slice(0, 2).map((b) => (
            <button key={b} type="button" onClick={() => onBook(b)} style={chip}>
              {b}
            </button>
          ))}
        </div>
      )}
      {r.mentionedIn && r.mentionedIn.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {r.mentionedIn.slice(0, 3).map((m) => (
            <a
              key={`${m.kind}-${m.slug}`}
              href={m.kind === "series" ? `/series/${m.slug}` : `/sermons/${m.slug}`}
              style={chip}
            >
              {m.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
