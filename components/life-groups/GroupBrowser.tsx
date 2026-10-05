"use client";

import { useMemo, useState } from "react";
import type { LifeGroup } from "@/lib/pco-groups";

const inputClass =
  "border border-border-strong rounded-xl px-4 py-3 w-full text-fg bg-surface-raised placeholder:text-fg-muted transition";

export default function GroupBrowser({ groups }: { groups: LifeGroup[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => g.name.toLowerCase().includes(q) || g.schedule.toLowerCase().includes(q)
    );
  }, [groups, query]);

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by day, time, or building — e.g. &ldquo;Tuesday&rdquo; or &ldquo;BX&rdquo;"
          className={inputClass}
          aria-label="Search Life Groups"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-fg-muted text-sm py-8 text-center">
          No groups matched that search. Try a different word, or reach out below and we&apos;ll help you find one.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="glass rounded-2xl p-5 flex flex-col">
              <h3 className="font-condensed font-800 text-fg text-lg mb-1.5 leading-tight">
                {g.name}
              </h3>
              <p className="text-fg-muted text-sm leading-relaxed mb-4 flex-1">{g.schedule}</p>
              {g.churchCenterUrl ? (
                <a
                  href={g.churchCenterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-accent-text hover:underline text-sm font-semibold"
                >
                  View details &amp; request to join
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7h8M8 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : (
                <p className="text-fg-subtle text-xs">Ask at Connect for details</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-fg-subtle text-xs mt-6 text-center">
        Showing {filtered.length} of {groups.length} active Life Groups. &ldquo;View details &amp; request to
        join&rdquo; opens the group&apos;s own page on Planning Center Church Center, where you can see the
        full description and request to join directly.
      </p>
    </div>
  );
}
